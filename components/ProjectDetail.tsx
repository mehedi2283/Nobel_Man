import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, Send, User, Loader2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project, Comment } from '../types';
import Footer from './Footer';
import Contact from './Contact';
import { projectService } from '../services/projectService';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onProjectUpdate: (project: Project) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project: initialProject, onBack, onProjectUpdate }) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [likes, setLikes] = useState(initialProject.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [mainImgLoaded, setMainImgLoaded] = useState(false);
  
  // Comment State
  const [comments, setComments] = useState<Comment[]>(initialProject.comments || []);
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Comments Carousel State
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Gallery Carousel State
  const galleryScrollRef = useRef<HTMLDivElement>(null);

  // Sync state if prop changes (e.g. from parent update)
  useEffect(() => {
    setProject(initialProject);
    setLikes(initialProject.likes || 0);
    setComments(initialProject.comments || []);
  }, [initialProject]);

  // Check local storage for like status
  useEffect(() => {
    const liked = localStorage.getItem(`liked_${project.id}`);
    if (liked) setIsLiked(true);
  }, [project.id]);

  // Infinite Scroll Animation Effect (Comments only)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || comments.length === 0) return;

    let animationFrameId: number;
    
    const animate = () => {
        if (!isDragging && !isHovering) {
            container.scrollLeft += 1;
            if (container.scrollLeft >= (container.scrollWidth / 2)) {
                container.scrollLeft = 0;
            }
        }
        animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDragging, isHovering, comments.length]);

  // Infinite Gallery: Center Initialization
  useEffect(() => {
     // Wait for render/layout
     const timer = setTimeout(() => {
         if (galleryScrollRef.current) {
             const container = galleryScrollRef.current;
             // We have 4 sets of images.
             // We want to start in the middle (start of Set 3, which is 50% scrollWidth)
             const halfWidth = container.scrollWidth / 2;
             container.scrollLeft = halfWidth;
         }
     }, 300); // Small delay to ensure images occupy space
     return () => clearTimeout(timer);
  }, [project.gallery]);

  const handleLike = async () => {
    if (isLiked) return;

    const newLikes = (likes || 0) + 1;
    setIsLiked(true);
    setLikes(newLikes);
    localStorage.setItem(`liked_${project.id}`, 'true');
    
    const updatedProject = { ...project, likes: newLikes };
    setProject(updatedProject);
    onProjectUpdate(updatedProject); // Update global state

    try {
        await projectService.likeProject(project.id);
    } catch (error) {
        console.error("Failed to like project");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentAuthor.trim() || !newCommentText.trim()) return;

    setSubmitStatus('loading');
    
    // Optimistic Update
    const tempComment: Comment = {
        id: Date.now().toString(),
        author: newCommentAuthor,
        text: newCommentText,
        createdAt: new Date().toISOString()
    };
    
    // Append to list (we reverse it in render)
    const newComments = [...comments, tempComment];
    
    try {
        const updatedProjectServer = await projectService.addComment(project.id, {
            author: tempComment.author,
            text: tempComment.text
        });
        
        // Success
        setComments(updatedProjectServer.comments || newComments);
        setProject(updatedProjectServer);
        onProjectUpdate(updatedProjectServer);
        
        setNewCommentAuthor('');
        setNewCommentText('');
        setSubmitStatus('success');
        
        // Reset status after delay
        setTimeout(() => setSubmitStatus('idle'), 3000);
        
    } catch (error) {
        console.error("Failed to post comment", error);
        alert("Failed to post comment. Please try again.");
        setSubmitStatus('idle');
    }
  };

  const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // -- Comments Drag Handlers --
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovering(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // -- Gallery Navigation Handlers --
  const scrollGallery = (direction: 'left' | 'right') => {
    if (!galleryScrollRef.current) return;
    const container = galleryScrollRef.current;
    
    // Width of one "Set" (we have 4 sets total)
    // We approximate this as 1/4 of scrollWidth
    const totalWidth = container.scrollWidth;
    const oneSetWidth = totalWidth / 4;
    
    const scrollAmount = 300; // Pixel amount to scroll per click
    
    if (direction === 'left') {
        // If we are getting too close to the start (Left Edge), jump forward to Set 3
        // "Too close" means we are inside Set 1
        if (container.scrollLeft <= oneSetWidth) {
            // Jump instantly to Set 3 (add 2 sets worth of width)
            container.scrollLeft += (oneSetWidth * 2);
        }
        // Then scroll left
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        // If we are getting too close to the end (Right Edge), jump backward to Set 1
        // "Too close" means we are inside Set 4
        // Check if current position + view width is deep into the last set
        if (container.scrollLeft >= (oneSetWidth * 3)) {
             // Jump instantly to Set 2 (subtract 2 sets worth of width)
             container.scrollLeft -= (oneSetWidth * 2);
        }
        // Then scroll right
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Passive loop check for drag/momentum scrolling
  const handleGalleryScroll = () => {
    if (!galleryScrollRef.current) return;
    const container = galleryScrollRef.current;
    const totalWidth = container.scrollWidth;
    const oneSetWidth = totalWidth / 4;

    // We only reset if we hit the EXTREME edges to avoid fighting with smooth scroll animation.
    // Allow the buffer to work.
    
    // If we hit exactly 0, wrap to middle
    if (container.scrollLeft <= 5) {
        container.scrollLeft = oneSetWidth * 2;
    }
    // If we hit the end, wrap to middle
    else if (container.scrollLeft >= totalWidth - container.clientWidth - 5) {
        container.scrollLeft = oneSetWidth * 2;
    }
  };

  // Prepare display comments (reversed)
  const displayComments = comments.slice().reverse();
  
  // Prepare display gallery (Duplicated 4 times to ensure infinite loop on wide screens)
  const displayGallery = project.gallery && project.gallery.length > 0 
    ? [...project.gallery, ...project.gallery, ...project.gallery, ...project.gallery] 
    : [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      {/* Navigation */}
      <div className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 md:px-16 py-6 flex justify-between items-center">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Projects
            </button>
            
            {/* Header Interaction Stats */}
             <div className="flex items-center gap-6">
                <button 
                    onClick={handleLike}
                    disabled={isLiked}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                        isLiked 
                        ? 'bg-red-50 border-red-200 text-red-500' 
                        : 'bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500'
                    }`}
                >
                    <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                    <span className="font-medium">{likes}</span>
                </button>
            </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 md:px-16 pt-12">
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <span className="text-gray-500 font-medium tracking-wide uppercase text-sm mb-4 block">{project.category}</span>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-12">{project.title}</h1>
        </motion.div>

        <motion.div
             initial={{ scale: 0.98, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="w-full aspect-video bg-gray-100 rounded-none overflow-hidden mb-16 group shadow-sm"
        >
            <img 
                src={project.image} 
                alt={project.title}
                onLoad={() => setMainImgLoaded(true)}
                className={`w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 
                  ${mainImgLoaded ? 'blur-0 opacity-100' : 'blur-xl opacity-0'}
                `}
                loading="lazy"
                decoding="async"
            />
        </motion.div>

        {/* Project Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-24">
            <div className="lg:col-span-4 space-y-8">
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Role</h3>
                    <p className="text-gray-600">{project.role || 'Designer'}</p>
                </div>
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Client</h3>
                    <p className="text-gray-600">{project.client || 'Confidential'}</p>
                </div>
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Year</h3>
                    <p className="text-gray-600">{project.year || '2023'}</p>
                </div>
            </div>

            <div className="lg:col-span-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">About the project</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    {project.description}
                </p>
            </div>
        </div>

        {/* Gallery Section */}
        {displayGallery.length > 0 && (
          <div className="pb-24">
             <div className="flex justify-between items-end mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Project Gallery</h2>
                {/* Desktop Arrows */}
                <div className="hidden md:flex gap-2">
                    <button 
                        onClick={() => scrollGallery('left')}
                        className="p-3 rounded-full border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all active:scale-95"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={() => scrollGallery('right')}
                        className="p-3 rounded-full border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all active:scale-95"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
             </div>
             
             <div className="relative group">
                 {/* Fade Gradients - reduced z-index to not block scroll on edges if needed */}
                 <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                 <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                 
                 {/* Mobile Arrows (Overlay) */}
                 <button 
                    onClick={() => scrollGallery('left')}
                    className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center border border-gray-100"
                 >
                    <ChevronLeft size={20} />
                 </button>
                 <button 
                    onClick={() => scrollGallery('right')}
                    className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center border border-gray-100"
                 >
                    <ChevronRight size={20} />
                 </button>

                 <div 
                    ref={galleryScrollRef}
                    className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-6 md:px-0 -mx-6 md:mx-0 select-none items-center"
                    onScroll={handleGalleryScroll}
                 >
                    {displayGallery.map((img, idx) => (
                        // Fixed height for carousel items: h-44 (176px).
                        // min-w-[200px] ensures decent size on mobile.
                        // On desktop, natural aspect ratio determines width.
                        <div key={`${img}-${idx}`} className="h-44 md:h-48 flex-shrink-0 relative">
                            <GalleryImage src={img} title={project.title} index={idx} />
                        </div>
                    ))}
                 </div>
             </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="pb-32">
            <div className="border-t border-gray-200 pt-16">
                
                <div className="max-w-4xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        Comments <span className="text-gray-400 text-xl font-normal">({comments.length})</span>
                    </h2>
                    
                    {/* Comment Form - SHARP RADIUS */}
                    <div className="bg-gray-50 p-6 md:p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Leave your thought</h3>
                        <form onSubmit={handleCommentSubmit} className="space-y-4">
                            <div>
                                <input 
                                    type="text" 
                                    placeholder="Your Name" 
                                    value={newCommentAuthor}
                                    onChange={(e) => setNewCommentAuthor(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all rounded-none"
                                    required
                                />
                            </div>
                            <div>
                                <textarea 
                                    placeholder="What do you think about this project?" 
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none rounded-none"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <motion.button 
                                    type="submit" 
                                    disabled={submitStatus === 'loading'}
                                    className="bg-black text-white h-14 px-8 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 disabled:opacity-100 group rounded-none min-w-[180px]"
                                    layout
                                >
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {submitStatus === 'idle' && (
                                            <motion.div
                                                key="idle"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex items-center gap-3"
                                            >
                                                <span>Post Comment</span>
                                                <Send size={16} className="group-hover:translate-x-1 transition-transform"/>
                                            </motion.div>
                                        )}
                                        {submitStatus === 'loading' && (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex items-center gap-2"
                                            >
                                                <span>Posted</span>
                                                <Check size={18} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Comments Carousel */}
                <div className="w-full relative group">
                    {comments.length === 0 ? (
                        <p className="text-gray-500 text-center italic py-4">No comments yet. Be the first to share your thoughts!</p>
                    ) : (
                        <>
                            {/* Fade Gradients */}
                            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                            <div 
                                ref={scrollContainerRef}
                                className={`flex overflow-x-auto gap-6 pb-8 scrollbar-hide px-6 md:px-0 -mx-6 md:mx-0 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                onMouseDown={handleMouseDown}
                                onMouseLeave={handleMouseLeave}
                                onMouseUp={handleMouseUp}
                                onMouseMove={handleMouseMove}
                                onMouseEnter={() => setIsHovering(true)}
                                onTouchStart={() => setIsHovering(true)}
                                onTouchEnd={() => setTimeout(() => setIsHovering(false), 1000)}
                            >
                                {/* Duplicated Content for Infinite Loop */}
                                {[...displayComments, ...displayComments].map((comment, index) => (
                                    <motion.div 
                                        key={`${comment.id}-${index}`} 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4 }}
                                        className="min-w-[300px] max-w-[300px] md:min-w-[350px] md:max-w-[350px] bg-white border border-gray-200 p-6 shadow-sm flex flex-col flex-shrink-0 rounded-none"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            {/* Updated Avatar Style to Match Dashboard - ROUNDED */}
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                                                {comment.author ? comment.author.charAt(0).toUpperCase() : <User size={18} />}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-gray-900 text-sm truncate">{comment.author}</h4>
                                                <span className="text-xs text-gray-400 block">{formatDate(comment.createdAt)}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed overflow-y-auto max-h-[120px] scrollbar-hide pointer-events-auto">
                                            {comment.text}
                                        </p>
                                    </motion.div>
                                ))}
                                {/* Spacer for right padding in carousel */}
                                <div className="w-1 flex-shrink-0" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>

      </div>
      
      <Contact />
      <Footer />
    </motion.div>
  );
};

// Sub-component for individual gallery images to handle own loading state
const GalleryImage = ({ src, title, index }: { src: string, title: string, index: number }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="h-full w-auto bg-gray-50 overflow-hidden group rounded-none border border-gray-100 relative"
        >
             {/* Use h-full and w-auto to let height dictate width (aspect ratio preserved) */}
            <img 
                src={src} 
                alt={`${title} gallery ${index + 1}`} 
                onLoad={() => setIsLoaded(true)}
                className={`h-full w-auto object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105
                   ${isLoaded ? 'blur-0 opacity-100' : 'blur-xl opacity-0'}
                `}
                loading="lazy"
                decoding="async"
            />
        </motion.div>
    );
};

export default ProjectDetail;