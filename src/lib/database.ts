import { PrismaClient, ProjectStatus, ProjectCategory } from '@prisma/client';
import { Project } from '@/types/project';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper function to convert Prisma project to our Project type
function convertPrismaProject(prismaProject: any): Project {
  return {
    id: prismaProject.id,
    title: prismaProject.title,
    description: prismaProject.description,
    longDescription: prismaProject.longDescription,
    startDate: prismaProject.startDate.toISOString().split('T')[0],
    endDate: prismaProject.endDate?.toISOString().split('T')[0],
    status: prismaProject.status.toLowerCase() as 'completed' | 'ongoing' | 'planned',
    technologies: prismaProject.technologies,
    category: prismaProject.category.toLowerCase().replace('_', '-') as 'ai' | 'real-time-graphics' | 'web' | 'mobile' | 'other',
    client: prismaProject.client,
    role: prismaProject.role,
    responsibilities: prismaProject.responsibilities,
    impact: prismaProject.impact,
    images: prismaProject.images,
    previewImage: prismaProject.previewImage,
    videoUrl: prismaProject.videoUrl,
    githubUrl: prismaProject.githubUrl,
    liveUrl: prismaProject.liveUrl,
    featured: prismaProject.featured,
    order: prismaProject.order,
    createdAt: prismaProject.createdAt.toISOString(),
    updatedAt: prismaProject.updatedAt.toISOString(),
  };
}

export async function getProjects(): Promise<Project[]> {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { startDate: 'desc' }
      ]
    });
    return projects.map(convertPrismaProject);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const project = await prisma.project.findUnique({
      where: { id }
    });
    return project ? convertPrismaProject(project) : null;
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    return null;
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const projects = await prisma.project.findMany({
      where: { featured: true },
      orderBy: [
        { order: 'asc' },
        { startDate: 'desc' }
      ]
    });
    return projects.map(convertPrismaProject);
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return [];
  }
}

export async function getProjectsByCategory(category: string): Promise<Project[]> {
  try {
    // Map frontend category names to database enum values
    const categoryMap: { [key: string]: ProjectCategory } = {
      'ai': 'AI',
      'real-time-graphics': 'REAL_TIME_GRAPHICS',
      'real-time_graphics': 'REAL_TIME_GRAPHICS', // Support both formats
      'web': 'WEB',
      'mobile': 'MOBILE',
      'other': 'OTHER'
    };
    
    const projectCategory = categoryMap[category.toLowerCase()];
    if (!projectCategory) {
      console.error('Invalid category:', category);
      return [];
    }
    
    const projects = await prisma.project.findMany({
      where: { category: projectCategory },
      orderBy: { startDate: 'desc' }
    });
    return projects.map(convertPrismaProject);
  } catch (error) {
    console.error('Error fetching projects by category:', error);
    return [];
  }
}

export async function getRecentProjects(limit: number = 5): Promise<Project[]> {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [
        { status: 'asc' }, // 'ongoing' comes before 'completed' alphabetically
        { endDate: 'desc' }, // Most recent end dates first
        { startDate: 'desc' } // Fallback to start date for projects with same end date
      ],
      take: limit
    });
    return projects.map(convertPrismaProject);
  } catch (error) {
    console.error('Error fetching recent projects:', error);
    return [];
  }
}

export async function searchProjects(query: string): Promise<Project[]> {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { technologies: { has: query } }
        ]
      },
      orderBy: { startDate: 'desc' }
    });
    return projects.map(convertPrismaProject);
  } catch (error) {
    console.error('Error searching projects:', error);
    return [];
  }
}

