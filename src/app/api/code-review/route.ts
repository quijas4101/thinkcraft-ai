import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit } from '@/lib/rateLimit';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    await limiter.check(5, 'OPENAI_RATE_LIMIT');

    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `Please review this ${language} code and provide constructive feedback:
    
${code}

Please provide feedback in the following format:
1. Code Quality Analysis
2. Potential Improvements
3. Best Practices
4. Security Considerations (if applicable)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an experienced software engineer providing code review feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const feedback = completion.choices[0]?.message?.content || 'No feedback available';

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Code review error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate code review' },
      { status: 500 }
    );
  }
} 