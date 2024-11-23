'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Student {
  id: string;
  displayName: string;
  progress: number;
  lastActive: string;
  status: 'On Track' | 'Needs Help' | 'Excelling';
  classroomId: string;
}

export function StudentProgress() {
  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchStudents() {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        
        // First get teacher's classrooms
        const classroomsQuery = query(
          collection(db, 'classrooms'),
          where('teacherId', '==', user.uid)
        );
        
        const classroomsSnapshot = await getDocs(classroomsQuery);
        const classroomIds = classroomsSnapshot.docs.map(doc => doc.id);
        
        if (classroomIds.length === 0) {
          if (mounted) {
            setStudents([]);
            setLoading(false);
          }
          return;
        }

        // Then get students from those classrooms
        const studentsData: Student[] = [];
        
        for (const classroomId of classroomIds) {
          const studentsQuery = query(
            collection(db, `classrooms/${classroomId}/students`),
            orderBy('lastActive', 'desc'),
            limit(10)
          );
          
          const studentsSnapshot = await getDocs(studentsQuery);
          
          studentsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            studentsData.push({
              id: doc.id,
              displayName: data.displayName || 'Unknown Student',
              progress: data.progress || 0,
              lastActive: data.lastActive || new Date().toISOString(),
              status: data.status || 'On Track',
              classroomId
            });
          });
        }
        
        if (mounted) {
          setStudents(studentsData);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        if (mounted) {
          setError('Failed to load student data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      fetchStudents();
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

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No student data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Recent Student Activity
        </h3>
        <div className="space-y-4">
          {students.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {student.displayName}
                </h3>
                <p className="text-sm text-gray-500">
                  Last active: {new Date(student.lastActive).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {student.progress}%
                  </div>
                  <div className={`text-sm ${
                    student.status === 'Needs Help' 
                      ? 'text-red-500' 
                      : student.status === 'Excelling' 
                      ? 'text-green-500' 
                      : 'text-gray-500'
                  }`}>
                    {student.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 