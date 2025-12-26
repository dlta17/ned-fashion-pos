
import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/common/PageHeader';
import { Customer, Sale } from '../types';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer, getSales } from '../services/api';
import { useI18n } from '../contexts/I18nContext';
import Modal from '../components/common/Modal';
import { EditIcon } from '../components/icons/EditIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CustomersPage: React.FC = () => {
    const { t, formatCurrency, language } = useI18n();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', notes: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [detailsCustomer, setDetailsCustomer] = useState<Customer | null>(null);

    const refresh = async () => {
        setLoading(true);
        try {
            const [c, s] = await Promise.all([getCustomers(), getSales()]);
            setCustomers(c);
            setSales(s);
        } catch (err) {
            console.error("Error refreshing data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refresh(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateCustomer(editingId, formData);
            } else {
                await addCustomer(formData);
            }
            setIsModalOpen(false);
            setFormData({ name: '', phone: '', email: '', notes: '' });
            await refresh();
        } catch (err) {
            alert("حدث خطأ أثناء حفظ بيانات العميل.");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("حذف العميل نهائياً من قاعدة البيانات؟ سيؤدي ذلك لمسح سجل مقاساته أيضاً.")) {
            await deleteCustomer(id);
            refresh();
        }
    };

    const getCustomerMetrics = (customerId: string) => {
        const customerSales = sales.filter(s => s.customerId === customerId);
        const totalSpent = customerSales.reduce((sum, s) => sum + s.total, 0);
        return {
            visitCount: customerSales.length,
            totalSpent: totalSpent,
            isVip: totalSpent > 5000, // عميل مميز إذا تخطى 5000
            history: customerSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        };
    };

    const filtered = useMemo(() => {
        return customers.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.phone.includes(searchTerm)
        );
    }, [customers, searchTerm]);

    const handleExportCSV = () => {
        const headers = ["الاسم", "الجوال", "البريد", "الزيارات", "إجمالي الصرف", "ملاحظات"];
        const rows = filtered.map(c => {
            const metrics = getCustomerMetrics(c.id);
            return [
                `"${c.name}"`,
                `"${c.phone}"`,
                `"${c.email || ''}"`,
                metrics.visitCount,
                metrics.totalSpent,
                `"${(c.notes || '').replace(/\n/g, ' ')}"`
            ];
        });
        
        const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t('customers.title')}</h1>
                    <p className="text-slate-500 font-bold">إدارة بيانات العملاء، سجل المقاسات، والتحليلات</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={handleExportCSV}
                        className="flex-1 md:flex-none px-6 py-3 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-2xl font-black text-sm transition-all"
                    >
                        تصدير القائمة
                    </button>
                    <button 
                        onClick={() => { setEditingId(null); setFormData({name:'', phone:'', email:'', notes:''}); setIsModalOpen(true); }}
                        className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        + إضافة عميل جديد
                    </button>
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="ابحث باسم العميل أو رقم الجوال..." 
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none rounded-2xl font-black text-slate-700 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(c => {
                    const metrics = getCustomerMetrics(c.id);
                    return (
                        <div key={c.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-50 hover:shadow-2xl hover:scale-[1.02] transition-all group relative overflow-hidden">
                            {metrics.isVip && (
                                <div className="absolute top-0 left-0 bg-amber-500 text-white px-6 py-1 rounded-br-2xl text-[10px] font-black uppercase tracking-widest shadow-lg z-10">
                                    عميل مميز 👑
                                </div>
                            )}
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className="pt-4">
                                    <h3 className="text-xl font-black text-slate-800">{c.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <p className="text-indigo-600 font-black text-sm">{c.phone}</p>
                                    </div>
                                    {c.email && (
                                        <p className="text-slate-400 text-[10px] font-bold mt-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                            {c.email}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setDetailsCustomer(c)} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"><EyeIcon /></button>
                                    <button onClick={() => { setEditingId(c.id); setFormData({name: c.name, phone: c.phone, email: c.email||'', notes: c.notes||''}); setIsModalOpen(true); }} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-800 hover:text-white transition-all"><EditIcon /></button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">الزيارات</p>
                                    <p className="text-lg font-black text-slate-800">{metrics.visitCount}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي المشتريات</p>
                                    <p className="text-lg font-black text-indigo-600">{formatCurrency(metrics.totalSpent)}</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => setDetailsCustomer(c)}
                                className="w-full mt-6 py-3 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                            >
                                سجل المقاسات والبيانات
                            </button>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-300 font-black italic">
                        لا يوجد عملاء يطابقون البحث.. أضف واحداً الآن؟
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "تعديل بيانات العميل" : "إضافة عميل جديد"}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase px-2">الاسم الكامل</label>
                            <input type="text" placeholder="مثلاً: محمد علي" required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black outline-none focus:border-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase px-2">رقم الجوال</label>
                            <input type="tel" placeholder="05XXXXXXXX" required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black outline-none focus:border-indigo-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase px-2">البريد الإلكتروني (اختياري)</label>
                            <input type="email" placeholder="customer@example.com" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black outline-none focus:border-indigo-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase px-2">الملاحظات والمقاسات</label>
                            <textarea placeholder="سجل هنا المقاسات الخاصة أو ملاحظات الخياطة..." className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black outline-none focus:border-indigo-500" rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black">إلغاء</button>
                        <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl px-10 hover:bg-indigo-700 transition-all">حفظ البيانات</button>
                    </div>
                </form>
            </Modal>

            {detailsCustomer && (
                <Modal isOpen={!!detailsCustomer} onClose={() => setDetailsCustomer(null)} title={`ملف العميل: ${detailsCustomer.name}`}>
                    <div className="space-y-6">
                        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-3 tracking-widest">سجل المقاسات والبيانات</h4>
                            <p className="font-bold text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{detailsCustomer.notes || 'لا توجد ملاحظات مسجلة لهذا العميل.'}</p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">سجل المشتريات الأخير</h4>
                            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {getCustomerMetrics(detailsCustomer.id).history.map(sale => (
                                    <div key={sale.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                        <div>
                                            <div className="font-black text-slate-800 text-xs">فاتورة #{sale.id.slice(-6).toUpperCase()}</div>
                                            <div className="text-[10px] text-slate-400 font-bold">{new Date(sale.date).toLocaleDateString(language)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-indigo-600">{formatCurrency(sale.total)}</div>
                                            <div className="text-[9px] text-slate-400 font-black uppercase">عبر {t(`enums.paymentMethod.${sale.paymentMethod}` as any)}</div>
                                        </div>
                                    </div>
                                ))}
                                {getCustomerMetrics(detailsCustomer.id).history.length === 0 && (
                                    <div className="text-center py-10 text-slate-300 italic font-black">لا توجد مشتريات مسجلة بعد.</div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                             <button onClick={() => handleDelete(detailsCustomer.id)} className="flex-1 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-xs">حذف العميل</button>
                             <button onClick={() => setDetailsCustomer(null)} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs px-10">إغلاق الملف</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default CustomersPage;
