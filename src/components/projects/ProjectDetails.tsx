'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import type { Project } from '@/types/core';

/**
 * Props for the ProjectDetails component
 * @property project - The project to display/edit
 * @property onUpdate - Callback function to run after successful update
 * @property onClose - Optional callback to close/hide the component
 */
interface ProjectDetailsProps {
  project: Project;
  onUpdate: () => void;
  onClose?: () => void;
}

/**
 * ProjectDetails Component
 * Displays and allows editing of a single project's details
 * Handles project updates and error states
 */
export function ProjectDetails({ project, onUpdate, onClose }: ProjectDetailsProps) {
  // Get authenticated user
  const { user } = useAuth();
  
  // Local state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedProject, setEditedProject] = useState(project);

  /**
   * Handles project update submission
   * Updates Firestore document and triggers refresh
   */
  const handleUpdateProject = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Update project in Firestore
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, {
        ...editedProject,
        lastUpdated: new Date().toISOString()
      });
      
      // Trigger refresh and exit edit mode
      onUpdate();
      setEditMode(false);
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  // Loading and error states
  if (loading) return <LoadingSpinner />;
  if (error) return <Alert variant="error" message={error} />;

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {editMode ? (
        // Edit Mode Form
        <div className="space-y-4">
          {/* Project Title Input */}
          <input
            type="text"
            value={editedProject.title}
            onChange={(e) => setEditedProject(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border rounded"
          />
          
          {/* Project Type Selection */}
          <select
            value={editedProject.type}
            onChange={(e) => setEditedProject(prev => ({ ...prev, type: e.target.value as Project['type'] }))}
            className="w-full p-2 border rounded"
          >
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Full Stack">Full Stack</option>
          </select>
          
          {/* Project Description */}
          <textarea
            value={editedProject.description || ''}
            onChange={(e) => setEditedProject(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border rounded min-h-[100px]"
            placeholder="Project description..."
          />
          
          {/* Project Status */}
          <select
            value={editedProject.status}
            onChange={(e) => setEditedProject(prev => ({ ...prev, status: e.target.value as Project['status'] }))}
            className="w-full p-2 border rounded"
          >
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProject}
              disabled={!editedProject.title}
            >
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        // View Mode
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {project.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {project.description || 'No description provided'}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setEditMode(true)}
            >
              Edit
            </Button>
          </div>
          
          {/* Project Metadata */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-sm rounded-full ${
                project.status === 'Completed'
                  ? 'bg-green-100 text-green-800'
                  : project.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
              <span className="text-sm text-gray-500">
                Last updated: {new Date(project.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 