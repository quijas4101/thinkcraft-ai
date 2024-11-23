'use client';

import { useState } from 'react';
import { useStudentDashboard } from '@/contexts/StudentDashboardContext';
import { ProjectDetails } from './ProjectDetails';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { createProject } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

export function ProjectsList() {
  const { projects, loading, refreshData } = useStudentDashboard();
  const { authState } = useAuth();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async () => {
    if (!authState.user) return;
    
    setIsCreating(true);
    try {
      await createProject({
        title: `New Project ${projects.length + 1}`,
        description: '',
        status: 'in_progress',
        studentId: authState.user.uid,
        lastUpdated: new Date().toISOString()
      });
      refreshData();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const activeProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Your Projects
        </h2>
        <Button
          onClick={handleCreateProject}
          disabled={isCreating}
          loading={isCreating}
          size="sm"
        >
          New Project
        </Button>
      </div>

      <div className="space-y-6">
        {activeProjects.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Active Projects
            </h3>
            <div className="space-y-4">
              {activeProjects.map(project => (
                <div key={project.id}>
                  {selectedProject === project.id ? (
                    <ProjectDetails 
                      project={project}
                      onUpdate={() => {
                        refreshData();
                        setSelectedProject(null);
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setSelectedProject(project.id)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-primary-500 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {project.title}
                          </h4>
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
              ))}
            </div>
          </div>
        )}

        {completedProjects.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Completed Projects
            </h3>
            <div className="space-y-2">
              {completedProjects.map(project => (
                <div
                  key={project.id}
                  className="p-4 rounded-lg bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {project.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Completed on: {new Date(project.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      Completed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {projects.length === 0 && !isCreating && (
          <div className="text-center py-6">
            <h3 className="text-sm font-medium text-gray-900">No projects yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new project
            </p>
            <Button
              onClick={handleCreateProject}
              className="mt-4"
            >
              Create Your First Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 