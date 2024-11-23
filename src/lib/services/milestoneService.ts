import { collection, doc, writeBatch, serverTimestamp, query, orderBy, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createNotification } from './notificationService';
import { incrementMilestoneCount } from './analyticsService';
import type { Milestone } from '@/types/milestone';

export async function createMilestone(milestoneData: Omit<Milestone, 'id'>) {
  const batch = writeBatch(db);
  
  // Get the next order number
  const existingMilestones = await getMilestones(milestoneData.projectId);
  const nextOrder = existingMilestones.length + 1;

  // Create milestone document
  const milestoneRef = doc(collection(db, 'projects', milestoneData.projectId, 'milestones'));
  batch.set(milestoneRef, {
    ...milestoneData,
    order: nextOrder,
    createdAt: serverTimestamp(),
    status: 'pending'
  });

  // Update project
  const projectRef = doc(db, 'projects', milestoneData.projectId);
  batch.update(projectRef, {
    totalMilestones: increment(1),
    lastUpdated: serverTimestamp()
  });

  await batch.commit();
  
  // Update analytics
  await incrementMilestoneCount(milestoneData.projectId);

  // Create notification
  await createNotification({
    userId: milestoneData.projectId,
    type: 'milestone',
    title: 'New Milestone Created',
    message: `A new milestone "${milestoneData.title}" has been added to your project.`,
    link: `/dashboard/student/projects/${milestoneData.projectId}`
  });

  return milestoneRef.id;
}

export async function getMilestones(projectId: string): Promise<Milestone[]> {
  const milestonesRef = collection(db, 'projects', projectId, 'milestones');
  const q = query(milestonesRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Milestone));
}

export async function updateMilestone(
  projectId: string,
  milestoneId: string,
  updates: Partial<Milestone>
) {
  const milestoneRef = doc(db, 'projects', projectId, 'milestones', milestoneId);
  
  await updateDoc(milestoneRef, {
    ...updates,
    lastUpdated: serverTimestamp()
  });

  // Update project analytics if status changed to completed
  if (updates.status === 'completed') {
    const analyticsRef = doc(db, 'projects', projectId, 'analytics', 'stats');
    await updateDoc(analyticsRef, {
      completedMilestones: increment(1),
      lastUpdated: serverTimestamp()
    });
  }
} 