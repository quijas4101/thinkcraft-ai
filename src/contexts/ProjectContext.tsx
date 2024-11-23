'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserProjects, createProject, updateProject } from '@/lib/projects';
import type { Project } from '@/types/core';

/**
 * Type definition for the Project context value
 * Includes all project-related state and operations
 */
interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  addProject: (projectData: Omit<Project, 'id' | 'lastUpdated'>) => Promise<string>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
}

// Create context with null as initial value
const ProjectContext = createContext<ProjectContextType | null>(null);

/**
 * ProjectProvider Component
 * Manages project state and provides project-related operations to children
 * Handles data fetching, caching, and updates
 */
export function ProjectProvider({ children }: { children: React.ReactNode }) {
  // Get authenticated user from AuthContext
  const { user } = useAuth();
  
  // Local state management
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches and updates the projects list
   * Called on initial load and after project modifications
   */
  async function refreshProjects() {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedProjects = await fetchUserProjects(user.uid);
      setProjects(fetchedProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  // Load projects when user is authenticated
  useEffect(() => {
    if (user?.uid) {
      refreshProjects();
    }
  }, [user?.uid]);

  // Context value with memoized callbacks
  const value = {
    projects,
    loading,
    error,
    refreshProjects,
    addProject: createProject,
    updateProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

/**
 * Custom hook to use the project context
 * Throws an error if used outside of ProjectProvider
 */
export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
} 