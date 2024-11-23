'use server';

import OpenAI from 'openai';
import { AIScenario } from '@/types/ai';
import { db } from '@/lib/firebase-admin';
import { CodeReviewFeedback } from '@/types/core';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateAIFeedback(params: {
  code: string;
  language: string;
  projectId: string;
  userId: string;
}): Promise<CodeReviewFeedback> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a code review assistant. Analyze the code and provide feedback."
        },
        {
          role: "user",
          content: `Review this ${params.language} code:\n\n${params.code}`
        }
      ]
    });

    const feedback: CodeReviewFeedback = {
      metrics: {
        'Code Quality': 8,
        'Best Practices': 7,
        'Performance': 9
      },
      suggestions: response.choices[0].message.content?.split('\n') || [],
      codeAnalysis: response.choices[0].message.content || ''
    };

    return feedback;
  } catch (error) {
    console.error('Error generating AI feedback:', error);
    throw new Error('Failed to generate code review');
  }
} 