
import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/common/PageHeader';
import { getSales, getCustomers } from '../services/api';
import { Sale, Customer } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { useStore } from '../contexts/StoreContext';
import { printInvoice } from '../utils/printUtils';
import { PrinterIcon } from '../components/icons/PrinterIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';

const ReportsPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [activeTab, setActiveTab] = useState<'sales' | 'customers'>('sales');
  
  const { t, formatCurrency, currency, language } = useI18n();
  const { settings: storeSettings } = useStore();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesData, custData] = await Promise.all([getSales(), getCustomers()]);
      setSales(salesData);
      setCustomers(custData);
    } catch (error) {
      console.error("Failed to load reporting data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter(s => 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.cashier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [sales, searchTerm]);

  const customerAnalysis = useMemo(() => {
    return customers.map(c => {
        const cSales = sales.filter(s => s.customerId === c.id);
        const total = cSales.reduce((acc, s) => acc + s.total, 0);
        const sortedSales = [...cSales].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return {
            ...c,
            totalSpent: total,
            visitCount: cSales.length,
            lastVisit: sortedSales.length > 0 ? sortedSales[0].date : null
        };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, sales]);

  const stats = useMemo(() => {
    const total = filteredSales.reduce((acc, s) => acc + s.total, 0);
    const count = filteredSales.length;
    return { total, count };
  }, [filteredSales]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 text-right">
      <PageHeader title={t('reports.title')} />

      <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-slate-100 mb-6">
        <button 
            onClick={() => setActiveTab('sales')}
            className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === 'sales' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
        >
            {t('reports.tabs.sales')}
        </button>
        <button 
            onClick={() => setActiveTab('customers')}
            className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === 'customers' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
        >
            {t('reports.tabs.customers')}
        </button>
      </div>
      
      {activeTab === 'sales' ? (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-slate-50 relative overflow-hidden group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">إجمالي مبيعات السجل</p>
                    <p className="text-4xl font-black text-indigo-600 relative z-10">{formatCurrency(stats.total)}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-50 group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">عدد الفواتير</p>
                    <p className="text-4xl font-black text-slate-800">{stats.count} فاتورة</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100">
                <input 
                    type="text" 
                    placeholder="ابحث برقم الفاتورة، اسم العميل، أو اسم البائع..." 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none rounded-2xl font-black text-slate-700 transition-all text-right"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الفاتورة</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">التاريخ</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">المبلغ</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">البائع</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-end">الإجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredSales.map(sale => (
                        <tr key={sale.id} className="hover:bg-indigo-50/30 transition-colors group">
                            <td className="px-8 py-5">
                            <div className="flex flex-col">
                                <span className="font-mono text-xs font-black text-indigo-600">#{sale.id.slice(-8).toUpperCase()}</span>
                                {sale.customerName && <span className="text-[10px] text-slate-400 font-bold">{sale.customerName}</span>}
                            </div>
                            </td>
                            <td className="px-8 py-5 text-center text-sm font-bold text-slate-600">
                            {new Date(sale.date).toLocaleDateString(language)}
                            </td>
                            <td className="px-8 py-5 text-center">
                            <span className="font-black text-slate-800">{formatCurrency(sale.total)}</span>
                            </td>
                            <td className="px-8 py-5 text-center">
                            <span className="bg-white border border-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm">{sale.cashier}</span>
                            </td>
                            <td className="px-8 py-5 text-end">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setSelectedSale(sale)} className="p-3 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all border border-slate-100"><EyeIcon /></button>
                                <button onClick={() => printInvoice(sale, storeSettings, '58mm', currency.code, language)} className="p-3 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm border border-slate-100"><PrinterIcon /></button>
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>
        </>
      ) : (
        <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 px-4">{t('reports.customerRanking')}</h2>
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">العميل</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">عدد المبيعات</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الأكثر إنفاقاً</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">آخر زيارة</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-end">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {customerAnalysis.map((c, index) => (
                                <tr key={c.id} className="hover:bg-indigo-50/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-[10px] font-black text-slate-500">{index + 1}</span>
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-800">{c.name}</span>
                                                <span className="text-[10px] text-slate-400 font-bold">{c.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center font-black text-slate-600">{c.visitCount}</td>
                                    <td className="px-8 py-5 text-center font-black text-indigo-600">{formatCurrency(c.totalSpent)}</td>
                                    <td className="px-8 py-5 text-center text-sm font-bold text-slate-500">
                                        {c.lastVisit ? new Date(c.lastVisit).toLocaleDateString(language) : '-'}
                                    </td>
                                    <td className="px-8 py-5 text-end">
                                        {c.totalSpent > 5000 && (
                                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border border-amber-200">
                                                VIP Customer
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {selectedSale && (
        <Modal isOpen={!!selectedSale} onClose={() => setSelectedSale(null)} title="معاينة تفاصيل الفاتورة">
            <div className="space-y-6 text-right">
                <div className="flex justify-between items-center border-b pb-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase">رقم المرجع</p>
                        <p className="font-mono font-black text-indigo-600">{selectedSale.id.toUpperCase()}</p>
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase">التاريخ</p>
                        <p className="font-bold text-slate-700">{new Date(selectedSale.date).toLocaleString(language)}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase">الأصناف المبيعة</h4>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-100 text-slate-500 font-black">
                                <tr>
                                    <th className="p-3">الصنف</th>
                                    <th className="p-3 text-center">الكمية</th>
                                    <th className="p-3 text-end">السعر</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {selectedSale.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-3 font-bold text-slate-800">{item.productName}</td>
                                        <td className="p-3 text-center font-black">{item.quantity}</td>
                                        <td className="p-3 text-end font-black text-indigo-600">{formatCurrency(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>المجموع الفرعي</span>
                        <span>{formatCurrency(selectedSale.subtotal)}</span>
                    </div>
                    {selectedSale.discount > 0 && (
                        <div className="flex justify-between text-xs font-bold text-rose-500">
                            <span>الخصم</span>
                            <span>-{formatCurrency(selectedSale.discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xl font-black text-indigo-600 border-t border-indigo-200 pt-2 mt-2">
                        <span>الإجمالي الصافي</span>
                        <span>{formatCurrency(selectedSale.total)}</span>
                    </div>
                </div>

                <button 
                    onClick={() => {
                        printInvoice(selectedSale, storeSettings, '58mm', currency.code, language);
                        setSelectedSale(null);
                    }}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex justify-center items-center gap-2"
                >
                    <PrinterIcon />
                    طباعة الفاتورة
                </button>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default ReportsPage;
