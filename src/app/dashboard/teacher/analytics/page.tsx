'use client';

import RoleGuard from '@/components/auth/RoleGuard';
import { StudentProgress } from '@/components/dashboard/teacher/StudentProgress';
import { TeacherStats } from '@/components/dashboard/teacher/TeacherStats';
import { StudentEngagement } from '@/components/dashboard/teacher/StudentEngagement';

export default function TeacherAnalytics() {
  return (
    <RoleGuard allowedRoles={['teacher']}>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track student progress and engagement metrics
          </p>
        </header>
        <TeacherStats />
        <StudentEngagement />
        <StudentProgress />
      </div>
    </RoleGuard>
  );
} 