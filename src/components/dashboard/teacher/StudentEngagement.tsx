'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';

interface StudentEngagementData {
  id: string;
  name: string;
  lastActive: Date;
  participationRate: number;
  completedTasks: number;
  totalTasks: number;
  averageTimePerTask: number;
  streak: number;
  classroomName: string;
}

export function StudentEngagement() {
  const { user } = useAuth();
  const [engagementData, setEngagementData] = useState<StudentEngagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<keyof StudentEngagementData>('participationRate');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (!user?.uid) return;

    async function fetchEngagementData() {
      try {
        setLoading(true);
        const classroomsRef = collection(db, 'classrooms');
        const classroomsQuery = query(
          classroomsRef,
          where('teacherId', '==', user.uid)
        );
        
        const classroomsSnapshot = await getDocs(classroomsQuery);
        const engagementData: StudentEngagementData[] = [];
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        for (const classroomDoc of classroomsSnapshot.docs) {
          const classroom = classroomDoc.data();
          const studentsRef = collection(db, `classrooms/${classroomDoc.id}/students`);
          const studentsQuery = query(
            studentsRef,
            orderBy('lastActive', 'desc'),
            limit(50)
          );

          const studentsSnapshot = await getDocs(studentsQuery);

          for (const studentDoc of studentsSnapshot.docs) {
            const studentData = studentDoc.data();
            const stats = await getStudentStats(studentDoc.id);
            
            engagementData.push({
              id: studentDoc.id,
              name: studentData.displayName || 'Unknown Student',
              lastActive: studentData.lastActive?.toDate() || new Date(),
              participationRate: calculateParticipationRate(stats),
              completedTasks: stats.completedTasks || 0,
              totalTasks: stats.totalTasks || 0,
              averageTimePerTask: stats.averageTimePerTask || 0,
              streak: stats.streak || 0,
              classroomName: classroom.name
            });
          }
        }

        // Apply sorting and filtering
        const filteredData = filterEngagementData(engagementData, filterBy);
        const sortedData = sortEngagementData(filteredData, sortBy);
        
        setEngagementData(sortedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching engagement data:', err);
        setError('Failed to load student engagement data');
        setLoading(false);
      }
    }

    fetchEngagementData();
  }, [user?.uid, sortBy, filterBy]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Student Engagement</h2>
        <div className="flex gap-4">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as typeof filterBy)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">All Students</option>
            <option value="active">Active (Last 7 Days)</option>
            <option value="inactive">Needs Attention</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as keyof StudentEngagementData)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="participationRate">Participation Rate</option>
            <option value="lastActive">Last Active</option>
            <option value="completedTasks">Completed Tasks</option>
            <option value="streak">Streak</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <Alert variant="error" message={error} />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Table headers */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {engagementData.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.classroomName}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Add other table cells */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Helper functions
function calculateParticipationRate(stats: any): number {
  if (!stats.totalTasks) return 0;
  return (stats.completedTasks / stats.totalTasks) * 100;
}

async function getStudentStats(studentId: string) {
  const statsRef = collection(db, 'studentStats');
  const statsQuery = query(statsRef, where('studentId', '==', studentId));
  const statsSnapshot = await getDocs(statsQuery);
  return statsSnapshot.docs[0]?.data() || {};
}

function filterEngagementData(
  data: StudentEngagementData[], 
  filterType: 'all' | 'active' | 'inactive'
): StudentEngagementData[] {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  switch (filterType) {
    case 'active':
      return data.filter(student => student.lastActive >= oneWeekAgo);
    case 'inactive':
      return data.filter(student => 
        student.lastActive < oneWeekAgo || 
        student.participationRate < 50
      );
    default:
      return data;
  }
}

function sortEngagementData(
  data: StudentEngagementData[], 
  sortKey: keyof StudentEngagementData
): StudentEngagementData[] {
  return [...data].sort((a, b) => {
    if (sortKey === 'lastActive') {
      return b.lastActive.getTime() - a.lastActive.getTime();
    }
    return (b[sortKey] as number) - (a[sortKey] as number);
  });
} 