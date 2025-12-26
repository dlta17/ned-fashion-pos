
import React, { useState, useEffect, useRef } from 'react';
import { Product, TransactionType, Variant } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { CloseIcon } from './icons/CloseIcon';

interface ProductFormProps {
    product?: Product | null;
    onSubmit: (productData: any) => void;
    onCancel: () => void;
    loading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel, loading }) => {
    const { t } = useI18n();
    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        category: '',
        brand: '',
        stock: 0,
        reorderPoint: 0,
        costPrice: 0,
        sellingPrice: 0,
        rentalPricePerDay: 0,
        transactionType: TransactionType.SALE,
    });

    // Variants State
    const [variants, setVariants] = useState<Variant[]>([]);
    const [newVariant, setNewVariant] = useState({ color: '', size: '', material: '', stock: 0 });
    
    // Refs for Focus Management
    const nameInputRef = useRef<HTMLInputElement>(null);
    const categoryInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                barcode: product.barcode,
                category: product.category,
                brand: product.brand,
                stock: product.stock,
                reorderPoint: product.reorderPoint,
                costPrice: product.costPrice,
                sellingPrice: product.sellingPrice || 0,
                rentalPricePerDay: product.rentalPricePerDay || 0,
                transactionType: product.transactionType,
            });
            setVariants(product.variants || []);
        } else {
            setFormData({
                name: '',
                barcode: '',
                category: '',
                brand: '',
                stock: 0,
                reorderPoint: 0,
                costPrice: 0,
                sellingPrice: 0,
                rentalPricePerDay: 0,
                transactionType: TransactionType.SALE,
            });
            setVariants([]);
        }
    }, [product]);

    useEffect(() => {
        if (variants.length > 0) {
            const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
            setFormData(prev => ({ ...prev, stock: totalStock }));
        }
    }, [variants]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumber = e.target.getAttribute('type') === 'number';
        setFormData(prev => ({
            ...prev,
            [name]: isNumber ? parseFloat(value) || 0 : value,
        }));
    };

    const generateBarcode = () => {
        const randomPart = Math.floor(1000000000 + Math.random() * 9000000000);
        setFormData(prev => ({ ...prev, barcode: randomPart.toString() }));
    };
    
    const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nameInputRef.current && !formData.name) {
                nameInputRef.current.focus();
            } else if (categoryInputRef.current) {
                categoryInputRef.current.focus();
            }
        }
    };

    const handleVariantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const isNumber = name === 'stock';
        setNewVariant(prev => ({
            ...prev,
            [name]: isNumber ? parseFloat(value) || 0 : value
        }));
    };

    const handleAddVariant = () => {
        if (!newVariant.color && !newVariant.size && !newVariant.material) return;
        const variantToAdd: Variant = {
            id: `var-${Date.now()}`,
            color: newVariant.color,
            size: newVariant.size,
            material: newVariant.material,
            stock: newVariant.stock
        };
        setVariants([...variants, variantToAdd]);
        setNewVariant({ color: '', size: '', material: '', stock: 0 });
    };

    const handleRemoveVariant = (id: string) => {
        setVariants(variants.filter(v => v.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isService = formData.transactionType === TransactionType.SERVICE;
        const submissionData = {
            ...formData,
            stock: isService ? 999999 : formData.stock,
            sellingPrice: formData.transactionType === TransactionType.SALE || isService ? formData.sellingPrice : undefined,
            rentalPricePerDay: formData.transactionType === TransactionType.RENTAL ? formData.rentalPricePerDay : undefined,
            variants: variants, 
            serialNumbers: product?.serialNumbers || [],
        };
        onSubmit(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl">
             <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mb-2">
                <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">{t('productForm.transactionType')}</label>
                <select 
                    name="transactionType" 
                    value={formData.transactionType} 
                    onChange={handleChange} 
                    className="block w-full px-4 py-2 bg-white border-2 border-indigo-100 rounded-xl shadow-sm focus:border-indigo-500 outline-none font-bold text-sm"
                >
                    <option value={TransactionType.SALE}>{t('enums.transactionType.SALE')}</option>
                    <option value={TransactionType.RENTAL}>{t('enums.transactionType.RENTAL')}</option>
                    <option value={TransactionType.SERVICE}>{t('enums.transactionType.SERVICE')}</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                {/* السطر الأول: الاسم والباركود جنباً إلى جنب */}
                <div className="flex flex-col">
                    <label className="block text-xs font-black text-slate-500 mb-1">{t('productForm.name')}</label>
                    <input 
                        ref={nameInputRef}
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        placeholder="مثلاً: قميص قطني رسمي"
                        className="block w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="block text-xs font-black text-slate-500 mb-1">{t('productForm.barcode')}</label>
                    <div className="flex gap-1.5">
                        <input 
                            type="text" 
                            name="barcode" 
                            value={formData.barcode} 
                            onChange={handleChange} 
                            onKeyDown={handleBarcodeKeyDown}
                            required 
                            placeholder="الكود..."
                            className="flex-1 px-4 py-2.5 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm text-indigo-600"
                        />
                        <button 
                            type="button" 
                            onClick={generateBarcode}
                            className="px-4 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                        >
                            توليد
                        </button>
                    </div>
                </div>

                {/* السطر الثاني: القسم والماركة */}
                <div className="flex flex-col">
                    <label className="block text-xs font-black text-slate-500 mb-1">{t('productForm.category')}</label>
                    <input 
                        ref={categoryInputRef}
                        type="text" 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange} 
                        required 
                        placeholder="رجالي / نسائي..."
                        className="block w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="block text-xs font-black text-slate-500 mb-1">{t('productForm.brand')}</label>
                    <input 
                        type="text" 
                        name="brand" 
                        value={formData.brand} 
                        onChange={handleChange} 
                        required 
                        placeholder="زارا / نايكي..."
                        className="block w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm"
                    />
                </div>
                
                {/* السطر الثالث: المخزون وحد الطلب */}
                {formData.transactionType !== TransactionType.SERVICE && (
                    <>
                        <div className="flex flex-col">
                            <label className="block text-xs font-black text-slate-500 mb-1">{t('productForm.stock')}</label>
                            <input 
                                type="number" 
                                name="stock" 
                                value={formData.stock} 
                                onChange={handleChange} 
                                required 
                                readOnly={variants.length > 0} 
                                className={`block w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm ${variants.length > 0 ? 'bg-slate-50 text-slate-400' : ''}`}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="block text-xs font-black text-slate-500 mb-1">{t('productForm.reorderPoint')}</label>
                            <input type="number" name="reorderPoint" value={formData.reorderPoint} onChange={handleChange} required className="block w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm"/>
                        </div>
                    </>
                )}
                
                {/* السطر الرابع: التكلفة والسعر */}
                <div className="flex flex-col">
                    <label className="block text-xs font-black text-slate-500 mb-1">{t('productForm.costPrice')}</label>
                    <input type="number" step="0.01" name="costPrice" value={formData.costPrice} onChange={handleChange} required className="block w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm"/>
                </div>

                {formData.transactionType === TransactionType.RENTAL ? (
                    <div className="flex flex-col">
                        <label className="block text-xs font-black text-indigo-500 mb-1">{t('productForm.rentalPricePerDay')}</label>
                        <input type="number" step="0.01" name="rentalPricePerDay" value={formData.rentalPricePerDay} onChange={handleChange} required className="block w-full px-4 py-2.5 border-2 border-indigo-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm text-indigo-600"/>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <label className="block text-xs font-black text-green-600 mb-1">{t('productForm.sellingPrice')}</label>
                        <input type="number" step="0.01" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} required className="block w-full px-4 py-2.5 border-2 border-green-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm text-green-700"/>
                    </div>
                )}
            </div>

            {/* Variants Section */}
            {formData.transactionType !== TransactionType.SERVICE && (
                <div className="border-t border-slate-100 pt-4 mt-4">
                    <h3 className="text-sm font-black text-slate-800 mb-3">{t('productForm.variants.title')}</h3>
                    
                    {variants.length > 0 ? (
                        <div className="bg-slate-50 rounded-2xl border border-slate-100 mb-3 overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-200 text-right">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('productForm.variants.color')}</th>
                                        <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('productForm.variants.size')}</th>
                                        <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('productForm.variants.material')}</th>
                                        <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('productForm.variants.stock')}</th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {variants.map((v) => (
                                        <tr key={v.id}>
                                            <td className="px-3 py-2 text-xs font-bold text-slate-700">{v.color || '-'}</td>
                                            <td className="px-3 py-2 text-xs font-bold text-slate-700">{v.size || '-'}</td>
                                            <td className="px-3 py-2 text-xs font-bold text-slate-700">{v.material || '-'}</td>
                                            <td className="px-3 py-2 text-xs font-black text-indigo-600">{v.stock}</td>
                                            <td className="px-3 py-2 text-center">
                                                <button type="button" onClick={() => handleRemoveVariant(v.id)} className="text-rose-500 hover:text-rose-700 p-1">
                                                    <CloseIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : null}

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">{t('productForm.variants.color')}</label>
                            <input type="text" name="color" value={newVariant.color} onChange={handleVariantChange} className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold" placeholder="أحمر"/>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">{t('productForm.variants.size')}</label>
                            <input type="text" name="size" value={newVariant.size} onChange={handleVariantChange} className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold" placeholder="XL"/>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">{t('productForm.variants.material')}</label>
                            <input type="text" name="material" value={newVariant.material} onChange={handleVariantChange} className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold" placeholder="قطن"/>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">{t('productForm.variants.stock')}</label>
                            <input type="number" name="stock" value={newVariant.stock} onChange={handleVariantChange} className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold"/>
                        </div>
                        <div>
                            <button type="button" onClick={handleAddVariant} className="w-full py-1.5 bg-white text-indigo-600 border border-indigo-200 text-xs font-black rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                {t('productForm.variants.add')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-4 gap-3 border-t border-slate-100">
                <button type="button" onClick={onCancel} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-black text-sm hover:bg-slate-200 transition-all">
                    {t('common.cancel')}
                </button>
                <button type="submit" disabled={loading} className="px-10 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all">
                    {loading ? t('common.saving') : t('common.save')}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
