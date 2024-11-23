'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Home() {
  const router = useRouter();
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user && userRole) {
        // Redirect based on role
        if (userRole === 'teacher') {
          router.push('/dashboard/teacher');
        } else if (userRole === 'student') {
          router.push('/dashboard/student');
        }
      } else {
        // Not authenticated, redirect to sign in
        router.push('/auth/signin');
      }
    }
  }, [user, userRole, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return null;
} 