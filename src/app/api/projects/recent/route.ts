import { NextRequest, NextResponse } from 'next/server';
import { getRecentProjects } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    
    const projects = await getRecentProjects(limit);
    
    return NextResponse.json({ 
      projects,
      count: projects.length,
      limit: limit
    });
    
  } catch (error) {
    console.error('Error fetching recent projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent projects' },
      { status: 500 }
    );
  }
}
