import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, Variants, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Send, Loader2, ArrowUpRight, ArrowDown, ChevronLeft, ChevronRight, MessageSquare, ZoomIn, X, Quote, ArrowRight } from 'lucide-react';
import { Project, Comment } from '../types';
import Footer from './Footer';
import Contact from './Contact';
import { projectService } from '../services/projectService';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onViewAll?: () => void;
  onProjectUpdate: (project: Project) => void;
}

// Utility for wrapping slider indices
const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project: initialProject, onBack, onViewAll, onProjectUpdate }) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [likes, setLikes] = useState(initialProject.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  
  // Comment State
  const [comments, setComments] = useState<Comment[]>(initialProject.comments || []);
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Slider States
  const [[galleryPage, galleryDirection], setGalleryPage] = useState([0, 0]);
  const [[commentPage, commentDirection], setCommentPage] = useState([0, 0]);
  
  // Auto-play Control States
  const [galleryAutoPlay, setGalleryAutoPlay] = useState(true);
  const [commentAutoPlay, setCommentAutoPlay] = useState(true);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Sync state
  useEffect(() => {
    setProject(initialProject);
    setLikes(initialProject.likes || 0);
    setComments(initialProject.comments || []);
  }, [initialProject]);

  useEffect(() => {
    const liked = localStorage.getItem(`liked_${project.id}`);
    if (liked) setIsLiked(true);
  }, [project.id]);

  // Lightbox Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') handleNextImageLightbox();
      if (e.key === 'ArrowLeft') handlePrevImageLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, project.gallery]);

  // Lock Body Scroll when Lightbox is Open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxIndex]);

  const handleLike = async () => {
    if (isLiked) return;

    const newLikes = (likes || 0) + 1;
    setIsLiked(true);
    setLikes(newLikes);
    localStorage.setItem(`liked_${project.id}`, 'true');
    
    const updatedProject = { ...project, likes: newLikes };
    setProject(updatedProject);
    onProjectUpdate(updatedProject);

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
    
    const tempComment: Comment = {
        id: Date.now().toString(),
        author: newCommentAuthor,
        text: newCommentText,
        createdAt: new Date().toISOString()
    };
    
    const newComments = [...comments, tempComment];
    
    try {
        const updatedProjectServer = await projectService.addComment(project.id, {
            author: tempComment.author,
            text: tempComment.text
        });
        
        setComments(updatedProjectServer.comments || newComments);
        setProject(updatedProjectServer);
        onProjectUpdate(updatedProjectServer);
        
        setNewCommentAuthor('');
        setNewCommentText('');
        setSubmitStatus('success');
        
        // Move slider to the new comment (which is last)
        setCommentPage([newComments.length - 1, 1]);

        setTimeout(() => setSubmitStatus('idle'), 3000);
        
    } catch (error) {
        console.error("Failed to post comment", error);
        setSubmitStatus('idle');
    }
  };

  const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // --- Gallery Slider Logic ---
  const galleryIndex = wrap(0, project.gallery?.length || 0, galleryPage);

  const paginateGallery = (newDirection: number) => {
    setGalleryPage([galleryPage + newDirection, newDirection]);
  };

  // Gallery Auto-play Effect
  useEffect(() => {
    if (!project.gallery || project.gallery.length <= 1 || !galleryAutoPlay) return;

    const interval = setInterval(() => {
        setGalleryPage(([prev]) => [prev + 1, 1]);
    }, 3000);

    return () => clearInterval(interval);
  }, [project.gallery, galleryAutoPlay, galleryPage]);

  // --- Comment Slider Logic ---
  const sortedComments = comments.slice().reverse(); // Newest first
  const commentIndex = wrap(0, sortedComments.length, commentPage);

  const paginateComments = (newDirection: number) => {
    setCommentPage([commentPage + newDirection, newDirection]);
  };

  // Comment Auto-play Effect
  useEffect(() => {
    if (sortedComments.length <= 1 || !commentAutoPlay) return;

    const interval = setInterval(() => {
        setCommentPage(([prev]) => [prev + 1, 1]);
    }, 4500);

    return () => clearInterval(interval);
  }, [sortedComments.length, commentAutoPlay, commentPage]);

  // --- Lightbox Logic ---
  const handleNextImageLightbox = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && project.gallery) {
        setLightboxIndex((prev) => (prev! + 1) % project.gallery!.length);
    }
  };

  const handlePrevImageLightbox = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && project.gallery) {
        setLightboxIndex((prev) => (prev! - 1 + project.gallery!.length) % project.gallery!.length);
    }
  };

  // --- Animation Variants ---
  const sliderVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 30 : -30,
      opacity: 0,
    })
  };

  // Text specific variants for the quote
  const textSliderVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
      filter: 'blur(8px)'
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)'
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 40 : -40,
      opacity: 0,
      filter: 'blur(8px)'
    })
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white min-h-screen"
    >
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* --- LEFT PANEL (Sticky Context) --- */}
        <div className="lg:w-[40%] lg:h-screen lg:sticky lg:top-0 bg-[#0a0a0a] text-white flex flex-col justify-between p-8 md:p-12 lg:p-16 relative overflow-hidden z-20">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Navigation */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10"
            >
                <button 
                    onClick={onBack}
                    className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                >
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="text-sm font-medium tracking-wide uppercase">Back to Projects</span>
                </button>
            </motion.div>

            {/* Main Title Block */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 mt-12 lg:mt-0"
            >
                <motion.div variants={itemVariants} className="mb-6 flex items-center gap-3">
                     <span className="px-3 py-1 rounded-full border border-white/20 text-xs font-medium uppercase tracking-wider text-gray-300">
                        {project.category}
                     </span>
                     <span className="h-px w-8 bg-white/20" />
                     <span className="text-gray-400 text-xs font-mono">{project.year || '2024'}</span>
                </motion.div>

                <motion.h1 
                    variants={itemVariants}
                    className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium leading-[0.95] tracking-tight mb-8 lg:mb-12"
                >
                    {project.title}
                </motion.h1>

                {/* Metadata Grid */}
                <motion.div 
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-y-6 gap-x-4 border-t border-white/10 pt-8"
                >
                    <div>
                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Role</h3>
                        <p className="text-base font-light text-gray-200">{project.role || 'UX/UI Design'}</p>
                    </div>
                    <div>
                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Client</h3>
                        <p className="text-base font-light text-gray-200">{project.client || 'Confidential'}</p>
                    </div>
                    <div className="col-span-2">
                         <div className="flex items-center gap-4 mt-2">
                             <button 
                                 onClick={handleLike}
                                 disabled={isLiked}
                                 className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
                                     isLiked 
                                     ? 'bg-red-500/20 border-red-500/50 text-red-500' 
                                     : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white hover:text-black'
                                 }`}
                             >
                                <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                                <span className="text-sm font-medium">{likes} Likes</span>
                             </button>
                             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300">
                                <MessageSquare size={16} />
                                <span className="text-sm font-medium">{comments.length} Comments</span>
                             </div>
                         </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Bottom Decor */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="hidden lg:block relative z-10"
            >
                <div className="flex items-center gap-2 text-white/20">
                    <ArrowDown size={16} className="animate-bounce" />
                    <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
                </div>
            </motion.div>
        </div>

        {/* --- RIGHT PANEL (Scrollable Content) --- */}
        <div className="lg:w-[60%] bg-white pb-24 lg:pb-0">
            
            {/* Hero Image */}
            <div className="cursor-zoom-in" onClick={() => setLightboxIndex(0)}>
                <ParallaxImage src={project.image} alt={project.title} />
            </div>

            <div className="px-6 py-12 md:p-16 lg:p-20 space-y-16 lg:space-y-24">
                
                {/* Description */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">The Challenge</h2>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-light">
                        {project.description}
                    </p>
                </motion.div>

                {/* --- GALLERY SLIDER --- */}
                {project.gallery && project.gallery.length > 0 && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                             <h2 className="text-xl font-bold text-gray-900">Project Gallery</h2>
                             <div className="flex items-center gap-2 text-xs text-gray-400">
                                 <ZoomIn size={14} />
                                 <span>Tap to expand</span>
                             </div>
                        </div>
                        
                        <div 
                            className="relative group bg-gray-50 rounded-2xl overflow-hidden aspect-[16/10]"
                            onMouseEnter={() => setGalleryAutoPlay(false)}
                            onMouseLeave={() => setGalleryAutoPlay(true)}
                        >
                            <AnimatePresence initial={false} custom={galleryDirection} mode="popLayout">
                                <motion.div
                                    key={galleryPage}
                                    custom={galleryDirection}
                                    variants={{
                                        enter: (direction: number) => ({
                                          x: direction > 0 ? '100%' : '-100%',
                                          opacity: 0,
                                        }),
                                        center: {
                                          zIndex: 1,
                                          x: 0,
                                          opacity: 1,
                                        },
                                        exit: (direction: number) => ({
                                          zIndex: 0,
                                          x: direction < 0 ? '100%' : '-100%',
                                          opacity: 0,
                                        })
                                    }}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.2 }
                                    }}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={1}
                                    onDragEnd={(e, { offset, velocity }) => {
                                        const swipe = swipePower(offset.x, velocity.x);
                                        if (swipe < -swipeConfidenceThreshold) {
                                            paginateGallery(1);
                                        } else if (swipe > swipeConfidenceThreshold) {
                                            paginateGallery(-1);
                                        }
                                    }}
                                    className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full"
                                    onClick={() => setLightboxIndex(galleryIndex)}
                                >
                                    <img 
                                        src={project.gallery[galleryIndex]} 
                                        alt="Gallery Slide" 
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </motion.div>
                            </AnimatePresence>
                            
                            {/* Navigation Arrows */}
                            {project.gallery.length > 1 && (
                                <>
                                    <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10" onClick={() => paginateGallery(-1)}>
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10" onClick={() => paginateGallery(1)}>
                                        <ChevronRight size={20} />
                                    </button>

                                    {/* Dots */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                        {project.gallery.map((_, idx) => (
                                            <div 
                                                key={idx}
                                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === galleryIndex ? 'bg-white w-4' : 'bg-white/50'}`} 
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* --- COMMENTS SECTION --- */}
                <div className="border-t border-gray-100 pt-10 md:pt-16">
                    <div className="flex items-center gap-3 mb-8 md:mb-12">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Community Feedback</h2>
                    </div>
                    
                    {/* Modern Sharp Form */}
                    <div className="w-full max-w-3xl mx-auto mb-20">
                        <form onSubmit={handleCommentSubmit} className="bg-white border border-gray-200 p-8 md:p-12 relative group/form">
                            
                            {/* Hover Effect Border */}
                            <div className="absolute inset-0 border border-black scale-[0.98] opacity-0 group-hover/form:scale-100 group-hover/form:opacity-100 transition-all duration-500 pointer-events-none" />

                            <div className="relative z-10 space-y-12">
                                
                                <div className="relative z-0 w-full group">
                                    <input 
                                        type="text" 
                                        value={newCommentAuthor}
                                        onChange={(e) => setNewCommentAuthor(e.target.value)}
                                        className="block py-4 px-0 w-full text-xl text-gray-900 bg-transparent border-0 border-b border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-black peer rounded-none transition-colors" 
                                        placeholder=" " 
                                    />
                                    <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 uppercase tracking-widest">
                                        Your Name
                                    </label>
                                </div>

                                <div className="relative z-0 w-full group">
                                    <textarea 
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        rows={1}
                                        className="block py-4 px-0 w-full text-xl text-gray-900 bg-transparent border-0 border-b border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-black peer rounded-none resize-none min-h-[60px] transition-colors" 
                                        placeholder=" " 
                                    />
                                    <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 uppercase tracking-widest">
                                        Your Thoughts
                                    </label>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={submitStatus === 'loading' || !newCommentAuthor || !newCommentText}
                                        className="group/btn relative px-10 py-4 bg-black text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="absolute inset-0 bg-gray-800 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                                        <div className="relative flex items-center gap-4">
                                            <span className="text-xs font-bold uppercase tracking-[0.2em]">Post Comment</span>
                                            {submitStatus === 'loading' ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Send size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
                                            )}
                                        </div>
                                    </button>
                                </div>

                            </div>
                        </form>
                    </div>

                    {/* Testimonial Style Slider */}
                    {sortedComments.length > 0 ? (
                         <div 
                            className="relative"
                            onMouseEnter={() => setCommentAutoPlay(false)}
                            onMouseLeave={() => setCommentAutoPlay(true)}
                         >
                            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                {/* Avatar & Meta Column - Static Layout */}
                                <div className="shrink-0 flex md:flex-col items-center gap-4 md:w-32">
                                    
                                    {/* Avatar - Content Animates Inside */}
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-white to-gray-100 border border-gray-200 shadow-md flex items-center justify-center text-2xl font-bold text-gray-900 relative overflow-hidden">
                                        <AnimatePresence mode="popLayout" custom={commentDirection}>
                                            <motion.div
                                                key={commentPage}
                                                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.5, y: -10 }}
                                                transition={{ duration: 0.4, ease: "backOut" }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                {sortedComments[commentIndex].author.charAt(0).toUpperCase()}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                    
                                    {/* Metadata - Slides Vertically Inside */}
                                    <div className="text-left md:text-center relative w-32 h-10">
                                        <AnimatePresence mode="popLayout" custom={commentDirection}>
                                            <motion.div
                                                key={commentPage}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.4, ease: "easeOut" }}
                                                className="absolute inset-0 flex flex-col items-center justify-center w-full"
                                            >
                                                <div className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1 truncate w-full text-center">
                                                    {sortedComments[commentIndex].author}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-mono">
                                                    {formatDate(sortedComments[commentIndex].createdAt)}
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Quote Content - Text Slides Horizontally */}
                                <div className="flex-1 relative pl-6 md:pl-12 border-l-2 border-gray-100 py-2 min-h-[120px] flex items-center overflow-hidden">
                                    <Quote size={64} className="absolute -top-6 -left-4 text-gray-100/50 -z-10 transform -scale-x-100" />
                                    <div className="relative w-full">
                                        <AnimatePresence mode="wait" custom={commentDirection}>
                                            <motion.p
                                                key={commentPage}
                                                custom={commentDirection}
                                                variants={textSliderVariants}
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                transition={{ duration: 0.5, ease: "circOut" }}
                                                className="text-2xl md:text-3xl font-light leading-relaxed text-gray-800 italic"
                                            >
                                                "{sortedComments[commentIndex].text}"
                                            </motion.p>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Slider Navigation & Progress */}
                            {sortedComments.length > 1 && (
                                <div className="flex items-center justify-end gap-6 mt-12">
                                    <button 
                                        onClick={() => paginateComments(-1)}
                                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    
                                    <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div 
                                            className="h-full bg-black"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((commentIndex + 1) / sortedComments.length) * 100}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>

                                    <button 
                                        onClick={() => paginateComments(1)}
                                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                         </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50/30 rounded-3xl border border-dashed border-gray-200">
                             <MessageSquare size={32} className="mx-auto text-gray-300 mb-4" />
                             <p className="text-gray-400 font-light">No feedback yet. Be the first to share your thoughts.</p>
                        </div>
                    )}
                </div>

                {/* Footer Link - Reduced Spacing */}
                <div className="py-8 md:py-24 flex justify-center border-t border-gray-100 mt-0 md:mt-20">
                    <button onClick={onViewAll || onBack} className="group flex flex-col items-center gap-4 text-gray-400 hover:text-black transition-colors">
                        <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white group-hover:border-black transition-all">
                            <ArrowUpRight size={24} />
                        </div>
                        <span className="font-medium tracking-wide uppercase">View All Projects</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
      
      {/* --- LIGHTBOX MODAL --- */}
      <AnimatePresence>
        {lightboxIndex !== null && project.gallery && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center"
                onClick={() => setLightboxIndex(null)}
            >
                {/* Close Button */}
                <button 
                    onClick={() => setLightboxIndex(null)}
                    className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-20"
                >
                    <X size={24} />
                </button>

                {/* Image Counter */}
                <div className="absolute top-6 left-6 text-white/50 text-sm font-mono z-20">
                    {lightboxIndex + 1} / {project.gallery.length}
                </div>

                {/* Navigation Buttons */}
                <button 
                    className="absolute left-4 md:left-8 p-3 bg-black/50 text-white rounded-full hover:bg-black/80 transition-all z-20 hidden md:flex items-center justify-center"
                    onClick={handlePrevImageLightbox}
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    className="absolute right-4 md:right-8 p-3 bg-black/50 text-white rounded-full hover:bg-black/80 transition-all z-20 hidden md:flex items-center justify-center"
                    onClick={handleNextImageLightbox}
                >
                    <ChevronRight size={24} />
                </button>

                {/* Main Image */}
                <motion.div 
                    key={lightboxIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    drag="x" // Enable drag
                    dragConstraints={{ left: 0, right: 0 }} // Snap back
                    dragElastic={1} // Feel elastic
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);
                        if (swipe < -swipeConfidenceThreshold) {
                            handleNextImageLightbox();
                        } else if (swipe > swipeConfidenceThreshold) {
                            handlePrevImageLightbox();
                        }
                    }}
                    className="w-full h-full max-w-7xl max-h-screen p-4 md:p-12 flex items-center justify-center cursor-grab active:cursor-grabbing"
                >
                    <img 
                        src={project.gallery[lightboxIndex]} 
                        alt="Full Screen" 
                        draggable={false}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </motion.div>
                
                {/* Mobile Hint */}
                <div className="absolute bottom-8 left-0 right-0 text-center text-white/30 text-xs md:hidden pointer-events-none">
                    Tap outside to close • Swipe to navigate
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white">
        <Contact />
        <Footer />
      </div>
    </motion.div>
  );
};

