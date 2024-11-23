'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onSnapshot, query, collection, where, orderBy, limit, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { Alert } from '@/components/ui/Alert';

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

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  error: string | null;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    if (!auth || !auth.user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', auth.user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const newNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Notification[];
        setNotifications(newNotifications);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications. Please try again later.');
        setNotifications([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth?.user]);

  const markAsRead = async (notificationId: string) => {
    if (!auth?.user) return;

    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to update notification. Please try again.');
    }
  };

  const markAllAsRead = async () => {
    if (!auth?.user) return;

    const batch = writeBatch(db);
    try {
      notifications
        .filter(n => !n.read)
        .forEach(n => {
          const ref = doc(db, 'notifications', n.id);
          batch.update(ref, { read: true });
        });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to update notifications. Please try again.');
    }
  };

  const value = {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markAsRead,
    markAllAsRead,
    error,
    loading
  };

  return (
    <NotificationContext.Provider value={value}>
      {error && <Alert type="error" message={error} className="mb-4" />}
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 