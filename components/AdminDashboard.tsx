import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { LogOut, Plus, Save, Trash2, LayoutGrid, X, Edit2, MessageCircle, Heart, MessageSquare, Briefcase, User, Mail, Link as LinkIcon, Globe, Instagram, Linkedin, AlignLeft, Check, Loader2, AlertCircle, Home, LayoutDashboard, Key, Shield, Calendar, Sparkles, Filter } from 'lucide-react';
import { Project, ClientLogo, ProfileData, ContactMessage, Comment, ChatLog } from '../types';
import { projectService } from '../services/projectService';
import ConfirmationModal from './ConfirmationModal';

interface AdminDashboardProps {
  projects: Project[];
  onSaveProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onReorderProjects: (projects: Project[]) => void;
  onProjectUpdate: (project: Project) => void;
  onProfileUpdate: (profile: ProfileData) => void;
  onLogout: () => void;
  homeLogo?: string;
}

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
    onDragEnd
}: {
    project: Project;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
    onOpenComments: () => void;
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
                <div className="hidden md:flex items-center gap-4 mr-4 border-r border-gray-100 pr-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500" title="Likes">
                        <Heart size={14} className={project.likes ? 'text-red-500 fill-red-500' : ''} /> 
                        {project.likes || 0}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500" title="Comments">
                        <MessageCircle size={14} className={project.comments?.length ? 'text-blue-500 fill-blue-500' : ''} /> 
                        {project.comments?.length || 0}
                    </div>
                </div>
                
                <button onPointerDown={(e) => e.stopPropagation()} onClick={onOpenComments} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium px-3"><MessageSquare size={16} /></button>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={onEdit} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium px-3"><Edit2 size={16} /> Edit</button>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium px-3"><Trash2 size={16} /> Delete</button>
            </div>
        </Reorder.Item>
    );
});

