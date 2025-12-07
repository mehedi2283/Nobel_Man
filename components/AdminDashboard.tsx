import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useMotionValue, useSpring } from 'framer-motion';
import { LogOut, Plus, Save, Trash2, LayoutGrid, X, Edit2, MessageCircle, Heart, MessageSquare, Briefcase, User, Mail, Link as LinkIcon, Globe, Instagram, Linkedin, AlignLeft, Check, Loader2, AlertCircle, Home, LayoutDashboard, Key, Shield, Calendar, Sparkles, Filter, CheckSquare, Square, CornerDownRight, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Project, ClientLogo, ProfileData, ContactMessage, Comment, ChatLog } from '../types';
import { projectService } from '../services/projectService';
import { DEFAULT_PROFILE_DATA } from '../constants';
import ConfirmationModal from './ConfirmationModal';

interface AdminDashboardProps {
  projects: Project[];
  onSaveProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onReorderProjects: (projects: Project[]) => void;
  onProjectUpdate: (project: Project) => void;
  onProfileUpdate: (profile: ProfileData) => void;
  onLogout: () => void;
  onRefreshRequests?: () => void;
  homeLogo?: string;
}

// --- Animated Counter Component ---
const AnimatedCounter = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { 
    damping: 30, 
    stiffness: 100 
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toLocaleString();
      }
    });
  }, [springValue]);

  return <span ref={ref}>0</span>;
};

const itemVariants = {
    idle: { 
        scale: 1, 
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        zIndex: 0
    },
    dragging: { 
        scale: 1.02, 
        backgroundColor: "#ffffff",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        zIndex: 50,
        cursor: "grabbing"
    }
};

const countVariants = {
    idle: { 
        backgroundColor: "#ffffff", 
        color: "#6b7280", 
        borderColor: "#e5e7eb",
        scale: 1
    },
    dragging: { 
        backgroundColor: "#000000", 
        color: "#ffffff", 
        borderColor: "#000000",
        scale: 1.15
    }
};

const SortableProjectItem = React.memo(({ 
    project, 
    index, 
    onEdit, 
    onDelete, 
    onOpenComments,
    onDragStart,
    onDragEnd
}: {
    project: Project;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
    onOpenComments: () => void;
    onDragStart: () => void;
    onDragEnd: () => void;
}) => {
    return (
        <Reorder.Item
            value={project}
            id={project.id}
            initial="idle"
            animate="idle"
            whileDrag="dragging"
            variants={itemVariants}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            layout
            className="p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-center gap-4 group cursor-grab active:cursor-grabbing relative overflow-hidden"
        >
            <div className="flex items-center gap-4 w-full md:w-auto pointer-events-none">
                {/* Updated Count Circle: Animates on Drag */}
                <motion.div 
                    variants={countVariants}
                    className="w-8 h-8 rounded-full border shadow-sm flex items-center justify-center text-sm font-bold transition-colors"
                >
                    {index + 1}
                </motion.div>
                
                <div className="w-20 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{project.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{project.category}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 ml-auto w-full md:w-auto justify-end">
                <div className="flex items-center gap-4 mr-auto md:mr-4 md:border-r border-gray-100 md:pr-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500" title="Likes">
                        <Heart size={14} className={project.likes ? 'text-red-500 fill-red-500' : ''} /> 
                        {project.likes || 0}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500" title="Comments">
                        <MessageCircle size={14} className={project.comments?.length ? 'text-blue-500 fill-blue-500' : ''} /> 
                        {project.comments?.length || 0}
                    </div>
                </div>
                
                <button onPointerDown={(e) => e.stopPropagation()} onClick={onOpenComments} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium px-2 md:px-3"><MessageSquare size={16} /></button>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={onEdit} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium px-2 md:px-3"><Edit2 size={16} /> <span className="hidden sm:inline">Edit</span></button>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium px-2 md:px-3"><Trash2 size={16} /> <span className="hidden sm:inline">Delete</span></button>
            </div>
        </Reorder.Item>
    );
});

