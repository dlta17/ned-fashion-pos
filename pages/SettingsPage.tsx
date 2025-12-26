
import React, { useState, useEffect, useRef } from 'react';
import PageHeader from '../components/common/PageHeader';
import { useI18n } from '../contexts/I18nContext';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { User, Role } from '../types';
import { getUsers, addUser, updateUser, deleteUser, exportSystemData, importSystemData } from '../services/api';
import Modal from '../components/common/Modal';
import { EditIcon } from '../components/icons/EditIcon';
import { CloseIcon } from '../components/icons/CloseIcon';

const SettingsPage: React.FC = () => {
    const { settings: storeSettings, updateSettings, license, setRemoteSyncUrl, refreshRemoteStatus } = useStore();
    const { user: currentUser } = useAuth();
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<'general' | 'users' | 'backup' | 'license'>('general');
    const [users, setUsers] = useState<User[]>([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userForm, setUserForm] = useState({ username: '', password: '', role: Role.Sales });
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [tempSyncUrl, setTempSyncUrl] = useState(license.remoteSyncUrl || '');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
    }, [activeTab]);

    const fetchUsers = async () => {
        const data = await getUsers();
        setUsers(data);
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUserId) {
            await updateUser(editingUserId, userForm);
        } else {
            await addUser(userForm);
        }
        setIsUserModalOpen(false);
        fetchUsers();
    };

    const handleDeleteUser = async (id: string) => {
        if (id === 'u-designer' || id === 'u-owner') {
            alert("لا يمكن حذف الحسابات الأساسية للنظام.");
            return;
        }
        if (window.confirm("حذف هذا الموظف؟")) {
            await deleteUser(id);
            fetchUsers();
        }
    };

    const handleDownloadBackup = () => {
        const data = exportSystemData();
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ned_pos_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const data = JSON.parse(ev.target?.result as string);
            if (importSystemData(data)) {
                alert("تم استعادة البيانات بنجاح! سيتم إعادة التحميل.");
                window.location.reload();
            }
        };
        reader.readAsText(file);
    };

    const isDesigner = currentUser?.role === Role.Designer;
    const hasUpdate = license.latestVersion && license.latestVersion !== license.currentVersion;

    return (
        <div className="pb-10 animate-in fade-in duration-500">
            <PageHeader title="الإعدادات المتقدمة" />
            
            <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl shadow-sm overflow-x-auto">
                {[
                    {id: 'general', label: 'بيانات المحل'}, 
                    {id: 'users', label: 'إدارة الموظفين'}, 
                    {id: 'backup', label: 'البيانات والنسخ'}, 
                    {id: 'license', label: 'التحديثات والترخيص'}
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        className={`py-4 px-6 font-black transition-all whitespace-nowrap text-sm ${activeTab === tab.id ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setActiveTab(tab.id as any)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-b-xl shadow-xl p-8 border border-gray-100 min-h-[400px]">
                
                {activeTab === 'general' && (
                    <div className="max-w-2xl space-y-10">
                        <div className="flex items-center gap-8 bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200">
                            <div className="relative group">
                                <div className="w-32 h-32 bg-white rounded-2xl border-2 border-slate-200 overflow-hidden flex items-center justify-center">
                                    {storeSettings.logoUrl ? <img src={storeSettings.logoUrl} className="w-full h-full object-contain" /> : <span className="text-xs text-slate-300">لا يوجد شعار</span>}
                                </div>
                                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-lg"><EditIcon /></button>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={e => {
                                    const file = e.target.files?.[0];
                                    if(file) {
                                        const r = new FileReader();
                                        r.onloadend = () => updateSettings({ logoUrl: r.result as string });
                                        r.readAsDataURL(file);
                                    }
                                }} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800">بيانات المتجر</h3>
                                <p className="text-sm text-slate-500">تظهر هذه المعلومات في أعلى الفاتورة المطبوعة</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">اسم المحل التجاري</label>
                                <input type="text" value={storeSettings.name} onChange={e => updateSettings({ name: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">اسم المالك</label>
                                <input type="text" value={storeSettings.ownerName} onChange={e => updateSettings({ ownerName: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">رقم الجوال للتواصل</label>
                                <input type="text" value={storeSettings.phone} onChange={e => updateSettings({ phone: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">رسالة تذييل الفاتورة</label>
                                <input type="text" value={storeSettings.footerText} onChange={e => updateSettings({ footerText: e.target.value })} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-black">إدارة طاقم العمل</h2>
                            <button onClick={() => { setEditingUserId(null); setUserForm({username:'', password:'', role:Role.Sales}); setIsUserModalOpen(true); }} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg">+ إضافة موظف</button>
                        </div>
                        <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                            <table className="w-full text-right">
                                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
                                    <tr>
                                        <th className="p-5">اسم المستخدم</th>
                                        <th className="p-5 text-center">الصلاحية</th>
                                        <th className="p-5 text-end">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-5 font-black text-slate-800">{u.username}</td>
                                            <td className="p-5 text-center">
                                                <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase">
                                                    {u.role === Role.Sales ? 'مبيعات' : u.role === Role.Admin ? 'مدير' : u.role === Role.Maintenance ? 'خياط' : 'مالك'}
                                                </span>
                                            </td>
                                            <td className="p-5 text-end">
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => { setEditingUserId(u.id); setUserForm({username:u.username, password:u.password||'', role:u.role}); setIsUserModalOpen(true); }} className="p-2 bg-slate-100 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><EditIcon /></button>
                                                    <button onClick={() => handleDeleteUser(u.id)} className="p-2 bg-slate-100 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><CloseIcon /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'backup' && (
                    <div className="max-w-2xl space-y-8">
                        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200">
                            <h2 className="text-2xl font-black mb-2">تصدير كافة البيانات</h2>
                            <p className="text-xs opacity-70 mb-8 font-bold leading-relaxed">قم بتحميل نسخة احتياطية من مبيعاتك ومنتجاتك وعملائك في ملف JSON واحد. يمكنك الاحتفاظ بهذا الملف على قرص خارجي.</p>
                            <button onClick={handleDownloadBackup} className="bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl">تحميل النسخة الآن</button>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                            <h2 className="text-xl font-black text-slate-800 mb-2">استيراد بيانات سابقة</h2>
                            <p className="text-xs text-slate-400 mb-8 font-bold">تحذير: هذه العملية ستقوم باستبدال كافة البيانات الحالية بالبيانات الموجودة في الملف المرفوع.</p>
                            <input type="file" ref={importInputRef} className="hidden" accept=".json" onChange={handleImportBackup} />
                            <button onClick={() => importInputRef.current?.click()} className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-black hover:bg-black transition-all">اختر ملف الاستعادة</button>
                        </div>
                    </div>
                )}

                {activeTab === 'license' && (
                    <div className="space-y-8">
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white border-t-8 border-indigo-600 shadow-2xl">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-black flex items-center gap-3">
                                        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                        معلومات الترخيص
                                    </h2>
                                    <p className="text-slate-400 text-xs mt-1 font-bold">رقم التعريف الفني لجهازك: <span className="text-indigo-400 font-mono">{license.hardwareId}</span></p>
                                </div>
                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${license.isActivated ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {license.isActivated ? 'نسخة مفعلة' : 'فترة تجريبية'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                <div className="space-y-2">
                                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">نسخة البرنامج</div>
                                    <div className="text-xl font-black text-white">v{license.currentVersion}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">تحديثات السحاب</div>
                                    <div className="flex items-center gap-2">
                                        {hasUpdate ? (
                                            <span className="text-rose-500 font-black text-sm flex items-center gap-2">
                                                <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                                                يتوفر تحديث جديد v{license.latestVersion}
                                            </span>
                                        ) : (
                                            <span className="text-green-500 font-black text-sm">أنت تستخدم أحدث إصدار</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {hasUpdate && (
                                <div className="mt-8 p-6 bg-indigo-600/20 rounded-3xl border border-indigo-600/30">
                                    <h4 className="font-black text-white text-sm mb-2">مميزات التحديث القادم:</h4>
                                    <p className="text-slate-300 text-xs leading-relaxed mb-4">{license.updateDescription || 'تحديثات أمان وتحسينات عامة في الأداء.'}</p>
                                    <button onClick={() => window.open(license.updateUrl, '_blank')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40">تحديث البرنامج الآن</button>
                                </div>
                            )}
                            
                            <button onClick={() => refreshRemoteStatus()} className="mt-8 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">إعادة مزامنة السحاب ↻</button>
                        </div>

                        {isDesigner ? (
                            <div className="space-y-4 pt-6 bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200">
                                <h3 className="text-indigo-600 font-black text-sm flex items-center gap-2">
                                    ⚙️ لوحة تحكم المطور (نضال)
                                </h3>
                                <div className="space-y-2">
                                    <label className="text-[9px] text-slate-400 font-black uppercase">رابط مزامنة GitHub Raw URL</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={tempSyncUrl} onChange={e => setTempSyncUrl(e.target.value)} className="flex-1 bg-white border border-slate-200 p-4 rounded-xl text-xs font-mono" placeholder="https://raw.githubusercontent.com/..." />
                                        <button onClick={() => { setRemoteSyncUrl(tempSyncUrl); alert("تم حفظ رابط السحاب بنجاح!"); }} className="bg-indigo-600 text-white px-8 rounded-xl font-black hover:bg-indigo-700 transition-all text-sm">تطبيق</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-6 text-slate-300 text-xs italic">
                                جميع الحقوق محفوظة لـ NED AI LABS. لا يمكن تعديل إعدادات السيرفر إلا من خلال المطور.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={editingUserId ? "تعديل الموظف" : "إضافة موظف جديد"}>
                <form onSubmit={handleSaveUser} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">اسم الدخول</label>
                        <input type="text" placeholder="Username" required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">كلمة المرور</label>
                        <input type="password" placeholder="••••••••" required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">الصلاحية</label>
                        <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold bg-white" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as any})}>
                            <option value={Role.Sales}>مبيعات فقط</option>
                            <option value={Role.Maintenance}>خياط / ترزي</option>
                            <option value={Role.Admin}>مدير فرع</option>
                            <option value={Role.Owner}>مالك المحل</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">حفظ البيانات</button>
                </form>
            </Modal>
        </div>
    );
};

export default SettingsPage;
