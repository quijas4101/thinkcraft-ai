'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentStats } from '@/lib/statsService';

interface Stats {
  completedChallenges: number;
  totalPoints: number;
  lastActive: Date;
}

export default function StudentStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        const studentStats = await getStudentStats(user.uid);
        setStats(studentStats);
        setError(null);
      } catch (err) {
        console.error('Error loading stats:', err);
        setError('Failed to load statistics');
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user?.uid]);

  if (loading) return <div>Loading stats...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No stats available</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Completed Challenges</h3>
        <p className="text-2xl">{stats.completedChallenges}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Total Points</h3>
        <p className="text-2xl">{stats.totalPoints}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Last Active</h3>
        <p className="text-2xl">{stats.lastActive.toLocaleDateString()}</p>
      </div>
    </div>
  );
} 