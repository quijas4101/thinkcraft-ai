'use client';

import RoleGuard from '@/components/auth/RoleGuard';
import { ProjectsList } from '@/components/projects/ProjectsList';
import { ProjectGallery } from '@/components/projects/ProjectGallery';
import { ProjectProvider } from '@/contexts/ProjectContext';

export default function StudentProjects() {
  return (
    <RoleGuard allowedRoles={['student']}>
      <ProjectProvider>
        <div className="space-y-6">
          <header>
            <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and track your ongoing projects
            </p>
          </header>
          <ProjectsList />
          <ProjectGallery />
        </div>
      </ProjectProvider>
    </RoleGuard>
  );
} 