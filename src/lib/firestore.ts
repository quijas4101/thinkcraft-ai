import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  addDoc,
  DocumentData,
  serverTimestamp,
  increment,
  orderBy,
  limit,
  writeBatch,
  setDoc
} from 'firebase/firestore';

// Types
interface Challenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  dueDate: string;
  progress: number;
  studentId: string;
}

interface Project {
  id: string;
  title: string;
  type: string;
  collaborators: number;
  lastUpdated: string;
  studentId: string;
}

interface StudentStats {
  completedChallenges: number;
  activeProjects: number;
  insightPoints: number;
  badgesEarned: number;
}

interface Classroom {
  id: string;
  name: string;
  studentCount: number;
  activeProjects: number;
  averageProgress: number;
  teacherId: string;
}

interface ChallengeSubmission {
  id: string;
  challengeId: string;
  studentId: string;
  content: string;
  feedback?: string;
  status: 'pending' | 'reviewed' | 'completed';
  score?: number;
  submittedAt: string;
  reviewedAt?: string;
}

interface AIFeedback {
  suggestions: string[];
  criticalThinkingScore: number;
  creativityScore: number;
  areas: {
    strength: string[];
    improvement: string[];
  };
}

interface Feedback {
  id: string;
  projectId: string;
  authorId: string;
  authorRole: 'teacher' | 'student';
  content: string;
  createdAt: string;
  parentId?: string; // For threaded responses
}

interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  order: number;
}

