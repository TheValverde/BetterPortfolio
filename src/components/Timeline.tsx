'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TimelineEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string | null;
  status: 'completed' | 'ongoing';
  client: string;
  role: string;
  description: string;
  technologies: string[];
  category: string;
  featured: boolean;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('timeline');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  // Sort events by start date (newest first) - show ALL projects
  const sortedEvents = [...events]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  // Group events by year - use end date for placement (except Yale project)
  const eventsByYear = sortedEvents.reduce((acc, event) => {
    let year;
    if (event.client === 'Yale University') {
      // Yale project uses start date
      year = new Date(event.startDate).getFullYear();
    } else {
      // All other projects use end date, fallback to start date if no end date
      year = event.endDate 
        ? new Date(event.endDate).getFullYear()
        : new Date(event.startDate).getFullYear();
    }
    
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(event);
    return acc;
  }, {} as Record<number, TimelineEvent[]>);

  const years = Object.keys(eventsByYear).map(Number).sort((a, b) => b - a);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'ongoing':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getClientColor = (client: string) => {
    switch (client) {
      case 'Riot Games':
        return 'bg-red-500';
      case 'Quince Imaging / NHL':
        return 'bg-blue-600';
      case 'Personal':
        return 'bg-purple-500';
      case 'World Bank Group':
        return 'bg-yellow-500';
      case 'Yale University':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <section id="timeline" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Career Timeline
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A journey through my professional evolution, from real-time graphics to AI engineering
          </p>
        </div>

        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Horizontal Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-30"></div>
            
            {/* Year markers and projects */}
            <div className="flex justify-between items-start relative">
              {years.map((year, yearIndex) => (
                <div key={year} className="flex flex-col items-center relative">
                  {/* Year marker */}
                  <div 
                    className="bg-secondary border-2 border-primary rounded-full px-4 py-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setExpandedYear(expandedYear === year ? null : year)}
                  >
                    <span className="text-primary font-bold text-sm">{year}</span>
                  </div>
                  
                  {/* Project dots */}
                  <div className="mt-4 flex flex-col items-center space-y-2">
                    {eventsByYear[year].map((event, eventIndex) => (
                      <div
                        key={event.id}
                        className="relative group"
                        onMouseEnter={() => setHoveredEvent(event.id)}
                        onMouseLeave={() => setHoveredEvent(null)}
                      >
                        {/* Project dot */}
                        <div 
                          className={`w-4 h-4 rounded-full border-2 border-background cursor-pointer transition-all duration-300 hover:scale-125 ${getClientColor(event.client)}`}
                          onClick={() => window.open(`/projects/${event.id}`, '_blank')}
                        ></div>
                        
                        {/* Hover tooltip */}
                        {hoveredEvent === event.id && (
                          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-secondary border border-border rounded-lg p-3 shadow-lg z-10 min-w-[200px]">
                            <h4 className="font-semibold text-foreground text-sm mb-1">{event.title}</h4>
                            <p className="text-xs text-muted-foreground mb-1">{event.client}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(event.startDate)} - {event.endDate ? formatDate(event.endDate) : 'Present'}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                event.status === 'completed' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {event.status}
                              </span>
                              {event.featured && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expanded year details */}
          {expandedYear && (
            <div className="mt-12 p-6 bg-secondary/20 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground">{expandedYear} Projects</h3>
                <button 
                  onClick={() => setExpandedYear(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventsByYear[expandedYear].map((event) => (
                  <div key={event.id} className="bg-background/50 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground text-sm">{event.title}</h4>
                      <div className="flex items-center space-x-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'completed' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {event.status}
                        </span>
                        {event.featured && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                            ★
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{event.client}</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {formatDate(event.startDate)} - {event.endDate ? formatDate(event.endDate) : 'Present'}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {event.technologies.slice(0, 2).map((tech, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-secondary/50 text-xs rounded-md text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                      {event.technologies.length > 2 && (
                        <span className="px-2 py-1 bg-secondary/50 text-xs rounded-md text-muted-foreground">
                          +{event.technologies.length - 2}
                        </span>
                      )}
                    </div>
                    <Link 
                      href={`/projects/${event.id}`}
                      className="inline-flex items-center text-primary hover:text-accent transition-colors text-xs font-medium"
                    >
                      View Project
                      <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timeline legend */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-muted-foreground">Riot Games</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-muted-foreground">NHL</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-muted-foreground">Personal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-muted-foreground">World Bank</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <span className="text-muted-foreground">Yale</span>
          </div>
        </div>
      </div>
    </section>
  );
}
