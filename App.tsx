import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VerticalLabel from './components/VerticalLabel';
import ChatWidget from './components/ChatWidget';
import About from './components/About';
import Process from './components/Process';
import Projects from './components/Projects';
import Contact from './components/Contact';
import ProjectDetail from './components/ProjectDetail';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import BackToTop from './components/BackToTop';
import Preloader from './components/Preloader';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ConfirmationModal from './components/ConfirmationModal';
import { Project, ProfileData } from './types';
import { INITIAL_PROJECTS } from './constants';
import { projectService } from './services/projectService';

type ViewState = 'home' | 'admin-login' | 'admin-dashboard';

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // App State
  const [view, setView] = useState<ViewState>('home');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Profile Data
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Confirmation Modal State for Projects
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, projectId: string | null }>({
    isOpen: false,
    projectId: null
  });

  // Load data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projData, profData] = await Promise.all([
            projectService.getProjects(),
            projectService.getProfile()
        ]);
        setProjects(projData);
        if(profData) setProfileData(profData);
      } catch (error) {
        console.error("Failed to load initial data", error);
        setProjects([]);
      }
    };
    fetchData();
  }, []);

  // Scroll to top when switching views or projects
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedProject?.id, view]);

  // Handle immediate updates from children (likes, comments) without full re-fetch
  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    
    // Also update selectedProject if it matches, to keep UI in sync
    if (selectedProject && selectedProject.id === updatedProject.id) {
        setSelectedProject(updatedProject);
    }
  };

  // Handle Profile Update from Dashboard
  const handleProfileUpdate = (updatedProfile: ProfileData) => {
    setProfileData(updatedProfile);
  };

  const handleSaveProject = async (project: Project) => {
    const previousProjects = [...projects];
    // Optimistic Update
    setProjects(prev => {
      const index = prev.findIndex(p => p.id === project.id);
      if (index >= 0) {
        const newProjects = [...prev];
        newProjects[index] = project;
        return newProjects;
      } else {
        return [project, ...prev];
      }
    });

    try {
      await projectService.saveProject(project);
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save to database. Is the server running? Check console for details.");
      setProjects(previousProjects);
    }
  };

  // Trigger modal
  const handleDeleteProjectRequest = (id: string) => {
    setDeleteConfirmation({ isOpen: true, projectId: id });
  };

  // Actual deletion logic
  const confirmDeleteProject = async () => {
    const id = deleteConfirmation.projectId;
    if (!id) return;
    setDeleteConfirmation({ isOpen: false, projectId: null });
    const previousProjects = [...projects];
    setProjects(prev => prev.filter(p => p.id !== id));
    try {
        await projectService.deleteProject(id);
    } catch (error) {
        console.error("Error deleting project:", error);
        alert("Failed to delete project from database. Is the server running?");
        setProjects(previousProjects);
    }
  };

  const handleReorderProjects = async (newOrder: Project[]) => {
    const previousProjects = [...projects];
    setProjects(newOrder);
    try {
        await projectService.reorderProjects(newOrder);
    } catch (error) {
        console.error("Error reordering projects:", error);
        setProjects(previousProjects);
    }
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setView('admin-dashboard');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setView('home');
  };

  const renderContent = () => {
    if (view === 'admin-login') {
        return <AdminLogin onLogin={handleAdminLogin} onBack={() => setView('home')} />;
    }

    if (view === 'admin-dashboard') {
        if (!isAdmin) {
             setView('admin-login');
             return null;
        }
        return <AdminDashboard 
            projects={projects} 
            onSaveProject={handleSaveProject} 
            onDeleteProject={handleDeleteProjectRequest}
            onReorderProjects={handleReorderProjects}
            onProjectUpdate={handleProjectUpdate}
            onProfileUpdate={handleProfileUpdate}
            onLogout={handleAdminLogout}
            homeLogo={profileData?.homeLogo}
        />;
    }

    if (selectedProject) {
        return (
            <ProjectDetail 
                project={selectedProject} 
                onBack={() => setSelectedProject(null)} 
                onProjectUpdate={handleProjectUpdate}
            />
        );
    }

    return (
        <>
            <Navbar logo={profileData?.homeLogo} />
            <VerticalLabel />
            
            <main className="w-full">
                {/* Start Hero animations only after loading is complete */}
                <Hero 
                    startAnimation={!isLoading} 
                    heroImage={profileData?.heroImage}
                    totalProjects={profileData?.totalProjects}
                    yearsExperience={profileData?.yearsExperience}
                    name={profileData?.name}
                    role={profileData?.role}
                />
                <About 
                    aboutImage1={profileData?.aboutImage1}
                    aboutImage2={profileData?.aboutImage2}
                    statsValue={profileData?.statsValue}
                    statsLabel={profileData?.statsLabel}
                    resumeUrl={profileData?.resumeUrl}
                    bio={profileData?.bio}
                    feature1={profileData?.feature1}
                    feature2={profileData?.feature2}
                    linkedin={profileData?.socialLinkedin}
                    behance={profileData?.socialBehance}
                    instagram={profileData?.socialInstagram}
                />
                <Process />
                <Projects 
                    projects={projects} 
                    onProjectSelect={setSelectedProject}
                    onProjectUpdate={handleProjectUpdate}
                />
                <Contact 
                    email={profileData?.email} 
                    linkedin={profileData?.socialLinkedin}
                    behance={profileData?.socialBehance}
                    instagram={profileData?.socialInstagram}
                />
                <Footer 
                    onAdminClick={() => setView('admin-login')} 
                    email={profileData?.email}
                    year={profileData?.copyrightYear}
                />
            </main>
        </>
    );
  };

  return (
    <div className="relative w-full min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-black selection:text-white">
      <CustomCursor />
      
      <AnimatePresence mode="wait">
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {renderContent()}

      <ConfirmationModal 
          isOpen={deleteConfirmation.isOpen}
          title="Delete Project?"
          message="Are you sure you want to delete this project? This action cannot be undone."
          confirmText="Delete"
          isDangerous={true}
          onConfirm={confirmDeleteProject}
          onCancel={() => setDeleteConfirmation({ isOpen: false, projectId: null })}
      />

      {view === 'home' && !selectedProject && (
          <>
            <BackToTop />
            <ChatWidget />
          </>
      )}
    </div>
  );
}

export default App;