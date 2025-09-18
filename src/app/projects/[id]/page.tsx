import { notFound } from 'next/navigation';
import { getProjectById } from '@/lib/database';
import ProjectDetail from '@/components/ProjectDetail';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);
  
  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.title} - ${process.env.FULL_NAME || 'Your Name'}`,
    description: project.description,
    openGraph: {
      title: `${project.title} - ${process.env.FULL_NAME || 'Your Name'}`,
      description: project.description,
      type: 'website',
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return <ProjectDetail project={project} />;
}
