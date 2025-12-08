import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useMotionValue, useSpring } from 'framer-motion';
import { LogOut, Plus, Save, Trash2, LayoutGrid, X, Edit2, MessageCircle, Heart, MessageSquare, Briefcase, User, Mail, Link as LinkIcon, Globe, Instagram, Linkedin, AlignLeft, Check, Loader2, AlertCircle, Home, LayoutDashboard, Key, Shield, Calendar, Sparkles, Filter, CheckSquare, Square, CornerDownRight, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, Utensils, ToggleLeft, ToggleRight, Clock, Repeat } from 'lucide-react';
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

// --- Helper Components ---

const StatCard = ({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) => (
   <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between transition-transform hover:scale-[1.02]">
       <div>
           <p className="text-xs font-semibold text-gray-500 mb-0.5 uppercase tracking-wide">{title}</p>
           <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
               <AnimatedCounter value={value} />
           </h3>
       </div>
       <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-700">
           {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 18 }) : icon}
       </div>
   </div>
);

const ExpandableMessage = ({ text, className = "" }: { text: string, className?: string }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = text.length > 120;
    
    return (
        <div className={className}>
            <p className={`text-sm leading-relaxed ${!expanded && isLong ? 'line-clamp-2' : ''}`}>
                {text}
            </p>
            {isLong && (
                <button 
                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                    className="text-xs font-bold mt-2 hover:underline text-blue-600 flex items-center gap-1"
                >
                    {expanded ? 'Show Less' : 'Read More'}
                </button>
            )}
        </div>
    );
};

const Input = ({ label, name, value, onChange, placeholder, type = "text" }: any) => (
    <div className="space-y-1.5">
        {label && <label className="text-xs font-bold text-gray-700 block uppercase tracking-wide">{label}</label>}
        <input 
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-all font-medium text-sm"
            placeholder={placeholder}
        />
    </div>
);

