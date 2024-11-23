const { auth, db } = require('../lib/firebase-admin');
const { createUserWithEmailAndPassword } = require('firebase/auth');
const { doc, setDoc } = require('firebase/firestore');

// Create a single test account
async function createSingleTestAccount(
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

// Create test accounts function with a different name
const setupTestAccounts = async () => {
  const studentUid = await createSingleTestAccount(
    'student@test.com',
    'test123',
    'student',
    'Test Student'
  );

  const teacherUid = await createSingleTestAccount(
    'teacher@test.com',
    'test123',
    'teacher',
    'Test Teacher'
  );

  return { studentUid, teacherUid };
};

module.exports = { setupTestAccounts }; 