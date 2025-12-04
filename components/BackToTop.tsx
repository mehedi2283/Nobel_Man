import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOverFooter, setIsOverFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Toggle Visibility
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Detect Footer
      const footer = document.getElementById('footer');
      if (footer) {
        const rect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // Check if footer is visible in the viewport
        if (rect.top < windowHeight) {
            setIsOverFooter(true);
        } else {
            setIsOverFooter(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          // Mobile: Vertical Stack (right-6, stacked above chat at bottom-24). Stays fixed on mobile.
          // Desktop: Horizontal (right-28). Moves up when over footer to bottom-24.
          className={`fixed z-40 w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg text-gray-900 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300 right-6 md:right-28 ${
            isOverFooter 
                ? 'bottom-24 md:bottom-24' 
                : 'bottom-24 md:bottom-8'
          }`}
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;