'use client';

import { useStudentDashboard } from '@/contexts/StudentDashboardContext';

export function ProgressStats() {
  const { stats, loading } = useStudentDashboard();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
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