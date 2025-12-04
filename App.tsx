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
import { Project } from './types';

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Scroll to top when switching views
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedProject]);

  return (
    <div className="relative w-full min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-black selection:text-white">
      <CustomCursor />
      
      <AnimatePresence mode="wait">
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {selectedProject ? (
        <ProjectDetail 
            project={selectedProject} 
            onBack={() => setSelectedProject(null)} 
        />
      ) : (
        <>
            <Navbar />
            <VerticalLabel />
            
            <main className="w-full">
                {/* Start Hero animations only after loading is complete */}
                <Hero startAnimation={!isLoading} />
                <About />
                <Process />
                <Projects onProjectSelect={setSelectedProject} />
                <Contact />
                <Footer />
            </main>
        </>
      )}

      {/* Floating Elements */}
      <BackToTop />
      <ChatWidget />
    </div>
  );
}

export default App;