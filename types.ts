
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
  order?: number; 
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
  aboutImage3?: string;
  statsValue: string;
  statsLabel: string;
  feature1: string;
  feature2: string;
  socialLinkedin: string;
  socialBehance: string;
  socialInstagram: string;
  email: string;
  copyrightYear: string;
  showTreatModal?: boolean;

  // Dynamic Treat Modal Configuration
  treatTitle?: string;
   treatImageTitle?: string;
  treatMessage?: string;
  treatImage?: string;
  treatButtonText?: string;
  treatInterval?: number; // Seconds
  treatMaxShowCount?: number; // How many times to show per session
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