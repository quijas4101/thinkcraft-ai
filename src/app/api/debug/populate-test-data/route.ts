import { NextResponse } from 'next/server';
import { populateTestData } from '@/scripts/populateTestData';

export async function POST(request: Request) {
  try {
    const { teacherUid, studentUid } = await request.json();
    
    if (!teacherUid || !studentUid) {
      return NextResponse.json({ error: 'Missing required UIDs' }, { status: 400 });
    }

    const result = await populateTestData(teacherUid, studentUid);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in populate-test-data route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 