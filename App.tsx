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
                const response = await fetch(`${CLOUD_URL}?t=${new Date().getTime()}`);
                const data = await response.json();
                const decrypted = JSON.parse(decodeURIComponent(escape(atob(data.cloud_payload))));
                const myHwid = "HW-9ED8D93E"; 
                const cloudStore = decrypted.stores[myHwid];

                if (cloudStore) {
                    if (cloudStore.status === 'BLOCKED') {
                        setIsBlocked(true);
                    } else if (cloudStore.status === 'ACTIVE') {
                        // --- حقن الحالة مباشرة في الذاكرة ---
                        const activeData = {
                            isActivated: true,
                            remoteStatus: 'ACTIVE',
                            hardwareId: myHwid,
                            expiryDate: '2030-01-01'
                        };
                        localStorage.setItem('ned_pos_license', JSON.stringify(activeData));
                        
                        // تحديث الحالة في الواجهة
                        if (activateLicense) activateLicense("FORCE_SaaS_ACTIVE");
                        
                        setIsBlocked(false);
                    }
                }
            } catch (error) {
                console.error("SaaS Connection Failed");
            } finally {
                setCloudLoading(false);
            }
        };
        syncSaaS();
    }, []);

    if (authLoading || cloudLoading) return <LoadingSpinner />;

    // لو السحاب باعت BLOCKED اظهر شاشة الحظر فوراً
    if (isBlocked) {
        return (
            <div className="h-screen bg-black flex items-center justify-center p-6 text-center text-white">
                <div className="bg-red-900/20 p-12 rounded-3xl border border-red-500 shadow-2xl">
                    <h1 className="text-5xl font-black mb-6">النظام محظور!</h1>
                    <p className="text-xl mb-8">تم إيقاف الخدمة عن هذا الجهاز من قبل المطور نضال سلامة.</p>
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