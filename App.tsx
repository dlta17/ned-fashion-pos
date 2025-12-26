import React, { Suspense, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { StoreProvider, useStore } from './contexts/StoreContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { Role } from './types';
import { I18nProvider } from './contexts/I18nContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';

// --- رابط الـ RAW اللي جبناه من GitHub ---
const CLOUD_URL = "https://raw.githubusercontent.com/dlta17/ned-fashion-pos/main/ned_cloud_server.json";

// ... (بقية الـ lazy imports سيبها زي ما هي)

const AppRoutes: React.FC = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { license, updateLicenseFromCloud } = useStore(); // هنستخدم دي لتحديث الحالة
    const [cloudLoading, setCloudLoading] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);

    useEffect(() => {
        const syncSaaS = async () => {
            try {
                const response = await fetch(CLOUD_URL);
                const data = await response.json();
                
                // فك تشفير البيانات اللي أنت بعتهالي
                const decrypted = JSON.parse(decodeURIComponent(escape(atob(data.cloud_payload))));
                
                // البحث عن جهازك في السحاب (HWID اللي في ملفك)
                const myHwid = "HW-9ED8D93E"; 
                const cloudStore = decrypted.stores[myHwid];

                if (cloudStore) {
                    if (cloudStore.status === 'BLOCKED') {
                        setIsBlocked(true);
                    } else {
                        // تحديث بيانات المحل والرسائل من السحاب أوتوماتيكياً
                        // (تأكد أن StoreContext يدعم استقبال هذه البيانات)
                        console.log("✅ SaaS Active: " + cloudStore.name);
                    }
                }
            } catch (error) {
                console.error("⚠️ فشل الاتصال بالسحاب، يعمل بالنظام المحلي");
            } finally {
                setCloudLoading(false);
            }
        };

        syncSaaS();
    }, []);

    if (authLoading || cloudLoading) return <LoadingSpinner />;

    // --- شاشة الحظر المركزية (SaaS Block) ---
    if (isBlocked || license.remoteStatus === 'BLOCKED') {
        return (
            <div className="h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-xl border-t-[12px] border-red-600">
                    <div className="text-red-600 mb-8 flex justify-center">
                        <svg className="w-28 h-28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 mb-6">نظام NED-POS متوقف</h1>
                    <p className="text-slate-500 font-bold text-lg mb-4">نأسف، تم تعليق الخدمة لهذا الجهاز من قبل الإدارة المركزية.</p>
                    <p className="text-slate-400 font-bold mb-10 text-sm">برجاء التواصل مع المطور (نضال سلامة) لتفعيل الاشتراك.</p>
                    <div className="bg-slate-50 p-4 rounded-xl font-mono text-sm font-black text-slate-400 select-all tracking-widest border border-slate-200">
                        ID: {license.hardwareId || "HW-9ED8D93E"}
                    </div>
                </div>
            </div>
        );
    }

    // ... باقي كود التفعيل التجريبي (Trial) زي ما هو