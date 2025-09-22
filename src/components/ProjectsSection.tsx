'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/types/project';

export default function ProjectsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('projects');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Fetch featured projects
        const featuredResponse = await fetch('/api/projects?featured=true');
        if (!featuredResponse.ok) {
          throw new Error('Failed to fetch featured projects');
        }
        const featuredData = await featuredResponse.json();
        setProjects(featuredData.projects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleViewAllProjects = async () => {
    if (showAllProjects) {
      // Already showing all, switch back to featured
      setShowAllProjects(false);
    } else {
      // Need to fetch all projects
      if (allProjects.length === 0) {
        try {
          setLoading(true);
          const response = await fetch('/api/projects?limit=100');
          if (!response.ok) {
            throw new Error('Failed to fetch all projects');
          }
          const data = await response.json();
          setAllProjects(data.projects);
          setShowAllProjects(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load all projects');
        } finally {
          setLoading(false);
        }
      } else {
        setShowAllProjects(true);
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ai':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
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
    switch (status) {
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

  if (loading) {
    return (
      <section id="projects" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading projects...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-400">Error loading projects: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`transition-all duration-1000 ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Projects
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
            <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
              A showcase of my work spanning AI engineering, real-time graphics, and full-stack development
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(showAllProjects ? allProjects : projects).map((project) => (
              <div
                key={project.id}
                className="bg-secondary/20 p-6 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                {/* Project Preview Image */}
                <div className="h-48 bg-muted/50 rounded-lg mb-4 overflow-hidden">
                  {project.previewImage ? (
                    <Image
                      src={project.previewImage}
                      alt={project.title}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">
                        {project.images && project.images.length > 0 
                          ? `${project.images.length} images` 
                          : 'No preview image'
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Project Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    {project.title}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                {/* Category Badge */}
                <div className="mb-3">
                  <span className={`px-2 py-1 rounded text-xs border ${getCategoryColor(project.category)}`}>
                    {project.category.replace('_', ' ').replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-4 text-sm line-clamp-3">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="bg-primary/20 text-primary px-2 py-1 rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 4 && (
                    <span className="text-muted-foreground text-xs">
                      +{project.technologies.length - 4} more
                    </span>
                  )}
                </div>

                    {/* Project Links */}
                    <div className="flex gap-2">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        View Details →
                      </Link>
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground text-sm"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-12">
            <button 
              onClick={handleViewAllProjects}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              {showAllProjects ? 'Show Featured Only' : 'View All Projects'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
