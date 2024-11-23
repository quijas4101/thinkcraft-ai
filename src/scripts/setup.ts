import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Create a single test account
async function createAccount(
  email: string,
  password: string,
  role: 'student' | 'teacher',
  displayName: string
): Promise<string | null> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      email,
      role,
      displayName,
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Created ${role} account:`, email);
    return user.uid;
  } catch (error: any) {
    if (error?.code === 'auth/email-already-in-use') {
      console.log(`⚠️ Account already exists for ${email}`);
    } else {
      console.error(`❌ Error creating ${role} account:`, error?.message || 'Unknown error');
    }
    return null;
  }
}

// Populate data for a student
async function setupStudentData(studentId: string) {
  try {
    // Create challenges
    const challenges = [
      {
        title: 'Introduction to AI',
        difficulty: 'Easy',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 30,
        studentId
      },
      {
        title: 'Machine Learning Basics',
        difficulty: 'Medium',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 0,
        studentId
      }
    ];

    for (const challenge of challenges) {
      await setDoc(doc(collection(db, 'challenges')), challenge);
    }

    // Create projects
    const projects = [
      {
        title: 'AI Chatbot',
        type: 'Project',
        collaborators: 2,
        lastUpdated: new Date().toISOString(),
        studentId
      },
      {
        title: 'Image Recognition',
        type: 'Learning Path',
        collaborators: 1,
        lastUpdated: new Date().toISOString(),
        studentId
      }
    ];

    for (const project of projects) {
      await setDoc(doc(collection(db, 'projects')), project);
    }

    console.log('✅ Created student data');
  } catch (error) {
    console.error('❌ Error creating student data:', error);
  }
}

// Populate data for a teacher
async function setupTeacherData(teacherId: string) {
  try {
    const classrooms = [
      {
        name: 'AI Fundamentals',
        studentCount: 15,
        activeProjects: 8,
        averageProgress: 75,
        teacherId,
        createdAt: new Date().toISOString()
      },
      {
        name: 'Advanced ML',
        studentCount: 12,
        activeProjects: 6,
        averageProgress: 60,
        teacherId,
        createdAt: new Date().toISOString()
      }
    ];

    for (const classroom of classrooms) {
      await setDoc(doc(collection(db, 'classrooms')), classroom);
    }

    console.log('✅ Created teacher data');
  } catch (error) {
    console.error('❌ Error creating teacher data:', error);
  }
}

// Main setup function
async function setup() {
  try {
    console.log('🚀 Starting setup...');

    // Create test accounts
    const studentId = await createAccount('student@test.com', 'test123', 'student', 'Test Student');
    const teacherId = await createAccount('teacher@test.com', 'test123', 'teacher', 'Test Teacher');

    if (studentId) {
      await setupStudentData(studentId);
    }

    if (teacherId) {
      await setupTeacherData(teacherId);
    }

    console.log('\n✨ Setup completed successfully!');
    console.log('\nTest Accounts:');
    console.log('Teacher: teacher@test.com / test123');
    console.log('Student: student@test.com / test123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setup(); 