const AdminDashboard: React.FC<AdminDashboardProps> = ({ projects, onSaveProject, onDeleteProject, onReorderProjects, onProjectUpdate, onProfileUpdate, onLogout, onRefreshRequests, homeLogo }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'list' | 'form' | 'logos' | 'profile' | 'inbox'>('overview');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Local state for drag and drop
  const [localProjects, setLocalProjects] = useState(projects);
  const [isDragging, setIsDragging] = useState(false);

  // Sync local projects when parent projects change, BUT ONLY if there's a real difference AND NOT dragging
  useEffect(() => {
    if (isDragging) return;
    const projectsChanged = JSON.stringify(projects) !== JSON.stringify(localProjects);
    if (projectsChanged) {
        setLocalProjects(projects);
    }
  }, [projects, isDragging]);

  // Comment Management State
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedProjectForComments, setSelectedProjectForComments] = useState<Project | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  // Logo Management State
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [newLogoName, setNewLogoName] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [isAddingLogo, setIsAddingLogo] = useState(false);
  const [logoToDelete, setLogoToDelete] = useState<string | null>(null);
  const [selectedLogoIds, setSelectedLogoIds] = useState<Set<string>>(new Set());
  const [isBulkDeletingLogos, setIsBulkDeletingLogos] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Profile Management State - Initialize with Default Data
  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE_DATA);
  const [saveProfileStatus, setSaveProfileStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Admin Credentials State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [credStatus, setCredStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Messages & Chat Logs State (Inbox)
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  
  // Inbox UI State
  const [inboxTab, setInboxTab] = useState<'contact' | 'chat'>('contact');
  const [dateFilter, setDateFilter] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  // Direction for calendar animation: -1 for prev, 1 for next
  const [calendarDirection, setCalendarDirection] = useState(0);
  
  // Inbox Pagination State
  const [inboxPage, setInboxPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    category: '',
    image: '',
    description: '',
    role: '',
    year: new Date().getFullYear().toString(),
    client: '',
  });
  
  const [galleryUrls, setGalleryUrls] = useState<string[]>(['']);

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      const logosData = await projectService.getClientLogos();
      setLogos(logosData);
      
      const pData = await projectService.getProfile();
      // If server returns data, merge it. If null, we stick to default.
      if (pData && pData.name) {
          setProfileData(prev => ({ ...prev, ...pData }));
      }

      const msgs = await projectService.getMessages();
      setMessages(msgs);

      const logs = await projectService.getChatLogs();
      setChatLogs(logs);
    };
    fetchData();
  }, []);

  // Polling for Instant Updates (Messages, Comments via Project Refresh)
  useEffect(() => {
    const pollInterval = setInterval(async () => {
        try {
            // 1. Refresh Inbox Data
            const msgs = await projectService.getMessages();
            // Simple check to avoid state thrashing if data is identical could be added, but minimal impact here
            setMessages(msgs);

            const logs = await projectService.getChatLogs();
            setChatLogs(logs);

            // 2. Request Parent to Refresh Projects (Likes/Comments)
            if (onRefreshRequests) {
                onRefreshRequests();
            }
        } catch (error) {
            console.debug("Polling failed", error);
        }
    }, 4000); // Check every 4 seconds

    return () => clearInterval(pollInterval);
  }, [onRefreshRequests]);

  // Reset pagination when tab or filter changes
  useEffect(() => {
      setInboxPage(1);
  }, [inboxTab, dateFilter]);

  // --- Statistics Calculations ---
  const stats = useMemo(() => {
    const totalLikes = projects.reduce((acc, curr) => acc + (curr.likes || 0), 0);
    const totalComments = projects.reduce((acc, curr) => acc + (curr.comments?.length || 0), 0);
    
    // Flatten all comments for the feed
    const allComments = projects
        .flatMap(p => (p.comments || []).map(c => ({
            ...c,
            projectId: p.id,
            projectTitle: p.title
        })))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { totalLikes, totalComments, allComments };
  }, [projects]);

  // --- Unread Counts ---
  const unreadMessagesCount = useMemo(() => messages.filter(m => !m.read).length, [messages]);
  const unreadChatLogsCount = useMemo(() => {
      return chatLogs.filter(l => !l.read && l.role === 'user').length;
  }, [chatLogs]);
  
  const totalUnreadInbox = unreadMessagesCount + unreadChatLogsCount;

  // --- Recent Activity Calculation ---
  const recentActivity = useMemo(() => {
    const commentItems = stats.allComments.map(c => ({
        id: c._id || c.id || Math.random().toString(),
        type: 'comment' as const,
        author: c.author,
        text: c.text,
        date: new Date(c.createdAt),
        subtext: `Commented on ${c.projectTitle}`,
        read: c.read,
        projectId: c.projectId
    }));

    const messageItems = messages.map(m => ({
        id: m._id || m.id || Math.random().toString(),
        type: 'message' as const,
        author: m.name,
        text: m.message,
        date: new Date(m.createdAt),
        subtext: 'Sent a message via Contact Form',
        read: m.read
    }));

    // Combine and sort by date descending
    return [...commentItems, ...messageItems]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5); // Take top 5 recent items
  }, [stats.allComments, messages]);

  // --- Chat Pairing Logic ---
  const pairedChatLogs = useMemo(() => {
    // 1. Sort ascending to reconstruct conversation flow properly
    const sorted = [...chatLogs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    interface ChatPair {
        id: string;
        userMsg?: ChatLog;
        modelMsg?: ChatLog;
        createdAt: string;
        read: boolean;
    }

    const pairs: ChatPair[] = [];
    let currentPair: { userMsg?: ChatLog, modelMsg?: ChatLog } | null = null;

    sorted.forEach((log) => {
        if (log.role === 'user') {
            if (currentPair && currentPair.userMsg && !currentPair.modelMsg) {
                 pairs.push({ 
                     id: currentPair.userMsg._id || Date.now().toString() + Math.random(), 
                     userMsg: currentPair.userMsg, 
                     createdAt: currentPair.userMsg.createdAt,
                     read: !!currentPair.userMsg.read
                 });
            }
            currentPair = { userMsg: log };
        } else if (log.role === 'model') {
            if (currentPair && currentPair.userMsg && !currentPair.modelMsg) {
                currentPair.modelMsg = log;
                pairs.push({ 
                    id: currentPair.userMsg._id || Date.now().toString() + Math.random(), 
                    userMsg: currentPair.userMsg, 
                    modelMsg: log, 
                    createdAt: currentPair.userMsg.createdAt,
                    read: !!currentPair.userMsg.read
                 });
                currentPair = null;
            } else {
                pairs.push({ 
                    id: log._id || Date.now().toString() + Math.random(), 
                    modelMsg: log, 
                    createdAt: log.createdAt,
                    read: true // System message considered read usually
                });
            }
        }
    });

    if (currentPair) {
         pairs.push({ 
             id: currentPair.userMsg?._id || Date.now().toString(), 
             userMsg: currentPair.userMsg, 
             modelMsg: currentPair.modelMsg,
             createdAt: currentPair.userMsg?.createdAt || new Date().toISOString(),
             read: !!currentPair.userMsg?.read
         });
    }

    return pairs;
  }, [chatLogs]);

  // --- Inbox Pagination & Grouping Logic ---
  const processedInboxData = useMemo(() => {
    let data: any[] = [];
    
    if (inboxTab === 'contact') {
        data = messages;
    } else {
        data = pairedChatLogs;
    }

    // Apply Date Filter
    if (dateFilter) {
        data = data.filter(item => {
            const itemDate = new Date(item.createdAt);
            const itemDateStr = itemDate.toISOString().split('T')[0];
            return itemDateStr === dateFilter;
        });
    }

    // Sort by Date (Newest First)
    return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [messages, pairedChatLogs, inboxTab, dateFilter]);

  // 2. Paginate Data
  const totalInboxPages = Math.ceil(processedInboxData.length / ITEMS_PER_PAGE) || 1;
  
  const paginatedInboxData = useMemo(() => {
      const start = (inboxPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      return processedInboxData.slice(start, end);
  }, [processedInboxData, inboxPage]);

  // 3. Group Paginated Data
  const groupedInbox = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    paginatedInboxData.forEach(item => {
      const dateKey = new Date(item.createdAt).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(item);
    });
    return grouped;
  }, [paginatedInboxData]);


  const resetForm = () => {
      setFormData({
        title: '',
        category: '',
        image: '',
        description: '',
        role: '',
        year: new Date().getFullYear().toString(),
        client: '',
      });
      setGalleryUrls(['']);
      setEditingId(null);
  };

  const handleEditClick = (project: Project) => {
      setEditingId(project.id);
      setFormData({ ...project });
      setGalleryUrls(project.gallery && project.gallery.length > 0 ? project.gallery : ['']);
      setActiveTab('form');
  };

  const handleDragStart = () => {
      setIsDragging(true);
  };

  const handleDragEnd = () => {
     setIsDragging(false);
     // Propagate reorder to parent
     onReorderProjects(localProjects);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleGalleryChange = (index: number, value: string) => {
    const newUrls = [...galleryUrls];
    newUrls[index] = value;
    setGalleryUrls(newUrls);
  };

  const addGalleryField = () => {
    setGalleryUrls([...galleryUrls, '']);
  };

  const removeGalleryField = (index: number) => {
    const newUrls = galleryUrls.filter((_, i) => i !== index);
    setGalleryUrls(newUrls);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) return;

    const validGallery = galleryUrls.filter(url => url.trim() !== '');
    const finalGallery = validGallery.length > 0 ? validGallery : [formData.image!];

    const projectToSave: Project = {
      id: editingId || formData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      title: formData.title || 'Untitled',
      category: formData.category || 'Design',
      image: formData.image || '',
      description: formData.description || '',
      role: formData.role || 'Designer',
      year: formData.year || new Date().getFullYear().toString(),
      client: formData.client || 'Personal',
      gallery: finalGallery,
      likes: formData.likes || 0,
      comments: formData.comments || []
    };

    onSaveProject(projectToSave);
    setActiveTab('list');
    resetForm();
  };

  // --- Mark Read Handlers ---
  const handleMarkMessageRead = async (msg: ContactMessage) => {
      if (msg.read) return;
      
      // Optimistic update
      setMessages(prev => prev.map(m => (m._id === msg._id || m.id === msg.id) ? { ...m, read: true } : m));
      
      try {
          await projectService.markMessageRead(msg._id || msg.id || '');
      } catch (error) {
          console.error("Failed to mark message read");
      }
  };

  const handleMarkChatRead = async (chatPair: any) => {
      if (chatPair.read) return;
      if (!chatPair.userMsg?._id) return;

      // Update state locally first (complex because pairs are derived)
      setChatLogs(prev => prev.map(l => l._id === chatPair.userMsg._id ? { ...l, read: true } : l));

      try {
          await projectService.markChatLogRead(chatPair.userMsg._id);
      } catch (error) {
          console.error("Failed to mark chat log read");
      }
  };

  const handleMarkAllRead = async () => {
      // Optimistic update
      setMessages(prev => prev.map(m => ({ ...m, read: true })));
      setChatLogs(prev => prev.map(l => ({ ...l, read: true }))); // Chat pairing logic handles read status from raw logs

      try {
          await Promise.all([
              projectService.markAllMessagesRead(),
              projectService.markAllChatLogsRead()
          ]);
      } catch (error) {
          console.error("Failed to mark all read");
      }
  };

  const handleMarkCommentRead = async (projectId: string, commentId: string) => {
      // Find the comment first to see if it's unread
      const project = projects.find(p => p.id === projectId);
      const comment = project?.comments?.find(c => c._id === commentId || c.id === commentId);
      
      if (comment && !comment.read) {
          try {
              const updatedProject = await projectService.markCommentRead(projectId, commentId);
              onProjectUpdate(updatedProject);
          } catch (error) {
              console.error("Failed to mark comment read");
          }
      }
  };

  // --- Comment Management ---
  const handleOpenComments = (project: Project) => {
      setSelectedProjectForComments(project);
      setShowCommentsModal(true);
  };

  const requestDeleteComment = (commentId: string) => {
      setCommentToDelete(commentId);
  };

  const confirmDeleteComment = async () => {
      if (!selectedProjectForComments || !commentToDelete) return;
      const commentId = commentToDelete;
      setCommentToDelete(null);

      try {
          const updatedProject = await projectService.deleteComment(selectedProjectForComments.id, commentId);
          onProjectUpdate(updatedProject);
          setSelectedProjectForComments(updatedProject);
      } catch (error) {
          console.error("Failed to delete comment:", error);
          alert("Failed to delete comment.");
      }
  };

  // --- Logo Management ---
  const handleAddLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogoUrl) return; // Name is optional

    setIsAddingLogo(true);
    try {
      const addedLogo = await projectService.addClientLogo(newLogoName || '', newLogoUrl);
      setLogos([addedLogo, ...logos]);
      setNewLogoName('');
      setNewLogoUrl('');
    } catch (error) {
      alert("Failed to add logo.");
    } finally {
      setIsAddingLogo(false);
    }
  };

  const confirmDeleteLogo = async () => {
    if (!logoToDelete) return;
    try {
      await projectService.deleteClientLogo(logoToDelete);
      setLogos(logos.filter(l => l._id !== logoToDelete));
      setLogoToDelete(null);
    } catch (error) {
      alert("Failed to delete logo.");
    }
  };

  const toggleLogoSelection = (id: string) => {
      const newSet = new Set(selectedLogoIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedLogoIds(newSet);
  };

  const toggleAllLogos = () => {
      if (selectedLogoIds.size === logos.length) {
          setSelectedLogoIds(new Set());
      } else {
          setSelectedLogoIds(new Set(logos.map(l => l._id || l.id || '')));
      }
  };

  const confirmBulkDeleteLogos = async () => {
      setIsBulkDeletingLogos(true);
      setShowBulkDeleteConfirm(false);
      try {
          const idsToDelete = Array.from(selectedLogoIds) as string[];
          await projectService.deleteClientLogos(idsToDelete);
          setLogos(prev => prev.filter(l => !selectedLogoIds.has(l._id || l.id || '')));
          setSelectedLogoIds(new Set());
      } catch (error) {
          alert("Failed to delete selected logos.");
      } finally {
          setIsBulkDeletingLogos(false);
      }
  };

  // --- Profile Management ---
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveProfileStatus('saving');
    try {
        const updatedProfile = await projectService.updateProfile(profileData);
        onProfileUpdate(updatedProfile); // Notify parent to update home page immediately
        setSaveProfileStatus('success');
        setTimeout(() => setSaveProfileStatus('idle'), 3000);
    } catch (error) {
        setSaveProfileStatus('error');
        setTimeout(() => setSaveProfileStatus('idle'), 3000);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) return;
    
    setCredStatus('saving');
    try {
        await projectService.updateAdminCredentials(adminEmail, adminPassword);
        setCredStatus('success');
        setAdminEmail('');
        setAdminPassword('');
        setTimeout(() => setCredStatus('idle'), 3000);
    } catch (error) {
        setCredStatus('error');
        setTimeout(() => setCredStatus('idle'), 3000);
    }
  };

  // --- Message Management ---
  const confirmDeleteMessage = async () => {
      if (!messageToDelete) return;
      try {
          await projectService.deleteMessage(messageToDelete);
          setMessages(messages.filter(m => (m._id || m.id) !== messageToDelete));
          setMessageToDelete(null);
      } catch (error) {
          alert("Failed to delete message.");
      }
  };

  // --- Custom Calendar Logic ---
  const handlePrevMonth = () => {
    setCalendarDirection(-1);
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCalendarDirection(1);
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };
  const handlePrevYear = () => {
    setCalendarDirection(-1);
    setCalendarMonth(new Date(calendarMonth.getFullYear() - 1, calendarMonth.getMonth(), 1));
  };
  const handleNextYear = () => {
    setCalendarDirection(1);
    setCalendarMonth(new Date(calendarMonth.getFullYear() + 1, calendarMonth.getMonth(), 1));
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    // Format YYYY-MM-DD manually to avoid timezone issues
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    setDateFilter(`${year}-${month}-${d}`);
    setShowDatePicker(false);
  };

  // Animation variants for sliding calendar
  const calendarVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  const renderCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="w-8 h-8 sm:w-9 sm:h-9" />);
    }
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const isSelected = dateFilter === dateStr;
        const isToday = new Date().toDateString() === new Date(year, month, i).toDateString();
        
        days.push(
            <button
                key={i}
                onClick={(e) => { e.stopPropagation(); handleDateClick(i); }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 select-none cursor-pointer
                    ${isSelected ? 'bg-black text-white shadow-md transform scale-105' : 'text-gray-700 hover:bg-gray-200 hover:font-bold'}
                    ${isToday && !isSelected ? 'text-blue-600 font-bold bg-blue-50' : ''}
                `}
            >
                {i}
            </button>
        );
    }
    return days;
  };

  const getTabClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border ${
      isActive 
        ? 'bg-white border-gray-200 shadow-sm text-gray-900 font-bold' 
        : 'border-transparent text-gray-500 hover:bg-white/50 hover:text-gray-900 font-medium'
    }`;
  };

  // Custom Animated Year Select Dropdown
  const CustomYearSelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
      const [isOpen, setIsOpen] = useState(false);
      const containerRef = useRef<HTMLDivElement>(null);
      
      useEffect(() => {
          const handleClickOutside = (event: MouseEvent) => {
              if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                  setIsOpen(false);
              }
          };
          document.addEventListener("mousedown", handleClickOutside);
          return () => document.removeEventListener("mousedown", handleClickOutside);
      }, []);

      const currentYear = new Date().getFullYear();
      // Generate years: Current + 2 down to 2010
      const years = Array.from({ length: currentYear - 2010 + 3 }, (_, i) => currentYear + 2 - i);

      return (
        <div className="space-y-2 relative" ref={containerRef}>
          <label className="text-sm font-bold text-gray-700 block">Year</label>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-all font-medium text-left flex justify-between items-center group hover:border-gray-400"
          >
            <span>{value || 'Select Year'}</span>
            <ChevronDown size={16} className={`transition-transform duration-300 text-gray-500 group-hover:text-black ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 scrollbar-hide"
                >
                    {years.map(y => (
                        <button
                            key={y}
                            type="button"
                            onClick={() => { onChange(y.toString()); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl
                                ${value === y.toString() ? 'bg-gray-50 font-bold text-black' : 'text-gray-600'}
                            `}
                        >
                            {y}
                        </button>
                    ))}
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
  };

  // Tabs config for Mobile Nav
  const mobileNavItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'inbox', icon: Mail, label: 'Inbox', count: totalUnreadInbox > 0 ? totalUnreadInbox : undefined },
    { id: 'list', icon: LayoutGrid, label: 'Projects', count: projects.length },
    { id: 'form', icon: Plus, label: 'Add' },
    { id: 'logos', icon: Briefcase, label: 'Logos' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-aeonik">
      
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {homeLogo ? (
                    <img src={homeLogo} alt="Dashboard Logo" className="h-8 w-auto object-contain" />
                ) : (
                    <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white font-bold">N</div>
                )}
                <span className="font-semibold text-gray-900">Admin Dashboard</span>
            </div>
            <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
            >
                <LogOut size={16} />
                Logout
            </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 flex-1 pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Sidebar - Desktop Only */}
            <div className="hidden md:flex w-64 flex-col gap-2 shrink-0 sticky top-24">
                <button 
                    onClick={() => { setActiveTab('overview'); resetForm(); }}
                    className={getTabClass('overview')}
                >
                    <LayoutDashboard size={20} />
                    Overview
                </button>
                <button 
                    onClick={() => { setActiveTab('inbox'); resetForm(); }}
                    className={getTabClass('inbox')}
                >
                    <Mail size={20} />
                    Inbox
                    {totalUnreadInbox > 0 && (
                         <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{totalUnreadInbox}</span>
                    )}
                </button>
                <button 
                    onClick={() => { setActiveTab('list'); resetForm(); }}
                    className={getTabClass('list')}
                >
                    <LayoutGrid size={20} />
                    All Projects
                    <span className="ml-auto bg-gray-100 text-gray-900 text-xs px-2 py-0.5 rounded-full font-bold">{projects.length}</span>
                </button>
                <button 
                    onClick={() => { setActiveTab('form'); resetForm(); }}
                    className={getTabClass('form')}
                >
                    <Plus size={20} />
                    Add New Project
                </button>
                <button 
                    onClick={() => { setActiveTab('logos'); resetForm(); }}
                    className={getTabClass('logos')}
                >
                    <Briefcase size={20} />
                    Client Logos
                </button>
                <button 
                    onClick={() => { setActiveTab('profile'); resetForm(); }}
                    className={getTabClass('profile')}
                >
                    <User size={20} />
                    Edit Profile
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 w-full min-w-0">
                <AnimatePresence mode="wait">
                    
                    {/* ... (Other Tabs: Overview, Inbox, List, Form, Logos) ... */}
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                               <StatCard title="Total Likes" value={stats.totalLikes} icon={<Heart size={20} className="text-red-500" />} />
                               <StatCard title="Total Comments" value={stats.totalComments} icon={<MessageCircle size={20} className="text-blue-500" />} />
                               <StatCard title="Total Messages" value={messages.length + chatLogs.length} icon={<Mail size={20} className="text-purple-500" />} />
                               <StatCard title="Total Projects" value={projects.length} icon={<LayoutGrid size={20} className="text-black" />} />
                           </div>
                           <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                               <div className="flex items-center gap-3 mb-8"><div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white"><Sparkles size={20} /></div><div><h3 className="text-lg font-bold text-gray-900">Recent Activity</h3><p className="text-sm text-gray-500">Latest comments and incoming messages</p></div></div>
                               <div className="space-y-6">
                                   {recentActivity.length > 0 ? (
                                       recentActivity.map((item) => (
                                           <div 
                                                key={item.id} 
                                                className={`flex gap-4 items-start group p-2 rounded-xl transition-colors ${!item.read ? 'bg-blue-50/50 cursor-pointer' : ''}`}
                                                onClick={() => {
                                                    if (!item.read) {
                                                        if (item.type === 'message') {
                                                            handleMarkMessageRead(item as any);
                                                        } else if (item.type === 'comment' && item.projectId) {
                                                            handleMarkCommentRead(item.projectId, item.id);
                                                        }
                                                    }
                                                }}
                                           >
                                               <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-colors ${item.type === 'comment' ? 'bg-blue-50 text-blue-600 border-blue-100 group-hover:border-blue-200 group-hover:bg-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100 group-hover:border-purple-200 group-hover:bg-purple-100'}`}>{item.type === 'comment' ? <MessageCircle size={18} /> : <Mail size={18} />}</div>
                                               <div className="flex-1 min-w-0">
                                                   <div className="flex justify-between items-start mb-1">
                                                       <h4 className={`font-bold text-sm ${!item.read ? 'text-black' : 'text-gray-900'}`}>
                                                           {item.author}
                                                           {!item.read && <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full" title="New"></span>}
                                                       </h4>
                                                       <span className="text-xs text-gray-400 font-mono">{item.date.toLocaleDateString()}</span>
                                                   </div>
                                                   <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">{item.type === 'comment' ? <MessageCircle size={12}/> : <Mail size={12}/>}{item.subtext}</p>
                                                   <ExpandableMessage 
                                                        text={item.text} 
                                                        className={`p-4 rounded-xl text-sm text-gray-600 transition-colors mt-2 ${!item.read ? 'bg-white border border-blue-100' : 'bg-gray-50 group-hover:bg-gray-100'}`}
                                                   />
                                               </div>
                                           </div>
                                       ))
                                   ) : (<div className="text-center py-12 text-gray-400"><p>No recent activity found.</p></div>)}
                               </div>
                           </div>
                        </motion.div>
                    )}

                    {activeTab === 'inbox' && (
                        <motion.div key="inbox" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto flex flex-col min-h-[600px]">
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">Inbox<span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{processedInboxData.length} items</span></h2>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="bg-gray-100 p-1 rounded-2xl flex items-center relative gap-1"><button onClick={() => setInboxTab('contact')} className={`relative flex-1 px-8 py-2 text-sm font-bold transition-colors z-10 rounded-xl whitespace-nowrap min-w-[120px] flex items-center justify-center gap-2 ${inboxTab === 'contact' ? 'text-black' : 'text-gray-500'}`}>Contact Form{unreadMessagesCount > 0 && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>}{inboxTab === 'contact' && (<motion.div layoutId="inbox-tab" className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10 border border-black/5" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />)}</button><button onClick={() => setInboxTab('chat')} className={`relative flex-1 px-8 py-2 text-sm font-bold transition-colors z-10 rounded-xl whitespace-nowrap min-w-[120px] flex items-center justify-center gap-2 ${inboxTab === 'chat' ? 'text-black' : 'text-gray-500'}`}>Chatbot{unreadChatLogsCount > 0 && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>}{inboxTab === 'chat' && (<motion.div layoutId="inbox-tab" className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10 border border-black/5" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />)}</button></div>
                                    <div className="relative flex items-center gap-2">
                                        <AnimatePresence>
                                            {totalUnreadInbox > 0 && (
                                                <motion.button 
                                                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                    onClick={handleMarkAllRead}
                                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-colors text-sm font-medium flex items-center gap-2 whitespace-nowrap shadow-sm h-[40px]"
                                                >
                                                    <CheckSquare size={16} />
                                                    <span className="hidden sm:inline">Mark All Read</span>
                                                    <span className="sm:hidden">Read All</span>
                                                </motion.button>
                                            )}
                                        </AnimatePresence>
                                        <button 
                                            className={`relative cursor-pointer border rounded-2xl px-5 py-2 flex items-center gap-3 transition-all h-[40px] ${dateFilter ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:border-gray-400 text-gray-600'}`} 
                                            onClick={() => setShowDatePicker(!showDatePicker)}
                                        >
                                            <Filter size={14} className={dateFilter ? "text-white" : "text-gray-400"} />
                                            <span className="text-sm font-medium">{dateFilter ? new Date(dateFilter).toLocaleDateString() : 'Filter by Date'}</span>
                                            {dateFilter && (<span onClick={(e) => { e.stopPropagation(); setDateFilter(''); }} className="ml-2 w-5 h-5 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"><X size={12} /></span>)}
                                        </button>
                                        
                                        <AnimatePresence>
                                            {showDatePicker && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                                                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                                                    className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50 w-[280px] sm:w-[320px]"
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-lg font-bold text-gray-900">Jump to date</h3>
                                                        <button onClick={() => setShowDatePicker(false)} className="text-gray-400 hover:text-black">
                                                            <X size={20} />
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between mb-4 px-1">
                                                        <div className="flex gap-1">
                                                            <button onClick={handlePrevYear} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors" title="Previous Year">
                                                                <ChevronsLeft size={18} />
                                                            </button>
                                                            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors" title="Previous Month">
                                                                <ChevronLeft size={18} />
                                                            </button>
                                                        </div>
                                                        <span className="font-bold text-gray-900 text-sm sm:text-base whitespace-nowrap">
                                                            {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                        </span>
                                                        <div className="flex gap-1">
                                                            <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors" title="Next Month">
                                                                <ChevronRight size={18} />
                                                            </button>
                                                            <button onClick={handleNextYear} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors" title="Next Year">
                                                                <ChevronsRight size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                                                        {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
                                                            <div key={d} className="text-xs font-bold text-gray-400">{d}</div>
                                                        ))}
                                                    </div>
                                                    
                                                    <div className="overflow-hidden min-h-[200px]">
                                                        <AnimatePresence mode="popLayout" custom={calendarDirection}>
                                                            <motion.div 
                                                                key={calendarMonth.toISOString()}
                                                                custom={calendarDirection}
                                                                variants={calendarVariants}
                                                                initial="enter"
                                                                animate="center"
                                                                exit="exit"
                                                                transition={{ type: "tween", duration: 0.2 }}
                                                                className="grid grid-cols-7 gap-1 sm:gap-2 place-items-center"
                                                            >
                                                                {renderCalendar()}
                                                            </motion.div>
                                                        </AnimatePresence>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                           </div>
                           <div className="flex-1">
                                {Object.keys(groupedInbox).length === 0 ? (<div className="text-center py-20 text-gray-400 flex flex-col items-center"><Mail size={64} className="mb-4 opacity-10" /><p>No messages found {dateFilter ? 'for this date' : 'in inbox'}.</p></div>) : (<AnimatePresence mode="wait"><motion.div key={`${inboxTab}-${inboxPage}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-8">{Object.entries(groupedInbox).map(([date, items]) => (<div key={date}><div className="flex items-center gap-4 mb-4"><div className="h-[1px] bg-gray-200 flex-1"></div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400"><Calendar size={14} /> {date}</div><div className="h-[1px] bg-gray-200 flex-1"></div></div><div className="space-y-4">{(items as any[]).map((item: any, idx: number) => (<div key={`${item.id}-${idx}`}>{item.email ? (<div onClick={() => handleMarkMessageRead(item)} className={`p-5 rounded-2xl border hover:shadow-md transition-all relative group cursor-pointer ${item.read ? 'bg-white border-gray-200' : 'bg-blue-50/50 border-blue-200 shadow-sm'}`}><button onClick={(e) => { e.stopPropagation(); setMessageToDelete(item._id || item.id); }} className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 active:bg-red-50 rounded-full transition-all z-10"><Trash2 size={18} /></button><div className="flex justify-between items-start mb-3 pr-12 md:pr-0 relative"><div className="flex items-center gap-3 overflow-hidden"><div className={`w-10 h-10 rounded-full flex items-center justify-center text-blue-600 shrink-0 ${item.read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100'}`}><Mail size={20} /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className={`font-bold truncate pr-2 ${item.read ? 'text-gray-700' : 'text-black'}`}>{item.name}</h3>{!item.read && <span className="w-2 h-2 rounded-full bg-red-500"></span>}</div>
                                               {/* UPDATED: break-all instead of truncate */}
                                               <a href={`mailto:${item.email}`} onClick={e => e.stopPropagation()} className="text-xs text-blue-600 hover:underline break-all block">{item.email}</a></div></div><div className="flex items-center gap-4 shrink-0"><span className="text-xs text-gray-400 font-mono whitespace-nowrap">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span><button onClick={(e) => { e.stopPropagation(); setMessageToDelete(item._id || item.id); }} className="hidden md:block p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all -mr-2" title="Delete Message"><Trash2 size={18} /></button></div></div><ExpandableMessage text={item.message} /></div>) : (<div onClick={() => handleMarkChatRead(item)} className={`rounded-2xl border p-5 space-y-4 cursor-pointer transition-colors ${item.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50/30 border-blue-200 shadow-sm'}`}><div className="flex justify-between items-center text-xs text-gray-400 mb-2 px-2"><span className="uppercase font-bold tracking-wider flex items-center gap-2">Conversation Log {!item.read && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}</span><span className="font-mono">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>{item.userMsg && (<div className="flex justify-end mb-2"><div className="flex items-end gap-2 max-w-[85%] flex-row-reverse"><div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.read ? 'bg-gray-300 text-white' : 'bg-black text-white'}`}><User size={14} /></div><div className={`border px-4 py-2 rounded-2xl rounded-tr-sm shadow-sm text-sm ${item.read ? 'bg-white border-gray-200 text-gray-600' : 'bg-white border-blue-100 text-gray-900 font-medium'}`}>{item.userMsg.text}</div></div></div>)}{item.userMsg && item.modelMsg && (<div className="flex justify-start pl-10 -my-1 opacity-20"><CornerDownRight size={16} /></div>)}{item.modelMsg && (<div className="flex justify-start"><div className="flex items-start gap-2 max-w-[85%]"><div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-1"><Sparkles size={14} /></div><div className="bg-white border border-purple-100 px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm text-sm text-gray-700">{item.modelMsg.text}</div></div></div>)}</div>)}</div>))}</div></div>))} </motion.div></AnimatePresence>)}
                           </div>
                           {totalInboxPages > 1 && (<div className="mt-8 border-t border-gray-100 pt-6 flex justify-between items-center"><span className="text-xs font-medium text-gray-400">Showing {((inboxPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(inboxPage * ITEMS_PER_PAGE, processedInboxData.length)} of {processedInboxData.length}</span><div className="flex items-center gap-2"><button onClick={() => setInboxPage(p => Math.max(1, p - 1))} disabled={inboxPage === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"><ChevronLeft size={16} /></button><span className="text-sm font-bold text-gray-900 px-2 min-w-[60px] text-center">{inboxPage} / {totalInboxPages}</span><button onClick={() => setInboxPage(p => Math.min(totalInboxPages, p + 1))} disabled={inboxPage === totalInboxPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"><ChevronRight size={16} /></button></div></div>)}
                        </motion.div>
                    )}
                    
                    {/* ... (Other sections) ... */}
                    
                    {/* Comment Modal - Updated to support marking read */}
                    {showCommentsModal && selectedProjectForComments && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCommentsModal(false)}>
                            <motion.div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <div><h3 className="font-bold text-xl text-gray-900">Manage Comments</h3><p className="text-sm text-gray-500">Project: {selectedProjectForComments.title}</p></div>
                                    <button onClick={() => setShowCommentsModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                                </div>
                                <div className="overflow-y-auto p-6 flex-1 bg-white">
                                    {!selectedProjectForComments.comments || selectedProjectForComments.comments.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400"><MessageCircle size={48} className="mx-auto mb-4 opacity-20" /><p>No comments on this project yet.</p></div>
                                    ) : (
                                        <div className="space-y-4">
                                            {(selectedProjectForComments.comments || []).slice().reverse().map((comment: any, idx: number) => (
                                                <div 
                                                    key={idx} 
                                                    className={`flex gap-4 p-4 border rounded-xl transition-colors group items-center ${!comment.read ? 'bg-blue-50 border-blue-200 cursor-pointer' : 'border-gray-100 hover:bg-gray-50'}`}
                                                    onClick={() => handleMarkCommentRead(selectedProjectForComments.id, comment._id || comment.id)}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">{comment.author.charAt(0).toUpperCase()}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className={`font-bold text-sm ${!comment.read ? 'text-black' : 'text-gray-900'}`}>
                                                                {comment.author}
                                                                {!comment.read && <span className="ml-2 w-2 h-2 rounded-full bg-red-500 inline-block"></span>}
                                                            </h4>
                                                            <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 leading-relaxed">{comment.text}</p>
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); requestDeleteComment(comment._id || comment.id); }} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete Comment"><Trash2 size={18} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t border-gray-100 bg-gray-50 text-right"><button onClick={() => setShowCommentsModal(false)} className="px-6 py-2 bg-black text-white rounded-2xl hover:bg-gray-800 transition-colors text-sm font-medium">Done</button></div>
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === 'list' && (
                        <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-900">Project Order & Management</h2><p className="text-sm text-gray-500">Drag items to reorder content on the homepage.</p></div>
                            <Reorder.Group axis="y" values={localProjects} onReorder={setLocalProjects} className="flex flex-col gap-4" layoutScroll>
                                {localProjects.map((project, index) => (<SortableProjectItem key={project.id} project={project} index={index} onEdit={() => handleEditClick(project)} onDelete={() => onDeleteProject(project.id)} onOpenComments={() => handleOpenComments(project)} onDragStart={handleDragStart} onDragEnd={handleDragEnd} />))}
                            </Reorder.Group>
                        </motion.div>
                    )}

                    {activeTab === 'form' && (
                        <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-3xl mx-auto">
                            <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Project' : 'Upload Project Details'}</h2><button onClick={() => { setActiveTab('list'); resetForm(); }} className="text-gray-500 hover:text-black"><X size={24} /></button></div>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Input label="Project Title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Finance Dashboard" /><Input label="Category" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. UI/UX Design" /></div>
                                <ImageInput label="Cover Image URL" name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." />
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center"><label className="text-sm font-bold text-gray-700">Project Gallery Images</label><button type="button" onClick={addGalleryField} className="text-xs bg-black text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-1"><Plus size={14} /> Add Image</button></div>
                                    <div className="space-y-3">{galleryUrls.map((url, index) => (<div key={index} className="flex gap-2 items-start"><div className="flex-1"><ImageInput value={url} onChange={(e: any) => handleGalleryChange(index, e.target.value)} placeholder={`Gallery Image URL ${index + 1}`} /></div>{galleryUrls.length > 1 && (<button type="button" onClick={() => removeGalleryField(index)} className="p-3 text-red-500 hover:bg-red-50 rounded-lg mt-1"><Trash2 size={20} /></button>)}</div>))}</div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Input label="Role" name="role" value={formData.role} onChange={handleInputChange} placeholder="Lead Designer" />
                                    <Input label="Client" name="client" value={formData.client} onChange={handleInputChange} placeholder="Company Name" />
                                    <CustomYearSelect 
                                        value={formData.year || ''} 
                                        onChange={(val) => handleInputChange({ target: { name: 'year', value: val } } as any)} 
                                    />
                                </div>
                                <div className="space-y-2"><label className="text-sm font-bold text-gray-700 block">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none" placeholder="Detailed project description..."/></div>
                                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white py-4 z-10"><button type="button" onClick={() => { setActiveTab('list'); resetForm(); }} className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Cancel</button><button type="submit" className="px-8 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 flex items-center gap-2"><Save size={18} />{editingId ? 'Update Project' : 'Save Project'}</button></div>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'logos' && (
                        <motion.div key="logos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Client Logos</h2>
                            <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-200"><h3 className="font-bold text-lg mb-4">Add New Logo</h3><form onSubmit={handleAddLogo} className="flex flex-col md:flex-row gap-4 items-end"><div className="flex-1 w-full space-y-2"><label className="text-sm font-bold text-gray-700">Client Name <span className="text-gray-400 font-normal">(Optional)</span></label><input type="text" value={newLogoName} onChange={(e) => setNewLogoName(e.target.value)} placeholder="e.g. Nike" className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black" /></div><div className="flex-[2] w-full space-y-2"><label className="text-sm font-bold text-gray-700">Logo Image URL</label><input type="url" value={newLogoUrl} onChange={(e) => setNewLogoUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black" required /></div><button type="submit" disabled={isAddingLogo} className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 h-[50px]">{isAddingLogo ? 'Adding...' : 'Add Logo'}</button></form></div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100"><div className="flex items-center justify-between w-full sm:w-auto gap-4"><span className="text-sm font-bold text-gray-500 whitespace-nowrap">{logos.length} Logos</span><button onClick={toggleAllLogos} className="text-sm font-medium text-gray-900 hover:text-black flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"><div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${selectedLogoIds.size === logos.length && logos.length > 0 ? 'bg-black border-black text-white' : 'border-gray-300 bg-white'}`}>{selectedLogoIds.size === logos.length && logos.length > 0 && <Check size={12} strokeWidth={3} />}</div>Select All</button></div><AnimatePresence>{selectedLogoIds.size > 0 && (<motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} onClick={() => setShowBulkDeleteConfirm(true)} className="w-full sm:w-auto text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-colors shadow-sm"><Trash2 size={18} /> Delete Selected ({selectedLogoIds.size})</motion.button>)}</AnimatePresence></div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">{logos.map((logo) => { const id = logo._id || logo.id || ''; const isSelected = selectedLogoIds.has(id); return (<div key={id} onClick={() => toggleLogoSelection(id)} className={`relative group border rounded-2xl p-4 flex flex-col items-center justify-center h-40 transition-all cursor-pointer select-none ${isSelected ? 'border-black ring-1 ring-black bg-gray-50/50' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}><div className="absolute top-3 left-3 z-10"><div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-transparent group-hover:border-gray-300'}`}><Check size={14} strokeWidth={3} /></div></div><button onClick={(e) => { e.stopPropagation(); setLogoToDelete(id); }} className={`absolute top-2 right-2 p-2.5 rounded-full transition-all z-20 ${isSelected || 'md:opacity-0 md:group-hover:opacity-100'} ${isSelected ? 'bg-white text-red-500 shadow-sm' : 'bg-red-50 text-red-500'} hover:bg-red-100 hover:scale-110 active:scale-95`} title="Delete Logo"><Trash2 size={16} /></button><div className="flex-1 w-full flex items-center justify-center p-2"><img src={logo.url} alt={logo.name} className="max-w-full max-h-full object-contain pointer-events-none" loading="lazy" /></div>{logo.name && (<div className="w-full text-center"><span className="text-xs font-medium text-gray-500 truncate block px-2 py-1 bg-gray-100/50 rounded-md">{logo.name}</span></div>)}</div>); })}</div>
                            {logos.length === 0 && (<p className="text-center text-gray-400 py-8">No logos added yet.</p>)}
                        </motion.div>
                    )}

                    {activeTab === 'profile' && (
                        <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto space-y-8 pb-12">
                             <div className="flex justify-between items-center mb-2 sticky top-16 z-20 bg-gray-50/80 backdrop-blur-sm py-4"><h2 className="text-2xl font-bold text-gray-900">Edit Profile & Content</h2><motion.button onClick={handleSaveProfile} disabled={saveProfileStatus !== 'idle'} animate={saveProfileStatus} className={`relative px-6 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 overflow-hidden transition-colors ${saveProfileStatus === 'success' ? 'bg-green-500 shadow-green-500/30' : saveProfileStatus === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-black shadow-black/20 hover:bg-gray-800'}`}><AnimatePresence mode="popLayout" initial={false}>{saveProfileStatus === 'idle' && (<motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Save Changes</span><Save size={18} /></motion.div>)}{saveProfileStatus === 'saving' && (<motion.div key="saving" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Saving...</span><Loader2 size={18} className="animate-spin" /></motion.div>)}{saveProfileStatus === 'success' && (<motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Saved!</span><Check size={18} /></motion.div>)}{saveProfileStatus === 'error' && (<motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Failed</span><AlertCircle size={18} /></motion.div>)}</AnimatePresence></motion.button></div>
                            
                            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100"><div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><User size={20} /></div><div><h3 className="font-bold text-lg text-gray-900">Personal Identity</h3><p className="text-sm text-gray-500">Name, Role and Bio details</p></div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"><Input label="Full Name" name="name" value={profileData.name} onChange={handleProfileChange} placeholder="e.g. Nobel" /><Input label="Job Title" name="role" value={profileData.role} onChange={handleProfileChange} placeholder="e.g. UX & UI Designer" /></div>
                                <div className="space-y-2 mb-6"><label className="text-sm font-bold text-gray-700 block">Short Bio</label><textarea name="bio" value={profileData.bio} onChange={handleProfileChange} rows={4} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none" placeholder="I’m a UX/UI Designer..."/></div>
                            </section>

                            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100"><div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><LayoutGrid size={20} /></div><div><h3 className="font-bold text-lg text-gray-900">Hero Section</h3><p className="text-sm text-gray-500">Main landing area details</p></div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ImageInput label="Home Logo URL" name="homeLogo" value={profileData.homeLogo} onChange={handleProfileChange} placeholder="Nav logo URL" />
                                    <ImageInput label="Hero Image URL" name="heroImage" value={profileData.heroImage} onChange={handleProfileChange} placeholder="Main portrait URL" />
                                    <Input label="Total Projects Count" name="totalProjects" value={profileData.totalProjects} onChange={handleProfileChange} placeholder="e.g. 20" />
                                    <Input label="Years Experience" name="yearsExperience" value={profileData.yearsExperience} onChange={handleProfileChange} placeholder="e.g. 2" />
                                </div>
                            </section>

                            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100"><div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><AlignLeft size={20} /></div><div><h3 className="font-bold text-lg text-gray-900">About Content</h3><p className="text-sm text-gray-500">Bio images, statistics and features</p></div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <ImageInput label="Portrait Image (Vertical)" name="aboutImage1" value={profileData.aboutImage1} onChange={handleProfileChange} placeholder="URL" />
                                    <ImageInput label="Landscape Image" name="aboutImage2" value={profileData.aboutImage2} onChange={handleProfileChange} placeholder="URL" />
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"><div className="md:col-span-1"><Input label="Stat Value" name="statsValue" value={profileData.statsValue} onChange={handleProfileChange} placeholder="e.g. 100" /></div><div className="md:col-span-2"><Input label="Stat Label" name="statsLabel" value={profileData.statsLabel} onChange={handleProfileChange} placeholder="e.g. User-focused screens..." /></div></div>
                                <div className="space-y-4"><Input label="Feature Bullet 1" name="feature1" value={profileData.feature1} onChange={handleProfileChange} placeholder="e.g. Agency & startup experience..." /><Input label="Feature Bullet 2" name="feature2" value={profileData.feature2} onChange={handleProfileChange} placeholder="e.g. Strong UX fundamentals..." /><Input label="Resume Link (Google Drive)" name="resumeUrl" value={profileData.resumeUrl} onChange={handleProfileChange} placeholder="https://..." /></div>
                            </section>
                            
                            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100"><div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600"><LinkIcon size={20} /></div><div><h3 className="font-bold text-lg text-gray-900">Contact & Socials</h3><p className="text-sm text-gray-500">Links and contact info</p></div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"><Input label="Contact Email" name="email" value={profileData.email} onChange={handleProfileChange} placeholder="email@example.com" /><Input label="Copyright Year" name="copyrightYear" value={profileData.copyrightYear} onChange={handleProfileChange} placeholder="2026" /></div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="space-y-2"><label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Linkedin size={14}/> LinkedIn URL</label><input type="text" name="socialLinkedin" value={profileData.socialLinkedin} onChange={handleProfileChange} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="https://..." /></div><div className="space-y-2"><label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Globe size={14}/> Behance URL</label><input type="text" name="socialBehance" value={profileData.socialBehance} onChange={handleProfileChange} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="https://..." /></div><div className="space-y-2"><label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Instagram size={14}/> Instagram URL</label><input type="text" name="socialInstagram" value={profileData.socialInstagram} onChange={handleProfileChange} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="https://..." /></div></div>
                            </section>

                            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100"><div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600"><Shield size={20} /></div><div><h3 className="font-bold text-lg text-gray-900">Admin Access</h3><p className="text-sm text-gray-500">Update login credentials</p></div></div>
                                <form onSubmit={handleUpdateCredentials} className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Mail size={14}/> New Admin Email</label><input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="new.admin@example.com" /></div><div className="space-y-2"><label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Key size={14}/> New Password</label><input type="text" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="New secure password" /></div></div><div className="flex justify-end"><motion.button type="submit" disabled={credStatus !== 'idle'} animate={credStatus} className={`relative px-6 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 overflow-hidden transition-colors ${credStatus === 'success' ? 'bg-green-500 shadow-green-500/30' : credStatus === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-black shadow-black/20 hover:bg-gray-800'}`}><AnimatePresence mode="popLayout" initial={false}>{credStatus === 'idle' && (<motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Update Credentials</span><Save size={18} /></motion.div>)}{credStatus === 'saving' && (<motion.div key="saving" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Updating...</span><Loader2 size={18} className="animate-spin" /></motion.div>)}{credStatus === 'success' && (<motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Updated!</span><Check size={18} /></motion.div>)}{credStatus === 'error' && (<motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Failed</span><AlertCircle size={18} /></motion.div>)}</AnimatePresence></motion.button></div></form>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>

      {/* ... Modals (ConfirmationModal etc) ... */}
       <AnimatePresence>
          {showCommentsModal && selectedProjectForComments && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCommentsModal(false)}>
                  <motion.div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                          <div><h3 className="font-bold text-xl text-gray-900">Manage Comments</h3><p className="text-sm text-gray-500">Project: {selectedProjectForComments.title}</p></div>
                          <button onClick={() => setShowCommentsModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                      </div>
                      <div className="overflow-y-auto p-6 flex-1 bg-white">
                          {!selectedProjectForComments.comments || selectedProjectForComments.comments.length === 0 ? (
                              <div className="text-center py-12 text-gray-400"><MessageCircle size={48} className="mx-auto mb-4 opacity-20" /><p>No comments on this project yet.</p></div>
                          ) : (
                              <div className="space-y-4">
                                  {(selectedProjectForComments.comments || []).slice().reverse().map((comment: any, idx: number) => (
                                      <div 
                                          key={idx} 
                                          className={`flex gap-4 p-4 border rounded-xl transition-colors group items-center ${!comment.read ? 'bg-blue-50 border-blue-200 cursor-pointer' : 'border-gray-100 hover:bg-gray-50'}`}
                                          onClick={() => handleMarkCommentRead(selectedProjectForComments.id, comment._id || comment.id)}
                                      >
                                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">{comment.author.charAt(0).toUpperCase()}</div>
                                          <div className="flex-1 min-w-0">
                                              <div className="flex justify-between items-start mb-1">
                                                  <h4 className={`font-bold text-sm ${!comment.read ? 'text-black' : 'text-gray-900'}`}>
                                                      {comment.author}
                                                      {!comment.read && <span className="ml-2 w-2 h-2 rounded-full bg-red-500 inline-block"></span>}
                                                  </h4>
                                                  <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                              </div>
                                              <p className="text-sm text-gray-600 leading-relaxed">{comment.text}</p>
                                          </div>
                                          <button onClick={(e) => { e.stopPropagation(); requestDeleteComment(comment._id || comment.id); }} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete Comment"><Trash2 size={18} /></button>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                      <div className="p-4 border-t border-gray-100 bg-gray-50 text-right"><button onClick={() => setShowCommentsModal(false)} className="px-6 py-2 bg-black text-white rounded-2xl hover:bg-gray-800 transition-colors text-sm font-medium">Done</button></div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
      <ConfirmationModal isOpen={!!commentToDelete} title="Delete Comment?" message="Are you sure you want to delete this comment permanently?" confirmText="Delete" isDangerous={true} onConfirm={confirmDeleteComment} onCancel={() => setCommentToDelete(null)} />
      <ConfirmationModal isOpen={!!logoToDelete} title="Delete Logo?" message="Are you sure you want to remove this client logo?" confirmText="Remove" isDangerous={true} onConfirm={confirmDeleteLogo} onCancel={() => setLogoToDelete(null)} />
      <ConfirmationModal isOpen={!!messageToDelete} title="Delete Message?" message="Are you sure you want to delete this contact message?" confirmText="Delete" isDangerous={true} onConfirm={confirmDeleteMessage} onCancel={() => setMessageToDelete(null)} />
      <ConfirmationModal isOpen={showBulkDeleteConfirm} title="Delete Selected Logos?" message={`Are you sure you want to delete ${selectedLogoIds.size} selected logos? This action cannot be undone.`} confirmText="Delete All" isDangerous={true} onConfirm={confirmBulkDeleteLogos} onCancel={() => setShowBulkDeleteConfirm(false)} />
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900"><AnimatedCounter value={value} /></h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
            {icon}
        </div>
    </div>
);

const Input = ({ label, name, value, onChange, placeholder }: any) => (
    <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 block">{label}</label>
        <input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"/>
    </div>
);

const ImageInput = ({ label, name, value, onChange, placeholder }: any) => {
    const [error, setError] = useState(false);
    useEffect(() => { setError(false); }, [value]);
    
    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-bold text-gray-700 block">{label}</label>}
            <div className="flex gap-3 items-center">
                <input 
                    type="text" 
                    name={name} 
                    value={value} 
                    onChange={onChange} 
                    placeholder={placeholder} 
                    className="flex-1 w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"
                />
                <AnimatePresence>
                    {value && !error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8, width: 0 }} 
                            animate={{ opacity: 1, scale: 1, width: 'auto' }} 
                            exit={{ opacity: 0, scale: 0.8, width: 0 }}
                            className="shrink-0"
                        >
                            <div className="relative w-16 h-[46px] bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center shadow-sm">
                                <div className="absolute inset-0 bg-gray-50"></div>
                                <img src={value} alt="Preview" className="relative z-10 h-full w-full object-contain" onError={() => setError(true)} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ExpandableMessage = ({ text, className }: { text: string, className?: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    // Use a character limit to determine if we SHOULD show the expand button
    const CHAR_LIMIT = 280; 
    const isLong = text.length > CHAR_LIMIT;

    return (
        <div className={className || "pl-0 md:pl-13 mt-2"}>
            <motion.div 
                initial={false}
                animate={{ 
                    height: isExpanded ? "auto" : (isLong ? 84 : "auto")
                }}
                style={{
                    maskImage: !isExpanded && isLong 
                        ? "linear-gradient(to bottom, black 60%, transparent 100%)" 
                        : "none",
                    WebkitMaskImage: !isExpanded && isLong 
                        ? "linear-gradient(to bottom, black 60%, transparent 100%)" 
                        : "none"
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }} // Smooth Material Design-like curve
                className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap overflow-hidden relative"
            >
                {text}
            </motion.div>
            
            {isLong && (
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    className="mt-3 text-xs font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-1 uppercase tracking-wider"
                >
                    {isExpanded ? (
                        <>Show Less <ChevronUp size={14} /></>
                    ) : (
                        <>Read Full Message <ChevronDown size={14} /></>
                    )}
                </button>
            )}
        </div>
    );
};

export default AdminDashboard;