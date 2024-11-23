'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { createNewProject } from '@/lib/firestore';
import { initializeProjectAnalytics } from '@/lib/services/analyticsService';

interface NewProjectModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function NewProjectModal({ onClose, onCreated }: NewProjectModalProps) {
  const { authState } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.user) return;

    setSubmitting(true);
    setError(null);

    try {
      const projectId = await createNewProject({
        title,
        description,
        language,
        status: 'in_progress',
        studentId: authState.user.uid,
        milestones: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });

      if (projectId) {
        await initializeProjectAnalytics(projectId);
        onCreated();
      } else {
        setError('Failed to create project');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError('An error occurred while creating the project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      title="Create New Project"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Project Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">
            Primary Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            loading={submitting}
          >
            Create Project
          </Button>
        </div>
      </form>
    </Dialog>
  );
} 