const AdminDashboard: React.FC<AdminDashboardProps> = ({ projects, onSaveProject, onDeleteProject, onReorderProjects, onProjectUpdate, onProfileUpdate, onLogout, homeLogo }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'list' | 'form' | 'logos' | 'profile' | 'inbox'>('overview');
  const [editingId, setEditingId] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for drag and drop
  const [localProjects, setLocalProjects] = useState(projects);

  // Sync local projects when parent projects change, BUT ONLY if there's a real difference.
  // This prevents jitter when optimistic updates from App.tsx come back down while local state is already correct.
  useEffect(() => {
    // Only update if the order or contents are actually different
    // We compare stringified versions to catch deep changes (content) or order changes
    const projectsChanged = JSON.stringify(projects) !== JSON.stringify(localProjects);
    
    if (projectsChanged) {
        setLocalProjects(projects);
    }
  }, [projects]);

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

  // Profile Management State
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    role: '',
    homeLogo: '',
    heroImage: '',
    totalProjects: '',
    yearsExperience: '',
    resumeUrl: '',
    bio: '',
    aboutImage1: '',
    aboutImage2: '',
    statsValue: '',
    statsLabel: '',
    feature1: '',
    feature2: '',
    socialLinkedin: '',
    socialBehance: '',
    socialInstagram: '',
    email: '',
    copyrightYear: ''
  });
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
    // Fetch logos when dashboard loads
    const fetchData = async () => {
      const logosData = await projectService.getClientLogos();
      setLogos(logosData);
      
      const pData = await projectService.getProfile();
      if (pData) setProfileData(pData);

      const msgs = await projectService.getMessages();
      setMessages(msgs);

      const logs = await projectService.getChatLogs();
      setChatLogs(logs);
    };
    fetchData();
  }, []);

  // --- Statistics Calculations ---
  const stats = useMemo(() => {
    const totalLikes = projects.reduce((acc, curr) => acc + (curr.likes || 0), 0);
    const totalComments = projects.reduce((acc, curr) => acc + (curr.comments?.length || 0), 0);
    
    // Flatten all comments for the feed
    const allComments = projects
        .flatMap(p => (p.comments || []).map(c => ({
            ...c,
            projectTitle: p.title
        })))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { totalLikes, totalComments, allComments };
  }, [projects]);

  // --- Inbox Grouping Logic ---
  const groupedInbox: Record<string, (ContactMessage | ChatLog)[]> = useMemo(() => {

    let data: any[] = [];
    
    // Select Source
    if (inboxTab === 'contact') {
        data = messages;
    } else {
        data = chatLogs;
    }

    // Apply Date Filter
    if (dateFilter) {
        // Adjust for timezone offset to ensure string matching works for "local" day
        const filterDateStr = new Date(dateFilter).toDateString();
        // Since input date is YYYY-MM-DD, parsing it as UTC might be off by a day depending on browser.
        // Simple string match on YYYY-MM-DD is safer for input type="date"
        
        data = data.filter(item => {
            const itemDate = new Date(item.createdAt);
            // Compare YYYY-MM-DD strings
            const itemDateStr = itemDate.toISOString().split('T')[0];
            return itemDateStr === dateFilter;
        });
    }

    // Sort by Date (Newest First)
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Group by Date string
    const grouped: Record<string, any[]> = {};
    data.forEach(item => {
      const dateKey = new Date(item.createdAt).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(item);
    });

    return grouped;
  }, [messages, chatLogs, inboxTab, dateFilter]);


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

  const handleDragEnd = () => {
     // Propagate reorder to parent
     onReorderProjects(localProjects);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      year: formData.year || '2024',
      client: formData.client || 'Personal',
      gallery: finalGallery,
      likes: formData.likes || 0,
      comments: formData.comments || []
    };

    onSaveProject(projectToSave);
    setActiveTab('list');
    resetForm();
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
    if (!newLogoName || !newLogoUrl) return;

    setIsAddingLogo(true);
    try {
      const addedLogo = await projectService.addClientLogo(newLogoName, newLogoUrl);
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

  const getTabClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border ${
      isActive 
        ? 'bg-white border-gray-200 shadow-sm text-gray-900 font-bold' 
        : 'border-transparent text-gray-500 hover:bg-white/50 hover:text-gray-900 font-medium'
    }`;
  };

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

      <div className="container mx-auto px-6 py-8 flex-1">
        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
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
                    {(messages.length > 0 || chatLogs.length > 0) && (
                         <span className="ml-auto bg-gray-100 text-gray-900 text-xs px-2 py-0.5 rounded-full font-bold">{messages.length + chatLogs.length}</span>
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
                    
                    {activeTab === 'overview' && (
                        <motion.div 
                            key="overview"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                           {/* Stats Cards */}
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                               <StatCard 
                                 title="Total Likes" 
                                 value={stats.totalLikes.toString()} 
                                 icon={<Heart size={20} className="text-red-500" />} 
                               />
                               <StatCard 
                                 title="Total Comments" 
                                 value={stats.totalComments.toString()} 
                                 icon={<MessageCircle size={20} className="text-blue-500" />} 
                               />
                               <StatCard 
                                 title="Total Messages" 
                                 value={(messages.length + chatLogs.length).toString()} 
                                 icon={<Mail size={20} className="text-purple-500" />} 
                               />
                               <StatCard 
                                 title="Total Projects" 
                                 value={projects.length.toString()} 
                                 icon={<LayoutGrid size={20} className="text-black" />} 
                               />
                           </div>

                           {/* Feed Columns */}
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
                               {/* Comments Feed */}
                               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
                                   <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                       <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                           <MessageSquare size={18} /> Recent Comments
                                       </h3>
                                   </div>
                                   <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                       {stats.allComments.length === 0 ? (
                                           <div className="text-center text-gray-400 py-12">No comments yet.</div>
                                       ) : (
                                           stats.allComments.map((comment, idx) => (
                                               <div key={`${comment.id}-${idx}`} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                   <div className="flex justify-between items-start mb-2">
                                                       <div>
                                                           <span className="font-bold text-sm text-gray-900">{comment.author}</span>
                                                           <span className="text-xs text-gray-500 mx-2">•</span>
                                                           <span className="text-xs text-gray-500 font-medium">on {comment.projectTitle}</span>
                                                       </div>
                                                       <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                   </div>
                                                   <p className="text-sm text-gray-600 leading-relaxed">{comment.text}</p>
                                               </div>
                                           ))
                                       )}
                                   </div>
                               </div>

                               {/* Messages Feed */}
                               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
                                   <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                       <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                           <Mail size={18} /> Recent Messages
                                       </h3>
                                   </div>
                                   <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                       {messages.length === 0 ? (
                                           <div className="text-center text-gray-400 py-12">No messages received yet.</div>
                                       ) : (
                                           messages.slice(0, 10).map((msg) => (
                                               <div key={msg._id || msg.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                   <div className="flex justify-between items-start mb-2">
                                                       <div>
                                                           <span className="font-bold text-sm text-gray-900">{msg.name}</span>
                                                       </div>
                                                       <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                   </div>
                                                   <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{msg.message}</p>
                                               </div>
                                           ))
                                       )}
                                   </div>
                               </div>
                           </div>
                        </motion.div>
                    )}

                    {activeTab === 'inbox' && (
                        <motion.div 
                            key="inbox"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto"
                        >
                           {/* ... Inbox Content ... */}
                           {/* (Same as previous content for Inbox) */}
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    Inbox
                                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        {inboxTab === 'contact' ? messages.length : chatLogs.length} interactions
                                    </span>
                                </h2>
                                {/* ... Tab switcher & Filter ... */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                                        <button onClick={() => setInboxTab('contact')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${inboxTab === 'contact' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Contact Form</button>
                                        <button onClick={() => setInboxTab('chat')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${inboxTab === 'chat' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Chatbot Messages</button>
                                    </div>
                                    <div className={`relative group cursor-pointer border rounded-lg px-4 py-2 flex items-center gap-3 transition-all ${dateFilter ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:border-gray-400 text-gray-600'}`}>
                                        <Filter size={14} className={dateFilter ? "text-white" : "text-gray-400 group-hover:text-gray-600"} />
                                        <span className="text-sm font-medium">{dateFilter ? new Date(dateFilter).toLocaleDateString() : 'Filter by Date'}</span>
                                        <input ref={dateInputRef} type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" />
                                        {dateFilter && (<button onClick={(e) => { e.stopPropagation(); setDateFilter(''); }} className="ml-2 w-5 h-5 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors z-20 relative"><X size={12} /></button>)}
                                    </div>
                                </div>
                           </div>
                           {/* List */}
                           {Object.keys(groupedInbox).length === 0 ? (
                                <div className="text-center py-20 text-gray-400 flex flex-col items-center"><Mail size={64} className="mb-4 opacity-10" /><p>No messages found {dateFilter ? 'for this date' : 'in inbox'}.</p></div>
                            ) : (
                                <div className="space-y-8">
                                    {Object.entries(groupedInbox).map(([date, items]) => (
                                        <div key={date}>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="h-[1px] bg-gray-200 flex-1"></div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400"><Calendar size={14} /> {date}</div><div className="h-[1px] bg-gray-200 flex-1"></div>
                                            </div>
                                            <div className="space-y-4">
                                                {items.map((item: any, idx: number) => (
                                                    <div key={`${item._id || item.id}-${idx}`} className={`p-5 rounded-2xl border hover:shadow-md transition-all relative group ${inboxTab === 'contact' ? 'bg-blue-50/30 border-blue-100' : 'bg-white border-gray-200'}`}>
                                                        {inboxTab === 'contact' ? (
                                                            <>
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Mail size={20} /></div><div><h3 className="font-bold text-gray-900">{item.name}</h3><a href={`mailto:${item.email}`} className="text-xs text-blue-600 hover:underline">{item.email}</a></div></div>
                                                                    <div className="flex items-center gap-4"><span className="text-xs text-gray-400 font-mono">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span><button onClick={() => setMessageToDelete(item._id || item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete Message"><Trash2 size={16} /></button></div>
                                                                </div>
                                                                <div className="pl-13 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.message}</div>
                                                            </>
                                                        ) : (
                                                            <div className="flex items-start gap-4">
                                                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.role === 'user' ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-600'}`}>{item.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}</div>
                                                                 <div className="flex-1 min-w-0">
                                                                     <div className="flex justify-between items-center mb-1"><span className={`text-xs font-bold uppercase tracking-wider ${item.role === 'user' ? 'text-gray-500' : 'text-purple-600'}`}>{item.role === 'user' ? 'Visitor Chat' : 'AI Response'}</span><span className="text-xs text-gray-400 font-mono">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                                                                     <p className="text-sm text-gray-700 bg-gray-50 inline-block px-4 py-2 rounded-xl rounded-tl-none">{item.text}</p>
                                                                 </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'list' && (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Project Order & Management</h2>
                                <p className="text-sm text-gray-500">Drag items to reorder content on the homepage.</p>
                            </div>
                            
                            <Reorder.Group axis="y" values={localProjects} onReorder={setLocalProjects} className="flex flex-col gap-4" layoutScroll>
                                {localProjects.map((project, index) => (
                                    <SortableProjectItem 
                                        key={project.id} 
                                        project={project}
                                        index={index}
                                        onEdit={() => handleEditClick(project)}
                                        onDelete={() => onDeleteProject(project.id)}
                                        onOpenComments={() => handleOpenComments(project)}
                                        onDragEnd={handleDragEnd}
                                    />
                                ))}
                            </Reorder.Group>
                        </motion.div>
                    )}

                    {activeTab === 'form' && (
                        <motion.div 
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-3xl mx-auto"
                        >
                           {/* ... Form Content ... */}
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Project' : 'Upload Project Details'}</h2>
                                <button onClick={() => { setActiveTab('list'); resetForm(); }} className="text-gray-500 hover:text-black"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Project Title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Finance Dashboard" />
                                    <Input label="Category" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. UI/UX Design" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 block">Cover Image URL</label>
                                    <input type="url" name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"/>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-gray-700 flex justify-between items-center">
                                        <span>Project Gallery Images</span>
                                        <button type="button" onClick={addGalleryField} className="text-xs bg-black text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-1"><Plus size={14} /> Add Image</button>
                                    </label>
                                    <div className="space-y-3">
                                        {galleryUrls.map((url, index) => (
                                            <div key={index} className="flex gap-2 items-start">
                                                <input type="url" value={url} onChange={(e) => handleGalleryChange(index, e.target.value)} placeholder={`Gallery Image URL ${index + 1}`} className="flex-1 px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium"/>
                                                {galleryUrls.length > 1 && (<button type="button" onClick={() => removeGalleryField(index)} className="p-3 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                     <Input label="Role" name="role" value={formData.role} onChange={handleInputChange} placeholder="Lead Designer" />
                                     <Input label="Client" name="client" value={formData.client} onChange={handleInputChange} placeholder="Company Name" />
                                     <Input label="Year" name="year" value={formData.year} onChange={handleInputChange} placeholder="2024" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 block">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none" placeholder="Detailed project description..."/>
                                </div>
                                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white py-4 z-10">
                                    <button type="button" onClick={() => { setActiveTab('list'); resetForm(); }} className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Cancel</button>
                                    <button type="submit" className="px-8 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 flex items-center gap-2"><Save size={18} />{editingId ? 'Update Project' : 'Save Project'}</button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'logos' && (
                        <motion.div 
                            key="logos"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Client Logos</h2>
                            <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-200">
                                <h3 className="font-bold text-lg mb-4">Add New Logo</h3>
                                <form onSubmit={handleAddLogo} className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-1 w-full space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Client Name</label>
                                        <input type="text" value={newLogoName} onChange={(e) => setNewLogoName(e.target.value)} placeholder="e.g. Nike" className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black" required />
                                    </div>
                                    <div className="flex-[2] w-full space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Logo Image URL</label>
                                        <input type="url" value={newLogoUrl} onChange={(e) => setNewLogoUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black" required />
                                    </div>
                                    <button type="submit" disabled={isAddingLogo} className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 h-[50px]">{isAddingLogo ? 'Adding...' : 'Add Logo'}</button>
                                </form>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {logos.map((logo) => (
                                    <div key={logo._id} className="relative group bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-center h-32 hover:shadow-md transition-shadow">
                                        <img src={logo.url} alt={logo.name} className="max-w-full max-h-full object-contain transition-all" loading="lazy" />
                                        <button onClick={() => setLogoToDelete(logo._id || null)} className="absolute top-2 right-2 p-2 bg-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"><Trash2 size={16} /></button>
                                        <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{logo.name}</div>
                                    </div>
                                ))}
                            </div>
                            {logos.length === 0 && (<p className="text-center text-gray-400 py-8">No logos added yet.</p>)}
                        </motion.div>
                    )}

                    {activeTab === 'profile' && (
                        <motion.div 
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-4xl mx-auto space-y-8 pb-12"
                        >
                            {/* ... Profile Form Content (same as before) ... */}
                            <div className="flex justify-between items-center mb-2 sticky top-20 z-20 bg-gray-50/80 backdrop-blur-sm py-4">
                                <h2 className="text-2xl font-bold text-gray-900">Edit Profile & Content</h2>
                                <motion.button onClick={handleSaveProfile} disabled={saveProfileStatus !== 'idle'} animate={saveProfileStatus} className={`relative px-6 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 overflow-hidden transition-colors ${saveProfileStatus === 'success' ? 'bg-green-500 shadow-green-500/30' : saveProfileStatus === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-black shadow-black/20 hover:bg-gray-800'}`}>
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {saveProfileStatus === 'idle' && (<motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Save Changes</span><Save size={18} /></motion.div>)}
                                        {saveProfileStatus === 'saving' && (<motion.div key="saving" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Saving...</span><Loader2 size={18} className="animate-spin" /></motion.div>)}
                                        {saveProfileStatus === 'success' && (<motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Saved!</span><Check size={18} /></motion.div>)}
                                        {saveProfileStatus === 'error' && (<motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Failed</span><AlertCircle size={18} /></motion.div>)}
                                    </AnimatePresence>
                                </motion.button>
                            </div>
                            
                            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100"><div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><User size={20} /></div><div><h3 className="font-bold text-lg text-gray-900">Personal Identity</h3><p className="text-sm text-gray-500">Name, Role and Bio details</p></div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <Input label="Full Name" name="name" value={profileData.name} onChange={handleProfileChange} placeholder="e.g. Nobel" />
                                    <Input label="Job Title" name="role" value={profileData.role} onChange={handleProfileChange} placeholder="e.g. UX & UI Designer" />
                                </div>
                                <div className="space-y-2 mb-6">
                                    <label className="text-sm font-bold text-gray-700 block">Short Bio</label>
                                    <textarea name="bio" value={profileData.bio} onChange={handleProfileChange} rows={4} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none" placeholder="I’m a UX/UI Designer..."/>
                                </div>
                            </section>

                            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100"><div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><LayoutGrid size={20} /></div><div><h3 className="font-bold text-lg text-gray-900">Hero Section</h3><p className="text-sm text-gray-500">Main landing area details</p></div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Home Logo URL" name="homeLogo" value={profileData.homeLogo} onChange={handleProfileChange} placeholder="Nav logo URL" />
                                    <Input label="Hero Image URL" name="heroImage" value={profileData.heroImage} onChange={handleProfileChange} placeholder="Main portrait URL" />
                                    <Input label="Total Projects Count" name="totalProjects" value={profileData.totalProjects} onChange={handleProfileChange} placeholder="e.g. 20" />
                                    <Input label="Years Experience" name="yearsExperience" value={profileData.yearsExperience} onChange={handleProfileChange} placeholder="e.g. 2" />
                                </div>
                            </section>

                            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100"><div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><AlignLeft size={20} /></div><div><h3 className="font-bold text-lg text-gray-900">About Content</h3><p className="text-sm text-gray-500">Bio images, statistics and features</p></div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <Input label="Portrait Image (Vertical)" name="aboutImage1" value={profileData.aboutImage1} onChange={handleProfileChange} placeholder="URL" />
                                    <Input label="Landscape Image" name="aboutImage2" value={profileData.aboutImage2} onChange={handleProfileChange} placeholder="URL" />
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div className="md:col-span-1"><Input label="Stat Value" name="statsValue" value={profileData.statsValue} onChange={handleProfileChange} placeholder="e.g. 100" /></div>
                                    <div className="md:col-span-2"><Input label="Stat Label" name="statsLabel" value={profileData.statsLabel} onChange={handleProfileChange} placeholder="e.g. User-focused screens..." /></div>
                                </div>
                                <div className="space-y-4">
                                     <Input label="Feature Bullet 1" name="feature1" value={profileData.feature1} onChange={handleProfileChange} placeholder="e.g. Agency & startup experience..." />
                                     <Input label="Feature Bullet 2" name="feature2" value={profileData.feature2} onChange={handleProfileChange} placeholder="e.g. Strong UX fundamentals..." />
                                     <Input label="Resume Link (Google Drive)" name="resumeUrl" value={profileData.resumeUrl} onChange={handleProfileChange} placeholder="https://..." />
                                </div>
                            </section>
                            
                            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100"><div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600"><LinkIcon size={20} /></div><div><h3 className="font-bold text-lg text-gray-900">Contact & Socials</h3><p className="text-sm text-gray-500">Links and contact info</p></div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                     <Input label="Contact Email" name="email" value={profileData.email} onChange={handleProfileChange} placeholder="email@example.com" />
                                     <Input label="Copyright Year" name="copyrightYear" value={profileData.copyrightYear} onChange={handleProfileChange} placeholder="2026" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2"><label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Linkedin size={14}/> LinkedIn URL</label><input type="text" name="socialLinkedin" value={profileData.socialLinkedin} onChange={handleProfileChange} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="https://..." /></div>
                                    <div className="space-y-2"><label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Globe size={14}/> Behance URL</label><input type="text" name="socialBehance" value={profileData.socialBehance} onChange={handleProfileChange} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="https://..." /></div>
                                    <div className="space-y-2"><label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Instagram size={14}/> Instagram URL</label><input type="text" name="socialInstagram" value={profileData.socialInstagram} onChange={handleProfileChange} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="https://..." /></div>
                                </div>
                            </section>

                            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100"><div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600"><Shield size={20} /></div><div><h3 className="font-bold text-lg text-gray-900">Admin Access</h3><p className="text-sm text-gray-500">Update login credentials</p></div></div>
                                <form onSubmit={handleUpdateCredentials} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2"><label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Mail size={14}/> New Admin Email</label><input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="new.admin@example.com" /></div>
                                        <div className="space-y-2"><label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Key size={14}/> New Password</label><input type="text" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-medium text-sm" placeholder="New secure password" /></div>
                                    </div>
                                    <div className="flex justify-end">
                                        <motion.button type="submit" disabled={credStatus !== 'idle'} animate={credStatus} className={`relative px-6 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 overflow-hidden transition-colors ${credStatus === 'success' ? 'bg-green-500 shadow-green-500/30' : credStatus === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-black shadow-black/20 hover:bg-gray-800'}`}>
                                            <AnimatePresence mode="popLayout" initial={false}>
                                                {credStatus === 'idle' && (<motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Update Credentials</span><Save size={18} /></motion.div>)}
                                                {credStatus === 'saving' && (<motion.div key="saving" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Updating...</span><Loader2 size={18} className="animate-spin" /></motion.div>)}
                                                {credStatus === 'success' && (<motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Updated!</span><Check size={18} /></motion.div>)}
                                                {credStatus === 'error' && (<motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2"><span>Failed</span><AlertCircle size={18} /></motion.div>)}
                                            </AnimatePresence>
                                        </motion.button>
                                    </div>
                                </form>
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
                                  {selectedProjectForComments.comments.slice().reverse().map((comment: any, idx: number) => (
                                      <div key={idx} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group items-center">
                                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">{comment.author.charAt(0).toUpperCase()}</div>
                                          <div className="flex-1 min-w-0">
                                              <div className="flex justify-between items-start mb-1"><h4 className="font-bold text-gray-900 text-sm">{comment.author}</h4><span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span></div>
                                              <p className="text-sm text-gray-600 leading-relaxed">{comment.text}</p>
                                          </div>
                                          <button onClick={() => requestDeleteComment(comment._id || comment.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete Comment"><Trash2 size={18} /></button>
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
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
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

export default AdminDashboard;