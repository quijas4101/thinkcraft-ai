require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, collection } = require('firebase/firestore');

// Initialize Firebase with environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Verify environment variables are loaded
console.log('Checking Firebase configuration...');
Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing Firebase config: ${key}`);
    process.exit(1);
  }
});

interface TestAccount {
  email: string;
  password: string;
  role: 'student' | 'teacher';
  displayName: string;
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const TEST_ACCOUNTS: TestAccount[] = [
  {
    email: 'student@test.com',
    password: 'test123',
    role: 'student',
    displayName: 'Test Student'
  },
  {
    email: 'teacher@test.com',
    password: 'test123',
    role: 'teacher',
    displayName: 'Test Teacher'
  }
];

async function createUserWithData(account: TestAccount) {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, account.email, account.password);
    const uid = userCredential.user.uid;

    // Create user document
    await setDoc(doc(db, 'users', uid), {
      email: account.email,
      displayName: account.displayName,
      role: account.role,
      createdAt: new Date().toISOString()
    });

    if (account.role === 'teacher') {
      // Create initial classroom data
      const classrooms = [
        {
          name: 'AI Fundamentals',
          studentCount: 15,
          activeProjects: 8,
          averageProgress: 75,
          teacherId: uid,
          createdAt: new Date().toISOString()
        }
      ];

      for (const classroom of classrooms) {
        await setDoc(doc(collection(db, 'classrooms')), classroom);
      }
    }

    console.log(`✅ Created ${account.role} account:`, account.email);
    return uid;
  } catch (error: any) {
    if (error?.code === 'auth/email-already-in-use') {
      console.log(`⚠️ Account already exists for ${account.email}`);
    } else {
      console.error(`❌ Error creating ${account.role} account:`, error?.message || 'Unknown error');
    }
    throw error;
  }
}

async function setupFirebase() {
  console.log('🚀 Starting Firebase setup...');
  
  for (const account of TEST_ACCOUNTS) {
    await createUserWithData(account);
  }
  
  console.log('✨ Firebase setup completed!');
  process.exit(0);
}

// Run the setup
setupFirebase().catch((error: Error) => {
  console.error('Failed to setup Firebase:', error);
  process.exit(1);
}); 