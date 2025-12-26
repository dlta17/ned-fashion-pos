
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decode, createBlob, decodeAudioData } from '../utils/audioUtils';
import { TranscriptEntry } from '../types';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopIcon } from './icons/StopIcon';
import { useI18n } from '../contexts/I18nContext';

const LiveAssistant: React.FC = () => {
    const { t } = useI18n();
    const [active, setActive] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [status, setStatus] = useState('جاهز');

    const sessionRef = useRef<any>(null);
    const inputCtx = useRef<AudioContext | null>(null);
    const outputCtx = useRef<AudioContext | null>(null);
    const nextStartTime = useRef(0);
    const audioSources = useRef<Set<AudioBufferSourceNode>>(new Set());

    const stop = useCallback(async () => {
        setActive(false);
        setStatus('جاهز');
        if (sessionRef.current) {
            try { (await sessionRef.current).close(); } catch {}
            sessionRef.current = null;
        }
        inputCtx.current?.close();
        outputCtx.current?.close();
    }, []);

    const start = async () => {
        setActive(true);
        setStatus('جاري الاتصال...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            inputCtx.current = new AudioContext({ sampleRate: 16000 });
            outputCtx.current = new AudioContext({ sampleRate: 24000 });

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('متصل');
                        const source = inputCtx.current!.createMediaStreamSource(stream);
                        const processor = inputCtx.current!.createScriptProcessor(4096, 1, 1);
                        processor.onaudioprocess = (e) => {
                            const blob = createBlob(e.inputBuffer.getChannelData(0));
                            sessionPromise.then(s => s.sendRealtimeInput({ media: blob }));
                        };
                        source.connect(processor);
                        processor.connect(inputCtx.current!.destination);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData && outputCtx.current) {
                            nextStartTime.current = Math.max(nextStartTime.current, outputCtx.current.currentTime);
                            const buffer = await decodeAudioData(decode(audioData), outputCtx.current, 24000, 1);
                            const source = outputCtx.current.createBufferSource();
                            source.buffer = buffer;
                            source.connect(outputCtx.current.destination);
                            source.start(nextStartTime.current);
                            nextStartTime.current += buffer.duration;
                            audioSources.current.add(source);
                        }
                    },
                    onerror: () => stop(),
                    onclose: () => stop()
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: 'أنت مساعد ذكي لمتجر ملابس محترف. ساعد العملاء في العثور على المقاسات والألوان.'
                }
            });
            sessionRef.current = sessionPromise;
        } catch { stop(); }
    };

    return (
        <div className="flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <span className="font-black text-slate-700">{status}</span>
                </div>
                <button
                    onClick={active ? stop : start}
                    className={`px-8 py-3 rounded-2xl font-black text-white transition-all shadow-lg ${active ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                    {active ? <StopIcon /> : <MicrophoneIcon />}
                    <span className="ms-2">{active ? "إيقاف المساعد" : "تحدث مع المساعد"}</span>
                </button>
            </div>
            
            <div className="flex-1 bg-slate-50 rounded-[2rem] border-2 border-slate-100 p-6 overflow-y-auto">
                <div className="text-center py-20 text-slate-300 font-black italic">
                    {active ? "المساعد يستمع إليك الآن..." : "اضغط على الزر أعلاه للبدء"}
                </div>
            </div>
        </div>
    );
};

export default LiveAssistant;
