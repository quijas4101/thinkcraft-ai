'use client';

import { useState } from 'react';
import { useStudentDashboard } from '@/contexts/StudentDashboardContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProjectDetails } from './ProjectDetails';
import type { Project } from '@/types/core';

export function ProjectGallery() {
  const { projects, loading, refreshData } = useStudentDashboard();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  const activeProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
        <button
          onClick={() => setSelectedProject('new')}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
        >
          New Project
        </button>
      </div>

      <div className="space-y-6">
        {activeProjects.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Active Projects
            </h3>
            <div className="grid gap-4">
              {activeProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProject(project.id)}
                  selected={selectedProject === project.id}
                  onUpdate={refreshData}
                />
              ))}
            </div>
          </div>
        )}

        {completedProjects.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Completed Projects
            </h3>
            <div className="grid gap-4">
              {completedProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProject(project.id)}
                  selected={selectedProject === project.id}
                  onUpdate={refreshData}
                />
              ))}
            </div>
          </div>
        )}

        {projects.length === 0 && (
          <p className="text-center text-gray-500">
            No projects yet. Start by creating a new project!
          </p>
        )}
      </div>

      {selectedProject === 'new' && (
        <NewProjectModal
          onClose={() => setSelectedProject(null)}
          onCreated={() => {
            refreshData();
            setSelectedProject(null);
          }}
        />
      )}
    </Card>
  );
}

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  selected: boolean;
  onUpdate: () => void;
}

function ProjectCard({ project, onClick, selected, onUpdate }: ProjectCardProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`w-full text-left p-4 rounded-lg border transition-all ${
          selected
            ? 'border-primary-500 ring-2 ring-primary-500'
            : 'border-gray-200 hover:border-primary-500'
        }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-gray-900">{project.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          </div>
          <Badge
            variant={project.status === 'completed' ? 'success' : 'default'}
          >
            {project.status === 'completed' ? 'Completed' : 'In Progress'}
          </Badge>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Progress</span>
            <span>{calculateProgress(project)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-primary-500 rounded-full transition-all"
              style={{ width: `${calculateProgress(project)}%` }}
            />
          </div>
        </div>
      </button>

      {selected && (
        <ProjectDetails
          project={project}
          onClose={() => onClick()}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

function calculateProgress(project: Project): number {
  if (!project.milestones?.length) return 0;
  const completed = project.milestones.filter(m => m.status === 'completed').length;
  return Math.round((completed / project.milestones.length) * 100);
} 