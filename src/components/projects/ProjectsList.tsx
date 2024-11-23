'use client';

import { useState } from 'react';
import { useProjects } from '@/contexts/ProjectContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ProjectDetails } from './ProjectDetails';
import type { Project } from '@/types/core';

/**
 * ProjectsList Component
 * Displays a list of student projects with filtering for active and completed projects.
 * Provides functionality to create new projects and view project details.
 */
export function ProjectsList() {
  // Get project data and utilities from context
  const { projects, loading, error, addProject, refreshProjects } = useProjects();
  
  // Local state management
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    type: 'Frontend' as const, // Enforce type literal
    description: ''
  });

  /**
   * Handles the creation of a new project
   * Manages loading state and error handling
   */
  const handleAddProject = async () => {
    try {
      setIsAddingProject(true);
      await addProject({
        ...newProject,
        collaborators: 1,
        status: 'Planning',
      });
      
      // Reset form and refresh project list
      setNewProject({
        title: '',
        type: 'Frontend',
        description: ''
      });
      await refreshProjects();
    } catch (err) {
      console.error('Error adding project:', err);
    } finally {
      setIsAddingProject(false);
    }
  };

  // Loading and error states
  if (loading) return <LoadingSpinner />;
  if (error) return <Alert variant="error" message={error} />;

  // Filter projects by status
  const activeProjects = projects.filter(p => p.status !== 'Completed');
  const completedProjects = projects.filter(p => p.status === 'Completed');

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header with Add Project button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
        <Button
          onClick={() => setIsAddingProject(true)}
          disabled={isAddingProject}
          loading={isAddingProject}
        >
          {isAddingProject ? 'Adding...' : 'New Project'}
        </Button>
      </div>

      {/* New Project Form */}
      {isAddingProject && (
        <div className="mb-6 p-4 border rounded-lg">
          {/* Project Title Input */}
          <input
            type="text"
            value={newProject.title}
            onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Project Title"
            className="w-full mb-2 p-2 border rounded"
          />
          {/* Project Type Selection */}
          <select
            value={newProject.type}
            onChange={(e) => setNewProject(prev => ({ ...prev, type: e.target.value as Project['type'] }))}
            className="w-full mb-2 p-2 border rounded"
          >
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Full Stack">Full Stack</option>
          </select>
          {/* Project Description */}
          <textarea
            value={newProject.description}
            onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Project Description"
            className="w-full mb-2 p-2 border rounded"
          />
          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setIsAddingProject(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddProject}
              disabled={!newProject.title}
            >
              Add Project
            </Button>
          </div>
        </div>
      )}

      {/* Projects List Section */}
      <div className="space-y-6">
        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Active Projects
            </h3>
            <div className="space-y-4">
              {activeProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSelected={selectedProject === project.id}
                  onSelect={() => setSelectedProject(project.id)}
                  onUpdate={refreshProjects}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Projects */}
        {completedProjects.length > 0 && (
          <CompletedProjectsList projects={completedProjects} />
        )}

        {/* Empty State */}
        {projects.length === 0 && !isAddingProject && (
          <EmptyState onCreateProject={() => setIsAddingProject(true)} />
        )}
      </div>
    </div>
  );
}

// Helper Components (could be moved to separate files if they grow)
interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: () => void;
}

function ProjectCard({ project, isSelected, onSelect, onUpdate }: ProjectCardProps) {
  return (
    <div>
      {isSelected ? (
        <ProjectDetails 
          project={project}
          onUpdate={onUpdate}
          onClose={() => onSelect()}
        />
      ) : (
        <button
          onClick={onSelect}
          className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-primary-500 transition-colors"
        >
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900">{project.title}</h4>
              <p className="text-sm text-gray-500">
                Last updated: {new Date(project.lastUpdated).toLocaleDateString()}
              </p>
            </div>
            <div className="text-sm font-medium text-primary-600">
              {project.status}
            </div>
          </div>
        </button>
      )}
    </div>
  );
} 