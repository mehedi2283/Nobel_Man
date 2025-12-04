import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Project } from '../types';
import Footer from './Footer';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      {/* Navigation */}
      <div className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 md:px-16 py-6">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Projects
            </button>
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
             className="w-full aspect-video bg-gray-100 rounded-none overflow-hidden mb-16 group"
        >
            <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
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
                <p className="text-gray-600 text-lg leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
            </div>
        </div>

        {/* Gallery Section */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="pb-24">
             <h2 className="text-3xl font-bold text-gray-900 mb-12">Project Gallery</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.gallery.map((img, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className="w-full aspect-[4/3] bg-gray-50 overflow-hidden group rounded-lg"
                    >
                        <img 
                            src={img} 
                            alt={`${project.title} gallery ${idx + 1}`} 
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
                        />
                    </motion.div>
                ))}
             </div>
          </div>
        )}

      </div>
      <Footer />
    </motion.div>
  );
};

export default ProjectDetail;