interface Notification {
  id: string;
  userId: string;
  type: 'feedback' | 'milestone' | 'project' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

interface ProjectAnalytics {
  complexityScore: number;
  linesOfCode: number;
  timeSpent: number;
  languageBreakdown: {
    [language: string]: number;
  };
  lastUpdated: string;
}

// Student Dashboard Functions
export async function fetchStudentChallenges(userId: string): Promise<Challenge[]> {
  try {
    console.log('Fetching challenges for user:', userId);
    const challengesRef = collection(db, 'challenges');
    const q = query(
      challengesRef, 
      where('studentId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as Challenge)
      .sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return dateA - dateB;
      });
  } catch (error) {
    console.error('Error fetching student challenges:', error);
    return [];
  }
}

export async function fetchStudentProjects(userId: string): Promise<Project[]> {
  try {
    console.log('Fetching projects for user:', userId);
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef, 
      where('studentId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as Project)
      .sort((a, b) => {
        const dateA = new Date(a.lastUpdated).getTime();
        const dateB = new Date(b.lastUpdated).getTime();
        return dateB - dateA;
      });
  } catch (error) {
    console.error('Error fetching student projects:', error);
    return [];
  }
}

export async function fetchStudentStats(userId: string): Promise<StudentStats | null> {
  try {
    const statsDoc = await getDoc(doc(db, 'studentStats', userId));
    return statsDoc.exists() ? statsDoc.data() as StudentStats : null;
  } catch (error) {
    console.error('Error fetching student stats:', error);
    return null;
  }
}

// Teacher Dashboard Functions
export async function fetchTeacherClassrooms(userId: string): Promise<Classroom[]> {
  try {
    console.log('Fetching classrooms for teacher:', userId);
    const classroomsRef = collection(db, 'classrooms');
    const q = query(classroomsRef, where('teacherId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Classroom[];
  } catch (error) {
    console.error('Error fetching teacher classrooms:', error);
    return [];
  }
}

// Update functions
export async function updateChallengeProgress(challengeId: string, progress: number) {
  try {
    await updateDoc(doc(db, 'challenges', challengeId), {
      progress,
      lastUpdated: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return false;
  }
}

export async function createNewProject(projectData: Omit<Project, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      lastUpdated: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating new project:', error);
    return null;
  }
}

export async function submitChallenge(
  challengeId: string, 
  studentId: string, 
  content: string
): Promise<string> {
  try {
    const submission = {
      challengeId,
      studentId,
      content,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'submissions'), submission);
    
    // Update student stats
    const statsRef = doc(db, 'studentStats', studentId);
    const statsDoc = await getDoc(statsRef);

    if (!statsDoc.exists()) {
      // Create the document with default values if it doesn't exist
      await setDoc(statsRef, {
        completedChallenges: 0,
        totalPoints: 0,
        lastActive: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    }

    // Increment completed challenges and update lastActive
    await updateDoc(statsRef, {
      completedChallenges: increment(1),
      lastActive: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error submitting challenge:', error);
    throw error;
  }
}

export async function getAIFeedback(submissionId: string): Promise<AIFeedback> {
  const submissionRef = doc(db, 'submissions', submissionId);
  const submissionDoc = await getDoc(submissionRef);
  
  if (!submissionDoc.exists()) {
    throw new Error('Submission not found');
  }

  // Here we would integrate with our AI service
  // For now, returning mock feedback
  return {
    suggestions: [
      'Consider exploring alternative perspectives',
      'Try to connect ideas across different domains'
    ],
    criticalThinkingScore: 85,
    creativityScore: 78,
    areas: {
      strength: ['Problem analysis', 'Creative solution generation'],
      improvement: ['Evidence support', 'Implementation details']
    }
  };
}

export async function createProject(projectData: Omit<Project, 'id'>) {
  const projectsRef = collection(db, 'projects');
  const docRef = await addDoc(projectsRef, projectData);
  return docRef.id;
}

export async function updateProject(projectId: string, updates: Partial<Project>) {
  const projectRef = doc(db, 'projects', projectId);
  
  // Ensure analytics exist
  await ensureProjectAnalytics(projectId);
  
  await updateDoc(projectRef, {
    ...updates,
    lastUpdated: serverTimestamp(),
    'analytics.lastUpdated': serverTimestamp()
  });

  // Create notification for project update
  const project = (await getDoc(projectRef)).data() as Project;
  await createNotification({
    userId: project.studentId,
    type: 'project',
    title: 'Project Updated',
    message: `Your project "${project.title}" has been updated.`,
    link: `/dashboard/student/projects/${projectId}`
  });
}

export async function getFeedbackForProject(projectId: string): Promise<Feedback[]> {
  try {
    const feedbackRef = collection(db, 'feedback');
    const q = query(
      feedbackRef,
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No feedback found for project:', projectId);
      return [];
    }

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    } as Feedback));
  } catch (error) {
    if (error instanceof Error && error.message.includes('requires an index')) {
      console.warn('Creating Firestore index...');
      return [];
    }
    throw error;
  }
}

export async function addFeedback(feedbackData: Omit<Feedback, 'id'>): Promise<string> {
  try {
    const feedbackRef = collection(db, 'feedback');
    const docRef = await addDoc(feedbackRef, {
      ...feedbackData,
      createdAt: serverTimestamp()
    });
    
    // Create notification for feedback
    await createNotification({
      userId: feedbackData.projectId, // This should be the project owner's ID
      type: 'feedback',
      title: 'New Feedback',
      message: `You have received new feedback on your project`,
      link: `/dashboard/student/projects/${feedbackData.projectId}`
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding feedback:', error);
    throw error;
  }
}

export async function markFeedbackAsRead(projectId: string, userId: string) {
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    unreadFeedback: false
  });
}

export async function createMilestone(milestoneData: Omit<Milestone, 'id'>) {
  try {
    const batch = writeBatch(db);
    
    // Create the milestone document
    const milestoneRef = doc(collection(db, 'projects', milestoneData.projectId, 'milestones'));
    batch.set(milestoneRef, {
      ...milestoneData,
      createdAt: serverTimestamp(),
      status: milestoneData.status || 'pending'
    });
    
    // Update project milestone counts and analytics
    const projectRef = doc(db, 'projects', milestoneData.projectId);
    batch.update(projectRef, {
      totalMilestones: increment(1),
      lastUpdated: serverTimestamp(),
      'analytics.milestoneCount': increment(1)
    });
    
    // Execute the batch
    await batch.commit();
    
    // Create notification after successful batch commit
    await createNotification({
      userId: milestoneData.projectId, // This should be the project owner's ID
      type: 'milestone',
      title: 'New Milestone Created',
      message: `A new milestone "${milestoneData.title}" has been added to your project.`,
      link: `/dashboard/student/projects/${milestoneData.projectId}`
    });
    
    return milestoneRef.id;
  } catch (error) {
    console.error('Error creating milestone:', error);
    throw new Error('Failed to create milestone. Please try again.');
  }
}

export async function updateMilestone(
  projectId: string,
  milestoneId: string,
  updates: Partial<Milestone>
) {
  const milestoneRef = doc(db, 'projects', projectId, 'milestones', milestoneId);
  await updateDoc(milestoneRef, updates);
  
  // Update project's current milestone if status changed to completed
  if (updates.status === 'completed') {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      currentMilestone: increment(1)
    });
  }
}

export async function getMilestones(projectId: string): Promise<Milestone[]> {
  const milestonesRef = collection(db, 'projects', projectId, 'milestones');
  const q = query(milestonesRef, orderBy('order'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Milestone[];
}

export async function getProjectAnalytics(projectId: string): Promise<ProjectAnalytics | null> {
  try {
    const analyticsRef = doc(db, 'analytics', projectId);
    const analyticsDoc = await getDoc(analyticsRef);
    
    if (!analyticsDoc.exists()) {
      return {
        complexityScore: 0,
        linesOfCode: 0,
        timeSpent: 0,
        languageBreakdown: {},
        lastUpdated: new Date().toISOString()
      };
    }
    
    return {
      ...analyticsDoc.data(),
      lastUpdated: analyticsDoc.data().lastUpdated?.toDate().toISOString() || new Date().toISOString()
    } as ProjectAnalytics;
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    throw error;
  }
}

// Update project analytics
export async function updateProjectAnalytics(projectId: string, updates: any) {
  const projectRef = doc(db, 'projects', projectId);
  const analyticsRef = collection(projectRef, 'analytics');
  
  await addDoc(analyticsRef, {
    ...updates,
    timestamp: serverTimestamp()
  });
}

export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
  const notificationRef = collection(db, 'notifications');
  await addDoc(notificationRef, {
    ...notification,
    read: false,
    createdAt: serverTimestamp()
  });
}

// Add a function to initialize project analytics if they don't exist
export async function ensureProjectAnalytics(projectId: string) {
  const projectRef = doc(db, 'projects', projectId);
  const projectDoc = await getDoc(projectRef);
  
  if (!projectDoc.exists() || !projectDoc.data()?.analytics) {
    await updateDoc(projectRef, {
      analytics: {
        complexityScore: 0,
        linesOfCode: 0,
        timeSpent: 0,
        milestoneCount: 0,
        languageBreakdown: {},
        lastUpdated: serverTimestamp()
      }
    });
  }
} 