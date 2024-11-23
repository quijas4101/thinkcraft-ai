'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  Timestamp,
  getDocs 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';

interface TeacherStatsData {
  totalStudents: number;
  activeChallenges: number;
  averageEngagement: number;
  pendingReviews: number;
  weeklyNewStudents: number;
  dueChallenges: number;
  monthlyEngagementChange: number;
  highPriorityReviews: number;
}

interface StudentActivity {
  lastActive: Timestamp;
  progress: number;
  completedTasks: number;
}

export function TeacherStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TeacherStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    const unsubscribers: (() => void)[] = [];

    try {
      // Get current timestamp for due date calculations
      const currentTimestamp = Timestamp.now();
      const oneWeekFromNow = new Timestamp(
        currentTimestamp.seconds + 7 * 24 * 60 * 60,
        currentTimestamp.nanoseconds
      );

      // Listen to classrooms
      const classroomsRef = collection(db, 'classrooms');
      const classroomsQuery = query(classroomsRef, where('teacherId', '==', user.uid));
      
      const unsubClassrooms = onSnapshot(classroomsQuery, async (snapshot) => {
        let totalStudents = 0;
        let totalEngagement = 0;
        let weeklyNewCount = 0;
        let pendingReviewsCount = 0;
        let highPriorityCount = 0;
        
        const oneWeekAgo = new Timestamp(
          currentTimestamp.seconds - 7 * 24 * 60 * 60,
          currentTimestamp.nanoseconds
        );

        // Process classroom data
        for (const doc of snapshot.docs) {
          const classroomId = doc.id;
          
          // Get students data
          const studentsRef = collection(db, `classrooms/${classroomId}/students`);
          const studentsSnapshot = await getDocs(studentsRef);
          
          totalStudents += studentsSnapshot.size;
          
          studentsSnapshot.docs.forEach(studentDoc => {
            const studentData = studentDoc.data();
            if (studentData.progress) {
              totalEngagement += studentData.progress;
            }
            if (studentData.lastActive && studentData.lastActive.toDate() > oneWeekAgo.toDate()) {
              weeklyNewCount++;
            }
          });

          // Get submissions data
          const submissionsRef = collection(db, `classrooms/${classroomId}/submissions`);
          const pendingSnapshot = await getDocs(
            query(submissionsRef, where('status', '==', 'pending'))
          );
          pendingReviewsCount += pendingSnapshot.size;

          const highPrioritySnapshot = await getDocs(
            query(
              submissionsRef,
              where('priority', '==', 'high'),
              where('status', '==', 'pending')
            )
          );
          highPriorityCount += highPrioritySnapshot.size;
        }

        // Update stats
        setStats({
          totalStudents,
          averageEngagement: totalStudents > 0 ? totalEngagement / totalStudents : 0,
          weeklyNewStudents: weeklyNewCount,
          pendingReviews: pendingReviewsCount,
          highPriorityReviews: highPriorityCount,
          activeChallenges: 0, // Will be updated by challenges listener
          dueChallenges: 0 // Will be updated by challenges listener
        });
      });

      unsubscribers.push(unsubClassrooms);

      // Listen to active challenges
      const challengesRef = collection(db, 'challenges');
      const unsubActiveChallenges = onSnapshot(
        query(
          challengesRef,
          where('teacherId', '==', user.uid),
          where('status', '==', 'active')
        ),
        (snapshot) => {
          setStats(prevStats => ({
            ...prevStats!,
            activeChallenges: snapshot.size
          }));
        }
      );

      unsubscribers.push(unsubActiveChallenges);

      // Listen to due challenges
      const unsubDueChallenges = onSnapshot(
        query(
          challengesRef,
          where('teacherId', '==', user.uid),
          where('dueDate', '<=', oneWeekFromNow)
        ),
        (snapshot) => {
          setStats(prevStats => ({
            ...prevStats!,
            dueChallenges: snapshot.size
          }));
        }
      );

      unsubscribers.push(unsubDueChallenges);

      setLoading(false);
    } catch (err) {
      console.error('Error setting up real-time listeners:', err);
      setError('Failed to load teacher statistics');
      setLoading(false);
    }

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [user?.uid]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Alert variant="error" message={error} />;
  }

  if (!stats) {
    return <Alert variant="info" message="No statistics available" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Students"
        value={stats.totalStudents}
        icon="users"
      />
      <StatCard
        title="Active Challenges"
        value={stats.activeChallenges}
        icon="target"
      />
      <StatCard
        title="Pending Reviews"
        value={stats.pendingReviews}
        highlight={stats.highPriorityReviews > 0}
        icon="clipboard-check"
      />
      <StatCard
        title="Due Soon"
        value={stats.dueChallenges}
        icon="clock"
      />
      {/* Add more stat cards as needed */}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  trend?: 'up' | 'down';
  trendValue?: number;
  trendSuffix?: string;
  trendLabel?: string;
}

function StatCard({ title, value, trend, trendValue, trendSuffix = '', trendLabel = '' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow px-5 py-6">
      <div className="flex items-center justify-between">
        <div>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
        </div>
        {trend && trendValue !== undefined && (
          <div className={`flex items-center text-sm ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className="font-medium">
              {trendValue}{trendSuffix} {trendLabel}
            </span>
            <svg
              className={`w-5 h-5 ml-1 ${trend === 'up' ? '' : 'transform rotate-180'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
} 