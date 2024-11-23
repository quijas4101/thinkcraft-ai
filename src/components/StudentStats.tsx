'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentStats } from '@/lib/statsService';

interface StudentStats {
  completedChallenges: number;
  totalPoints: number;
  lastActive: Date;
  createdAt: Date;
}

export default function StudentStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const userStats = await getStudentStats(user.uid);
        setStats(userStats);
        setError(null);
      } catch (err) {
        console.error('Error loading stats:', err);
        setError('Failed to load stats. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse">Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-gray-500 p-4 text-center">
        No stats available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold">Completed Challenges</h3>
        <p className="text-2xl">{stats.completedChallenges}</p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold">Total Points</h3>
        <p className="text-2xl">{stats.totalPoints}</p>
      </div>
    </div>
  );
} 