import { db } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function setupInitialData(userId: string, role: 'student' | 'teacher') {
  try {
    if (role === 'student') {
      // Create initial student stats
      await setDoc(doc(db, 'studentStats', userId), {
        studentId: userId,
        completedChallenges: 0,
        activeProjects: 1,
        insightPoints: 100,
        badgesEarned: 2,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // Create initial projects
      const projects = [
        {
          title: 'AI Chatbot',
          type: 'Project',
          collaborators: 2,
          lastUpdated: serverTimestamp(),
          createdAt: serverTimestamp(),
          studentId: userId,
          status: 'in_progress'
        },
        {
          title: 'Machine Learning Basics',
          type: 'Learning Path',
          collaborators: 1,
          lastUpdated: serverTimestamp(),
          createdAt: serverTimestamp(),
          studentId: userId,
          status: 'not_started'
        }
      ];

      for (const project of projects) {
        await setDoc(doc(collection(db, 'projects')), project);
      }

      // Create initial challenges
      const challenges = [
        {
          title: 'Introduction to AI',
          difficulty: 'Easy',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 30,
          studentId: userId,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        },
        {
          title: 'Neural Networks',
          difficulty: 'Medium',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 0,
          studentId: userId,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        }
      ];

      for (const challenge of challenges) {
        await setDoc(doc(collection(db, 'challenges')), challenge);
      }

    } else if (role === 'teacher') {
      // Create initial classrooms
      const classrooms = [
        {
          name: 'AI Fundamentals',
          studentCount: 15,
          activeProjects: 8,
          averageProgress: 75,
          teacherId: userId,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        },
        {
          name: 'Machine Learning 101',
          studentCount: 12,
          activeProjects: 6,
          averageProgress: 60,
          teacherId: userId,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        }
      ];

      for (const classroom of classrooms) {
        await setDoc(doc(collection(db, 'classrooms')), classroom);
      }
    }

    console.log(`✅ Initial data setup completed for ${role}`);
    return true;
  } catch (error) {
    console.error('❌ Error setting up initial data:', error);
    throw error;
  }
}

export { setupInitialData }; 