'use client';

import { useEffect, useState } from 'react';

export default function SkillsSection() {
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

    const element = document.getElementById('skills');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const skillCategories = [
    {
      title: 'AI & Machine Learning',
      skills: ['LangGraph', 'LangChain', 'CrewAI', 'Agno', 'FastMCP', 'Agentic AI', 'LLM Integration', 'MCP (Model Context Protocol)', 'Machine Learning', 'Python', 'Docker', 'Ubuntu Server'],
      color: 'text-blue-400'
    },
    {
      title: 'Backend & APIs',
      skills: ['FastAPI', 'FAISS', 'Python', 'REST APIs', 'GraphQL', 'PostgreSQL', 'MongoDB', 'Redis'],
      color: 'text-green-400'
    },
    {
      title: 'Real-Time Graphics & Development',
      skills: ['Ventuz', 'Unreal Engine', 'Unity', 'C#', 'JavaScript', 'APIs', 'After Effects'],
      color: 'text-purple-400'
    },
    {
      title: 'Mobile & Web Development',
      skills: ['Swift', 'SwiftUI', 'HTML & CSS', 'JavaScript', 'Python', 'Next.js', 'React', 'TypeScript'],
      color: 'text-pink-400'
    },
    {
      title: 'Creative & Design',
      skills: ['Adobe Photoshop', 'Adobe Premiere Pro', 'Adobe Audition', 'Blender', 'Figma', 'Midjourney'],
      color: 'text-orange-400'
    },
    {
      title: 'Professional & Systems',
      skills: ['Project Management', 'Leadership', 'Consulting', 'Systems Design', 'Remote Teamwork', 'Audio Visual Systems'],
      color: 'text-cyan-400'
    }
  ];

  return (
    <section id="skills" className="py-20 bg-secondary/20">
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
              Skills
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
            <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
              A comprehensive overview of my technical expertise and professional capabilities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skillCategories.map((category, index) => (
              <div
                key={category.title}
                className="bg-background/50 p-6 rounded-lg border border-border hover:border-primary/50 transition-all duration-300"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <h3 className={`text-xl font-semibold mb-4 ${category.color}`}>
                  {category.title}
                </h3>
                <div className="space-y-2">
                  {category.skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center space-x-2"
                    >
                      <div className={`w-2 h-2 rounded-full ${category.color.replace('text-', 'bg-')}`} />
                      <span className="text-muted-foreground">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
