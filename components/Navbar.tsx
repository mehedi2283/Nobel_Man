import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface NavbarProps {
  logo?: string;
}

const Navbar: React.FC<NavbarProps> = ({ logo }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
       if (window.scrollY > 50) {
         setIsScrolled(true);
       } else {
         setIsScrolled(false);
       }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);
  
  const handleScrollToSection = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (id === 'home') {
       window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
       const element = document.getElementById(id);
       if (element) {
         element.scrollIntoView({ behavior: 'smooth' });
       }
    }
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-16 md:py-5 transition-all duration-300 ${
            isScrolled 
            ? 'bg-white/70 backdrop-blur-xl backdrop-saturate-150 border-b border-white/20 shadow-sm' 
            : 'bg-transparent border-b border-transparent shadow-none'
        }`}
      >
        <div className="flex items-center">
          {/* Logo Image - Acts as Home Link */}
          {logo && (
            <div 
                className="h-8 md:h-10 w-auto flex items-center justify-center cursor-pointer relative z-50"
                onClick={(e) => handleScrollToSection(e, 'home')}
            >
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="h-full w-auto object-contain"
                  loading="lazy"
                />
            </div>
          )}
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-12">
          {['About', 'Process', 'Projects', 'Contact'].map((item, index) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={(e) => handleScrollToSection(e, item.toLowerCase())}
              whileHover={{ scale: 1.05, color: "#000" }}
              className="text-gray-600 hover:text-black font-medium text-sm tracking-wide transition-colors cursor-pointer"
            >
              {item}
            </motion.a>
          ))}
        </div>
        
        {/* Mobile Menu Toggle */}
        <div className="md:hidden z-50">
          <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-12 h-12 flex items-center justify-center focus:outline-none relative"
              aria-label="Toggle Menu"
          >
              <AnimatePresence mode="popLayout" initial={false}>
                  {isMobileMenuOpen ? (
                      <motion.div
                          key="close"
                          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                          animate={{ opacity: 1, rotate: 0, scale: 1 }}
                          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                          className="absolute inset-0 flex items-center justify-center"
                      >
                          <X size={24} className="text-black" />
                      </motion.div>
                  ) : (
                      <motion.div
                          key="menu"
                          initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                          animate={{ opacity: 1, rotate: 0, scale: 1 }}
                          exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
                      >
                          <div className="w-6 h-0.5 bg-black rounded-full"></div>
                          <div className="w-6 h-0.5 bg-black rounded-full"></div>
                      </motion.div>
                  )}
              </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center space-y-8 md:hidden"
          >
            {['About', 'Process', 'Projects', 'Contact'].map((item, index) => (
              <motion.a
                key={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                href={`#${item.toLowerCase()}`}
                onClick={(e) => handleScrollToSection(e, item.toLowerCase())}
                className="text-3xl font-medium text-gray-900 hover:text-gray-600 transition-colors"
              >
                {item}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;