// User Models
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher';
  createdAt: string;
  lastActive: string;
}

export interface StudentProfile extends User {
  role: 'student';
  classroomId?: string;
  currentLevel: number;
  insightPoints: number;
  badges: string[];
}

export interface TeacherProfile extends User {
  role: 'teacher';
  specializations: string[];
  classrooms: string[];
}

// Learning Models
export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Quiz' | 'Project' | 'Exercise';
  dueDate: string;
  progress: number;
  studentId: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  skills: string[];
  points: number;
}

export interface ProjectFile {
  name: string;
  url: string;
  uploadedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  content: string;
  status: 'in_progress' | 'completed';
  studentId: string;
  lastUpdated: string;
  language?: string;
  tags?: string[];
  milestones?: Milestone[];
  currentMilestone?: number;
  totalMilestones?: number;
}

// Classroom Models
export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  description: string;
  studentCount: number;
  activeProjects: number;
  averageProgress: number;
  createdAt: string;
  lastUpdated: string;
  students: string[];
  currentModule: string;
}

export interface StudentStats {
  studentId: string;
  completedChallenges: number;
  activeProjects: number;
  insightPoints: number;
  badgesEarned: number;
  lastUpdated: string;
  skillLevels: Record<string, number>;
  learningStreak: number;
}

export interface Feedback {
  id: string;
  projectId: string;
  authorId: string;
  authorRole: 'teacher' | 'student';
  content: string;
  createdAt: string;
  parentId?: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  order: number;
} 