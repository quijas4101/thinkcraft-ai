'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Student {
  id: string;
  displayName: string;
  email: string;
  status: 'active' | 'inactive';
  joinDate: string;
  progress: number;
  classroomId: string;
}

interface StudentManagementProps {
  classroomId: string;
}

export function StudentManagement({ classroomId }: StudentManagementProps) {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState({ email: '', displayName: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchStudents() {
      if (!classroomId) return;

      try {
        setLoading(true);
        const studentsRef = collection(db, `classrooms/${classroomId}/students`);
        const studentsSnapshot = await getDocs(studentsRef);

        if (mounted) {
          const studentsData = studentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Student[];

          setStudents(studentsData);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        if (mounted) {
          setError('Failed to load students');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchStudents();

    return () => {
      mounted = false;
    };
  }, [classroomId]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroomId || !user?.uid) return;

    try {
      setIsAdding(true);
      
      // Add student to classroom's students subcollection
      const studentData = {
        ...newStudent,
        status: 'active',
        joinDate: serverTimestamp(),
        progress: 0,
        classroomId
      };

      const docRef = await addDoc(
        collection(db, `classrooms/${classroomId}/students`), 
        studentData
      );

      // Update classroom's student count
      const classroomRef = doc(db, 'classrooms', classroomId);
      await updateDoc(classroomRef, {
        studentCount: students.length + 1,
        lastUpdated: serverTimestamp()
      });

      setStudents(prev => [...prev, { 
        id: docRef.id, 
        ...studentData, 
        joinDate: new Date().toISOString() 
      }]);
      
      setNewStudent({ email: '', displayName: '' });
    } catch (err) {
      console.error('Error adding student:', err);
      setError('Failed to add student');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Student Form */}
      <form onSubmit={handleAddStudent} className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Student</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={newStudent.email}
              onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={newStudent.displayName}
              onChange={(e) => setNewStudent(prev => ({ ...prev, displayName: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            disabled={isAdding}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isAdding ? 'Adding...' : 'Add Student'}
          </button>
        </div>
      </form>

      {/* Students List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Join Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {student.displayName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{student.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    student.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.progress}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(student.joinDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 