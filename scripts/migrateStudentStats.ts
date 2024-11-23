import { db } from '../src/lib/firebase';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';

async function migrateStudentStats() {
  const usersRef = collection(db, 'users');
  const studentQuery = query(usersRef, where('role', '==', 'student'));
  const students = await getDocs(studentQuery);

  for (const student of students.docs) {
    const statsRef = doc(db, 'studentStats', student.id);
    await setDoc(statsRef, {
      completedChallenges: 0,
      totalPoints: 0,
      lastActive: new Date(),
      createdAt: new Date()
    }, { merge: true });
  }
}

// Run the migration
migrateStudentStats().then(() => {
  console.log('Migration complete');
}).catch(console.error); 