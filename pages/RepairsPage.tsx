


import React, { useState, useEffect, useMemo } from 'react';
import { getRepairs, addRepair, updateRepairStatus } from '../services/api';
import { Repair, RepairStatus, Role } from '../types';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { useStore } from '../contexts/StoreContext';
import { printRepairTicket } from '../utils/printUtils';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { WrenchIcon } from '../components/icons/WrenchIcon'; // Can replace with Scissors icon if imported

const RepairsPage: React.FC = () => {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<RepairStatus | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    deviceModel: '',
    serialNumber: '',
    issueDescription: ''
  });

  const { user } = useAuth();
  const { t, language } = useI18n();
  const { settings: storeSettings } = useStore();

  const fetchRepairs = async () => {
    setLoading(true);
    setError(null);
    try {
        const repairData = await getRepairs();
        setRepairs(repairData);
    } catch (error) {
        console.error("Error fetching repairs:", error);
        setError(t('repairs.errors.fetchFailed'));
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const filteredRepairs = useMemo(() => {
    if (activeFilter === 'all') {
      return repairs;
    }
    return repairs.filter(repair => repair.status === activeFilter);
  }, [repairs, activeFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if(!formData.customerName.trim() || !formData.deviceModel.trim() || !formData.issueDescription.trim()) {
        alert("Please fill all required fields.");
        return;
    }

    setIsSaving(true);
    try {
        const newRepair = await addRepair(formData);
        
        await fetchRepairs();
        setIsAddModalOpen(false);
        setFormData({ customerName: '', deviceModel: '', serialNumber: '', issueDescription: '' });

        setTimeout(() => {
            if(window.confirm(t('repairs.confirmPrint'))) {
                printRepairTicket(newRepair, storeSettings, language);
            }
        }, 100);

    } catch (error) {
        console.error("Failed to add repair", error);
        alert("Error saving repair ticket.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleStatusUpdate = async (repair: Repair, nextStatus: RepairStatus) => {
      // Specific Confirmation for Delivery
      if (nextStatus === RepairStatus.COMPLETED) {
           if (!window.confirm(t('repairs.confirmDeliver'))) return;
      } else {
           if (!window.confirm(`Change status to ${t('enums.repairStatus.' + nextStatus)}?`)) return;
      }

      setUpdatingId(repair.id);
      try {
          await updateRepairStatus(repair.id, nextStatus);
          await fetchRepairs();
          
          if (nextStatus === RepairStatus.COMPLETED) {
              // Automatically print delivery note
              printRepairTicket({ ...repair, status: nextStatus }, storeSettings, language);
          }

      } catch (err) {
          console.error(err);
          alert(t('repairs.errors.updateFailed'));
      } finally {
          setUpdatingId(null);
      }
  };

  const getStatusColor = (status: RepairStatus) => {
    switch (status) {
      case RepairStatus.PENDING: return 'bg-gray-100 text-gray-800';
      case RepairStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
      case RepairStatus.READY: return 'bg-yellow-100 text-yellow-800';
      case RepairStatus.COMPLETED: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderActionButton = (repair: Repair) => {
      if (updatingId === repair.id) return <span className="text-gray-500 text-xs">Updating...</span>;

      switch(repair.status) {
          case RepairStatus.PENDING:
              return (
                  <button 
                    onClick={() => handleStatusUpdate(repair, RepairStatus.IN_PROGRESS)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    {t('repairs.actions.start')}
                  </button>
              );
          case RepairStatus.IN_PROGRESS:
              return (
                   <button 
                    onClick={() => handleStatusUpdate(repair, RepairStatus.READY)}
                    className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
                  >
                    {t('repairs.actions.finish')}
                  </button>
              );
           case RepairStatus.READY:
              return (
                   <button 
                    onClick={() => handleStatusUpdate(repair, RepairStatus.COMPLETED)}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                  >
                    {t('repairs.actions.deliver')}
                  </button>
              );
           default:
               return (
                   <button 
                        onClick={() => {
                            if(window.confirm(t('repairs.confirmPrintTicket', { customer: repair.customerName }))) {
                                printRepairTicket(repair, storeSettings, language);
                            }
                        }} 
                        className="text-gray-500 hover:text-gray-800 transition-colors" 
                        title="Print Ticket"
                    >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    </button>
               );
      }
  }

  const canManageRepairs = user?.role === Role.Admin || user?.role === Role.Maintenance || user?.role === Role.Owner || user?.role === Role.Designer;

  if (loading) return <LoadingSpinner />;

  if (error) {
      return (
          <div className="flex flex-col items-center justify-center h-64">
              <div className="text-red-500 mb-4">{error}</div>
              <button onClick={fetchRepairs} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Retry
              </button>
          </div>
      )
  }

  return (
    <div>
      <PageHeader 
        title={t('repairs.title')} 
        buttonText={canManageRepairs ? t('repairs.newDevice') : undefined}
        onButtonClick={canManageRepairs ? () => setIsAddModalOpen(true) : undefined}
      />
      
      <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
        {(['all', RepairStatus.PENDING, RepairStatus.IN_PROGRESS, RepairStatus.READY, RepairStatus.COMPLETED] as const).map(status => (
             <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${
                    activeFilter === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status === 'all' ? t('common.all') : t(`enums.repairStatus.${status}`)}
              </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('repairs.table.customerDevice')}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('repairs.table.issue')}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('repairs.table.receivedDate')}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('repairs.table.status')}</th>
                <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">{t('repairs.table.action')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRepairs.length === 0 ? (
                 <tr>
                     <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                            <WrenchIcon />
                            <p className="mt-2">{t('repairs.empty')}</p>
                        </div>
                     </td>
                 </tr>
              ) : (
                  filteredRepairs.map((repair) => (
                    <tr key={repair.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{repair.customerName}</div>
                        <div className="text-sm text-gray-500">{repair.deviceModel}</div>
                        <div className="text-xs text-gray-400 font-mono">{repair.serialNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 max-w-xs truncate" title={repair.issueDescription}>
                              {repair.issueDescription}
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {repair.receivedDate ? new Date(repair.receivedDate).toLocaleDateString(language) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(repair.status)}`}>
                          {t(`enums.repairStatus.${repair.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                         {renderActionButton(repair)}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('repairs.newDevice')}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('repairs.form.customerName')}</label>
                    <input 
                        type="text" 
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t('repairs.form.deviceModel')}</label>
                    <input 
                        type="text" 
                        name="deviceModel"
                        value={formData.deviceModel}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Suit, Dress, Jeans"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">{t('repairs.form.serialNumber')}</label>
                <input 
                    type="text" 
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="Color / Size / Tag No."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">{t('repairs.form.issue')}</label>
                <textarea 
                    name="issueDescription"
                    value={formData.issueDescription}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    placeholder="e.g. Shorten sleeves 2cm, fix zipper..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div className="flex justify-end pt-4 space-x-2 rtl:space-x-reverse">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors">
                    {t('common.cancel')}
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors shadow-sm">
                    {isSaving ? t('common.saving') : t('common.save')}
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default RepairsPage;
