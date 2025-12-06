import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowRight, ArrowLeft, RotateCcw, Heart, MessageCircle } from 'lucide-react';
import { Project } from '../types';
import { projectService } from '../services/projectService';

interface ProjectsProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onProjectUpdate: (project: Project) => void;
}

const Projects: React.FC<ProjectsProps> = ({ projects, onProjectSelect, onProjectUpdate }) => {
  const [page, setPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(projects.length / itemsPerPage);

  const displayedProjects = projects.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const handleNext = () => {
    if (page < totalPages - 1) {
        setPage(page + 1);
    }
  };
  
  const handlePrev = () => {
     if (page > 0) {
        setPage(page - 1);
     }
  };

  const handleReset = () => {
      setPage(0);
  };

  const hasNext = page < totalPages - 1;
  const hasPrev = page > 0;

  return (
    <section id="projects" className="py-20 lg:py-32 bg-[#f7f7f7] overflow-hidden">
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
        </div>

        {/* Empty State */}
        {projects.length === 0 ? (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-200 rounded-none bg-gray-50/50"
            >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ArrowUpRight className="text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Projects Coming Soon</h3>
                <p className="text-gray-500 max-w-md">New case studies are currently being prepared. Check back later.</p>
            </motion.div>
        ) : (
            <>
                {/* Grid Container with Slide Animation */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={page}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 min-h-[500px]"
                    >
                        {displayedProjects.map((project, index) => (
                            <ProjectCard 
                                key={project.id} 
                                project={project} 
                                index={index} 
                                onClick={() => onProjectSelect(project)}
                                onProjectUpdate={onProjectUpdate}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Pagination Controls */}
                <div className="mt-16 flex justify-center gap-4">
                    {hasPrev && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={handlePrev}
                            className="px-8 py-4 bg-white border border-gray-200 text-gray-900 font-medium hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm flex items-center gap-2 rounded-full"
                        >
                            <ArrowLeft size={18} />
                            Previous
                        </motion.button>
                    )}

                    {hasNext ? (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={handleNext}
                            className="px-8 py-4 bg-white border border-gray-200 text-gray-900 font-medium hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm flex items-center gap-2 rounded-full"
                        >
                            Load More Works
                            <ArrowRight size={18} />
                        </motion.button>
                    ) : (
                        totalPages > 1 && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={handleReset}
                                className="px-8 py-4 bg-white border border-gray-200 text-gray-900 font-medium hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm flex items-center gap-2 rounded-full"
                            >
                                <RotateCcw size={18} />
                                Back to Start
                            </motion.button>
                        )
                    )}
                </div>
                
                {/* Pagination Indicator */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <div 
                                key={i} 
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === page ? 'bg-black w-4' : 'bg-gray-300'}`}
                            />
                        ))}
                    </div>
                )}
            </>
        )}
      </div>
    </section>
  );
};

interface ProjectCardProps { 
  project: Project; 
  index: number; 
  onClick: () => void;
  onProjectUpdate: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onClick, onProjectUpdate }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [likes, setLikes] = useState(project.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  
  // Check local storage for like status and sync props
  useEffect(() => {
    const liked = localStorage.getItem(`liked_${project.id}`);
    if (liked) setIsLiked(true);
    setLikes(project.likes || 0);
  }, [project.id, project.likes]);
  
  // Motion values for parallax effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring physics for smooth movement
  const springConfig = { damping: 20, stiffness: 200 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  // Map mouse position to pixel offset
  const xMove = useTransform(xSpring, [-0.5, 0.5], ["-10px", "10px"]);
  const yMove = useTransform(ySpring, [-0.5, 0.5], ["-10px", "10px"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    if (window.innerWidth < 768) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening project detail
    if (isLiked) return;

    const newLikes = (likes || 0) + 1;
    setIsLiked(true);
    setLikes(newLikes);
    localStorage.setItem(`liked_${project.id}`, 'true');

    // Update global state immediately for instant feedback across components
    onProjectUpdate({ ...project, likes: newLikes });

    try {
        await projectService.likeProject(project.id);
    } catch (error) {
        console.error("Failed to like project");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group cursor-pointer p-4 border border-transparent hover:border-gray-200 hover:bg-white rounded-none transition-all duration-300"
      onClick={onClick}
    >
      {/* Image Container */}
      <div 
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden w-full aspect-[4/3] bg-gray-100 mb-6 rounded-none"
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 z-20 pointer-events-none" />
        
        {/* Parallax Wrapper */}
        <motion.div 
            style={{ x: xMove, y: yMove }}
            className="w-full h-full"
        >
            <img 
              src={project.image} 
              alt={project.title}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-115 
                ${imgLoaded ? 'blur-0 opacity-100' : 'blur-xl opacity-0'}
              `}
              loading="lazy"
              decoding="async"
            />
        </motion.div>

        {/* Hover Button */}
        <div className="absolute inset-0 flex items-center justify-center z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center transform scale-90 md:scale-75 md:group-hover:scale-100 transition-transform duration-300 shadow-xl">
            <ArrowUpRight size={32} className="text-black" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex justify-between items-start px-2">
        <div>
           <h3 className="text-2xl font-medium text-gray-900 mb-2">{project.title}</h3>
           <p className="text-gray-500">{project.category}</p>
        </div>

        {/* Interaction Stats */}
        <div className="flex items-center gap-4">
             <button 
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
             >
                 <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                 <span>{likes}</span>
             </button>
             <div className="flex items-center gap-1.5 text-sm font-medium text-gray-400">
                 <MessageCircle size={18} />
                 <span>{project.comments?.length || 0}</span>
             </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Projects;