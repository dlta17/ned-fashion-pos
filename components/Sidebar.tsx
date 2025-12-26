
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { InventoryIcon } from './icons/InventoryIcon';
import { RepairsIcon } from './icons/RepairsIcon';
import { ReportsIcon } from './icons/ReportsIcon';
import { CloseIcon } from './icons/CloseIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { CashRegisterIcon } from './icons/CashRegisterIcon';
import { TruckIcon } from './icons/TruckIcon';
import { UsersIcon } from './icons/UsersIcon';
import { useI18n } from '../contexts/I18nContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200";
  const activeNavLinkClasses = "bg-indigo-600 text-white shadow-lg";

  const hasAccess = (allowedRoles: Role[]) => {
      if (!user) return false;
      return allowedRoles.includes(user.role);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      <div className="flex items-center justify-between px-6 py-8 border-b border-white/5">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white">N</div>
            <h1 className="text-lg font-black text-white tracking-tighter uppercase">{t('common.appName')}</h1>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
          <CloseIcon />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-3 opacity-50">الرئيسية</div>

        <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
          <DashboardIcon />
          <span className="ms-3 font-bold">{t('sidebar.dashboard')}</span>
        </NavLink>
        
        {hasAccess([Role.Designer, Role.Owner, Role.Admin, Role.Sales]) && (
          <>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-6 mb-4 px-3 opacity-50">العمليات اليومية</div>
            <NavLink to="/pos" onClick={() => setIsOpen(false)} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
              <CashRegisterIcon />
              <span className="ms-3 font-bold">{t('sidebar.pos')}</span>
            </NavLink>
            <NavLink to="/inventory" onClick={() => setIsOpen(false)} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
              <InventoryIcon />
              <span className="ms-3 font-bold">{t('sidebar.inventory')}</span>
            </NavLink>
            {/* خانة العملاء والمقاسات - ثابتة ومتاحة للجميع */}
            <NavLink to="/customers" onClick={() => setIsOpen(false)} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
              <UsersIcon />
              <span className="ms-3 font-bold">العملاء والمقاسات</span>
            </NavLink>
            <NavLink to="/reports" onClick={() => setIsOpen(false)} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                <ReportsIcon />
                <span className="ms-3 font-bold">التقارير والسجل</span>
            </NavLink>
          </>
        )}
        
        {hasAccess([Role.Designer, Role.Owner, Role.Admin, Role.Maintenance]) && (
          <>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-6 mb-4 px-3 opacity-50">الخدمات</div>
            <NavLink to="/repairs" onClick={() => setIsOpen(false)} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
              <RepairsIcon />
              <span className="ms-3 font-bold">{t('sidebar.repairs')}</span>
            </NavLink>
          </>
        )}

        {hasAccess([Role.Designer, Role.Owner, Role.Admin]) && (
          <>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-6 mb-4 px-3 opacity-50">الإدارة المالية</div>
            <NavLink to="/suppliers" onClick={() => setIsOpen(false)} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                <TruckIcon />
                <span className="ms-3 font-bold">{t('sidebar.suppliers')}</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="px-4 py-6 mt-auto border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all font-black text-sm">
              <LogoutIcon />
              <span className="ms-3">{t('sidebar.logout')}</span>
          </button>
      </div>
    </div>
  );

  return (
    <>
      <div className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
      <div className={`fixed inset-y-0 right-0 z-40 w-72 transform transition-transform duration-300 lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {sidebarContent}
      </div>
      <div className="hidden lg:flex lg:flex-shrink-0 border-l border-slate-800 shadow-2xl">
        <div className="flex flex-col w-72 h-screen">
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
