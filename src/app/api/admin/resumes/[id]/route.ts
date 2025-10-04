import { NextRequest, NextResponse } from 'next/server';
import { updateResume, deleteResume, setActiveResume } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get client IP for logging
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = forwarded?.split(',')[0]?.trim() || realIP || 'localhost';
    
    console.log('Admin resume PUT API accessed from:', clientIP);

    const { id } = params;
    const body = await request.json();
    const { filename, displayName, isActive, fileSize } = body;

    // If setting as active, use the setActiveResume function
    if (isActive === true) {
      const resume = await setActiveResume(id);
      return NextResponse.json(resume);
    }

    // Otherwise, update normally
    const resume = await updateResume(id, {
      filename,
      displayName,
      isActive,
      fileSize
    });

    return NextResponse.json(resume);
  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get client IP for logging
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = forwarded?.split(',')[0]?.trim() || realIP || 'localhost';
    
    console.log('Admin resume DELETE API accessed from:', clientIP);

    const { id } = params;
    const success = await deleteResume(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete resume' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}
