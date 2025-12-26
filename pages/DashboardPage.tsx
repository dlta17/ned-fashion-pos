
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardData, getCustomers } from '../services/api';
import { DollarSignIcon } from '../components/icons/DollarSignIcon';
import { PackageIcon } from '../components/icons/PackageIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';

interface DashboardData {
  dailySales: number;
  itemsSoldToday: number;
  pendingRepairs: number;
  topSelling: any[];
  salesByDay: { day: string; sales: number }[];
}

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t, formatCurrency } = useI18n();
  const { user } = useAuth();
  const { settings } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [dashboardData, customers] = await Promise.all([getDashboardData(), getCustomers()]);
      setData(dashboardData);
      setCustomerCount(customers.length);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-[500px]"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div></div>;
  if (!data) return <div className="text-center p-20 text-red-500 font-bold">حدث خطأ في تحميل البيانات</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">{t('dashboard.title')}</h1>
            <p className="text-slate-500 mt-1 font-bold">{t('dashboard.welcome', { user: user?.username || '', store: settings.name })}</p>
        </div>
        <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">خادم محلي نشط</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t('dashboard.dailySales'), val: formatCurrency(data.dailySales), icon: <DollarSignIcon />, color: 'indigo' },
          { label: t('dashboard.itemsSoldToday'), val: data.itemsSoldToday, icon: <PackageIcon />, color: 'cyan' },
          { label: t('dashboard.totalCustomers'), val: customerCount, icon: <UsersIcon />, color: 'amber' }
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 flex items-center group hover:scale-[1.02] transition-transform">
            <div className={`p-4 rounded-3xl bg-${card.color}-50 text-${card.color}-600 mr-4 rtl:ml-4 rtl:mr-0 group-hover:bg-${card.color}-600 group-hover:text-white transition-colors`}>{card.icon}</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
              <p className="text-2xl font-black text-slate-800">{card.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50">
          <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-800">{t('dashboard.weeklySales')}</h2>
              <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black">تقرير حي</div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesByDay}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 800}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 800}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorSales)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
          <h2 className="text-xl font-black text-slate-800 mb-8">{t('dashboard.topSelling')}</h2>
          <div className="space-y-7">
            {data.topSelling.map((product, index) => (
                <div key={index} className="relative">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-black text-slate-700 truncate max-w-[140px]">{product.name}</span>
                        <span className="text-xs font-black text-indigo-600">{formatCurrency(product.revenue)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-indigo-600 to-cyan-500 h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${Math.min(100, (product.revenue / (data.topSelling[0]?.revenue || 1)) * 100)}%` }}
                        ></div>
                    </div>
                    <div className="mt-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('dashboard.quantitySold')}: {product.sold}</div>
                </div>
            ))}
            {data.topSelling.length === 0 && <p className="text-center py-20 text-slate-300 font-bold italic">لا يوجد بيانات للتحليل</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
