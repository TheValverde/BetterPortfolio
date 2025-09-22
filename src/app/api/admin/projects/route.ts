import { NextRequest, NextResponse } from 'next/server';
import { createProject } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json();
    
    // Validate required fields
    if (!projectData.title || !projectData.description || !projectData.startDate) {
      return NextResponse.json(
        { error: 'Title, description, and start date are required' },
        { status: 400 }
      );
    }

    const project = await createProject(projectData);
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
