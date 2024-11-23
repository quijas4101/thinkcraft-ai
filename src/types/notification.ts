export interface Notification {
  id: string;
  userId: string;
  type: 'feedback' | 'milestone' | 'project' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
} 