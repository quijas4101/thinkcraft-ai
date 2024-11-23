export interface User {
  uid: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  displayName?: string;
  photoURL?: string;
  classroomId?: string;
  insightPoints?: number;
  level?: number;
  badges?: string[];
  interests?: string[];
  completedChallenges?: number;
  activeProjects?: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface StudentProfile extends User {
  progress: {
    criticalThinking: number;
    creativity: number;
    collaboration: number;
  };
  currentChallenges: string[];
  achievements: {
    id: string;
    name: string;
    description: string;
    earnedAt: string;
  }[];
} 