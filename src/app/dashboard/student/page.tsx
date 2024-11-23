'use client';

import { useState, useEffect } from 'react';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import StudentStats from '@/components/dashboard/student/StudentStats';
import { ChallengeList } from '@/components/dashboard/student/ChallengeList';
import { ProjectGallery } from '@/components/dashboard/student/ProjectGallery';
import { fetchStudentChallenges } from '@/lib/firestore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Challenge } from '@/types/core';

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadChallenges() {
      if (!user?.uid) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchStudentChallenges(user.uid);
        if (mounted) {
          setChallenges(data);
        }
      } catch (error) {
        console.error('Error loading challenges:', error);
        if (mounted) {
          setError('Failed to load challenges');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    if (!authLoading && user?.uid) {
      loadChallenges();
    }

    return () => {
      mounted = false;
    };
  }, [user?.uid, authLoading]);

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <RoleGuard allowedRoles={['student']}>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.displayName || 'Student'}!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Track your progress and explore new challenges
          </p>
        </header>

        {error && (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        )}

        <StudentStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChallengeList 
            challenges={challenges} 
            loading={isLoading} 
            onUpdate={() => {}}
          />
          <ProjectGallery userId={user?.uid} />
        </div>
      </div>
    </RoleGuard>
  );
} 