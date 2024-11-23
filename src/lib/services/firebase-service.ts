import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  addDoc,
  orderBy,
  serverTimestamp,
  DocumentReference,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { 
  User, 
  StudentProfile, 
  TeacherProfile, 
  Challenge, 
  Project, 
  Classroom,
  StudentStats 
} from '@/types/models';

// User Services
export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.error('User document not found:', userId);
      return null;
    }
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
}

// Student Services
export async function getStudentProfile(userId: string): Promise<StudentProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists() || userDoc.data()?.role !== 'student') return null;
    return { id: userDoc.id, ...userDoc.data() } as StudentProfile;
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return null;
  }
}

export async function getStudentStats(studentId: string): Promise<StudentStats | null> {
  try {
    const statsDoc = await getDoc(doc(db, 'studentStats', studentId));
    if (!statsDoc.exists()) {
      console.warn('No stats found for student:', studentId);
      return null;
    }
    return { id: statsDoc.id, ...statsDoc.data() } as StudentStats;
  } catch (error) {
    console.error('Error fetching student stats:', error);
    throw new Error('Failed to fetch student stats');
  }
}

// Teacher Services
export async function getTeacherProfile(userId: string): Promise<TeacherProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists() || userDoc.data()?.role !== 'teacher') {
      console.warn('No teacher profile found for:', userId);
      return null;
    }
    return { id: userDoc.id, ...userDoc.data() } as TeacherProfile;
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    throw new Error('Failed to fetch teacher profile');
  }
}

export async function getTeacherClassrooms(teacherId: string): Promise<Classroom[]> {
  try {
    const q = query(
      collection(db, 'classrooms'),
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Classroom[];
  } catch (error) {
    console.error('Error fetching teacher classrooms:', error);
    throw new Error('Failed to fetch teacher classrooms');
  }
}

// Update Services
export async function updateChallengeProgress(
  challengeId: string, 
  progress: number
): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'challenges', challengeId), {
      progress,
      lastUpdated: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return false;
  }
}

export async function createProject(project: Omit<Project, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...project,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
} 