interface RewardSystem {
  points: number;
  badges: string[];
  level: number;
}

export async function awardPoints(userId: string, action: string, points: number) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    'gamification.points': increment(points),
    'gamification.lastUpdated': serverTimestamp()
  });
} 