import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { updateChallengeProgress } from '@/lib/firestore';
import type { Challenge } from '@/types/core';

interface ChallengeListProps {
  challenges: Challenge[];
  loading: boolean;
  onUpdate: () => void;
}

export function ChallengeList({ challenges, loading, onUpdate }: ChallengeListProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleProgressUpdate = async (challengeId: string, progress: number) => {
    setUpdating(challengeId);
    try {
      await updateChallengeProgress(challengeId, progress);
      onUpdate();
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Challenges</h2>
        <div className="space-y-4">
          {challenges.length === 0 ? (
            <p className="text-gray-500">No active challenges</p>
          ) : (
            challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{challenge.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
                  </div>
                  <Badge variant={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{challenge.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-primary-500 rounded-full transition-all"
                      style={{ width: `${challenge.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Due: {new Date(challenge.dueDate).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleProgressUpdate(challenge.id, challenge.progress + 10)}
                    disabled={updating === challenge.id || challenge.progress >= 100}
                    className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                  >
                    {updating === challenge.id ? 'Updating...' : 'Update Progress'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}

function getDifficultyColor(difficulty: string): 'success' | 'warning' | 'error' {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'success';
    case 'medium':
      return 'warning';
    case 'hard':
      return 'error';
    default:
      return 'warning';
  }
} 