'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  getDocs,
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface AnalyticsData {
  classroomStats: ClassroomStats[];
  progressTrend: ProgressPoint[];
  studentEngagement: EngagementData[];
  submissionStats: SubmissionStats;
}

interface ClassroomStats {
  id: string;
  name: string;
  averageProgress: number;
  activeStudents: number;
  completionRate: number;
}

interface ProgressPoint {
  date: string;
  progress: number;
}

interface EngagementData {
  studentName: string;
  lastActive: string;
  completedTasks: number;
  participationRate: number;
}

interface SubmissionStats {
  total: number;
  pending: number;
  completed: number;
}

export function TeacherAnalytics() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    const unsubscribers: (() => void)[] = [];

    try {
      // Real-time classroom stats
      const classroomsRef = collection(db, 'classrooms');
      const classroomsQuery = query(
        classroomsRef,
        where('teacherId', '==', user.uid)
      );

      const unsubClassrooms = onSnapshot(classroomsQuery, async (snapshot) => {
        const classroomStats: ClassroomStats[] = [];
        const progressPoints: ProgressPoint[] = [];
        let totalSubmissions = 0;
        let pendingSubmissions = 0;

        for (const doc of snapshot.docs) {
          const classroom = doc.data();
          const classroomId = doc.id;

          // Get real-time student data
          const studentsRef = collection(db, `classrooms/${classroomId}/students`);
          const studentsSnapshot = await getDocs(studentsRef);

          // Calculate classroom stats
          const stats = calculateClassroomStats(studentsSnapshot);
          classroomStats.push({
            id: classroomId,
            name: classroom.name,
            ...stats
          });

          // Get submission stats
          const submissionsRef = collection(db, `classrooms/${classroomId}/submissions`);
          const submissionsSnapshot = await getDocs(submissionsRef);
          
          totalSubmissions += submissionsSnapshot.size;
          pendingSubmissions += submissionsSnapshot.docs.filter(
            doc => doc.data().status === 'pending'
          ).length;

          // Calculate progress trend
          const progressHistory = await getProgressHistory(classroomId, timeRange);
          progressPoints.push(...progressHistory);
        }

        // Update analytics data
        setAnalyticsData(prev => ({
          ...prev!,
          classroomStats,
          progressTrend: aggregateProgressPoints(progressPoints),
          submissionStats: {
            total: totalSubmissions,
            pending: pendingSubmissions,
            completed: totalSubmissions - pendingSubmissions
          }
        }));
      });

      unsubscribers.push(unsubClassrooms);

      setLoading(false);
    } catch (err) {
      console.error('Error setting up analytics:', err);
      setError('Failed to load analytics data');
      setLoading(false);
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user?.uid, timeRange]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Alert variant="error" message={error} />;
  }

  if (!analyticsData) {
    return <Alert variant="info" message="No analytics data available" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Progress Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.progressTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#0ea5e9" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Classroom Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Classroom Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.classroomStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageProgress" fill="#0ea5e9" name="Progress" />
                <Bar dataKey="completionRate" fill="#34d399" name="Completion" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional analytics sections */}
    </div>
  );
}

// Helper functions
function calculateClassroomStats(snapshot: any): Partial<ClassroomStats> {
  let totalProgress = 0;
  let activeStudents = 0;
  let completedTasks = 0;
  let totalTasks = 0;

  snapshot.docs.forEach((doc: any) => {
    const student = doc.data();
    if (student.progress) {
      totalProgress += student.progress;
    }
    if (student.lastActive && 
        student.lastActive.toDate() > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      activeStudents++;
    }
    if (student.completedTasks) {
      completedTasks += student.completedTasks;
    }
    if (student.totalTasks) {
      totalTasks += student.totalTasks;
    }
  });

  return {
    averageProgress: snapshot.size > 0 ? totalProgress / snapshot.size : 0,
    activeStudents,
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  };
}

async function getProgressHistory(classroomId: string, timeRange: string): Promise<ProgressPoint[]> {
  const progressRef = collection(db, `classrooms/${classroomId}/progress`);
  const startDate = getStartDate(timeRange);
  
  const progressQuery = query(
    progressRef,
    where('date', '>=', startDate),
    orderBy('date', 'asc')
  );

  const snapshot = await getDocs(progressQuery);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      date: formatDate(data.date.toDate(), timeRange),
      progress: data.averageProgress
    };
  });
}

function aggregateProgressPoints(points: ProgressPoint[]): ProgressPoint[] {
  const aggregated = new Map<string, { total: number; count: number }>();

  // Group progress points by date
  points.forEach(point => {
    const existing = aggregated.get(point.date);
    if (existing) {
      existing.total += point.progress;
      existing.count += 1;
    } else {
      aggregated.set(point.date, { total: point.progress, count: 1 });
    }
  });

  // Calculate averages and convert back to array
  return Array.from(aggregated.entries()).map(([date, { total, count }]) => ({
    date,
    progress: total / count
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Utility functions
function getStartDate(timeRange: string): Date {
  const now = new Date();
  switch (timeRange) {
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case 'year':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

function formatDate(date: Date, timeRange: string): string {
  switch (timeRange) {
    case 'week':
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'year':
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    default:
      return date.toLocaleDateString();
  }
} 