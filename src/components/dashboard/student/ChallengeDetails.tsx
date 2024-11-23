'use client';

import { useState } from 'react';
import { Challenge } from '@/types/models';
import { updateChallengeProgress } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface ChallengeDetailsProps {
  challenge: Challenge;
  onUpdate: () => void;
}

export function ChallengeDetails({ challenge, onUpdate }: ChallengeDetailsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await updateChallengeProgress(challenge.id, {
        progress: Math.min(challenge.progress + 25, 100),
        lastUpdated: new Date().toISOString()
      });
      onUpdate();
    } catch (err) {
      setError('Failed to update challenge progress');
      console.error('Error updating challenge:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {challenge.title}
      </h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Difficulty</p>
          <p className="mt-1 text-sm text-gray-900">{challenge.difficulty}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Due Date</p>
          <p className="mt-1 text-sm text-gray-900">
            {new Date(challenge.dueDate).toLocaleDateString()}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Progress</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${challenge.progress}%` }}
            />
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} />
        )}

        <Button
          onClick={handleSubmit}
          disabled={submitting || challenge.progress >= 100}
          loading={submitting}
          className="w-full"
        >
          {challenge.progress >= 100 ? 'Completed!' : 'Submit Progress'}
        </Button>
      </div>
    </div>
  );
} 