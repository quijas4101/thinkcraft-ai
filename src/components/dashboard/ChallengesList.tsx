'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchStudentChallenges } from '@/lib/firestore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Challenge } from '@/types/core';

export function ChallengesList() {
  const { user, loading: authLoading } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadChallenges() {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const data = await fetchStudentChallenges(user.uid);
        if (mounted) {
          setChallenges(data);
        }
      } catch (err) {
        console.error('Error loading challenges:', err);
        if (mounted) {
          setError('Failed to load challenges');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      loadChallenges();
    }

    return () => {
      mounted = false;
    };
  }, [user?.uid, authLoading]);

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No challenges available</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {challenges.map((challenge) => (
        <div 
          key={challenge.id} 
          className="bg-white shadow rounded-lg p-6"
        >
          <h3 className="text-lg font-medium text-gray-900">
            {challenge.title}
          </h3>
          <div className="mt-2 text-sm text-gray-500">
            <p>Difficulty: {challenge.difficulty}</p>
            <p>Due: {new Date(challenge.dueDate).toLocaleDateString()}</p>
          </div>
          <div className="mt-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                    Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-primary-600">
                    {challenge.progress}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                <div 
                  style={{ width: `${challenge.progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 