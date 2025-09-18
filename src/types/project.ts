export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  startDate: string;
  endDate?: string;
  status: 'completed' | 'ongoing' | 'planned';
  technologies: string[];
  category: 'ai' | 'real-time-graphics' | 'web' | 'mobile' | 'other';
  client?: string;
  role: string;
  responsibilities: string[];
  impact?: string;
  images?: string[];
  videoUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFilter {
  category?: string;
  technology?: string;
  year?: number;
  status?: string;
  featured?: boolean;
}

export interface ProjectResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
}
