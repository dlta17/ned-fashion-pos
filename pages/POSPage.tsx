
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getProducts, addSale, getCustomers } from '../services/api';
import { Product, SaleItem, PaymentMethod, TransactionType, Customer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/common/Modal';
import { useI18n } from '../contexts/I18nContext';
import { useStore } from '../contexts/StoreContext';
import { printInvoice, openCashDrawer } from '../utils/printUtils';
import { LockOpenIcon } from '../components/icons/LockOpenIcon';

const POSPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  const [discountValue, setDiscountValue] = useState<string>('');
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENT'>('FIXED');

  const { user } = useAuth();
  const { t, formatCurrency, currency, language } = useI18n();
  const { settings: storeSettings } = useStore();
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [pData, cData] = await Promise.all([getProducts(), getCustomers()]);
    setProducts(pData);
    setCustomers(cData);
    setLoading(false);
    if(searchInputRef.current) searchInputRef.current.focus();
  };

  const filteredCustomers = useMemo(() => {
      if (!customerSearch) return [];
      return customers.filter(c => c.name.includes(customerSearch) || c.phone.includes(customerSearch)).slice(0, 5);
  }, [customers, customerSearch]);

  const handleAddToCart = (product: Product) => {
      if (product.transactionType !== TransactionType.SERVICE && product.stock <= 0) {
          alert("هذا المنتج غير متوفر في المخزون");
          return;
      }
      setCart(prev => {
          const exists = prev.find(i => i.productId === product.id);
          if (exists) {
              return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
          }
          return [...prev, {
              productId: product.id,
              productName: product.name,
              quantity: 1,
              price: product.transactionType === TransactionType.RENTAL ? (product.rentalPricePerDay || 0) : (product.sellingPrice || 0),
              transactionType: product.transactionType
          }];
      });
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = discountType === 'FIXED' ? (parseFloat(discountValue) || 0) : subtotal * ((parseFloat(discountValue) || 0) / 100);
  const total = Math.max(0, subtotal - discountAmount);

  const handleProcessPayment = async () => {
    if (!user || cart.length === 0) return;
    setPaymentLoading(true);
    try {
        const sale = await addSale(cart, selectedPaymentMethod, user.username, discountAmount, selectedCustomerId);
        printInvoice(sale, storeSettings, '58mm', currency.code, language);
        setCart([]);
        setDiscountValue('');
        setSelectedCustomerId(undefined);
        setIsPaymentModalOpen(false);
    } catch (error) {
        alert("فشل إتمام العملية");
    } finally {
        setPaymentLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div></div>;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-9rem)] gap-6 animate-in fade-in duration-500">
      <div className="lg:w-3/5 xl:w-2/3 flex flex-col">
        <div className="flex gap-2 mb-4">
            <input
                ref={searchInputRef}
                type="text"
                placeholder="ابحث بالاسم أو الباركود..."
                className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-black shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => openCashDrawer()} className="p-4 bg-white text-slate-400 rounded-2xl hover:text-indigo-600 shadow-sm border border-slate-100 transition-colors">
                <LockOpenIcon />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-50">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm)).map(product => (
              <button 
                key={product.id}
                onClick={() => handleAddToCart(product)}
                className="group p-5 bg-slate-50 rounded-3xl text-center border-2 border-transparent hover:border-indigo-500 hover:bg-indigo-50 transition-all"
              >
                <div className="font-black text-slate-800 text-xs truncate mb-1">{product.name}</div>
                <div className="text-indigo-600 font-black">{formatCurrency(product.sellingPrice || product.rentalPricePerDay || 0)}</div>
                <div className="text-[9px] text-slate-400 font-black uppercase mt-2">{product.category}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:w-2/5 xl:w-1/3 bg-white rounded-[2.5rem] shadow-2xl flex flex-col p-8 border border-slate-100">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex justify-between items-center">
            الفاتورة الحالية
            <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full uppercase">Net Mode</span>
        </h2>

        <div className="mb-6 relative">
            {!selectedCustomerId ? (
                <div className="space-y-2">
                    <input 
                        type="text" 
                        placeholder="اختر عميل..." 
                        className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-black border-2 border-transparent focus:border-indigo-400 outline-none"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                    {filteredCustomers.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-2xl border border-slate-100 z-50 overflow-hidden mt-2">
                            {filteredCustomers.map(c => (
                                <button key={c.id} onClick={() => {setSelectedCustomerId(c.id); setCustomerSearch('');}} className="w-full text-right p-4 hover:bg-indigo-50 border-b last:border-0 transition-colors">
                                    <div className="font-black text-sm text-slate-800">{c.name}</div>
                                    <div className="text-[10px] text-indigo-500 font-black">{c.phone}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-indigo-600 p-5 rounded-2xl flex justify-between items-center text-white shadow-lg">
                    <div className="font-black text-sm">{customers.find(c => c.id === selectedCustomerId)?.name}</div>
                    <button onClick={() => setSelectedCustomerId(undefined)} className="bg-white/20 p-2 rounded-xl text-[10px] font-black">إزالة</button>
                </div>
            )}
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2">
          {cart.map(item => (
            <div key={item.productId} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex-1">
                <div className="font-black text-slate-800 text-xs">{item.productName}</div>
                <div className="text-[10px] text-slate-500 font-black">{formatCurrency(item.price)} × {item.quantity}</div>
              </div>
              <div className="font-black text-indigo-600 text-sm">{formatCurrency(item.price * item.quantity)}</div>
            </div>
          ))}
          {cart.length === 0 && <div className="text-center py-16 text-slate-300 font-black italic">السلة فارغة</div>}
        </div>

        <div className="bg-slate-50 p-5 rounded-[2rem] mb-6 border border-slate-100">
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إضافة خصم</span>
                <div className="flex bg-white rounded-xl p-1 shadow-sm">
                    <button onClick={() => setDiscountType('FIXED')} className={`px-4 py-1 text-[9px] font-black rounded-lg transition-all ${discountType === 'FIXED' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>مبلغ</button>
                    <button onClick={() => setDiscountType('PERCENT')} className={`px-4 py-1 text-[9px] font-black rounded-lg transition-all ${discountType === 'PERCENT' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>%</button>
                </div>
            </div>
            <input 
                type="number" 
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white border border-slate-100 p-4 rounded-xl font-black text-center text-indigo-600 outline-none text-xl shadow-inner"
            />
        </div>

        <div className="space-y-3 border-t-2 border-slate-100 pt-6">
          <div className="flex justify-between text-3xl font-black text-slate-800">
            <span>الإجمالي</span>
            <span className="text-indigo-600">{formatCurrency(total)}</span>
          </div>
        </div>

        <button 
            disabled={cart.length === 0}
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full mt-8 py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
        >
            تأكيد العملية
        </button>
      </div>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="إتمام العملية">
           <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    {[PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.EWALLET].map(m => (
                        <button key={m} onClick={() => setSelectedPaymentMethod(m)} className={`p-6 rounded-3xl border-2 font-black text-xs transition-all ${selectedPaymentMethod === m ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                            {t(`enums.paymentMethod.${m}` as any)}
                        </button>
                    ))}
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                    <p className="text-xs font-black text-slate-400 uppercase mb-1">المبلغ المطلوب تحصيله</p>
                    <p className="text-3xl font-black text-indigo-600">{formatCurrency(total)}</p>
                </div>
                <button onClick={handleProcessPayment} disabled={paymentLoading} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl hover:bg-indigo-700">
                    {paymentLoading ? "جاري المعالجة..." : "تأكيد وطباعة الفاتورة"}
                </button>
           </div>
      </Modal>
    </div>
  );
};

export default POSPage;
