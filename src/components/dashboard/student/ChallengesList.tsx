'use client';

import { useState } from 'react';
import { useStudentDashboard } from '@/contexts/StudentDashboardContext';
import { ChallengeDetails } from './ChallengeDetails';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function ChallengesList() {
  const { challenges, loading, refreshData } = useStudentDashboard();
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  const activeChallenges = challenges.filter(c => c.progress < 100);
  const completedChallenges = challenges.filter(c => c.progress >= 100);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Your Challenges
      </h2>

      <div className="space-y-6">
        {activeChallenges.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Active Challenges
            </h3>
            <div className="space-y-4">
              {activeChallenges.map(challenge => (
                <div key={challenge.id}>
                  {selectedChallenge === challenge.id ? (
                    <ChallengeDetails 
                      challenge={challenge}
                      onUpdate={() => {
                        refreshData();
                        setSelectedChallenge(null);
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setSelectedChallenge(challenge.id)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-primary-500 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {challenge.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(challenge.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-primary-600">
                          {challenge.progress}%
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {completedChallenges.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Completed Challenges
            </h3>
            <div className="space-y-2">
              {completedChallenges.map(challenge => (
                <div
                  key={challenge.id}
                  className="p-4 rounded-lg bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {challenge.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Completed on: {new Date(challenge.lastUpdated).toLocaleDateString()}
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

        {challenges.length === 0 && (
          <p className="text-center text-gray-500">
            No challenges available at the moment.
          </p>
        )}
      </div>
    </div>
  );
} 