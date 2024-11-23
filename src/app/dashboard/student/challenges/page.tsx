'use client';

import RoleGuard from '@/components/auth/RoleGuard';
import { ChallengesList } from '@/components/dashboard/ChallengesList';

export default function StudentChallenges() {
  return (
    <RoleGuard allowedRoles={['student']}>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Your Challenges</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and complete your assigned challenges
          </p>
        </header>
        <ChallengesList />
      </div>
    </RoleGuard>
  );
} 