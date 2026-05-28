import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, Role } from './AuthContext';

interface Props {
  children: ReactNode;
  roles?: Role[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { user, loading } = useAuth();

  if (loading) return <p className="p-6 text-slate-500">Učitavanje…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
