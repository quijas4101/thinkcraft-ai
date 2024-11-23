import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';
require('dotenv').config({ path: '.env.local' });

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount as any),
});

const db = getFirestore();

async function createIndexes() {
  try {
    // Create index for notifications (userId, createdAt)
    await db.collection('notifications').listIndexes();
    await db.collection('notifications').createIndex({
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    });

    // Create index for users (classroomId, role)
    await db.collection('users').createIndex({
      fields: [
        { fieldPath: 'classroomId', order: 'ASCENDING' },
        { fieldPath: 'role', order: 'ASCENDING' }
      ]
    });

    // Create index for challenges (studentId, dueDate)
    await db.collection('challenges').createIndex({
      fields: [
        { fieldPath: 'studentId', order: 'ASCENDING' },
        { fieldPath: 'dueDate', order: 'ASCENDING' }
      ]
    });

    // Create index for projects (studentId, lastUpdated)
    await db.collection('projects').createIndex({
      fields: [
        { fieldPath: 'studentId', order: 'ASCENDING' },
        { fieldPath: 'lastUpdated', order: 'DESCENDING' }
      ]
    });

    // Create index for feedback (projectId, createdAt)
    await db.collection('feedback').createIndex({
      fields: [
        { fieldPath: 'projectId', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    });

    // Create index for milestones (projectId, order)
    await db.collection('projects').doc('dummy').collection('milestones').createIndex({
      fields: [
        { fieldPath: 'projectId', order: 'ASCENDING' },
        { fieldPath: 'order', order: 'ASCENDING' }
      ]
    });

    console.log('✅ Indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

createIndexes().then(() => process.exit(0)); 