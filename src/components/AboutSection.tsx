'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AboutSection() {
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

    const element = document.getElementById('about');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <section id="about" className="py-20 bg-secondary/20">
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
              About Me
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Hi there, I&apos;m an AI Engineer specializing in building intelligent systems and immersive experiences. 
                My expertise spans from cutting-edge AI technologies like LangChain, CrewAI, and MCP (Model Context Protocol) to traditional 
                real-time graphics programming with Ventuz and Unreal Engine.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed">
                I have extensive experience integrating AI models into custom software, building AI agents, and developing MCP servers for 
                enhanced AI capabilities. Recently, I&apos;ve been focused on AI engineering, building personal AI agents like Ubuntu Home AI 
                that manage entire server environments, and creating MCP servers for gaming APIs like SpaceTraders.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed">
                My background in real-time graphics programming with major clients like Riot Games, NHL, Yale University, and the World Bank 
                has given me a unique perspective on combining AI with live production systems. With my diverse skillset spanning AI engineering, 
                real-time graphics, and software development, I&apos;m always striving to innovate and deliver cutting-edge solutions.
              </p>

              {/* Key Highlights */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-background/50 p-4 rounded-lg border border-border">
                  <h3 className="font-semibold text-primary mb-2">AI Engineering</h3>
                  <p className="text-sm text-muted-foreground">
                    Building intelligent agents and MCP servers for enhanced AI capabilities
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg border border-border">
                  <h3 className="font-semibold text-primary mb-2">Real-Time Graphics</h3>
                  <p className="text-sm text-muted-foreground">
                    Creating immersive experiences for major clients and live events
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg border border-border">
                  <h3 className="font-semibold text-primary mb-2">Full-Stack Development</h3>
                  <p className="text-sm text-muted-foreground">
                    End-to-end solutions from frontend to backend systems
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg border border-border">
                  <h3 className="font-semibold text-primary mb-2">Client Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    Working with Riot Games, NHL, Yale University, and World Bank
                  </p>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative w-full h-96 lg:h-[500px] rounded-lg overflow-hidden">
                <Image
                  src="/images/your-photo.webp"
                  alt="Your Name - AI Engineer"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/20 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