// Sub-component for Image with reveal effect
const ParallaxImage = ({ src, alt }: { src: string; alt: string }) => {
    const { scrollYProgress } = useScroll();
    const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="w-full h-[50vh] md:h-[60vh] lg:h-[80vh] overflow-hidden bg-gray-100 relative group">
             <motion.div style={{ scale }} className="w-full h-full">
                <img 
                    src={src} 
                    alt={alt}
                    onLoad={() => setLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                />
             </motion.div>
             
             {/* Animated View Fullscreen Button */}
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 backdrop-blur-0 group-hover:backdrop-blur-[2px] transition-all duration-700 ease-out flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                <button className="pointer-events-auto group/btn relative overflow-hidden bg-white px-8 py-4 rounded-full shadow-2xl transition-all duration-500 ease-out transform translate-y-8 scale-90 group-hover:translate-y-0 group-hover:scale-100 hover:scale-105 active:scale-95">
                    
                    {/* Fill Effect - Smoother easing */}
                    <div className="absolute inset-0 bg-black translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]" />
                    
                    {/* Content: Text Swaps Color */}
                    <div className="relative z-10 flex items-center gap-3 text-black group-hover/btn:text-white transition-colors duration-500">
                        <ZoomIn size={18} />
                        <span className="text-sm font-bold uppercase tracking-widest">View Fullscreen</span>
                    </div>
                </button>
             </div>
        </div>
    );
};

export default ProjectDetail;