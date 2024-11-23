'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('student' | 'teacher')[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user is not authenticated or doesn't have required role
    if (!loading && (!user || !userRole || !allowedRoles.includes(userRole))) {
      router.push('/auth/signin');
    }
  }, [user, userRole, loading, allowedRoles, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Only render children if user has required role
  if (user && userRole && allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  return null;
} 