import { NextRequest, NextResponse } from 'next/server';
import { getProjects, getFeaturedProjects, searchProjects, createProject, getProjectsByCategory } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const technology = searchParams.get('technology');
    const year = searchParams.get('year');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let projects: any[] = [];

    // Apply filters
    if (featured === 'true') {
      projects = await getFeaturedProjects();
    } else if (search) {
      projects = await searchProjects(search);
    } else if (category) {
      projects = await getProjectsByCategory(category);
    } else {
      projects = await getProjects();
    }

    // Apply additional filters
    if (technology) {
      projects = projects.filter(project => 
        project.technologies.some((tech: string) => 
          tech.toLowerCase().includes(technology.toLowerCase())
        )
      );
    }

    if (year) {
      const yearNum = parseInt(year);
      projects = projects.filter(project => {
        const projectYear = new Date(project.startDate).getFullYear();
        return projectYear === yearNum;
      });
    }

    if (status) {
      projects = projects.filter(project => project.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = projects.slice(startIndex, endIndex);

    return NextResponse.json({
      projects: paginatedProjects,
      total: projects.length,
      page,
      limit,
      totalPages: Math.ceil(projects.length / limit)
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newProject = await createProject(body);
    
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
