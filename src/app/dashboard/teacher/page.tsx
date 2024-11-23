'use client';

import RoleGuard from '@/components/auth/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { TeacherStats } from '@/components/dashboard/teacher/TeacherStats';
import { ClassroomOverview } from '@/components/dashboard/teacher/ClassroomOverview';
import { StudentProgress } from '@/components/dashboard/teacher/StudentProgress';

export default function TeacherDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <RoleGuard allowedRoles={['teacher']}>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.displayName || 'Teacher'}!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor your students' progress and manage your classroom
          </p>
        </header>

        <TeacherStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClassroomOverview />
          <StudentProgress />
        </div>
      </div>
    </RoleGuard>
  );
} 