
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Project } from '../types';

interface ProjectsProps {
  onProjectSelect: (project: Project) => void;
}

export const projectsData: Project[] = [
  {
    id: 'flownest',
    title: 'FlowNest Dashboard',
    category: 'UI/UX Design',
    image: '/images/work_1.png',
    description: 'A comprehensive analytics dashboard designed for SaaS businesses to track KPIs, revenue, and user growth in real-time. The goal was to simplify complex data visualization into an intuitive, actionable interface.',
    role: 'Lead Product Designer',
    year: '2023',
    client: 'FlowNest Inc.',
    gallery: [
        '/images/work_1.png',
        '/images/work_2.png',
        '/images/work_3.png',
        '/images/work_4.png',
        '/images/work_1.png',
        '/images/work_2.png'
    ]
  },
  {
    id: 'fit-track',
    title: 'FitPulse Mobile App',
    category: 'Mobile Application',
    image: '/images/work_2.png',
    description: 'A fitness tracking application focused on holistic health. Features include workout planning, meal tracking, and progress visualization. The dark mode UI was chosen to reduce eye strain during early morning or late night workouts.',
    role: 'UI Designer',
    year: '2024',
    client: 'FitPulse',
    gallery: [
        '/images/work_2.png',
        '/images/work_3.png',
        '/images/work_4.png',
        '/images/work_1.png',
        '/images/work_2.png',
        '/images/work_3.png'
    ]
  },
  {
    id: 'smart-home',
    title: 'Lumina Smart Home',
    category: 'IoT Interface',
    image: '/images/work_3.png',
    description: 'Control your entire home from a single app. This project involved creating a design system for IoT device controls, ensuring consistency across lighting, temperature, and security modules.',
    role: 'UX Researcher & Designer',
    year: '2022',
    client: 'Lumina Systems',
    gallery: [
        '/images/work_3.png',
        '/images/work_4.png',
        '/images/work_1.png',
        '/images/work_2.png',
        '/images/work_3.png',
        '/images/work_4.png'
    ]
  },
  {
    id: 'invest-pro',
    title: 'InvestPro Landing',
    category: 'Web Design',
    image: '/images/work_4.png',
    description: 'High-conversion landing page for a fintech startup. The design focuses on trust, clarity, and directing user attention to the primary call-to-action through strategic layout and typography.',
    role: 'Web Designer',
    year: '2023',
    client: 'InvestPro',
    gallery: [
        '/images/work_4.png',
        '/images/work_1.png',
        '/images/work_2.png',
        '/images/work_3.png',
        '/images/work_4.png',
        '/images/work_1.png'
    ]
  }
];

const Projects: React.FC<ProjectsProps> = ({ onProjectSelect }) => {
  return (
    <section id="projects" className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-6 md:px-16 max-w-[1400px]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-6">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-normal text-gray-900 tracking-tight"
          >
            Selected Works
          </motion.h2>
          
          <motion.a
             href="https://www.behance.net/shafiulnobel"
             target="_blank"
             rel="noopener noreferrer"
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="hidden md:block px-8 py-3 border border-gray-300 text-gray-900 font-medium hover:bg-black hover:text-white hover:border-black transition-all duration-300"
          >
            More Works
          </motion.a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {projectsData.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              index={index} 
              onClick={() => onProjectSelect(project)}
            />
          ))}
        </div>

        {/* Mobile Button - Show only on mobile */}
        <div className="mt-12 flex justify-center md:hidden">
            <motion.a
                href="https://www.behance.net/shafiulnobel"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="px-8 py-3 border border-gray-300 text-gray-900 font-medium hover:bg-black hover:text-white hover:border-black transition-all duration-300"
            >
                More Works
            </motion.a>
        </div>
      </div>
    </section>
  );
};

const ProjectCard: React.FC<{ project: Project; index: number; onClick: () => void }> = ({ project, index, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Motion values for parallax effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring physics for smooth movement
  const springConfig = { damping: 20, stiffness: 200 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  // Map mouse position to pixel offset (range -10px to 10px)
  const xMove = useTransform(xSpring, [-0.5, 0.5], ["-10px", "10px"]);
  const yMove = useTransform(ySpring, [-0.5, 0.5], ["-10px", "10px"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    // Disable parallax on small screens/touch via window width check for performance/simplicity in this handler
    if (window.innerWidth < 768) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate normalized position from center (-0.5 to 0.5)
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group cursor-pointer p-4 border-2 border-transparent hover:border-gray-200 hover:shadow-md transition-all duration-300"
      onClick={onClick}
    >
      {/* Image Container */}
      <div 
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden w-full aspect-[4/3] bg-gray-100 mb-6"
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 z-20 pointer-events-none" />
        
        {/* Parallax Wrapper */}
        <motion.div 
            style={{ x: xMove, y: yMove }}
            className="w-full h-full"
        >
            <img 
              src={project.image} 
              alt={project.title}
              // Base scale increased to 110% to ensure edges aren't visible when moving
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-115"
            />
        </motion.div>

        {/* Hover Button - Visible by default on mobile (opacity-100), Hidden on desktop (md:opacity-0) until hover (md:group-hover:opacity-100) */}
        <div className="absolute inset-0 flex items-center justify-center z-30 opacity-50 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center transform scale-90 md:scale-75 md:group-hover:scale-100 transition-transform duration-300 shadow-xl">
            <ArrowUpRight size={32} className="text-black" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex justify-between items-start px-1">
        <div>
           <h3 className="text-2xl font-medium text-gray-900 mb-2">{project.title}</h3>
           <p className="text-gray-500">{project.category}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Projects;
