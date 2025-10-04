import { NextRequest, NextResponse } from 'next/server';
import { getResumes, createResume, getActiveResume } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get client IP for logging
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = forwarded?.split(',')[0]?.trim() || realIP || 'localhost';
    
    console.log('Admin resumes API accessed from:', clientIP);

    const resumes = await getResumes();
    const activeResume = await getActiveResume();

    return NextResponse.json({
      resumes,
      activeResume
    });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for logging
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = forwarded?.split(',')[0]?.trim() || realIP || 'localhost';
    
    console.log('Admin resumes POST API accessed from:', clientIP);

    const body = await request.json();
    const { filename, displayName, fileSize } = body;

    if (!filename || !displayName) {
      return NextResponse.json(
        { error: 'Filename and display name are required' },
        { status: 400 }
      );
    }

    const resume = await createResume({
      filename,
      displayName,
      fileSize
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error('Error creating resume:', error);
    return NextResponse.json(
      { error: 'Failed to create resume' },
      { status: 500 }
    );
  }
}
