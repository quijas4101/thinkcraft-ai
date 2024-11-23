'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ProjectDetails } from '@/components/projects/ProjectDetails';
import type { Project } from '@/types/core';

export function ProjectsList() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    title: '',
    type: 'Frontend',
    description: ''
  });

  useEffect(() => {
    if (!authLoading && user?.uid) {
      loadProjects();
    }
  }, [user?.uid, authLoading]);

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, where('studentId', '==', user!.uid));
      const querySnapshot = await getDocs(q);
      
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: doc.data().lastUpdated?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as Project[];

      setProjects(projectsData);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddProject() {
    if (!user?.uid) return;

    try {
      setIsAddingProject(true);
      setError(null);
      
      const projectData = {
        ...newProject,
        studentId: user.uid,
        collaborators: 1,
        status: 'Planning' as const,
        lastUpdated: serverTimestamp(),
        type: newProject.type || 'Frontend'
      };

      await addDoc(collection(db, 'projects'), projectData);
      await loadProjects();
      
      setNewProject({
        title: '',
        type: 'Frontend',
        description: ''
      });
      setIsAddingProject(false);
    } catch (err) {
      console.error('Error adding project:', err);
      setError('Failed to add project');
    } finally {
      setIsAddingProject(false);
    }
  }

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Alert variant="error" message={error} />;
  }

  if (!user) {
    return <Alert variant="error" message="Please sign in to view projects" />;
  }

  const activeProjects = projects.filter(p => p.status !== 'Completed');
  const completedProjects = projects.filter(p => p.status === 'Completed');

  return (
    <div className="bg-white shadow rounded-lg p-6">
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

      {isAddingProject && (
        <div className="mb-6 p-4 border rounded-lg">
          <input
            type="text"
            value={newProject.title}
            onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Project Title"
            className="w-full mb-2 p-2 border rounded"
          />
          <select
            value={newProject.type}
            onChange={(e) => setNewProject(prev => ({ ...prev, type: e.target.value }))}
            className="w-full mb-2 p-2 border rounded"
          >
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Full Stack">Full Stack</option>
          </select>
          <textarea
            value={newProject.description}
            onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Project Description"
            className="w-full mb-2 p-2 border rounded"
          />
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
                        loadProjects();
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

        {/* Completed Projects Section */}
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

        {projects.length === 0 && !isAddingProject && (
          <div className="text-center py-6">
            <h3 className="text-sm font-medium text-gray-900">No projects yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new project
            </p>
            <Button
              onClick={() => setIsAddingProject(true)}
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