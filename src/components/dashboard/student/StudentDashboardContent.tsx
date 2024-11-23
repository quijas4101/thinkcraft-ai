'use client';

import { useStudentDashboard } from '@/contexts/StudentDashboardContext';
import { ProgressStats } from './ProgressStats';
import { ChallengesList } from './ChallengesList';
import { ProjectsList } from './ProjectsList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';

export function StudentDashboardContent() {
  const { profile, loading, error } = useStudentDashboard();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.displayName || 'Student'}!
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Track your progress and continue your learning journey
        </p>
      </header>

      <ProgressStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChallengesList />
        <ProjectsList />
      </div>
    </div>
  );
} 