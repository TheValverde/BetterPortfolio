'use client';

import { useState, useEffect } from 'react';
import Timeline from './Timeline';

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

export default function TimelineWrapper() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const response = await fetch('/api/timeline');
        if (!response.ok) {
          throw new Error('Failed to fetch timeline data');
        }
        const data = await response.json();
        setEvents(data.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, []);

  if (loading) {
    return (
      <section id="timeline" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Career Timeline
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Loading your professional journey...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="timeline" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Career Timeline
            </h2>
            <p className="text-red-500">Error loading timeline: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return <Timeline events={events} />;
}
