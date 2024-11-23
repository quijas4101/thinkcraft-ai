import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { StudentStats } from '@/types/core';

export async function getStudentStats(userId: string): Promise<StudentStats> {
  const statsRef = doc(db, 'studentStats', userId);
  const statsDoc = await getDoc(statsRef);

  if (!statsDoc.exists()) {
    // Initialize stats if they don't exist
    const initialStats: StudentStats = {
      completedChallenges: 0,
      totalChallenges: 0,
      badges: [],
      skills: {
        'Critical Thinking': 1,
        'Creativity': 1,
        'Problem Solving': 1
      },
      points: 0,
      level: 1,
      lastActive: new Date().toISOString()
    };

    await updateDoc(statsRef, initialStats);
    return initialStats;
  }

  return statsDoc.data() as StudentStats;
}

export async function updateStudentStats(
  userId: string,
  updates: Partial<StudentStats>
) {
  const statsRef = doc(db, 'studentStats', userId);
  await updateDoc(statsRef, updates);
}

export async function awardPoints(userId: string, points: number) {
  const statsRef = doc(db, 'studentStats', userId);
  await updateDoc(statsRef, {
    points: increment(points),
    lastActive: new Date().toISOString()
  });
} 