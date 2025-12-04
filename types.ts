export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export interface PortfolioData {
  name: string;
  role: string;
  experienceYears: number;
  projectsCompleted: number;
  bio: string;
  skills: string[];
}

export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  role?: string;
  year?: string;
  client?: string;
  gallery?: string[];
}