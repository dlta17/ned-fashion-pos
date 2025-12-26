
import React, { useState, useEffect, useMemo } from 'react';
import { getRemoteLicenses, updateRemoteLicense, deleteRemoteLicense } from '../services/api';
import { RemoteLicenseRecord, SubscriptionPlan } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import Modal from '../components/common/Modal';
import { DollarSignIcon } from '../components/icons/DollarSignIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { LockOpenIcon } from '../components/icons/LockOpenIcon';

const LicenseManagementPage: React.FC = () => {
    const [records, setRecords] = useState<RemoteLicenseRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({ 
        hwid: '', 
        clientName: '', 
        status: 'PENDING',
        plan: SubscriptionPlan.MONTHLY,
        price: 0
    });
    const { formatCurrency, language } = useI18n();

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        const data = await getRemoteLicenses();
        setRecords(data);
        setLoading(false);
    };

    const handleUpdateStatus = async (hwid: string, status: any) => {
        const confirmMsg = status === 'BLOCKED' ? '⚠️ هل أنت متأكد من إيقاف الخدمة عن هذا المتجر؟ سيتم قفل النظام عندهم فوراً!' : 'هل تريد إعادة تفعيل المتجر؟';
        if (window.confirm(confirmMsg)) {
            await updateRemoteLicense(hwid, { status });
            fetchRecords();
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateRemoteLicense(formData.hwid, { 
            clientName: formData.clientName, 
            status: formData.status as any,
            plan: formData.plan,
            price: formData.price
        });
        setIsAddModalOpen(false);
        setFormData({ hwid: '', clientName: '', status: 'PENDING', plan: SubscriptionPlan.MONTHLY, price: 0 });
        fetchRecords();
    };

    const designerStats = useMemo(() => {
        return {
            totalStores: records.length,
            activeStores: records.filter(r => r.status === 'ACTIVE').length,
            totalRevenue: records.reduce((sum, r) => sum + r.price, 0),
            blockedStores: records.filter(r => r.status === 'BLOCKED').length
        };
    }, [records]);

    const generateKeyForHwid = (hwid: string) => {
        const MASTER_SECRET = "NED-AI-LABS-SECRET-2025-POS-PRO";
        const source = hwid + MASTER_SECRET;
        let hash = 0;
        for (let i = 0; i < source.length; i++) hash = ((hash << 5) - hash) + source.charCodeAt(i);
        const rawStr = Math.abs(hash).toString(16).toUpperCase().padEnd(16, 'X');
        const key = `${rawStr.substring(0, 4)}-${rawStr.substring(4, 8)}-${rawStr.substring(8, 12)}-${rawStr.substring(12, 16)}`;
        navigator.clipboard.writeText(key);
        alert(`تم توليد مفتاح التفعيل:\n${key}\n\nتم نسخ المفتاح تلقائياً للحافظة.`);
    };

    if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 rounded-[3rem] shadow-2xl border border-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white flex items-center gap-3">
                        <span className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <ShieldCheckIcon />
                        </span>
                        سيرفر التحكم المركزي
                    </h1>
                    <p className="text-slate-400 mt-2 font-bold">بوابة المطور نضال لإدارة تراخيص المتاجر</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black shadow-xl hover:bg-indigo-50 transition-all flex items-center gap-2 active:scale-95"
                >
                    <span className="text-xl">+</span>
                    تسجيل متجر جديد
                </button>
            </div>

            {/* Quick Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><UsersIcon /></div>
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">إجمالي المتاجر</div>
                            <div className="text-2xl font-black text-white">{designerStats.totalStores}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 text-green-400 rounded-xl"><LockOpenIcon /></div>
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">المتاجر النشطة</div>
                            <div className="text-2xl font-black text-white">{designerStats.activeStores}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><DollarSignIcon /></div>
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">أرباح التراخيص</div>
                            <div className="text-2xl font-black text-white">{formatCurrency(designerStats.totalRevenue)}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl"><ShieldCheckIcon /></div>
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">المتاجر المحظورة</div>
                            <div className="text-2xl font-black text-white">{designerStats.blockedStores}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="px-8 py-6">المتجر / المالك</th>
                                <th className="px-8 py-6 text-center">نوع الخطة</th>
                                <th className="px-8 py-6 text-center">تاريخ الانتهاء</th>
                                <th className="px-8 py-6 text-center">الحالة</th>
                                <th className="px-8 py-6 text-end">الإجراءات والتحكم</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {records.map(record => (
                                <tr key={record.hwid} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="font-black text-white text-lg">{record.clientName}</div>
                                        <div className="text-[10px] font-mono text-indigo-400 mt-1">{record.hwid}</div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${
                                            record.plan === SubscriptionPlan.LIFETIME ? 'bg-purple-500/10 text-purple-400' :
                                            record.plan === SubscriptionPlan.YEARLY ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700/50 text-slate-300'
                                        }`}>
                                            {record.plan === SubscriptionPlan.LIFETIME ? 'دائم (مدى الحياة)' : 
                                             record.plan === SubscriptionPlan.YEARLY ? 'اشتراك سنوي' : 'اشتراك شهري'}
                                        </span>
                                        <div className="text-[10px] text-slate-500 mt-1 font-bold">السعر: {formatCurrency(record.price)}</div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="font-black text-slate-200">{new Date(record.expiryDate).toLocaleDateString(language)}</div>
                                        <div className="text-[9px] text-slate-500 uppercase mt-1">آخر ظهور: {new Date(record.lastSeen).toLocaleTimeString(language)}</div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm ${
                                            record.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                                            record.status === 'BLOCKED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 
                                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        }`}>
                                            {record.status === 'ACTIVE' ? 'نشط' : record.status === 'BLOCKED' ? 'موقوف' : 'تجريبي'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-end">
                                        <div className="flex justify-end items-center gap-3">
                                            <button 
                                                onClick={() => generateKeyForHwid(record.hwid)}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-[11px] font-black shadow-lg shadow-indigo-600/20 transition-all"
                                            >
                                                توليد مفتاح
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleUpdateStatus(record.hwid, record.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE')}
                                                className={`p-2.5 rounded-xl border-2 transition-all ${
                                                    record.status === 'ACTIVE' 
                                                    ? 'border-rose-900/50 text-rose-500 hover:bg-rose-500 hover:text-white' 
                                                    : 'border-green-900/50 text-green-500 hover:bg-green-500 hover:text-white'
                                                }`}
                                                title={record.status === 'ACTIVE' ? 'إيقاف الخدمة' : 'تفعيل الخدمة'}
                                            >
                                                {record.status === 'ACTIVE' ? 
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> 
                                                    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                                }
                                            </button>

                                            <button 
                                                onClick={() => { if(window.confirm('حذف السجل نهائياً؟')) deleteRemoteLicense(record.hwid).then(fetchRecords); }}
                                                className="p-2.5 text-slate-600 hover:text-rose-500 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {records.length === 0 && (
                        <div className="text-center py-24 text-slate-600">
                             <div className="mb-4 text-slate-800">
                                <ShieldCheckIcon />
                             </div>
                             <p className="font-black text-xl">لا توجد متاجر مسجلة بعد</p>
                             <p className="text-sm">ابدأ بإضافة أول متجر للتحكم فيه عن بُعد</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal with Dark Theme */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="تسجيل متجر جديد">
                <div className="bg-white p-2 rounded-2xl">
                    <form onSubmit={handleAdd} className="space-y-6 text-right">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-400 uppercase">اسم المتجر / المالك</label>
                                <input type="text" placeholder="مثلاً: بوتيك الأميرة" required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-400 uppercase">Hardware ID (HW-XXX)</label>
                                <input type="text" placeholder="انسخ الكود من شاشة تفعيل العميل" required value={formData.hwid} onChange={e => setFormData({...formData, hwid: e.target.value.toUpperCase()})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold font-mono text-indigo-600" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-400 uppercase">مدة الاشتراك (الخطة)</label>
                                <select value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value as any})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold bg-white">
                                    <option value={SubscriptionPlan.MONTHLY}>اشتراك شهري</option>
                                    <option value={SubscriptionPlan.YEARLY}>اشتراك سنوي</option>
                                    <option value={SubscriptionPlan.LIFETIME}>دائم (مدى الحياة)</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-400 uppercase">سعر الترخيص المتفق عليه</label>
                                <input type="number" placeholder="المبلغ الذي دفعه العميل" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase">حالة التشغيل المبدئية</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold bg-white">
                                <option value="ACTIVE">تنشيط فوري (نشط)</option>
                                <option value="PENDING">فترة تجريبية (انتظار)</option>
                                <option value="BLOCKED">إيقاف الخدمة (محظور)</option>
                            </select>
                        </div>

                        <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black shadow-xl hover:bg-black mt-4 transition-all active:scale-95">
                            تسجيل المتجر في السيرفر المركزي
                        </button>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default LicenseManagementPage;
