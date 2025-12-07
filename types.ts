
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

export interface Comment {
  id?: string;
  _id?: string;
  author: string;
  text: string;
  createdAt: string;
  read?: boolean;
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
  likes?: number;
  comments?: Comment[];
}

export interface ClientLogo {
  id?: string;
  _id?: string;
  name: string;
  url: string;
}

export interface ProfileData {
  _id?: string;
  name: string;
  role: string;
  homeLogo: string;
  heroImage: string;
  totalProjects: string;
  yearsExperience: string;
  resumeUrl: string;
  bio: string;
  aboutImage1: string;
  aboutImage2: string;
  statsValue: string;
  statsLabel: string;
  feature1: string;
  feature2: string;
  socialLinkedin: string;
  socialBehance: string;
  socialInstagram: string;
  email: string;
  copyrightYear: string;
}

export interface ContactMessage {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

export interface ChatLog {
  _id?: string;
  role: 'user' | 'model';
  text: string;
  createdAt: string;
  read?: boolean;
}