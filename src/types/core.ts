/**
 * Core type definitions for the application
 * These types are used across multiple components and features
 */

/**
 * Project Type
 * Represents a student's project with all its properties
 */
export interface Project {
  id: string;                    // Unique identifier
  title: string;                 // Project title
  type: 'Frontend' | 'Backend' | 'Full Stack';  // Project category
  collaborators: number;         // Number of students working on the project
  lastUpdated: string;          // ISO timestamp of last update
  description?: string;         // Optional project description
  status: 'Planning' | 'In Progress' | 'Completed';  // Current project status
  studentId: string;            // ID of the student who owns the project
  progress?: number;            // Optional progress percentage (0-100)
  content?: string;            // Optional project content/notes
  language?: string;           // Optional primary programming language
}

/**
 * Challenge Type
 * Represents a learning challenge assigned to students
 */
export interface Challenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  dueDate: string;             // ISO timestamp for due date
  progress: number;            // Completion progress (0-100)
  studentId: string;           // ID of assigned student
  description: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

/**
 * Classroom Type
 * Represents a teacher's classroom with associated metrics
 */
export interface Classroom {
  id: string;
  name: string;
  teacherId: string;           // ID of teacher managing the classroom
  studentCount: number;        // Number of enrolled students
  activeProjects: number;      // Count of ongoing projects
  averageProgress: number;     // Average progress across all projects
  description?: string;        // Optional classroom description
  createdAt: string;          // ISO timestamp of creation date
} 