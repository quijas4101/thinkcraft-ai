import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

interface StudentStats {
  completedChallenges: number;
  totalPoints: number;
  lastActive: Date;
  createdAt: Date;
}

const defaultStats = {
  completedChallenges: 0,
  totalPoints: 0,
};

export async function getStudentStats(userId: string): Promise<StudentStats> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const statsRef = doc(db, 'studentStats', userId);
  
  try {
    const statsDoc = await getDoc(statsRef);

    if (!statsDoc.exists()) {
      // Create new document with default values
      const timestamp = new Date();
      const newStats = {
        ...defaultStats,
        lastActive: timestamp,
        createdAt: timestamp
      };
      
      await setDoc(statsRef, newStats);
      return newStats;
    }

    const data = statsDoc.data();
    return {
      completedChallenges: data.completedChallenges ?? 0,
      totalPoints: data.totalPoints ?? 0,
      lastActive: data.lastActive?.toDate() ?? new Date(),
      createdAt: data.createdAt?.toDate() ?? new Date()
    };
  } catch (error) {
    console.error('Error in getStudentStats:', error);
    throw error;
  }
}

export async function updateStudentStats(userId: string, updates: Partial<StudentStats>) {
  try {
    const statsRef = doc(db, 'studentStats', userId);
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      // Create document with defaults + updates if it doesn't exist
      await setDoc(statsRef, {
        completedChallenges: 0,
        totalPoints: 0,
        lastActive: serverTimestamp(),
        createdAt: serverTimestamp(),
        ...updates
      });
    } else {
      await updateDoc(statsRef, {
        ...updates,
        lastActive: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating student stats:', error);
    throw error;
  }
} 