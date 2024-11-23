'use client';

import RoleGuard from '@/components/auth/RoleGuard';
import { ClassroomOverview } from '@/components/dashboard/teacher/ClassroomOverview';

export default function TeacherClassroom() {
  return (
    <RoleGuard allowedRoles={['teacher']}>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Classroom Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your classrooms and student assignments
          </p>
        </header>
        <ClassroomOverview />
      </div>
    </RoleGuard>
  );
} 