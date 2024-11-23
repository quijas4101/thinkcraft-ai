'use client';

import { useState } from 'react';
import { useProjects } from '@/contexts/ProjectContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProjectDetails } from './ProjectDetails';
import { calculateProjectProgress } from '@/lib/projects';
import type { Project } from '@/types/core';

/**
 * ProjectGallery Component
 * Displays projects in a grid layout with visual progress indicators
 * Allows for project selection and detailed view
 */
export function ProjectGallery() {
  // Get project data from context
  const { projects, loading, refreshData } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  if (loading) return <LoadingSpinner />;

  // Filter projects by status
  const activeProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Project Gallery</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            selected={selectedProject === project.id}
            onClick={() => setSelectedProject(
              selectedProject === project.id ? null : project.id
            )}
            onUpdate={refreshData}
          />
        ))}
      </div>
    </Card>
  );
}

/**
 * Props for the ProjectCard component
 */
interface ProjectCardProps {
  project: Project;
  selected: boolean;
  onClick: () => void;
  onUpdate: () => void;
}

/**
 * ProjectCard Component
 * Displays individual project information with progress indicators
 * Handles selection and detail view toggling
 */
function ProjectCard({ project, selected, onClick, onUpdate }: ProjectCardProps) {
  // Calculate project progress
  const progress = calculateProjectProgress(project);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`w-full text-left p-4 rounded-lg border transition-all ${
          selected 
            ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-50'
            : 'border-gray-200 hover:border-primary-500'
        }`}
      >
        {/* Project Header */}
        <h3 className="font-medium text-gray-900">{project.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{project.description}</p>
        
        {/* Project Status */}
        <div className="flex items-center justify-between mt-4">
          <Badge
            variant={project.status === 'completed' ? 'success' : 'default'}
          >
            {project.status === 'completed' ? 'Completed' : 'In Progress'}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-primary-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </button>

      {/* Project Details Modal/Overlay */}
      {selected && (
        <ProjectDetails
          project={project}
          onClose={onClick}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
} 