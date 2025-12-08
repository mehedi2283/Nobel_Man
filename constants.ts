import { PortfolioData, Project, ProfileData } from './types';

export const PORTFOLIO_DATA: PortfolioData = {
  name: "Nobel",
  role: "UX & UI Designer",
  experienceYears: 2,
  projectsCompleted: 20,
  bio: "I am a passionate UX & UI Designer focused on creating intuitive and aesthetically pleasing digital experiences. With over 2 years of experience and 20+ completed projects, I bridge the gap between user needs and business goals.",
  skills: ["Figma", "Adobe XD", "Prototyping", "User Research", "Wireframing", "React Basic", "Tailwind CSS"]
};

// Empty initial projects to allow manual entry from Admin Dashboard
export const INITIAL_PROJECTS: Project[] = [];

// Full Frontend Backup Data
export const DEFAULT_PROFILE_DATA: ProfileData = {
  name: "Nobel",
  role: "UX & UI Designer",
  homeLogo: "https://i.ibb.co.com/YFQCpFXL/logo-N.png",
  heroImage: "https://i.ibb.co.com/3mGN2F24/Hero-img-Color.png",
  totalProjects: "20",
  yearsExperience: "02",
  resumeUrl: "https://drive.google.com/file/d/1ivQuzujkx1Lwx9XemVSNty7jrtiX6FEZ/view?usp=sharing",
  bio: "I'm a UX/UI Designer with a strong foundation in user-centered design and hands-on experience working on real client projects. I focus on understanding user needs, simplifying complex flows, and turning ideas into clean, usable digital experiences.",
  aboutImage1: "https://i.ibb.co.com/Lhxhd0d1/About-img1-Color.png",
  aboutImage2: "https://i.ibb.co.com/fYVJGXKM/About-img2-Color.png",
  statsValue: "100",
  statsLabel: "User-focused screens created from wireframes to polished UI.",
  feature1: "Agency & startup experience working on UX research, wireframes, UI design, and usability improvements for real client projects.",
  feature2: "Strong UX fundamentals - user research, pain-point analysis, information architecture, and usability testing.",
  socialLinkedin: "https://www.linkedin.com/in/shafiul-",
  socialBehance: "https://www.behance.net/shafiulnob",
  socialInstagram: "https://www.instagram.com/shafiul_",
  email: "shafiulislamnobel1@gmail.com",
  copyrightYear: "2024",
  showTreatModal: false,
  treatTitle: "Treat Pending!",
  treatImageTitle: "Kacchi Biryani",
  treatMessage: "Need treat ASAP! Don't keep the hunger waiting.",
  treatImage: "https://i.ibb.co/fGSfy2RF/Kacchi-Biryani-Mutton-large.webp",
  treatButtonText: "Okay, I'll Treat You!",
  treatInterval: 5,
  treatMaxShowCount: 3
};;

export const AI_SYSTEM_INSTRUCTION = `
You are an AI assistant for a portfolio website of a UX/UI Designer named "${PORTFOLIO_DATA.name}".
Your goal is to answer visitor questions about Nobel professionally, briefly, and enthusiastically.

Key Info:
- Role: ${PORTFOLIO_DATA.role}
- Experience: ${PORTFOLIO_DATA.experienceYears}+ Years
- Projects: ${PORTFOLIO_DATA.projectsCompleted}+ Completed
- Skills: ${PORTFOLIO_DATA.skills.join(', ')}
- Bio: ${PORTFOLIO_DATA.bio}

Tone: Professional, modern, creative, and helpful.
Constraint: Keep answers under 80 words. If asked about contact info, suggest looking at the 'Contact' section (which you can say is usually at the bottom or via email at hello@nobel.design).
`;