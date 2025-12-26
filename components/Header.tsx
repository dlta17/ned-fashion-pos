
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { MenuIcon } from './icons/MenuIcon';
import { CloseIcon } from './icons/CloseIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import NotificationBell from './NotificationBell';
import { CogIcon } from './icons/CogIcon';
import { useI18n } from '../contexts/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencySwitcher from './CurrencySwitcher';
import { useStore } from '../contexts/StoreContext';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { t } = useI18n();
    const { settings, license } = useStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const hasAccess = (allowedRoles: Role[]) => {
        if (!user) return false;
        return allowedRoles.includes(user.role);
    };

    return (
        <header className="bg-gray-800 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                             {settings.logoUrl && (
                                <img src={settings.logoUrl} alt="Logo" className="h-10 w-10 mr-3 object-contain rounded-full bg-white p-0.5" />
                             )}
                            <h1 className="text-xl font-bold text-white">{settings.name || t('common.appName')}</h1>
                        </div>
                        <div className="hidden md:block">
                            <div className="ms-10 flex items-baseline space-x-4 rtl:space-x-reverse">
                                <NavLink to="/dashboard" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-black transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>{t('sidebar.dashboard')}</NavLink>
                                {hasAccess([Role.Designer, Role.Owner, Role.Admin, Role.Sales]) && (
                                    <>
                                        <NavLink to="/pos" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-black transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>{t('sidebar.pos')}</NavLink>
                                        <NavLink to="/inventory" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-black transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>{t('sidebar.inventory')}</NavLink>
                                        <NavLink to="/customers" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-black transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>{t('customers.title')}</NavLink>
                                        <NavLink to="/reports" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-black transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>{t('sidebar.reports')}</NavLink>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        {license.latestVersion && (
                            <NavLink to="/settings" className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black animate-pulse shadow-lg shadow-indigo-500/50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                تحديث متاح {license.latestVersion}
                            </NavLink>
                        )}

                        <CurrencySwitcher />
                        <LanguageSwitcher />
                        <NotificationBell />
                        
                        {hasAccess([Role.Designer, Role.Owner, Role.Admin]) && (
                            <NavLink to="/settings" title={t('sidebar.settings')} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-all">
                                <CogIcon />
                            </NavLink>
                        )}

                        <button onClick={handleLogout} className="flex items-center p-2 text-rose-400 hover:text-white hover:bg-rose-600 rounded-xl transition-all">
                            <LogoutIcon />
                        </button>
                    </div>
                    
                    <div className="-me-2 flex md:hidden gap-2">
                        <NotificationBell />
                        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="bg-gray-700 p-2 rounded-xl text-gray-300">
                            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden bg-gray-800 border-t border-gray-700 p-4 space-y-2 animate-in slide-in-from-top duration-300">
                    <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-white font-black bg-gray-700">لوحة التحكم</NavLink>
                    {hasAccess([Role.Designer, Role.Owner, Role.Admin, Role.Sales]) && (
                        <>
                            <NavLink to="/pos" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-white font-black hover:bg-gray-700 transition-all">نقطة البيع</NavLink>
                            <NavLink to="/inventory" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-white font-black hover:bg-gray-700 transition-all">المخزون</NavLink>
                            <NavLink to="/customers" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-white font-black hover:bg-gray-700 transition-all">العملاء</NavLink>
                            <NavLink to="/reports" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-white font-black hover:bg-gray-700 transition-all">التقارير</NavLink>
                        </>
                    )}
                    <div className="border-t border-gray-700 pt-2 flex justify-between">
                         <button onClick={handleLogout} className="text-rose-400 font-black p-2">خروج</button>
                         <NavLink to="/settings" onClick={() => setMobileMenuOpen(false)} className="text-gray-400 p-2">الإعدادات</NavLink>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
