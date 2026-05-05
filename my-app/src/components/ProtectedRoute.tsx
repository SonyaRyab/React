//защита маршрутов для user/moderator

import type { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { ROUTES } from '../Routes';

type UserRole = 'researcher' | 'professor' | 'admin' | null;

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  allowedRoles,
}) => {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.user);

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to={ROUTES.HOME} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;