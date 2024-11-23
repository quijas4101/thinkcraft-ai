'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ProjectDetails } from './student/ProjectDetails';
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
      {/* Rest of the component remains the same */}
    </div>
  );
} 