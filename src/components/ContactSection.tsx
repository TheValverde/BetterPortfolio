'use client';

import { useEffect, useState } from 'react';

export default function ContactSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('contact');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(data.message);
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/yourprofile/',
      icon: '💼'
    },
    {
      name: 'GitHub',
      url: 'https://github.com/yourusername',
      icon: '💻'
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/yourhandle',
      icon: '🐦'
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@yourchannel',
      icon: '📺'
    }
  ];

  return (
    <section id="contact" className="py-20">
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
              Get In Touch
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
            <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
              Ready to collaborate on your next AI or real-time graphics project? Let&apos;s talk!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-secondary/20 p-8 rounded-lg border border-border">
              <h3 className="text-2xl font-semibold text-foreground mb-6">
                Send me a message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                    placeholder="Tell me about your project..."
                    required
                  />
                </div>
                {/* Status Message */}
                {submitMessage && (
                  <div
                    className={`p-4 rounded-lg ${
                      submitStatus === 'success'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-6">
                  Let&apos;s connect
                </h3>
                <p className="text-lg text-muted-foreground mb-8">
                  I&apos;m always interested in discussing new opportunities, AI projects, 
                  or just having a chat about technology and innovation.
                </p>
              </div>

              {/* Email */}
              <div className="bg-background/50 p-6 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">Email</h4>
                <a
                  href={`mailto:${process.env.SMTP_FROM || 'contact@example.com'}`}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  {process.env.SMTP_FROM || 'contact@example.com'}
                </a>
              </div>

              {/* Social Links */}
              <div className="bg-background/50 p-6 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-4">Follow me</h4>
                <div className="grid grid-cols-2 gap-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <span className="text-2xl">{link.icon}</span>
                      <span className="text-foreground">{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-6 rounded-lg border border-primary/30">
                <h4 className="font-semibold text-foreground mb-2">Availability</h4>
                <p className="text-muted-foreground">
                  Currently available for AI engineering projects, MCP server development, 
                  and consulting opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
