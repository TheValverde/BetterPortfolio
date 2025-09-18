import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        status: true,
        client: true,
        role: true,
        technologies: true,
        category: true,
        featured: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // Transform the data for timeline
    const timelineEvents = projects.map(project => ({
      id: project.id,
      title: project.title,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      client: project.client,
      role: project.role,
      description: project.description || 'No description available',
      technologies: project.technologies,
      category: project.category,
      featured: project.featured,
    }));

    return NextResponse.json({ events: timelineEvents });
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline data' },
      { status: 500 }
    );
  }
}
