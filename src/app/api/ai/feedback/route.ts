import { NextResponse } from 'next/server';
import { generateAIFeedback } from '@/lib/services/aiService';
import { auth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const { code, language, projectId } = await request.json();

    const feedback = await generateAIFeedback({
      code,
      language,
      projectId,
      userId: decodedToken.uid
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error in AI feedback route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 