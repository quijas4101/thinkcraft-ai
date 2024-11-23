import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Project } from '@/types/core';

/**
 * Fetches all projects for a given user
 * @param userId - The ID of the user whose projects to fetch
 * @returns Promise resolving to an array of projects
 */
export async function fetchUserProjects(userId: string): Promise<Project[]> {
  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, where('studentId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    lastUpdated: doc.data().lastUpdated?.toDate?.()?.toISOString() || new Date().toISOString()
  })) as Project[];
}

/**
 * Creates a new project in the database
 * @param projectData - The project data without id and lastUpdated
 * @returns Promise resolving to the new project's ID
 */
export async function createProject(projectData: Omit<Project, 'id' | 'lastUpdated'>) {
  const docRef = await addDoc(collection(db, 'projects'), {
    ...projectData,
    lastUpdated: serverTimestamp(),
    collaborators: projectData.collaborators || 1,
    progress: projectData.progress || 0
  });
  
  return docRef.id;
}

/**
 * Updates an existing project
 * @param projectId - The ID of the project to update
 * @param updates - Partial project data to update
 */
export async function updateProject(projectId: string, updates: Partial<Project>) {
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    ...updates,
    lastUpdated: serverTimestamp()
  });
}

/**
 * Calculates the progress percentage of a project
 * @param project - The project to calculate progress for
 * @returns A number between 0 and 100 representing progress
 */
export function calculateProjectProgress(project: Project): number {
  if (project.status === 'Completed') return 100;
  if (project.status === 'Planning') return 0;
  return project.progress || 50;
} 