const ImageInput = ({ label, name, value, onChange, placeholder }: any) => (
    <div className="space-y-1.5">
        {label && <label className="text-xs font-bold text-gray-700 block uppercase tracking-wide">{label}</label>}
        <div className="flex gap-3">
            <input 
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                className="flex-1 px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-all font-medium text-sm"
                placeholder={placeholder || "https://..."}
            />
            {value && (
                <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0 relative group">
                    <img src={value} alt="Preview" className="w-full h-full object-cover" />
                </div>
            )}
        </div>
    </div>
);

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
            className="p-3 md:p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row items-center gap-4 group cursor-grab active:cursor-grabbing relative overflow-hidden bg-white"
        >
            <div className="flex items-center gap-3 w-full md:w-auto pointer-events-none">
                <motion.div 
                    variants={countVariants}
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full border shadow-sm flex items-center justify-center text-xs md:text-sm font-bold transition-colors"
                >
                    {index + 1}
                </motion.div>
                
                <div className="w-16 h-12 md:w-20 md:h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate text-sm md:text-base">{project.title}</h3>
                    <p className="text-xs text-gray-500 truncate">{project.category}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 ml-auto w-full md:w-auto justify-end">
                <div className="flex items-center gap-3 mr-auto md:mr-4 md:border-r border-gray-100 md:pr-4">
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500" title="Likes">
                        <Heart size={14} className={project.likes ? 'text-red-500 fill-red-500' : ''} /> 
                        {project.likes || 0}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500" title="Comments">
                        <MessageCircle size={14} className={project.comments?.length ? 'text-blue-500 fill-blue-500' : ''} /> 
                        {project.comments?.length || 0}
                    </div>
                </div>
                
                <button onPointerDown={(e) => e.stopPropagation()} onClick={onOpenComments} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><MessageSquare size={16} /></button>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={onEdit} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
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

  useEffect(() => {
    if (isDragging) return;
    const projectsChanged = JSON.stringify(projects) !== JSON.stringify(localProjects);
    if (projectsChanged) {
        setLocalProjects(projects);
    }
  }, [projects, isDragging]);

  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedProjectForComments, setSelectedProjectForComments] = useState<Project | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [newLogoName, setNewLogoName] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [isAddingLogo, setIsAddingLogo] = useState(false);
  const [logoToDelete, setLogoToDelete] = useState<string | null>(null);
  const [selectedLogoIds, setSelectedLogoIds] = useState<Set<string>>(new Set());
  const [isBulkDeletingLogos, setIsBulkDeletingLogos] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE_DATA);
  const [saveProfileStatus, setSaveProfileStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const [isTreatToggling, setIsTreatToggling] = useState(false);

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [credStatus, setCredStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  
  const [inboxTab, setInboxTab] = useState<'contact' | 'chat'>('contact');
  const [dateFilter, setDateFilter] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarDirection, setCalendarDirection] = useState(0);
  
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

  useEffect(() => {
    const fetchData = async () => {
      const logosData = await projectService.getClientLogos();
      setLogos(logosData);
      
      const pData = await projectService.getProfile();
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

  useEffect(() => {
    const pollInterval = setInterval(async () => {
        try {
            const msgs = await projectService.getMessages();
            setMessages(msgs);

            const logs = await projectService.getChatLogs();
            setChatLogs(logs);

            if (onRefreshRequests) {
                onRefreshRequests();
            }
            
            // Only update profile data from server if we are NOT on the profile tab
            // This prevents overwriting user input while editing
            if (activeTab !== 'profile') {
                const pData = await projectService.getProfile();
                if (pData) {
                    setProfileData(prev => ({...prev, ...pData}));
                }
            }

        } catch (error) {
            console.debug("Polling failed", error);
        }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [onRefreshRequests, activeTab]);

  useEffect(() => {
      setInboxPage(1);
  }, [inboxTab, dateFilter]);

  const stats = useMemo(() => {
    const totalLikes = projects.reduce((acc, curr) => acc + (curr.likes || 0), 0);
    const totalComments = projects.reduce((acc, curr) => acc + (curr.comments?.length || 0), 0);
    const allComments = projects.flatMap(p => (p.comments || []).map(c => ({...c, projectId: p.id, projectTitle: p.title}))).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { totalLikes, totalComments, allComments };
  }, [projects]);

  const unreadMessagesCount = useMemo(() => messages.filter(m => !m.read).length, [messages]);
  const unreadChatLogsCount = useMemo(() => chatLogs.filter(l => !l.read && l.role === 'user').length, [chatLogs]);
  const totalUnreadInbox = unreadMessagesCount + unreadChatLogsCount;

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
    return [...commentItems, ...messageItems].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
  }, [stats.allComments, messages]);

  const pairedChatLogs = useMemo(() => {
    const sorted = [...chatLogs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const pairs: any[] = [];
    let currentPair: { userMsg?: ChatLog, modelMsg?: ChatLog } | null = null;
    sorted.forEach((log) => {
        if (log.role === 'user') {
            if (currentPair && currentPair.userMsg && !currentPair.modelMsg) {
                 pairs.push({ id: currentPair.userMsg._id || Date.now().toString() + Math.random(), userMsg: currentPair.userMsg, createdAt: currentPair.userMsg.createdAt, read: !!currentPair.userMsg.read });
            }
            currentPair = { userMsg: log };
        } else if (log.role === 'model') {
            if (currentPair && currentPair.userMsg && !currentPair.modelMsg) {
                currentPair.modelMsg = log;
                pairs.push({ id: currentPair.userMsg._id || Date.now().toString() + Math.random(), userMsg: currentPair.userMsg, modelMsg: log, createdAt: currentPair.userMsg.createdAt, read: !!currentPair.userMsg.read });
                currentPair = null;
            } else {
                pairs.push({ id: log._id || Date.now().toString() + Math.random(), modelMsg: log, createdAt: log.createdAt, read: true });
            }
        }
    });
    if (currentPair) {
         pairs.push({ id: currentPair.userMsg?._id || Date.now().toString(), userMsg: currentPair.userMsg, modelMsg: currentPair.modelMsg, createdAt: currentPair.userMsg?.createdAt || new Date().toISOString(), read: !!currentPair.userMsg?.read });
    }
    return pairs;
  }, [chatLogs]);

  const processedInboxData = useMemo(() => {
    let data: any[] = inboxTab === 'contact' ? messages : pairedChatLogs;
    if (dateFilter) {
        data = data.filter(item => {
            const itemDate = new Date(item.createdAt);
            const itemDateStr = itemDate.toISOString().split('T')[0];
            return itemDateStr === dateFilter;
        });
    }
    return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [messages, pairedChatLogs, inboxTab, dateFilter]);

  const paginatedInboxData = useMemo(() => {
      const start = (inboxPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      return processedInboxData.slice(start, end);
  }, [processedInboxData, inboxPage]);

  const groupedInbox = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    paginatedInboxData.forEach(item => {
      const dateKey = new Date(item.createdAt).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(item);
    });
    return grouped;
  }, [paginatedInboxData]);
  
  const totalInboxPages = Math.ceil(processedInboxData.length / ITEMS_PER_PAGE) || 1;

  const resetForm = () => {
      setFormData({ title: '', category: '', image: '', description: '', role: '', year: new Date().getFullYear().toString(), client: '' });
      setGalleryUrls(['']);
      setEditingId(null);
  };

  const handleEditClick = (project: Project) => {
      setEditingId(project.id);
      setFormData({ ...project });
      setGalleryUrls(project.gallery && project.gallery.length > 0 ? project.gallery : ['']);
      setActiveTab('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProject: Project = {
        id: editingId || Date.now().toString(),
        title: formData.title || 'Untitled',
        category: formData.category || 'Uncategorized',
        image: formData.image || '',
        description: formData.description || '',
        role: formData.role || '',
        year: formData.year || new Date().getFullYear().toString(),
        client: formData.client || '',
        gallery: galleryUrls.filter(url => url.trim() !== ''),
        likes: editingId ? (projects.find(p => p.id === editingId)?.likes || 0) : 0,
        comments: editingId ? (projects.find(p => p.id === editingId)?.comments || []) : [],
        order: editingId ? (projects.find(p => p.id === editingId)?.order || 0) : 0
    };
    onSaveProject(finalProject);
    setActiveTab('list');
    resetForm();
  };

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => { setIsDragging(false); onReorderProjects(localProjects); };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleGalleryChange = (index: number, value: string) => { const newUrls = [...galleryUrls]; newUrls[index] = value; setGalleryUrls(newUrls); };
  const addGalleryField = () => setGalleryUrls([...galleryUrls, '']);
  const removeGalleryField = (index: number) => { const newUrls = galleryUrls.filter((_, i) => i !== index); setGalleryUrls(newUrls); };

  const handleMarkMessageRead = async (msg: ContactMessage) => {
      if (msg.read) return;
      setMessages(prev => prev.map(m => (m._id === msg._id || m.id === msg.id) ? { ...m, read: true } : m));
      try { await projectService.markMessageRead(msg._id || msg.id || ''); } catch (error) { console.error("Failed to mark message read"); }
  };
  const handleMarkChatRead = async (chatPair: any) => {
      if (chatPair.read) return;
      if (!chatPair.userMsg?._id) return;
      setChatLogs(prev => prev.map(l => l._id === chatPair.userMsg._id ? { ...l, read: true } : l));
      try { await projectService.markChatLogRead(chatPair.userMsg._id); } catch (error) { console.error("Failed to mark chat log read"); }
  };
  const handleMarkAllRead = async () => {
      setMessages(prev => prev.map(m => ({ ...m, read: true })));
      setChatLogs(prev => prev.map(l => ({ ...l, read: true })));
      try { await Promise.all([projectService.markAllMessagesRead(), projectService.markAllChatLogsRead()]); } catch (error) { console.error("Failed to mark all read"); }
  };
  const handleMarkCommentRead = async (projectId: string, commentId: string) => {
      const project = projects.find(p => p.id === projectId);
      const comment = project?.comments?.find(c => c._id === commentId || c.id === commentId);
      if (comment && !comment.read) {
          try { const updatedProject = await projectService.markCommentRead(projectId, commentId); onProjectUpdate(updatedProject); } catch (error) { console.error("Failed to mark comment read"); }
      }
  };
  
  const handleOpenComments = (project: Project) => { setSelectedProjectForComments(project); setShowCommentsModal(true); };
  const requestDeleteComment = (commentId: string) => setCommentToDelete(commentId);
  const confirmDeleteComment = async () => {
      if (!selectedProjectForComments || !commentToDelete) return;
      const commentId = commentToDelete;
      setCommentToDelete(null);
      try { const updatedProject = await projectService.deleteComment(selectedProjectForComments.id, commentId); onProjectUpdate(updatedProject); setSelectedProjectForComments(updatedProject); } catch (error) { alert("Failed to delete comment."); }
  };
  const handleAddLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogoUrl) return;
    setIsAddingLogo(true);
    try { const addedLogo = await projectService.addClientLogo(newLogoName || '', newLogoUrl); setLogos([addedLogo, ...logos]); setNewLogoName(''); setNewLogoUrl(''); } catch (error) { alert("Failed to add logo."); } finally { setIsAddingLogo(false); }
  };
  const confirmDeleteLogo = async () => {
    if (!logoToDelete) return;
    try { await projectService.deleteClientLogo(logoToDelete); setLogos(logos.filter(l => l._id !== logoToDelete)); setLogoToDelete(null); } catch (error) { alert("Failed to delete logo."); }
  };
  const toggleLogoSelection = (id: string) => { const newSet = new Set(selectedLogoIds); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); setSelectedLogoIds(newSet); };
  const toggleAllLogos = () => { if (selectedLogoIds.size === logos.length) setSelectedLogoIds(new Set()); else setSelectedLogoIds(new Set(logos.map(l => l._id || l.id || ''))); };
  const confirmBulkDeleteLogos = async () => {
      setIsBulkDeletingLogos(true);
      setShowBulkDeleteConfirm(false);
      try { const idsToDelete = Array.from(selectedLogoIds) as string[]; await projectService.deleteClientLogos(idsToDelete); setLogos(prev => prev.filter(l => !selectedLogoIds.has(l._id || l.id || ''))); setSelectedLogoIds(new Set()); } catch (error) { alert("Failed to delete selected logos."); } finally { setIsBulkDeletingLogos(false); }
  };
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setProfileData({ ...profileData, [e.target.name]: e.target.value }); };
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveProfileStatus('saving');
    try { const updatedProfile = await projectService.updateProfile(profileData); onProfileUpdate(updatedProfile); setSaveProfileStatus('success'); setTimeout(() => setSaveProfileStatus('idle'), 3000); } catch (error) { setSaveProfileStatus('error'); setTimeout(() => setSaveProfileStatus('idle'), 3000); }
  };
  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) return;
    setCredStatus('saving');
    try { await projectService.updateAdminCredentials(adminEmail, adminPassword); setCredStatus('success'); setAdminEmail(''); setAdminPassword(''); setTimeout(() => setCredStatus('idle'), 3000); } catch (error) { setCredStatus('error'); setTimeout(() => setCredStatus('idle'), 3000); }
  };
  const confirmDeleteMessage = async () => {
      if (!messageToDelete) return;
      try { await projectService.deleteMessage(messageToDelete); setMessages(messages.filter(m => (m._id || m.id) !== messageToDelete)); setMessageToDelete(null); } catch (error) { alert("Failed to delete message."); }
  };

  const handleTreatToggle = async () => {
      const newValue = !profileData.showTreatModal;
      setIsTreatToggling(true);
      setProfileData(prev => ({ ...prev, showTreatModal: newValue }));
      try {
          const updatedProfile = await projectService.updateProfile({ ...profileData, showTreatModal: newValue });
          onProfileUpdate(updatedProfile);
      } catch (error) {
          console.error("Failed to toggle treat modal");
          setProfileData(prev => ({ ...prev, showTreatModal: !newValue }));
      } finally {
          setIsTreatToggling(false);
      }
  };

  const handlePrevMonth = () => { setCalendarDirection(-1); setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)); };
  const handleNextMonth = () => { setCalendarDirection(1); setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)); };
  const handlePrevYear = () => { setCalendarDirection(-1); setCalendarMonth(new Date(calendarMonth.getFullYear() - 1, calendarMonth.getMonth(), 1)); };
  const handleNextYear = () => { setCalendarDirection(1); setCalendarMonth(new Date(calendarMonth.getFullYear() + 1, calendarMonth.getMonth(), 1)); };
  const handleDateClick = (day: number) => {
    const selectedDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const year = selectedDate.getFullYear(); const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); const d = String(selectedDate.getDate()).padStart(2, '0');
    setDateFilter(`${year}-${month}-${d}`); setShowDatePicker(false);
  };
  const calendarVariants = { enter: (direction: number) => ({ x: direction > 0 ? 20 : -20, opacity: 0, }), center: { x: 0, opacity: 1, }, exit: (direction: number) => ({ x: direction < 0 ? 20 : -20, opacity: 0, }), };
  const renderCalendar = () => {
    const year = calendarMonth.getFullYear(); const month = calendarMonth.getMonth(); const daysInMonth = new Date(year, month + 1, 0).getDate(); const firstDay = new Date(year, month, 1).getDay();
    const days = []; for (let i = 0; i < firstDay; i++) { days.push(<div key={`empty-${i}`} className="w-8 h-8 sm:w-9 sm:h-9" />); }
    for (let i = 1; i <= daysInMonth; i++) { const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`; const isSelected = dateFilter === dateStr; const isToday = new Date().toDateString() === new Date(year, month, i).toDateString(); days.push(<button key={i} onClick={(e) => { e.stopPropagation(); handleDateClick(i); }} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 select-none cursor-pointer ${isSelected ? 'bg-black text-white shadow-md transform scale-105' : 'text-gray-700 hover:bg-gray-200 hover:font-bold'} ${isToday && !isSelected ? 'text-blue-600 font-bold bg-blue-50' : ''}`}>{i}</button>); }
    return days;
  };

  const getTabClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border ${isActive ? 'bg-white border-gray-200 shadow-sm text-gray-900 font-bold' : 'border-transparent text-gray-500 hover:bg-white/50 hover:text-gray-900 font-medium'}`;
  };

  const CustomYearSelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
      const [isOpen, setIsOpen] = useState(false); const containerRef = useRef<HTMLDivElement>(null);
      useEffect(() => { const handleClickOutside = (event: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(event.target as Node)) { setIsOpen(false); } }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
      const currentYear = new Date().getFullYear(); const years = Array.from({ length: currentYear - 2010 + 3 }, (_, i) => currentYear + 2 - i);
      return (<div className="space-y-1.5 relative" ref={containerRef}><label className="text-xs font-bold text-gray-700 block uppercase tracking-wide">Year</label><button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-all font-medium text-left flex justify-between items-center group hover:border-gray-400 text-sm"><span>{value || 'Select Year'}</span><ChevronDown size={16} className={`transition-transform duration-300 text-gray-500 group-hover:text-black ${isOpen ? 'rotate-180' : ''}`} /></button><AnimatePresence>{isOpen && (<motion.div initial={{ opacity: 0, y: -5, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.98 }} transition={{ duration: 0.2, ease: "easeOut" }} className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 scrollbar-hide">{years.map(y => (<button key={y} type="button" onClick={() => { onChange(y.toString()); setIsOpen(false); }} className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl ${value === y.toString() ? 'bg-gray-50 font-bold text-black' : 'text-gray-600'}`}>{y}</button>))}</motion.div>)}</AnimatePresence></div>);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-aeonik">
      
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
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
                <span className="hidden md:inline">Logout</span>
            </button>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 flex-1 pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="hidden md:flex w-64 flex-col gap-2 shrink-0 sticky top-24">
                <button onClick={() => { setActiveTab('overview'); resetForm(); }} className={getTabClass('overview')}><LayoutDashboard size={18} />Overview</button>
                <button onClick={() => { setActiveTab('inbox'); resetForm(); }} className={getTabClass('inbox')}><Mail size={18} />Inbox{totalUnreadInbox > 0 && (<span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{totalUnreadInbox}</span>)}</button>
                <button onClick={() => { setActiveTab('list'); resetForm(); }} className={getTabClass('list')}><LayoutGrid size={18} />All Projects<span className="ml-auto bg-gray-100 text-gray-900 text-xs px-2 py-0.5 rounded-full font-bold">{projects.length}</span></button>
                <button onClick={() => { setActiveTab('form'); resetForm(); }} className={getTabClass('form')}><Plus size={18} />Add New Project</button>
                <button onClick={() => { setActiveTab('logos'); resetForm(); }} className={getTabClass('logos')}><Briefcase size={18} />Client Logos</button>
                <button onClick={() => { setActiveTab('profile'); resetForm(); }} className={getTabClass('profile')}><User size={18} />Edit Profile</button>
            </div>

            <div className="flex-1 w-full min-w-0">
                <AnimatePresence mode="wait">
                    
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 md:space-y-8">
                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                               <StatCard title="Total Likes" value={stats.totalLikes} icon={<Heart className="text-red-500" />} />
                               <StatCard title="Total Comments" value={stats.totalComments} icon={<MessageCircle className="text-blue-500" />} />
                               <StatCard title="Messages" value={messages.length + chatLogs.length} icon={<Mail className="text-purple-500" />} />
                               <StatCard title="Projects" value={projects.length} icon={<LayoutGrid className="text-black" />} />
                               
                               {/* Compact Treat Toggle integrated into grid */}
                               <div className={`p-4 rounded-xl shadow-sm border transition-all duration-300 flex flex-col justify-between cursor-pointer h-full ${profileData.showTreatModal ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`} onClick={handleTreatToggle}>
                                   <div className="flex justify-between items-start mb-2">
                                       <p className={`text-xs font-semibold uppercase tracking-wide ${profileData.showTreatModal ? 'text-orange-600' : 'text-gray-500'}`}>Treat Mode</p>
                                       <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${profileData.showTreatModal ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                                           <Utensils size={14} />
                                       </div>
                                   </div>
                                   <h3 className={`text-lg font-bold flex items-center gap-2 ${profileData.showTreatModal ? 'text-orange-900' : 'text-gray-900'}`}>
                                       {profileData.showTreatModal ? 'Active' : 'Off'}
                                       {isTreatToggling && <Loader2 size={14} className="animate-spin text-gray-400" />}
                                   </h3>
                               </div>
                           </div>

                           <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-sm">
                               <div className="flex items-center gap-3 mb-6"><div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white"><Sparkles size={16} /></div><div><h3 className="text-base font-bold text-gray-900">Recent Activity</h3></div></div>
                               <div className="space-y-4">
                                   {recentActivity.length > 0 ? (
                                       recentActivity.map((item) => (
                                           <div 
                                                key={item.id} 
                                                className={`flex gap-3 items-start group p-2 rounded-lg transition-colors ${!item.read ? 'bg-blue-50/50 cursor-pointer' : ''}`}
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
                                               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors ${item.type === 'comment' ? 'bg-blue-50 text-blue-600 border-blue-100 group-hover:border-blue-200 group-hover:bg-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100 group-hover:border-purple-200 group-hover:bg-purple-100'}`}>{item.type === 'comment' ? <MessageCircle size={14} /> : <Mail size={14} />}</div>
                                               <div className="flex-1 min-w-0">
                                                   <div className="flex justify-between items-start mb-0.5">
                                                       <h4 className={`font-bold text-xs md:text-sm ${!item.read ? 'text-black' : 'text-gray-900'}`}>
                                                           {item.author}
                                                           {!item.read && <span className="ml-1.5 inline-block w-1.5 h-1.5 bg-red-500 rounded-full" title="New"></span>}
                                                       </h4>
                                                       <span className="text-[10px] text-gray-400 font-mono">{item.date.toLocaleDateString()}</span>
                                                   </div>
                                                   <p className="text-[10px] md:text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">{item.type === 'comment' ? <MessageCircle size={10}/> : <Mail size={10}/>}{item.subtext}</p>
                                                   <ExpandableMessage 
                                                        text={item.text} 
                                                        className={`p-3 rounded-lg text-xs md:text-sm text-gray-600 transition-colors mt-1 ${!item.read ? 'bg-white border border-blue-100' : 'bg-gray-50 group-hover:bg-gray-100'}`}
                                                   />
                                               </div>
                                           </div>
                                       ))
                                   ) : (<div className="text-center py-8 text-gray-400 text-sm"><p>No recent activity found.</p></div>)}
                               </div>
                           </div>
                        </motion.div>
                    )}

                    {/* ... (Inbox, List, Form, Logos tabs remain unchanged) ... */}
                    {activeTab === 'inbox' && (
                        <motion.div key="inbox" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6 max-w-4xl mx-auto flex flex-col min-h-[500px]">
                           {/* Inbox Content (Same as previous) */}
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">Inbox<span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{processedInboxData.length} items</span></h2>
                                <motion.div layout className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                    <motion.div layout className="bg-gray-100 p-1 rounded-xl flex items-center relative gap-1 w-full sm:w-auto">
                                        <button onClick={() => setInboxTab('contact')} className={`relative flex-1 px-4 py-1.5 text-xs font-bold transition-colors z-10 rounded-lg whitespace-nowrap min-w-[100px] flex items-center justify-center gap-2 ${inboxTab === 'contact' ? 'text-black' : 'text-gray-500'}`}>Contact Form{unreadMessagesCount > 0 && <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>}{inboxTab === 'contact' && (<motion.div layoutId="inbox-tab" className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10 border border-black/5" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />)}</button>
                                        <button onClick={() => setInboxTab('chat')} className={`relative flex-1 px-4 py-1.5 text-xs font-bold transition-colors z-10 rounded-lg whitespace-nowrap min-w-[100px] flex items-center justify-center gap-2 ${inboxTab === 'chat' ? 'text-black' : 'text-gray-500'}`}>Chatbot{unreadChatLogsCount > 0 && <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>}{inboxTab === 'chat' && (<motion.div layoutId="inbox-tab" className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10 border border-black/5" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />)}</button>
                                    </motion.div>
                                    <motion.div layout className="relative flex items-center gap-2 w-full sm:w-auto">
                                        <AnimatePresence mode="popLayout">
                                            {totalUnreadInbox > 0 && (
                                                <motion.button layout initial={{ opacity: 0, scale: 0.9, width: 0 }} animate={{ opacity: 1, scale: 1, width: "auto" }} exit={{ opacity: 0, scale: 0.9, width: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} onClick={handleMarkAllRead} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-colors text-xs font-medium flex items-center gap-2 whitespace-nowrap shadow-sm overflow-hidden"><CheckSquare size={14} className="shrink-0" /><span className="whitespace-nowrap">Mark All Read</span></motion.button>
                                            )}
                                        </AnimatePresence>
                                        <motion.button layout className={`relative cursor-pointer border rounded-xl px-3 py-1.5 flex items-center gap-2 transition-all w-full sm:w-auto justify-center ${dateFilter ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:border-gray-400 text-gray-600'}`} onClick={() => setShowDatePicker(!showDatePicker)}><Filter size={12} className={dateFilter ? "text-white" : "text-gray-400"} /><span className="text-xs font-medium whitespace-nowrap">{dateFilter ? new Date(dateFilter).toLocaleDateString() : 'Filter'}</span>{dateFilter && (<span onClick={(e) => { e.stopPropagation(); setDateFilter(''); }} className="ml-1 w-4 h-4 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"><X size={10} /></span>)}</motion.button>
                                        <AnimatePresence>{showDatePicker && (<motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50 w-[280px] sm:w-[320px]"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-gray-900">Jump to date</h3><button onClick={() => setShowDatePicker(false)} className="text-gray-400 hover:text-black"><X size={20} /></button></div><div className="flex items-center justify-between mb-4 px-1"><div className="flex gap-1"><button onClick={handlePrevYear} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"><ChevronsLeft size={18} /></button><button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"><ChevronLeft size={18} /></button></div><span className="font-bold text-gray-900 text-sm sm:text-base whitespace-nowrap">{calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span><div className="flex gap-1"><button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"><ChevronRight size={18} /></button><button onClick={handleNextYear} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"><ChevronsRight size={18} /></button></div></div><div className="grid grid-cols-7 gap-1 mb-2 text-center">{['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (<div key={d} className="text-xs font-bold text-gray-400">{d}</div>))}</div><div className="overflow-hidden min-h-[200px]"><AnimatePresence mode="popLayout" custom={calendarDirection}><motion.div key={calendarMonth.toISOString()} custom={calendarDirection} variants={calendarVariants} initial="enter" animate="center" exit="exit" transition={{ type: "tween", duration: 0.2 }} className="grid grid-cols-7 gap-1 sm:gap-2 place-items-center">{renderCalendar()}</motion.div></AnimatePresence></div></motion.div>)}</AnimatePresence>
                                    </motion.div>
                                </motion.div>
                           </div>
                           <div className="flex-1">
                                {Object.keys(groupedInbox).length === 0 ? (<div className="text-center py-20 text-gray-400 flex flex-col items-center"><Mail size={48} className="mb-4 opacity-10" /><p className="text-sm">No messages found.</p></div>) : (<AnimatePresence mode="wait"><motion.div key={`${inboxTab}-${inboxPage}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-6">{Object.entries(groupedInbox).map(([date, items]) => (<div key={date}><div className="flex items-center gap-4 mb-3"><div className="h-[1px] bg-gray-100 flex-1"></div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400"><Calendar size={12} /> {date}</div><div className="h-[1px] bg-gray-100 flex-1"></div></div><div className="space-y-3">{(items as any[]).map((item: any, idx: number) => (<div key={`${item.id}-${idx}`}>{item.email ? (<div onClick={() => handleMarkMessageRead(item)} className={`p-4 rounded-xl border hover:shadow-md transition-all relative group cursor-pointer ${item.read ? 'bg-white border-gray-200' : 'bg-blue-50/50 border-blue-200 shadow-sm'}`}><button onClick={(e) => { e.stopPropagation(); setMessageToDelete(item._id || item.id); }} className="md:hidden absolute top-3 right-3 p-2 text-gray-400 hover:text-red-500 active:bg-red-50 rounded-full transition-all z-10"><Trash2 size={16} /></button><div className="flex justify-between items-start mb-2 pr-10 md:pr-0 relative"><div className="flex items-center gap-3 overflow-hidden"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-blue-600 shrink-0 ${item.read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100'}`}><Mail size={16} /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className={`font-bold truncate text-sm ${item.read ? 'text-gray-700' : 'text-black'}`}>{item.name}</h3>{!item.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}</div><a href={`mailto:${item.email}`} onClick={e => e.stopPropagation()} className="text-[10px] md:text-xs text-blue-600 hover:underline break-all block">{item.email}</a></div></div><div className="flex items-center gap-3 shrink-0"><span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span><button onClick={(e) => { e.stopPropagation(); setMessageToDelete(item._id || item.id); }} className="hidden md:block p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all -mr-1" title="Delete Message"><Trash2 size={16} /></button></div></div><ExpandableMessage text={item.message} className="pl-0 md:pl-11" /></div>) : (<div onClick={() => handleMarkChatRead(item)} className={`rounded-xl border p-4 space-y-3 cursor-pointer transition-colors ${item.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50/30 border-blue-200 shadow-sm'}`}><div className="flex justify-between items-center text-[10px] text-gray-400 mb-1 px-1"><span className="uppercase font-bold tracking-wider flex items-center gap-1">Log {!item.read && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}</span><span className="font-mono">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>{item.userMsg && (<div className="flex justify-end mb-2"><div className="flex items-end gap-2 max-w-[90%] flex-row-reverse"><div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${item.read ? 'bg-gray-300 text-white' : 'bg-black text-white'}`}><User size={12} /></div><div className={`border px-3 py-1.5 rounded-xl rounded-tr-sm shadow-sm text-xs md:text-sm ${item.read ? 'bg-white border-gray-200 text-gray-600' : 'bg-white border-blue-100 text-gray-900 font-medium'}`}>{item.userMsg.text}</div></div></div>)}{item.userMsg && item.modelMsg && (<div className="flex justify-start pl-8 -my-1 opacity-20"><CornerDownRight size={14} /></div>)}{item.modelMsg && (<div className="flex justify-start"><div className="flex items-start gap-2 max-w-[90%]"><div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-1"><Sparkles size={12} /></div><div className="bg-white border border-purple-100 px-3 py-1.5 rounded-xl rounded-tl-sm shadow-sm text-xs md:text-sm text-gray-700">{item.modelMsg.text}</div></div></div>)}</div>)}</div>))}</div></div>))} </motion.div></AnimatePresence>)}
                           </div>
                           {totalInboxPages > 1 && (<div className="mt-6 border-t border-gray-100 pt-4 flex justify-between items-center"><span className="text-[10px] font-medium text-gray-400">Page {inboxPage} of {totalInboxPages}</span><div className="flex items-center gap-2"><button onClick={() => setInboxPage(p => Math.max(1, p - 1))} disabled={inboxPage === 1} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"><ChevronLeft size={14} /></button><span className="text-xs font-bold text-gray-900 px-1 min-w-[30px] text-center">{inboxPage}</span><button onClick={() => setInboxPage(p => Math.min(totalInboxPages, p + 1))} disabled={inboxPage === totalInboxPages} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"><ChevronRight size={14} /></button></div></div>)}
                        </motion.div>
                    )}

                    {activeTab === 'list' && (
                        <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-900">Project Order</h2><p className="text-xs text-gray-500">Drag to reorder.</p></div>
                            <Reorder.Group axis="y" values={localProjects} onReorder={setLocalProjects} className="flex flex-col gap-3" layoutScroll>
                                {localProjects.map((project, index) => (<SortableProjectItem key={project.id} project={project} index={index} onEdit={() => handleEditClick(project)} onDelete={() => onDeleteProject(project.id)} onOpenComments={() => handleOpenComments(project)} onDragStart={handleDragStart} onDragEnd={handleDragEnd} />))}
                            </Reorder.Group>
                        </motion.div>
                    )}

                    {activeTab === 'form' && (
                        <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 max-w-3xl mx-auto">
                            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Project' : 'Upload Details'}</h2><button onClick={() => { setActiveTab('list'); resetForm(); }} className="text-gray-500 hover:text-black"><X size={20} /></button></div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input label="Title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Project Name" /><Input label="Category" name="category" value={formData.category} onChange={handleInputChange} placeholder="Design Field" /></div>
                                <ImageInput label="Cover Image" name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." />
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center"><label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Gallery</label><button type="button" onClick={addGalleryField} className="text-[10px] bg-black text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors flex items-center gap-1"><Plus size={12} /> Add</button></div>
                                    <div className="space-y-2">{galleryUrls.map((url, index) => (<div key={index} className="flex gap-2 items-start"><div className="flex-1"><ImageInput value={url} onChange={(e: any) => handleGalleryChange(index, e.target.value)} placeholder={`Image ${index + 1}`} /></div>{galleryUrls.length > 1 && (<button type="button" onClick={() => removeGalleryField(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-0.5"><Trash2 size={16} /></button>)}</div>))}</div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input label="Role" name="role" value={formData.role} onChange={handleInputChange} placeholder="My Role" />
                                    <Input label="Client" name="client" value={formData.client} onChange={handleInputChange} placeholder="Client Name" />
                                    <CustomYearSelect value={formData.year || ''} onChange={(val) => handleInputChange({ target: { name: 'year', value: val } } as any)} />
                                </div>
                                <div className="space-y-1.5"><label className="text-xs font-bold text-gray-700 block uppercase tracking-wide">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none text-sm" placeholder="Project details..."/></div>
                                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3"><button type="button" onClick={() => { setActiveTab('list'); resetForm(); }} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg text-sm">Cancel</button><button type="submit" className="px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm"><Save size={16} />{editingId ? 'Update' : 'Save'}</button></div>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'logos' && (
                        <motion.div key="logos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 max-w-4xl mx-auto">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Manage Logos</h2>
                            <div className="bg-gray-50 p-5 rounded-lg mb-6 border border-gray-200"><h3 className="font-bold text-sm mb-3">Add Logo</h3><form onSubmit={handleAddLogo} className="flex flex-col md:flex-row gap-3 items-end"><div className="flex-1 w-full"><Input label="Name" name="newLogoName" value={newLogoName} onChange={(e: any) => setNewLogoName(e.target.value)} placeholder="Optional" /></div><div className="flex-[2] w-full"><Input label="URL" name="newLogoUrl" value={newLogoUrl} onChange={(e: any) => setNewLogoUrl(e.target.value)} placeholder="https://..." /></div><button type="submit" disabled={isAddingLogo} className="px-5 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 h-[42px] text-sm">{isAddingLogo ? '...' : 'Add'}</button></form></div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-100"><div className="flex items-center justify-between w-full sm:w-auto gap-4"><span className="text-xs font-bold text-gray-500 whitespace-nowrap">{logos.length} Items</span><button onClick={toggleAllLogos} className="text-xs font-medium text-gray-900 hover:text-black flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 transition-colors"><div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${selectedLogoIds.size === logos.length && logos.length > 0 ? 'bg-black border-black text-white' : 'border-gray-300 bg-white'}`}>{selectedLogoIds.size === logos.length && logos.length > 0 && <Check size={10} strokeWidth={3} />}</div>Select All</button></div><AnimatePresence>{selectedLogoIds.size > 0 && (<motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} onClick={() => setShowBulkDeleteConfirm(true)} className="w-full sm:w-auto text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm"><Trash2 size={14} /> Delete ({selectedLogoIds.size})</motion.button>)}</AnimatePresence></div>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">{logos.map((logo) => { const id = logo._id || logo.id || ''; const isSelected = selectedLogoIds.has(id); return (<div key={id} onClick={() => toggleLogoSelection(id)} className={`relative group border rounded-xl p-3 flex flex-col items-center justify-center h-28 transition-all cursor-pointer select-none ${isSelected ? 'border-black ring-1 ring-black bg-gray-50/50' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}><div className="absolute top-2 left-2 z-10"><div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-transparent group-hover:border-gray-300'}`}><Check size={12} strokeWidth={3} /></div></div><button onClick={(e) => { e.stopPropagation(); setLogoToDelete(id); }} className={`absolute top-1 right-1 p-1.5 rounded-full transition-all z-20 ${isSelected || 'md:opacity-0 md:group-hover:opacity-100'} ${isSelected ? 'bg-white text-red-500 shadow-sm' : 'bg-red-50 text-red-500'} hover:bg-red-100`} title="Delete"><Trash2 size={12} /></button><div className="flex-1 w-full flex items-center justify-center p-1"><img src={logo.url} alt={logo.name} className="max-w-full max-h-full object-contain pointer-events-none" loading="lazy" /></div>{logo.name && (<div className="w-full text-center"><span className="text-[10px] font-medium text-gray-500 truncate block px-1 py-0.5 bg-gray-100/50 rounded">{logo.name}</span></div>)}</div>); })}</div>
                            {logos.length === 0 && (<p className="text-center text-gray-400 py-8 text-sm">No logos.</p>)}
                        </motion.div>
                    )}

                    {activeTab === 'profile' && (
                        <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto space-y-6 pb-12">
                             <div className="flex justify-between items-center mb-2 sticky top-16 z-20 bg-gray-50/80 backdrop-blur-sm py-3"><h2 className="text-xl font-bold text-gray-900">Profile & Content</h2><motion.button onClick={handleSaveProfile} disabled={saveProfileStatus !== 'idle'} animate={saveProfileStatus} className={`relative px-5 py-2 rounded-lg font-bold text-white shadow-lg flex items-center gap-2 overflow-hidden transition-colors text-sm ${saveProfileStatus === 'success' ? 'bg-green-500 shadow-green-500/30' : saveProfileStatus === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-black shadow-black/20 hover:bg-gray-800'}`}><AnimatePresence mode="popLayout" initial={false}>{saveProfileStatus === 'idle' && (<motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Save</span><Save size={16} /></motion.div>)}{saveProfileStatus === 'saving' && (<motion.div key="saving" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Saving...</span><Loader2 size={16} className="animate-spin" /></motion.div>)}{saveProfileStatus === 'success' && (<motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Saved!</span><Check size={16} /></motion.div>)}{saveProfileStatus === 'error' && (<motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Failed</span><AlertCircle size={16} /></motion.div>)}</AnimatePresence></motion.button></div>
                            
                            {/* Treat Modal Configuration Section */}
                            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                        <Utensils size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-gray-900">Treat Modal Settings</h3>
                                        <p className="text-xs text-gray-500">Configure the popup behavior and content</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                    <Input label="Popup Title" name="treatTitle" value={profileData.treatTitle} onChange={handleProfileChange} placeholder="e.g. Treat Pending!" />
                                    <Input label="Button Text" name="treatButtonText" value={profileData.treatButtonText} onChange={handleProfileChange} placeholder="e.g. Okay!" />
                                    <ImageInput label="Image URL" name="treatImage" value={profileData.treatImage} onChange={handleProfileChange} placeholder="https://..." />
                                </div>

                                <div className="space-y-1.5 mb-4">
                                    <label className="text-xs font-bold text-gray-700 block uppercase tracking-wide">Message Content</label>
                                    <textarea name="treatMessage" value={profileData.treatMessage} onChange={handleProfileChange} rows={2} className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none text-sm" placeholder="Message to display..."/>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><Clock size={12}/> Interval (Sec)</label>
                                        <input type="number" name="treatInterval" value={profileData.treatInterval} onChange={handleProfileChange} className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="5" min="1" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><Repeat size={12}/> Max Session Shows</label>
                                        <input type="number" name="treatMaxShowCount" value={profileData.treatMaxShowCount} onChange={handleProfileChange} className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="3" min="1" />
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100"><div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><User size={16} /></div><div><h3 className="font-bold text-base text-gray-900">Personal Identity</h3></div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><Input label="Full Name" name="name" value={profileData.name} onChange={handleProfileChange} placeholder="e.g. Nobel" /><Input label="Job Title" name="role" value={profileData.role} onChange={handleProfileChange} placeholder="e.g. UX & UI Designer" /></div>
                                <div className="space-y-1.5"><label className="text-xs font-bold text-gray-700 block uppercase tracking-wide">Short Bio</label><textarea name="bio" value={profileData.bio} onChange={handleProfileChange} rows={3} className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none text-sm" placeholder="Bio..."/></div>
                            </section>

                            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100"><div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><LayoutGrid size={16} /></div><div><h3 className="font-bold text-base text-gray-900">Hero Section</h3></div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ImageInput label="Home Logo URL" name="homeLogo" value={profileData.homeLogo} onChange={handleProfileChange} placeholder="Nav logo URL" />
                                    <ImageInput label="Hero Image URL" name="heroImage" value={profileData.heroImage} onChange={handleProfileChange} placeholder="Main portrait URL" />
                                    <Input label="Total Projects Count" name="totalProjects" value={profileData.totalProjects} onChange={handleProfileChange} placeholder="e.g. 20" />
                                    <Input label="Years Experience" name="yearsExperience" value={profileData.yearsExperience} onChange={handleProfileChange} placeholder="e.g. 2" />
                                </div>
                            </section>

                            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100"><div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><AlignLeft size={16} /></div><div><h3 className="font-bold text-base text-gray-900">About Content</h3></div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <ImageInput label="Portrait Image (Vertical)" name="aboutImage1" value={profileData.aboutImage1} onChange={handleProfileChange} placeholder="URL" />
                                    <ImageInput label="Landscape Image" name="aboutImage2" value={profileData.aboutImage2} onChange={handleProfileChange} placeholder="URL" />
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"><div className="md:col-span-1"><Input label="Stat Value" name="statsValue" value={profileData.statsValue} onChange={handleProfileChange} placeholder="e.g. 100" /></div><div className="md:col-span-2"><Input label="Stat Label" name="statsLabel" value={profileData.statsLabel} onChange={handleProfileChange} placeholder="e.g. User-focused screens..." /></div></div>
                                <div className="space-y-3"><Input label="Feature Bullet 1" name="feature1" value={profileData.feature1} onChange={handleProfileChange} placeholder="Feature 1..." /><Input label="Feature Bullet 2" name="feature2" value={profileData.feature2} onChange={handleProfileChange} placeholder="Feature 2..." /><Input label="Resume Link" name="resumeUrl" value={profileData.resumeUrl} onChange={handleProfileChange} placeholder="https://..." /></div>
                            </section>
                            
                            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100"><div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600"><LinkIcon size={16} /></div><div><h3 className="font-bold text-base text-gray-900">Contact & Socials</h3></div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><Input label="Contact Email" name="email" value={profileData.email} onChange={handleProfileChange} placeholder="email@example.com" /><Input label="Copyright Year" name="copyrightYear" value={profileData.copyrightYear} onChange={handleProfileChange} placeholder="2026" /></div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-1.5"><label className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><Linkedin size={12}/> LinkedIn</label><input type="text" name="socialLinkedin" value={profileData.socialLinkedin} onChange={handleProfileChange} className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="URL" /></div><div className="space-y-1.5"><label className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><Globe size={12}/> Behance</label><input type="text" name="socialBehance" value={profileData.socialBehance} onChange={handleProfileChange} className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="URL" /></div><div className="space-y-1.5"><label className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><Instagram size={12}/> Instagram</label><input type="text" name="socialInstagram" value={profileData.socialInstagram} onChange={handleProfileChange} className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="URL" /></div></div>
                            </section>

                            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100"><div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600"><Shield size={16} /></div><div><h3 className="font-bold text-base text-gray-900">Admin Access</h3></div></div>
                                <form onSubmit={handleUpdateCredentials} className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><Mail size={12}/> New Email</label><input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="new.admin@example.com" /></div><div className="space-y-1.5"><label className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><Key size={12}/> New Password</label><input type="text" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="New secure password" /></div></div><div className="flex justify-end"><motion.button type="submit" disabled={credStatus !== 'idle'} animate={credStatus} className={`relative px-5 py-2 rounded-lg font-bold text-white shadow-lg flex items-center gap-2 overflow-hidden transition-colors text-sm ${credStatus === 'success' ? 'bg-green-500 shadow-green-500/30' : credStatus === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-black shadow-black/20 hover:bg-gray-800'}`}><AnimatePresence mode="popLayout" initial={false}>{credStatus === 'idle' && (<motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Update</span><Save size={16} /></motion.div>)}{credStatus === 'saving' && (<motion.div key="saving" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Updating...</span><Loader2 size={16} className="animate-spin" /></motion.div>)}{credStatus === 'success' && (<motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Updated!</span><Check size={16} /></motion.div>)}{credStatus === 'error' && (<motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Failed</span><AlertCircle size={16} /></motion.div>)}</AnimatePresence></motion.button></div></form>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>

      {/* ... Modals (ConfirmationModal etc) - unchanged ... */}
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

export default AdminDashboard;