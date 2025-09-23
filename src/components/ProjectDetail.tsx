import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/types/project';

interface ProjectDetailProps {
  project: Project;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  // Function to parse markdown links and convert them to JSX
  const parseMarkdownLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Add the link
      parts.push(
        <Link 
          key={match.index}
          href={match[2]} 
          className="text-primary hover:text-primary/80 underline"
        >
          {match[1]}
        </Link>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ai':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'real-time-graphics':
      case 'real_time_graphics':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'web':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'mobile':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'ongoing':
        return 'bg-blue-500/20 text-blue-400';
      case 'planned':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
{process.env.FULL_NAME || 'Your Name'}
          </Link>
          <Link 
            href="/#projects" 
            className="text-foreground hover:text-primary transition-colors text-lg font-medium"
          >
            ← Back to Projects
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Project Header */}
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
                  {project.title}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm border ${getCategoryColor(project.category)}`}>
                    {project.category.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Project Meta */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Project Details</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><span className="font-medium">Start Date:</span> {formatDate(project.startDate)}</p>
                  {project.endDate && (
                    <p><span className="font-medium">End Date:</span> {formatDate(project.endDate)}</p>
                  )}
                  <p><span className="font-medium">Role:</span> {project.role}</p>
                  {project.client && (
                    <p><span className="font-medium">Client:</span> {project.client}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Project Description */}
          {(project.description || project.longDescription) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">About This Project</h2>
              <div className="prose prose-invert max-w-none">
                {project.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                    {project.description}
                  </p>
                )}
                {project.longDescription && (
                  <p className="text-muted-foreground leading-relaxed">
                    {parseMarkdownLinks(project.longDescription)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Responsibilities */}
          {project.responsibilities && project.responsibilities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">My Responsibilities</h2>
              <ul className="space-y-2">
                {project.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-muted-foreground">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Impact */}
          {project.impact && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Project Impact</h2>
              <p className="text-muted-foreground leading-relaxed">
                {project.impact}
              </p>
            </div>
          )}

          {/* Project Images */}
          {project.images && project.images.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Project Images</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {project.images.map((image, index) => (
                  <div key={index} className="relative aspect-video bg-muted/50 rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`${project.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Video */}
          {project.videoUrl && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Project Video</h2>
              <div className="relative aspect-video bg-muted/50 rounded-lg overflow-hidden">
                <iframe
                  src={project.videoUrl}
                  title={`${project.title} - Video`}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Project Links */}
          {(project.githubUrl || project.liveUrl) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Project Links</h2>
              <div className="flex flex-wrap gap-4">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    View on GitHub
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Live Project
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Back to Projects */}
          <div className="text-center">
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to All Projects
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