export async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  try {
    const project = await prisma.project.create({
      data: {
        title: projectData.title,
        description: projectData.description,
        longDescription: projectData.longDescription,
        startDate: new Date(projectData.startDate),
        endDate: projectData.endDate ? new Date(projectData.endDate) : null,
        status: projectData.status.toUpperCase() as ProjectStatus,
        technologies: projectData.technologies,
        category: projectData.category.toUpperCase().replace('-', '_') as ProjectCategory,
        client: projectData.client,
        role: projectData.role,
        responsibilities: projectData.responsibilities,
        impact: projectData.impact,
        images: projectData.images || [],
        previewImage: projectData.previewImage,
        videoUrl: projectData.videoUrl,
        githubUrl: projectData.githubUrl,
        liveUrl: projectData.liveUrl,
        featured: projectData.featured,
        order: projectData.order,
      }
    });
    return convertPrismaProject(project);
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  try {
    const updateData: any = {};
    
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.longDescription) updateData.longDescription = updates.longDescription;
    if (updates.startDate) updateData.startDate = new Date(updates.startDate);
    if (updates.endDate) updateData.endDate = new Date(updates.endDate);
    if (updates.status) updateData.status = updates.status.toUpperCase() as ProjectStatus;
    if (updates.technologies) updateData.technologies = updates.technologies;
    if (updates.category) updateData.category = updates.category.toUpperCase().replace('-', '_') as ProjectCategory;
    if (updates.client) updateData.client = updates.client;
    if (updates.role) updateData.role = updates.role;
    if (updates.responsibilities) updateData.responsibilities = updates.responsibilities;
    if (updates.impact) updateData.impact = updates.impact;
    if (updates.images) updateData.images = updates.images;
    if (updates.previewImage !== undefined) updateData.previewImage = updates.previewImage;
    if (updates.videoUrl) updateData.videoUrl = updates.videoUrl;
    if (updates.githubUrl) updateData.githubUrl = updates.githubUrl;
    if (updates.liveUrl) updateData.liveUrl = updates.liveUrl;
    if (updates.featured !== undefined) updateData.featured = updates.featured;
    if (updates.order !== undefined) updateData.order = updates.order;

    const project = await prisma.project.update({
      where: { id },
      data: updateData
    });
    return convertPrismaProject(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await prisma.project.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

// Seed function to populate the database with initial data
export async function seedDatabase(): Promise<void> {
  try {
    // Check if we already have projects
    const existingProjects = await prisma.project.count();
    if (existingProjects > 0) {
      console.log('Database already seeded');
      return;
    }

    const sampleProjects = [
      {
        title: 'Ubuntu Home AI',
        description: 'AI Agent for personal use with coding capabilities, integrating with MCP servers.',
        longDescription: 'Created an AI Agent for personal use with coding capabilities, that integrates with MCP servers. This agent is hosted on my Ubuntu Server, with a mirror on my Windows desktop. Both utilize another MCP server I made to input CLI commands to help manage the full environment on the Ubuntu server. It also does daily diagnostics, and takes in system resources, which through clever engineering, outputs whether we can run more services, cut back, and even recommends other services to run.',
        startDate: new Date('2025-05-01'),
        status: 'ONGOING' as ProjectStatus,
        technologies: ['Python', 'MCP', 'LangChain', 'Docker', 'Ubuntu Server', 'AI Agents'],
        category: 'AI' as ProjectCategory,
        role: 'AI Engineer',
        responsibilities: [
          'Developed AI agent with coding capabilities',
          'Created MCP server for CLI command integration',
          'Implemented system resource monitoring',
          'Built automated diagnostics system'
        ],
        impact: 'Automated server management and provided intelligent recommendations for system optimization.',
        images: [],
        featured: true,
        order: 1
      },
      {
        title: 'SpaceTraders MCP',
        description: 'Model Context Protocol server for interacting with the SpaceTraders API.',
        longDescription: 'A comprehensive Model Context Protocol (MCP) server for interacting with the SpaceTraders API. This project exposes SpaceTraders API endpoints as MCP tools, allowing AI agents to manage agents, fleets, contracts, and trading operations in the SpaceTraders universe.',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-07-01'),
        status: 'COMPLETED' as ProjectStatus,
        technologies: ['Python', 'MCP', 'FastAPI', 'Docker', 'API Integration'],
        category: 'AI' as ProjectCategory,
        role: 'AI Engineer',
        responsibilities: [
          'Developed MCP server architecture',
          'Implemented SpaceTraders API integration',
          'Created comprehensive tool set for AI agents',
          'Built Docker containerization'
        ],
        impact: 'Enabled AI agents to autonomously play and manage SpaceTraders gameplay.',
        githubUrl: 'https://github.com/yourusername/spacetraders-mcp',
        images: [],
        featured: true,
        order: 2
      },
      {
        title: 'Riot Games MSI Tournament',
        description: 'Programmed Arena graphics for MSI, set in Canada.',
        longDescription: 'Program Arena graphics for MSI, set in Canada. Worked patiently with artists, and programmed show within a week. Traveled to LA to support Riot in the launch of this flagship event.',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-06-01'),
        status: 'COMPLETED' as ProjectStatus,
        technologies: ['Ventuz', 'Real-time Graphics', 'Live Events'],
        category: 'REAL_TIME_GRAPHICS' as ProjectCategory,
        client: 'Riot Games',
        role: 'Real-Time Graphics Programmer',
        responsibilities: [
          'Programmed arena graphics for MSI tournament',
          'Collaborated with artists on visual design',
          'Provided on-site support in LA',
          'Ensured smooth live event execution'
        ],
        impact: 'Successfully delivered graphics for one of Riot\'s flagship esports events.',
        images: [],
        featured: true,
        order: 3
      },
      {
        title: 'Zelus',
        description: 'Real-time stats visualizer and projection system for NHL games.',
        longDescription: 'Zelus is a powerful real-time stats visualizer and projection system developed for NHL games. This innovative system takes live match data and projects it directly onto the ice surface during period breaks, creating an immersive fan experience.',
        startDate: new Date('2023-08-01'),
        status: 'ONGOING' as ProjectStatus,
        technologies: ['Ventuz', 'Real-time Graphics', 'NHL API', 'Projection Systems'],
        category: 'REAL_TIME_GRAPHICS' as ProjectCategory,
        client: 'Quince Imaging',
        role: 'Real-Time Developer',
        responsibilities: [
          'Developed real-time projection system for NHL games',
          'Created Shot Report and Leaderboard features',
          'Implemented Rewind feature for replaying plays',
          'Designed new templates and user manual'
        ],
        impact: 'Enhanced fan engagement during NHL games with interactive statistics and replay capabilities.',
        images: [],
        featured: true,
        order: 4
      }
    ];

    for (const projectData of sampleProjects) {
      await prisma.project.create({
        data: projectData
      });
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}