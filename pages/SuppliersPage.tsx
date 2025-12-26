
import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import { Supplier, Purchase, Product, Role, PurchaseItem } from '../types';
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier, getPurchases, addPurchase, getProducts } from '../services/api';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/common/Modal';
import { EditIcon } from '../components/icons/EditIcon';
import { CloseIcon } from '../components/icons/CloseIcon';

const SuppliersPage: React.FC = () => {
    const { t, formatCurrency } = useI18n();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'list' | 'purchases'>('list');
    
    // Data States
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [supplierForm, setSupplierForm] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '' });
    const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);

    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [purchaseForm, setPurchaseForm] = useState<{
        supplierId: string;
        items: PurchaseItem[];
    }>({ supplierId: '', items: [] });
    
    // Helper state for adding items to purchase
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [itemQty, setItemQty] = useState(1);
    const [itemCost, setItemCost] = useState(0);

    const canManage = [Role.Designer, Role.Owner, Role.Admin].includes(user?.role || Role.Sales);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [supData, purData, prodData] = await Promise.all([
                getSuppliers(),
                getPurchases(),
                getProducts()
            ]);
            setSuppliers(supData);
            setPurchases(purData);
            setProducts(prodData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- Supplier CRUD ---

    const handleOpenSupplierModal = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplierId(supplier.id);
            setSupplierForm({ ...supplier });
        } else {
            setEditingSupplierId(null);
            setSupplierForm({ name: '', contactPerson: '', phone: '', email: '', address: '' });
        }
        setIsSupplierModalOpen(true);
    };

    const handleSaveSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSupplierId) {
                await updateSupplier(editingSupplierId, supplierForm);
            } else {
                await addSupplier(supplierForm);
            }
            await fetchData();
            setIsSupplierModalOpen(false);
        } catch (error) {
            alert("Error saving supplier");
        }
    };

    const handleDeleteSupplier = async (id: string) => {
        if (window.confirm(t('suppliers.confirmDelete'))) {
            await deleteSupplier(id);
            await fetchData();
        }
    };

    // --- Purchase Invoice Logic ---

    const handleOpenPurchaseModal = () => {
        setPurchaseForm({ supplierId: '', items: [] });
        setSelectedProduct('');
        setItemQty(1);
        setItemCost(0);
        setIsPurchaseModalOpen(true);
    };

    const handleAddItemToPurchase = () => {
        if (!selectedProduct || itemQty <= 0 || itemCost < 0) return;
        
        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        const newItem: PurchaseItem = {
            productId: product.id,
            productName: product.name,
            quantity: itemQty,
            costPrice: itemCost
        };

        setPurchaseForm(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));

        // Reset item inputs
        setSelectedProduct('');
        setItemQty(1);
        setItemCost(0);
    };

    const handleRemoveItemFromPurchase = (index: number) => {
        setPurchaseForm(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSavePurchase = async () => {
        if (!purchaseForm.supplierId || purchaseForm.items.length === 0) {
            alert("Please select a supplier and add items.");
            return;
        }

        const supplier = suppliers.find(s => s.id === purchaseForm.supplierId);
        if (!supplier) return;

        const totalCost = purchaseForm.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

        try {
            await addPurchase({
                supplierId: supplier.id,
                supplierName: supplier.name,
                items: purchaseForm.items,
                totalCost
            });
            await fetchData();
            setIsPurchaseModalOpen(false);
        } catch (error) {
            alert("Failed to save purchase");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div>
            <PageHeader title={t('suppliers.title')} />

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button 
                    className={`py-2 px-4 font-medium ${activeTab === 'list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('list')}
                >
                    {t('suppliers.tabs.list')}
                </button>
                <button 
                    className={`py-2 px-4 font-medium ${activeTab === 'purchases' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('purchases')}
                >
                    {t('suppliers.tabs.purchases')}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'list' && (
                <div>
                    <div className="flex justify-end mb-4 gap-2">
                        {canManage && (
                            <>
                                <button onClick={() => handleOpenSupplierModal()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                    {t('suppliers.addSupplier')}
                                </button>
                                <button onClick={handleOpenPurchaseModal} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                    {t('suppliers.newPurchase')}
                                </button>
                            </>
                        )}
                    </div>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('suppliers.table.name')}</th>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('suppliers.table.contact')}</th>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('suppliers.table.phone')}</th>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('suppliers.table.address')}</th>
                                    <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {suppliers.map(s => (
                                    <tr key={s.id}>
                                        <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{s.contactPerson}</td>
                                        <td className="px-6 py-4 text-gray-500">{s.phone}</td>
                                        <td className="px-6 py-4 text-gray-500">{s.address}</td>
                                        <td className="px-6 py-4 text-end flex justify-end gap-2">
                                            {canManage && (
                                                <>
                                                    <button onClick={() => handleOpenSupplierModal(s)} className="text-blue-600 hover:text-blue-900"><EditIcon /></button>
                                                    <button onClick={() => handleDeleteSupplier(s.id)} className="text-red-600 hover:text-red-900"><CloseIcon /></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'purchases' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                     <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('suppliers.table.date')}</th>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('suppliers.table.name')}</th>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('suppliers.table.items')}</th>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('suppliers.table.total')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {purchases.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{p.supplierName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {p.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(p.totalCost)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                </div>
            )}

            {/* Supplier Modal */}
            <Modal isOpen={isSupplierModalOpen} onClose={() => setIsSupplierModalOpen(false)} title={editingSupplierId ? t('suppliers.editSupplier') : t('suppliers.addSupplier')}>
                <form onSubmit={handleSaveSupplier} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('suppliers.form.name')}</label>
                        <input type="text" required value={supplierForm.name} onChange={e => setSupplierForm({...supplierForm, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('suppliers.form.contactPerson')}</label>
                        <input type="text" value={supplierForm.contactPerson} onChange={e => setSupplierForm({...supplierForm, contactPerson: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('suppliers.form.phone')}</label>
                        <input type="text" required value={supplierForm.phone} onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('suppliers.form.address')}</label>
                        <input type="text" value={supplierForm.address} onChange={e => setSupplierForm({...supplierForm, address: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div className="flex justify-end pt-4 gap-2">
                        <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">{t('common.save')}</button>
                    </div>
                </form>
            </Modal>

            {/* Purchase Invoice Modal */}
            <Modal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} title={t('suppliers.newPurchase')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('suppliers.form.selectSupplier')}</label>
                        <select 
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                            value={purchaseForm.supplierId}
                            onChange={(e) => setPurchaseForm({...purchaseForm, supplierId: e.target.value})}
                        >
                            <option value="">-- Select --</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="border p-3 rounded bg-gray-50">
                        <h4 className="text-sm font-bold mb-2 text-gray-700">Add Items</h4>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="col-span-2">
                                <label className="block text-xs text-gray-500">{t('suppliers.form.selectProduct')}</label>
                                <select 
                                    className="w-full border rounded p-1 text-sm"
                                    value={selectedProduct}
                                    onChange={e => {
                                        const pid = e.target.value;
                                        setSelectedProduct(pid);
                                        const prod = products.find(p => p.id === pid);
                                        if (prod) setItemCost(prod.costPrice);
                                    }}
                                >
                                    <option value="">-- Product --</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500">{t('suppliers.form.quantity')}</label>
                                <input type="number" min="1" className="w-full border rounded p-1 text-sm" value={itemQty} onChange={e => setItemQty(Number(e.target.value))} />
                            </div>
                             <div>
                                <label className="block text-xs text-gray-500">{t('suppliers.form.costPrice')}</label>
                                <input type="number" min="0" className="w-full border rounded p-1 text-sm" value={itemCost} onChange={e => setItemCost(Number(e.target.value))} />
                            </div>
                        </div>
                        <button onClick={handleAddItemToPurchase} className="mt-2 w-full bg-gray-200 text-gray-800 text-sm py-1 rounded hover:bg-gray-300">
                             {t('suppliers.form.add')}
                        </button>
                    </div>

                    {/* Items List */}
                    <div className="max-h-40 overflow-y-auto border-t border-b py-2">
                        {purchaseForm.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm py-1">
                                <span>{item.productName} (x{item.quantity}) @ {formatCurrency(item.costPrice)}</span>
                                <button onClick={() => handleRemoveItemFromPurchase(idx)} className="text-red-500">x</button>
                            </div>
                        ))}
                        {purchaseForm.items.length === 0 && <p className="text-xs text-gray-400 text-center">No items added.</p>}
                    </div>

                    <div className="flex justify-between items-center font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(purchaseForm.items.reduce((acc, i) => acc + (i.costPrice * i.quantity), 0))}</span>
                    </div>

                    <div className="flex justify-end pt-4 gap-2">
                        <button onClick={() => setIsPurchaseModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">{t('common.cancel')}</button>
                        <button onClick={handleSavePurchase} className="px-4 py-2 bg-green-600 text-white rounded-md">{t('common.save')}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SuppliersPage;
