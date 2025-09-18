'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className={`transition-all duration-1000 ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-foreground">Your</span>{' '}
            <span className="text-primary">Name</span>
          </h1>

          {/* Subtitle */}
          <div className="text-xl sm:text-2xl lg:text-3xl mb-8 text-muted-foreground">
            <span className="block">AI Engineer &</span>
            <span className="block text-primary">Real-Time Graphics Developer</span>
          </div>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Building the future of AI with cutting-edge agents, MCP servers, and immersive experiences. 
            From Riot Games to NHL, creating intelligent systems that push the boundaries of what&apos;s possible.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="#projects"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View My Work
            </Link>
            <Link
              href="#contact"
              className="border-2 border-primary text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-105"
            >
              Get In Touch
            </Link>
          </div>

          {/* Tech Stack Preview */}
          <div className="mt-16">
            <p className="text-sm text-muted-foreground mb-4">Powered by</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {[
                'Next.js',
                'TypeScript',
                'AI Agents',
                'MCP Servers',
                'React',
                'Tailwind CSS',
                'Docker',
                'Python',
              ].map((tech) => (
                <span
                  key={tech}
                  className="bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-full border border-border/50"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
