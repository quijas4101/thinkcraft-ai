export async function createUserDocument(user: User, role: string) {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email,
      role: role,
      createdAt: serverTimestamp(),
    });

    // Initialize studentStats if role is student
    if (role === 'student') {
      const statsRef = doc(db, 'studentStats', user.uid);
      await setDoc(statsRef, {
        completedChallenges: 0,
        totalPoints: 0,
        lastActive: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    }

    return true;
  } catch (error) {
    console.error('Error creating user document:', error);
    return false;
  }
}

async function initializeStudentStats(userId: string) {
  const statsRef = doc(db, 'studentStats', userId);
  await setDoc(statsRef, {
    completedChallenges: 0,
    totalPoints: 0,
    lastActive: serverTimestamp(),
    createdAt: serverTimestamp()
  });
} 