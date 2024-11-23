'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFeedbackThread, addFeedback } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import type { Feedback } from '@/types/core';

interface FeedbackThreadProps {
  projectId: string;
}

export function FeedbackThread({ projectId }: FeedbackThreadProps) {
  const { authState } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeedback();
  }, [projectId]);

  const loadFeedback = async () => {
    try {
      const thread = await getFeedbackThread(projectId);
      setFeedback(thread);
    } catch (err) {
      console.error('Error loading feedback:', err);
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.user || !newComment.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await addFeedback({
        projectId,
        authorId: authState.user.uid,
        authorRole: authState.role || 'student',
        content: newComment.trim(),
        createdAt: new Date().toISOString()
      });

      setNewComment('');
      await loadFeedback();
    } catch (err) {
      console.error('Error adding feedback:', err);
      setError('Failed to add feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading feedback...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Discussion Thread</h3>

      <div className="space-y-4">
        {feedback.map((item) => (
          <div
            key={item.id}
            className={`flex space-x-3 ${
              item.authorId === authState.user?.uid ? 'justify-end' : ''
            }`}
          >
            <div
              className={`flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200 max-w-2xl ${
                item.authorId === authState.user?.uid ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar
                    name={item.authorName || 'User'}
                    role={item.authorRole}
                    size="sm"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {item.authorName || 'User'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{item.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <div>
          <label htmlFor="comment" className="sr-only">
            Add a comment
          </label>
          <textarea
            id="comment"
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Add your feedback..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>
        <div className="mt-2 flex justify-end">
          <Button
            type="submit"
            disabled={submitting || !newComment.trim()}
            loading={submitting}
          >
            Add Comment
          </Button>
        </div>
      </form>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
} 