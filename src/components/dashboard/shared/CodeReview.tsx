'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { generateCodeReview } from '@/lib/services/aiService';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { CodeReviewFeedback } from '@/types/core';

interface CodeReviewProps {
  code: string;
  language: string;
  projectId: string;
  onUpdate?: () => void;
}

export function CodeReview({ code, language, projectId, onUpdate }: CodeReviewProps) {
  const { authState } = useAuth();
  const [feedback, setFeedback] = useState<CodeReviewFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestReview = async () => {
    setLoading(true);
    setError(null);

    try {
      const review = await generateCodeReview({
        code,
        language,
        projectId,
        userId: authState.user?.uid
      });
      setFeedback(review);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error generating code review:', err);
      setError('Failed to generate code review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Code Review</h3>
        <Button
          onClick={handleRequestReview}
          disabled={loading || !code}
          loading={loading}
          size="sm"
        >
          Request Review
        </Button>
      </div>

      {error && (
        <Alert type="error" message={error} />
      )}

      {feedback && (
        <div className="space-y-4">
          {/* Quality Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(feedback.metrics).map(([metric, score]) => (
              <div
                key={metric}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="text-sm font-medium text-gray-500">{metric}</div>
                <div className="mt-1 flex items-baseline">
                  <div className="text-2xl font-semibold text-indigo-600">
                    {score}/10
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Suggestions for Improvement
            </h4>
            <ul className="space-y-2">
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 text-indigo-500">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                  <span className="ml-2 text-sm text-gray-600">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Code Analysis */}
          {feedback.codeAnalysis && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Detailed Analysis
              </h4>
              <div className="prose prose-sm max-w-none text-gray-600">
                {feedback.codeAnalysis}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 