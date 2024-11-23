'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Classroom {
  id: string;
  name: string;
  studentCount: number;
  activeProjects: number;
  averageProgress: number;
  lastUpdated: string;
  teacherId: string;
}

interface NewClassroomData {
  name: string;
  description?: string;
}

export function ClassroomOverview() {
  const { user, loading: authLoading } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newClassroom, setNewClassroom] = useState<NewClassroomData>({
    name: '',
    description: ''
  });

  useEffect(() => {
    let mounted = true;

    async function fetchClassrooms() {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const classroomsRef = collection(db, 'classrooms');
        const q = query(classroomsRef, where('teacherId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        if (mounted) {
          const classroomData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Classroom[];

          setClassrooms(classroomData);
        }
      } catch (err) {
        console.error('Error fetching classrooms:', err);
        if (mounted) {
          setError('Failed to load classrooms');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      fetchClassrooms();
    }

    return () => {
      mounted = false;
    };
  }, [user?.uid, authLoading]);

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    try {
      setIsCreating(true);
      const classroomData = {
        ...newClassroom,
        teacherId: user.uid,
        studentCount: 0,
        activeProjects: 0,
        averageProgress: 0,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'classrooms'), classroomData);
      
      setClassrooms(prev => [...prev, { 
        id: docRef.id, 
        ...classroomData, 
        lastUpdated: new Date().toISOString() 
      }]);
      
      setNewClassroom({ name: '', description: '' });
      setIsCreating(false);
    } catch (err) {
      console.error('Error creating classroom:', err);
      setError('Failed to create classroom');
      setIsCreating(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Create Classroom Form */}
      <form onSubmit={handleCreateClassroom} className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="className" className="block text-sm font-medium text-gray-700">
              Classroom Name
            </label>
            <input
              type="text"
              id="className"
              value={newClassroom.name}
              onChange={(e) => setNewClassroom(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={newClassroom.description}
              onChange={(e) => setNewClassroom(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Classroom'}
          </button>
        </div>
      </form>

      {/* Classrooms List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classrooms.map((classroom) => (
          <div key={classroom.id} className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">{classroom.name}</h3>
            <dl className="mt-4 space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Students</dt>
                <dd className="text-2xl font-semibold text-primary-600">
                  {classroom.studentCount}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Active Projects</dt>
                <dd className="text-2xl font-semibold text-primary-600">
                  {classroom.activeProjects}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Average Progress</dt>
                <dd className="text-2xl font-semibold text-primary-600">
                  {classroom.averageProgress}%
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
} 