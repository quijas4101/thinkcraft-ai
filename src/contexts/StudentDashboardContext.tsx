'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { 
  getStudentProfile, 
  getStudentStats 
} from '@/lib/services/firebase-service';
import { 
  fetchStudentChallenges as getStudentChallenges,
  fetchStudentProjects as getStudentProjects 
} from '@/lib/firestore';
import type { 
  StudentProfile, 
  Challenge, 
  Project, 
  StudentStats 
} from '@/types/models';

interface StudentDashboardContextType {
  profile: StudentProfile | null;
  challenges: Challenge[];
  projects: Project[];
  stats: StudentStats | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const StudentDashboardContext = createContext<StudentDashboardContextType>({
  profile: null,
  challenges: [],
  projects: [],
  stats: null,
  loading: true,
  error: null,
  refreshData: async () => {},
});

export function StudentDashboardProvider({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!authState.user) return;

    try {
      setLoading(true);
      setError(null);

      const [profileData, challengesData, projectsData, statsData] = await Promise.all([
        getStudentProfile(authState.user.uid),
        getStudentChallenges(authState.user.uid),
        getStudentProjects(authState.user.uid),
        getStudentStats(authState.user.uid),
      ]);

      setProfile(profileData);
      setChallenges(challengesData);
      setProjects(projectsData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authState.user) {
      loadData();
    }
  }, [authState.user]);

  return (
    <StudentDashboardContext.Provider 
      value={{
        profile,
        challenges,
        projects,
        stats,
        loading,
        error,
        refreshData: loadData
      }}
    >
      {children}
    </StudentDashboardContext.Provider>
  );
}

export const useStudentDashboard = () => useContext(StudentDashboardContext); 