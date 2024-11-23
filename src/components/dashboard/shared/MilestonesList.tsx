'use client';

import { useState } from 'react';
import { createMilestone, updateMilestone } from '@/lib/services/milestoneService';
import type { Milestone } from '@/types/milestone';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface MilestonesListProps {
  projectId: string;
  milestones: Milestone[];
  onUpdate: () => void;
}

export function MilestonesList({ projectId, milestones, onUpdate }: MilestonesListProps) {
  const [newMilestone, setNewMilestone] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createMilestone({
        projectId,
        title,
        description,
        dueDate,
        status: 'pending',
        order: milestones.length + 1
      });

      setTitle('');
      setDescription('');
      setDueDate('');
      setNewMilestone(false);
      onUpdate();
    } catch (err) {
      setError('Failed to create milestone');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (milestoneId: string, newStatus: Milestone['status']) => {
    try {
      await updateMilestone(projectId, milestoneId, {
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
      });
      onUpdate();
    } catch (err) {
      setError('Failed to update milestone status');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Project Milestones</h3>
        <Button
          onClick={() => setNewMilestone(true)}
          variant="outline"
          size="sm"
        >
          Add Milestone
        </Button>
      </div>

      {error && <Alert type="error" message={error} />}

      {newMilestone && (
        <form onSubmit={handleAddMilestone} className="space-y-4 p-4 border rounded-md">
          <input
            type="text"
            placeholder="Milestone title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            rows={3}
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            required
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setNewMilestone(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              loading={submitting}
            >
              Add
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {milestones.sort((a, b) => a.order - b.order).map((milestone) => (
          <div
            key={milestone.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border"
          >
            <div className="space-y-1">
              <h4 className="font-medium text-gray-900">{milestone.title}</h4>
              <p className="text-sm text-gray-500">{milestone.description}</p>
              <p className="text-xs text-gray-400">
                Due: {new Date(milestone.dueDate).toLocaleDateString()}
              </p>
            </div>
            <select
              value={milestone.status}
              onChange={(e) => handleStatusChange(milestone.id, e.target.value as Milestone['status'])}
              className="ml-4 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
} 