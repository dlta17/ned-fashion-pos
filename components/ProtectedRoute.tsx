import React, { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { useI18n } from '../contexts/I18nContext';

interface ProtectedRouteProps {
  children: ReactElement;
  allowedRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const { t } = useI18n();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-4xl font-bold text-red-600">{t('protectedRoute.unauthorized')}</h1>
            <p className="mt-4 text-lg text-gray-700">
                {t('protectedRoute.noPermission')}
            </p>
        </div>
    );
  }

  return children;
};

export default ProtectedRoute;