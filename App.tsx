import React, { Suspense, useEffect, useState } from 'react';
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

const CLOUD_URL = "https://raw.githubusercontent.com/dlta17/ned-fashion-pos/main/ned_cloud_server.json";

const MainLayout: React.FC = () => {
  const { license, clearLocalWarning } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      {license.warningMessage && (
          <div className="bg-amber-600 text-white p-4 text-center font-black animate-pulse flex justify-between items-center px-10 border-b border-amber-700 shadow-lg relative z-[60]">
              <div className="flex items-center gap-3">
                  <span className="text-sm">تنبيه من الإدارة: {license.warningMessage}</span>
              </div>
              <button onClick={clearLocalWarning} className="bg-black/20 hover:bg-black/40 px-3 py-1 rounded-lg text-xs">إخفاء</button>
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
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { license, activateLicense } = useStore(); 
    const [cloudLoading, setCloudLoading] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);

    useEffect(() => {
        const syncSaaS = async () => {
            try {
                // إضافة timestamp لمنع الـ Cache
                const response = await fetch(`${CLOUD_URL}?t=${new Date().getTime()}`);
                const data = await response.json();
                const decrypted = JSON.parse(decodeURIComponent(escape(atob(data.cloud_payload))));
                const myHwid = "HW-9ED8D93E"; 
                const cloudStore = decrypted.stores[myHwid];

                if (cloudStore) {
                    if (cloudStore.status === 'BLOCKED') {
                        setIsBlocked(true);
                    } else if (cloudStore.status === 'ACTIVE') {
                        // --- التعديل الجوهري هنا ---
                        // 1. تحديث الـ LocalStorage يدوياً لضمان استقرار الحالة
                        const forcedLicense = {
                            ...license,
                            isActivated: true,
                            remoteStatus: 'ACTIVE',
                            trialDaysLeft: 999,
                            hardwareId: myHwid
                        };
                        localStorage.setItem('ned_pos_license', JSON.stringify(forcedLicense));

                        // 2. تفعيل النسخة برمجياً
                        if (typeof activateLicense === 'function') {
                            activateLicense("SaaS_FORCE_ACTIVE"); 
                        }
                        console.log("✅ SaaS Status: ACTIVE");
                    }
                }
            } catch (error) {
                console.error("⚠️ SaaS Connection Error");
            } finally {
                setCloudLoading(false);
            }
        };
        syncSaaS();
    }, [activateLicense]);

    if (authLoading || cloudLoading) return <LoadingSpinner />;

    if (isBlocked || license.remoteStatus === 'BLOCKED') {
        return (
            <div className="h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-xl border-t-[12px] border-red-600">
                    <h1 className="text-4xl font-black text-slate-800 mb-6">النظام متوقف!</h1>
                    <p className="text-slate-500 font-bold text-lg mb-4">تم تعليق الخدمة من السيرفر المركزي.</p>
                    <p className="text-slate-400 font-bold">يرجى مراجعة المطور نضال سلامة.</p>
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