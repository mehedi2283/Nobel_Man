import { PortfolioData, Project } from './types';

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