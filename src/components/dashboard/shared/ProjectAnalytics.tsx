'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/models';
import { getProjectAnalytics } from '@/lib/firestore';
import { Alert } from '@/components/ui/Alert';

interface ProjectAnalyticsProps {
  project: Project;
}

interface Analytics {
  complexityScore: number;
  linesOfCode: number;
  timeSpent: number;
  languageBreakdown: {
    [key: string]: number;
  };
  lastUpdated: string;
}

export function ProjectAnalytics({ project }: ProjectAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const data = await getProjectAnalytics(project.id);
        setAnalytics({
          complexityScore: typeof data?.complexityScore === 'number' ? data.complexityScore : 0,
          linesOfCode: typeof data?.linesOfCode === 'number' ? data.linesOfCode : 0,
          timeSpent: typeof data?.timeSpent === 'number' ? data.timeSpent : 0,
          languageBreakdown: data?.languageBreakdown || {},
          lastUpdated: data?.lastUpdated || new Date().toISOString()
        });
      } catch (err) {
        console.error('Error fetching project analytics:', err);
        setError('Failed to load project analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [project.id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="error" message={error} />;
  }

  if (!analytics) {
    return <Alert variant="info" message="No analytics data available" />;
  }

  const formatNumber = (value: number | undefined | null): string => {
    if (typeof value !== 'number') return '0';
    return value.toFixed(2);
  };

  const formatTime = (minutes: number | undefined | null): string => {
    if (typeof minutes !== 'number') return '0 hrs';
    return `${Math.round(minutes / 60)} hrs`;
  };

  const metrics = [
    {
      name: 'Complexity Score',
      value: formatNumber(analytics.complexityScore),
      description: 'Code complexity rating'
    },
    {
      name: 'Lines of Code',
      value: formatNumber(analytics.linesOfCode).split('.')[0],
      description: 'Total lines written'
    },
    {
      name: 'Time Spent',
      value: formatTime(analytics.timeSpent),
      description: 'Total time coding'
    }
  ];

  const languages = Object.entries(analytics.languageBreakdown || {})
    .map(([lang, value]) => [lang, typeof value === 'number' ? value : 0])
    .sort(([, a], [, b]) => (b as number) - (a as number));

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Project Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                {metric.name}
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                {metric.value}
              </dd>
              <dd className="mt-2 text-sm text-gray-500">
                {metric.description}
              </dd>
            </div>
          </div>
        ))}
      </div>

      {languages.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">
            Language Distribution
          </h4>
          <div className="space-y-4">
            {languages.map(([language, percentage]) => (
              <div key={language}>
                <div className="flex justify-between text-sm font-medium text-gray-900">
                  <span>{language}</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <div className="mt-1 relative h-2 bg-gray-200 rounded">
                  <div
                    className="h-full bg-indigo-500 rounded"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 