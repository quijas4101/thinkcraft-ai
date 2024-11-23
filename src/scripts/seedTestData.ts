import { db } from '@/lib/firebase';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';

async function seedTestData() {
  try {
    // Seed challenges for test student
    const challenges = [
      {
        title: 'Introduction to React',
        difficulty: 'Easy',
        dueDate: new Date('2024-04-20').toISOString(),
        progress: 30,
        studentId: 'STUDENT_UID', // Replace with actual student UID after creating account
        description: 'Learn the basics of React components and state management',
      },
      {
        title: 'TypeScript Fundamentals',
        difficulty: 'Medium',
        dueDate: new Date('2024-04-25').toISOString(),
        progress: 60,
        studentId: 'STUDENT_UID',
        description: 'Master TypeScript types and interfaces',
      }
    ];

    // Seed student stats
    const studentStats = {
      completedChallenges: 5,
      activeProjects: 3,
      insightPoints: 750,
      badgesEarned: 8,
      lastUpdated: Timestamp.now(),
    };

    // Seed classrooms for test teacher
    const classrooms = [
      {
        name: 'Web Development 101',
        studentCount: 15,
        activeProjects: 8,
        averageProgress: 75,
        teacherId: 'TEACHER_UID', // Replace with actual teacher UID
        lastUpdated: Timestamp.now(),
      },
      {
        name: 'Advanced JavaScript',
        studentCount: 12,
        activeProjects: 6,
        averageProgress: 82,
        teacherId: 'TEACHER_UID',
        lastUpdated: Timestamp.now(),
      }
    ];

    // Seed projects
    const projects = [
      {
        title: 'Personal Portfolio',
        type: 'Frontend',
        collaborators: 1,
        lastUpdated: Timestamp.now(),
        studentId: 'STUDENT_UID',
        status: 'In Progress',
        description: 'Building a personal portfolio website using React and TypeScript',
      },
      {
        title: 'Task Manager API',
        type: 'Backend',
        collaborators: 2,
        lastUpdated: Timestamp.now(),
        studentId: 'STUDENT_UID',
        status: 'Planning',
        description: 'Creating a RESTful API for task management',
      }
    ];

    // Write to Firestore
    for (const challenge of challenges) {
      await setDoc(doc(collection(db, 'challenges')), challenge);
    }

    await setDoc(doc(db, 'studentStats', 'STUDENT_UID'), studentStats);

    for (const classroom of classrooms) {
      await setDoc(doc(collection(db, 'classrooms')), classroom);
    }

    for (const project of projects) {
      await setDoc(doc(collection(db, 'projects')), project);
    }

    console.log('Test data seeded successfully!');
  } catch (error) {
    console.error('Error seeding test data:', error);
  }
}

// Run the seeding function
seedTestData(); 