import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ProjectAnalytics, UserAnalytics } from '@/types/analytics';

export async function initializeProjectAnalytics(projectId: string) {
  const analyticsRef = doc(db, 'projects', projectId, 'analytics', 'stats');
  await setDoc(analyticsRef, {
    complexityScore: 0,
    linesOfCode: 0,
    timeSpent: 0,
    milestoneCount: 0,
    languageBreakdown: {},
    lastUpdated: serverTimestamp()
  });
}

export async function updateProjectAnalytics(
  projectId: string, 
  updates: Partial<ProjectAnalytics>
) {
  const analyticsRef = doc(db, 'projects', projectId, 'analytics', 'stats');
  await updateDoc(analyticsRef, {
    ...updates,
    lastUpdated: serverTimestamp()
  });
}

export async function incrementMilestoneCount(projectId: string) {
  const analyticsRef = doc(db, 'projects', projectId, 'analytics', 'stats');
  await updateDoc(analyticsRef, {
    milestoneCount: increment(1),
    lastUpdated: serverTimestamp()
  });
}

export async function trackProjectActivity(projectId: string, activityType: string) {
  const analyticsRef = doc(db, 'projects', projectId, 'analytics', 'activity');
  
  await updateDoc(analyticsRef, {
    [`activities.${activityType}`]: increment(1),
    lastActivity: serverTimestamp(),
    totalActivities: increment(1)
  });
}

export async function trackUserProgress(userId: string, updates: Partial<UserAnalytics>) {
  const userStatsRef = doc(db, 'studentStats', userId);
  
  await updateDoc(userStatsRef, {
    ...updates,
    lastUpdated: serverTimestamp()
  });
}

export async function calculateProjectMetrics(projectId: string): Promise<ProjectAnalytics> {
  const projectRef = doc(db, 'projects', projectId);
  const projectDoc = await getDoc(projectRef);
  const project = projectDoc.data();

  if (!project) throw new Error('Project not found');

  const metrics = {
    totalMilestones: project.milestones?.length || 0,
    completedMilestones: project.milestones?.filter((m: any) => m.status === 'completed').length || 0,
    progressPercentage: 0,
    timeSpent: project.timeSpent || 0,
    lastUpdated: serverTimestamp()
  };

  metrics.progressPercentage = metrics.totalMilestones > 0
    ? (metrics.completedMilestones / metrics.totalMilestones) * 100
    : 0;

  await updateDoc(doc(db, 'projects', projectId, 'analytics', 'metrics'), metrics);

  return metrics;
}

export async function updateUserEngagement(userId: string, action: string) {
  const statsRef = doc(db, 'studentStats', userId);
  
  await updateDoc(statsRef, {
    [`engagement.${action}`]: increment(1),
    'engagement.lastActive': serverTimestamp(),
    'engagement.totalActions': increment(1)
  });
} 