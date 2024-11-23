'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchStudentStats } from '@/lib/firestore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Stats {
  completedChallenges: number;
  activeProjects: number;
  insightPoints: number;
  badgesEarned: number;
}

export function ProgressStats() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      if (!user?.uid) return;
      
      try {
        const data = await fetchStudentStats(user.uid);
        if (mounted) {
          setStats(data);
        }
      } catch (err) {
        console.error('Error loading stats:', err);
        if (mounted) {
          setError('Failed to load statistics');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      loadStats();
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

  const statItems = [
    { name: 'Completed Challenges', value: stats?.completedChallenges || 0 },
    { name: 'Active Projects', value: stats?.activeProjects || 0 },
    { name: 'Insight Points', value: stats?.insightPoints || 0 },
    { name: 'Badges Earned', value: stats?.badgesEarned || 0 },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        {statItems.map((item) => (
          <div key={item.name} className="px-4 py-5 bg-gray-50 rounded-lg overflow-hidden">
            <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
            <dd className="mt-1 text-3xl font-semibold text-indigo-600">{item.value}</dd>
          </div>
        ))}
      </div>
    </div>
  );
} 