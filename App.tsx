import React, { Suspense, useEffect, useState, useCallback } from 'react';
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
    const { activateLicense } = useStore(); 
    const [status, setStatus] = useState<'LOADING' | 'ACTIVE' | 'BLOCKED' | 'OFFLINE'>('LOADING');

    const checkSaaS = useCallback(async (isBackground = false) => {
        try {
            const response = await fetch(`${CLOUD_URL}?t=${new Date().getTime()}`);
            const data = await response.json();
            const decrypted = JSON.parse(decodeURIComponent(escape(atob(data.cloud_payload))));
            const myHwid = "HW-9ED8D93E"; 
            const cloudStore = decrypted.stores[myHwid];

            if (cloudStore && cloudStore.status === 'ACTIVE') {
                const licenseData = {
                    isActivated: true,
                    remoteStatus: 'ACTIVE',
                    hardwareId: myHwid,
                    expiryDate: '2030-01-01'
                };
                localStorage.setItem('ned_pos_license', JSON.stringify(licenseData));
                if (!isBackground && activateLicense) activateLicense("FORCE_SaaS");
                setStatus('ACTIVE');
            } else {
                // لو الحالة اتغيرت لـ BLOCKED نمسح التفعيل المحلي فوراً
                localStorage.removeItem('ned_pos_license');
                setStatus('BLOCKED');
            }
        } catch (error) {
            if (!isBackground) {
                const local = localStorage.getItem('ned_pos_license');
                if (local && JSON.parse(local).isActivated) {
                    setStatus('ACTIVE');
                } else {
                    setStatus('OFFLINE');
                }
            }
        }
    }, [activateLicense]);

    useEffect(() => {
        // فحص عند التشغيل
        checkSaaS();

        // فحص دوري كل 60 ثانية (المراقب اللحظي)
        const interval = setInterval(() => {
            checkSaaS(true);
        }, 60000); 

        return () => clearInterval(interval);
    }, [checkSaaS]);

    if (authLoading || status === 'LOADING') return <LoadingSpinner />;

    if (status === 'BLOCKED') {
        return (
            <div className="h-screen bg-slate-950 flex items-center justify-center text-center p-6">
                <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-[0_0_50px_rgba(239,68,68,0.3)] border-b-8 border-red-600">
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🛑</div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4">الوصول محظور!</h1>
                    <p className="text-slate-600 font-bold mb-8">عذراً، تم إيقاف صلاحية الوصول لهذا الجهاز. يرجى التواصل مع نضال سلامة للتفعيل.</p>
                    <div className="bg-slate-100 p-3 rounded-2xl font-mono text-xs text-slate-400">ID: HW-9ED8D93E</div>
                </div>
            </div>
        );
    }

    if (status === 'OFFLINE') {
        return (
            <div className="h-screen bg-slate-50 flex items-center justify-center text-center p-6">
                <div className="max-w-sm">
                    <h1 className="text-2xl font-black text-slate-800 mb-2">لا يوجد اتصال</h1>
                    <p className="text-slate-500 mb-6 font-bold">يجب الاتصال بالإنترنت للتحقق من الرخصة لأول مرة.</p>
                    <button onClick={() => window.location.reload()} className="bg-black text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all">إعادة المحاولة</button>
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