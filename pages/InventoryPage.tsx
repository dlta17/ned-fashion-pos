

import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/api';
import { Product, Role, TransactionType } from '../types';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import ProductForm from '../components/ProductForm';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { BarcodeIcon } from '../components/icons/BarcodeIcon';
import { printBarcodeLabel } from '../utils/printUtils';
import { useStore } from '../contexts/StoreContext';

const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const { user } = useAuth();
  const { t, formatCurrency, currency, language } = useI18n();
  const { settings: storeSettings } = useStore();

  const fetchProductData = async () => {
      setLoading(true);
      const productData = await getProducts();
      setProducts(productData);
      setLoading(false);
  };
  
  useEffect(() => {
    fetchProductData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm(t('inventory.deleteConfirm'))) {
        try {
            await deleteProduct(productId);
            await fetchProductData();
        } catch (error) {
            console.error("Failed to delete product", error);
        }
    }
  };

  const handlePrintBarcode = (product: Product) => {
      if (!product.barcode) {
          alert("No barcode to print");
          return;
      }
      
      const copiesStr = prompt(t('common.enterCopies'), "1");
      if (!copiesStr) return;
      const copies = parseInt(copiesStr);
      if (isNaN(copies) || copies < 1) return;

      printBarcodeLabel(product, storeSettings, language, currency.code, copies);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };
  
  const handleFormSubmit = async (productData: Omit<Product, 'id'>) => {
    setFormLoading(true);
    try {
        if (editingProduct) {
            await updateProduct(editingProduct.id, productData);
        } else {
            await addProduct(productData);
        }
        await fetchProductData();
        handleCloseModal();
    } catch (error) {
        console.error("Failed to save product", error);
        alert(t('inventory.errors.saveFailed'));
    } finally {
        setFormLoading(false);
    }
  };


  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const renderStockStatus = (stock: number, reorderPoint: number) => {
    if (stock === 0) {
      return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">{t('inventory.status.outOfStock')}</span>;
    }
    if (stock <= reorderPoint) {
      return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">{t('inventory.status.lowStock')}</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">{t('inventory.status.inStock')}</span>;
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>;
  }

  const canManageInventory = [Role.Designer, Role.Owner, Role.Admin].includes(user?.role || Role.Sales);

  return (
    <div>
      <PageHeader 
        title={t('inventory.title')} 
        buttonText={canManageInventory ? t('inventory.addProduct') : undefined}
        onButtonClick={canManageInventory ? handleOpenAddModal : undefined}
      />
      
      <div className="mb-4">
        <input
          type="text"
          placeholder={t('inventory.searchPlaceholder')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.product')}</th>
                  <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.type')}</th>
                  <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.stock')}</th>
                  <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.price')}</th>
                  <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.status')}</th>
                  {canManageInventory && <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.actions')}</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.brand}</div>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.transactionType === TransactionType.RENTAL ? t('enums.transactionType.RENTAL') : t('enums.transactionType.SALE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.transactionType === TransactionType.RENTAL 
                            ? `${formatCurrency(product.rentalPricePerDay || 0)} / ${t('common.day')}`
                            : formatCurrency(product.sellingPrice || 0)
                        }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{renderStockStatus(product.stock, product.reorderPoint)}</td>
                    {canManageInventory && (
                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                        <button 
                            onClick={() => handlePrintBarcode(product)} 
                            className="text-gray-600 hover:text-black mx-2"
                            title={t('inventory.printBarcode')}
                        >
                            <BarcodeIcon />
                        </button>
                        <button onClick={() => handleOpenEditModal(product)} className="text-blue-600 hover:text-blue-900 mx-2">{t('common.edit')}</button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900 mx-2">
                           <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? t('inventory.editProduct') : t('inventory.addProduct')}>
        <ProductForm 
            product={editingProduct} 
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
            loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default InventoryPage;