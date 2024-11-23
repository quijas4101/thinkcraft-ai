import { db } from '@/lib/firebase';
import { collection, doc, setDoc, Timestamp, serverTimestamp } from 'firebase/firestore';

interface TestData {
  teacherUid: string;
  studentUid: string;
}

export async function populateTestData({ teacherUid, studentUid }: TestData) {
  try {
    // 1. Create classroom
    const classroomRef = doc(collection(db, 'classrooms'));
    const classroomData = {
      name: 'Web Development 101',
      teacherId: teacherUid,
      studentCount: 5,
      activeProjects: 3,
      averageProgress: 65,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      description: 'Introduction to modern web development',
      tags: ['React', 'TypeScript', 'Next.js']
    };
    
    await setDoc(classroomRef, classroomData);
    console.log('Created classroom:', classroomRef.id);

    // 2. Update student profile
    const studentData = {
      displayName: 'Test Student',
      email: 'student@test.com',
      role: 'student',
      classroomId: classroomRef.id,
      progress: 65,
      lastActive: serverTimestamp(),
      createdAt: serverTimestamp(),
      completedChallenges: 8,
      totalPoints: 750
    };
    
    await setDoc(doc(db, 'users', studentUid), studentData, { merge: true });
    console.log('Updated student profile');

    // 3. Create student challenges
    const challenges = [
      {
        title: 'React Components',
        difficulty: 'Easy',
        dueDate: new Date('2024-04-01').toISOString(),
        progress: 100,
        studentId: studentUid,
        description: 'Create your first React component',
        status: 'completed',
        points: 100
      },
      {
        title: 'TypeScript Basics',
        difficulty: 'Medium',
        dueDate: new Date('2024-04-15').toISOString(),
        progress: 60,
        studentId: studentUid,
        description: 'Learn TypeScript fundamentals',
        status: 'in-progress',
        points: 150
      },
      {
        title: 'Next.js App Router',
        difficulty: 'Hard',
        dueDate: new Date('2024-04-30').toISOString(),
        progress: 0,
        studentId: studentUid,
        description: 'Build a full-stack app with Next.js',
        status: 'not-started',
        points: 200
      }
    ];

    for (const challenge of challenges) {
      await setDoc(doc(collection(db, 'challenges')), challenge);
    }
    console.log('Created challenges');

    // 4. Create student projects
    const projects = [
      {
        title: 'Personal Portfolio',
        description: 'A showcase of my work',
        studentId: studentUid,
        status: 'in-progress',
        progress: 75,
        technologies: ['React', 'TailwindCSS'],
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      },
      {
        title: 'Task Manager API',
        description: 'RESTful API for task management',
        studentId: studentUid,
        status: 'completed',
        progress: 100,
        technologies: ['Node.js', 'Express'],
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      }
    ];

    for (const project of projects) {
      await setDoc(doc(collection(db, 'projects')), project);
    }
    console.log('Created projects');

    // 5. Create student stats
    const studentStats = {
      completedChallenges: 8,
      activeProjects: 1,
      totalPoints: 750,
      averageProgress: 65,
      lastUpdated: serverTimestamp(),
      strengths: ['React', 'CSS'],
      areasForImprovement: ['TypeScript', 'Testing'],
      badges: [
        { name: 'Fast Learner', earned: true },
        { name: 'Problem Solver', earned: true },
        { name: 'Code Ninja', earned: false }
      ]
    };

    await setDoc(doc(db, 'studentStats', studentUid), studentStats);
    console.log('Created student stats');

    // 6. Update teacher profile
    const teacherData = {
      displayName: 'Test Teacher',
      email: 'teacher@test.com',
      role: 'teacher',
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      classrooms: [classroomRef.id],
      specializations: ['Web Development', 'React', 'TypeScript']
    };

    await setDoc(doc(db, 'users', teacherUid), teacherData, { merge: true });
    console.log('Updated teacher profile');

    return {
      success: true,
      data: {
        classroomId: classroomRef.id,
        studentCount: 1,
        challengesCount: challenges.length,
        projectsCount: projects.length
      }
    };

  } catch (error) {
    console.error('Error populating test data:', error);
    throw error;
  }
} 