import { NextResponse } from 'next/server';
import { getActiveResume } from '@/lib/database';

export async function GET() {
  try {
    const activeResume = await getActiveResume();
    
    if (!activeResume) {
      return NextResponse.json(
        { error: 'No active resume found' },
        { status: 404 }
      );
    }

    return NextResponse.json(activeResume);
  } catch (error) {
    console.error('Error fetching active resume:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
}


