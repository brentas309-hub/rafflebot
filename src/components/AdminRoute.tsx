import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin } from '../lib/auth';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    isAdmin().then((result) => {
      setAdmin(result);
      setChecking(false);
    });
  }, []);

  if (checking) return null;
  if (!admin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
