
import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { StoreProvider, useStore } from './contexts/StoreContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { Role } from './types';
import { I18nProvider } from './contexts/I18nContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';

const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const InventoryPage = React.lazy(() => import('./pages/InventoryPage'));
const RepairsPage = React.lazy(() => import('./pages/RepairsPage'));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));
const POSPage = React.lazy(() => import('./pages/POSPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SuppliersPage = React.lazy(() => import('./pages/SuppliersPage'));
const CustomersPage = React.lazy(() => import('./pages/CustomersPage'));

const MainLayout: React.FC = () => {
  const { license, clearLocalWarning } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      {license.warningMessage && (
          <div className="bg-amber-600 text-white p-4 text-center font-black animate-pulse flex justify-between items-center px-10 border-b border-amber-700 shadow-lg relative z-[60]">
              <div className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span className="text-sm">تنبيه هام من الإدارة: {license.warningMessage}</span>
              </div>
              <button onClick={clearLocalWarning} className="bg-black/20 hover:bg-black/40 px-3 py-1 rounded-lg text-xs">إخفاء مؤقتاً</button>
          </div>
      )}

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/pos" element={<ProtectedRoute allowedRoles={[Role.Designer, Role.Owner, Role.Admin, Role.Sales]}><POSPage /></ProtectedRoute>} />
                    <Route path="/inventory" element={<ProtectedRoute allowedRoles={[Role.Designer, Role.Owner, Role.Admin, Role.Sales]}><InventoryPage /></ProtectedRoute>} />
                    <Route path="/customers" element={<ProtectedRoute allowedRoles={[Role.Designer, Role.Owner, Role.Admin, Role.Sales]}><CustomersPage /></ProtectedRoute>} />
                    <Route path="/repairs" element={<ProtectedRoute allowedRoles={[Role.Designer, Role.Owner, Role.Admin, Role.Maintenance]}><RepairsPage /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute allowedRoles={[Role.Designer, Role.Owner, Role.Admin, Role.Sales]}><ReportsPage /></ProtectedRoute>} />
                    <Route path="/suppliers" element={<ProtectedRoute allowedRoles={[Role.Designer, Role.Owner, Role.Admin]}><SuppliersPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute allowedRoles={[Role.Designer, Role.Owner, Role.Admin]}><SettingsPage /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
    const { isAuthenticated, loading } = useAuth();
    const { license, activateLicense } = useStore();

    if (loading) return <LoadingSpinner />;

    if (license.remoteStatus === 'BLOCKED') {
        return (
            <div className="h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-xl border-t-[12px] border-red-600">
                    <div className="text-red-600 mb-8 flex justify-center">
                        <svg className="w-28 h-28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 mb-6">عذراً، النظام متوقف!</h1>
                    <p className="text-slate-500 font-bold text-lg mb-4">لقد تم إيقاف الخدمة عن هذا الجهاز من قبل السيرفر المركزي.</p>
                    {license.warningMessage && (
                        <div className="bg-red-50 p-6 rounded-2xl mb-10 border border-red-100 italic font-bold text-red-900">
                            " {license.warningMessage} "
                        </div>
                    )}
                    <p className="text-slate-400 font-bold mb-10">يرجى مراجعة الإدارة أو سداد المستحقات لتفعيل النسخة مرة أخرى.</p>
                    <div className="bg-slate-50 p-4 rounded-xl font-mono text-sm font-black text-slate-400 select-all tracking-widest border border-slate-200">
                        {license.hardwareId}
                    </div>
                </div>
            </div>
        );
    }

    if (!license.isActivated && license.trialDaysLeft <= 0) {
         return (
             <div className="flex flex-col justify-center items-center h-screen bg-slate-900 p-4">
                 <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full border-t-8 border-blue-600 text-center">
                    <h1 className="text-2xl font-black text-slate-800 mb-4 uppercase">نظام التفعيل</h1>
                    <p className="text-slate-500 font-bold mb-8">لقد انتهت الفترة التجريبية. يرجى إدخال مفتاح التفعيل للاستمرار.</p>
                    <div className="bg-slate-50 p-4 rounded-xl mb-6 text-left border-2 border-slate-100 group relative">
                        <p className="text-[10px] uppercase text-slate-400 font-black mb-1">Hardware ID</p>
                        <div className="flex items-center justify-between">
                            <p className="font-mono text-lg font-black text-blue-700 select-all break-all">{license.hardwareId}</p>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(license.hardwareId);
                                    alert("تم نسخ المعرف!");
                                }}
                                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black"
                            >نسخ</button>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                             const key = prompt("أدخل مفتاح التفعيل:");
                             if(key && activateLicense(key)) window.location.reload();
                             else if(key) alert("المفتاح غير صحيح.");
                        }} 
                        className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl"
                    >إدخال مفتاح التفعيل</button>
                 </div>
             </div>
         );
    }

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/*" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />} />
            </Routes>
        </Suspense>
    );
};

const App: React.FC = () => {
  return (
    <I18nProvider>
      <StoreProvider>
        <AuthProvider>
            <NotificationProvider>
                <HashRouter>
                    <AppRoutes />
                </HashRouter>
            </NotificationProvider>
        </AuthProvider>
      </StoreProvider>
    </I18nProvider>
  );
};

export default App;
