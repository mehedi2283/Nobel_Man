import React, { useEffect, useState } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

interface HeroProps {
  startAnimation?: boolean;
  heroImage?: string;
  totalProjects?: string;
  yearsExperience?: string;
  name?: string;
  role?: string;
}

const Hero: React.FC<HeroProps> = ({ 
  startAnimation = true,
  heroImage,
  totalProjects,
  yearsExperience,
  name,
  role
}) => {
  const controls = useAnimation();
  const [imgLoaded, setImgLoaded] = useState(false);
  
  // Use passed prop or empty string (no hardcoded fallback)
  const displayImage = heroImage || "";

  useEffect(() => {
    if (startAnimation) {
      controls.start("visible");
    }
  }, [startAnimation, controls]);

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const fadeInRight: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1, delay: 0.5 } }
  };

  return (
    <section id="home" className="relative h-screen w-full flex items-center overflow-hidden bg-white">
      
      {/* Background Image - Optimized */}
      <div className="absolute inset-0 z-0">
        <img 
            src="https://storage.googleapis.com/msgsndr/xnK9XgHdPIFUajSVVFfV/media/69300df80b0f9d198855f18d.png" 
            alt="Background" 
            className="w-full h-full object-cover transition-opacity duration-700"
            loading="lazy"
            decoding="async"
        />
        <div className="absolute inset-0 bg-white/30"></div>
      </div>

      {/* Main Content Container - Added lg:pl-32 to offset for the fixed sidebar */}
      <div className="container mx-auto px-6 md:px-16 lg:pl-32 h-full flex flex-col lg:flex-row items-center relative z-10 pt-20 lg:pt-0">
        
        {/* Left Content */}
        <div className="flex-1 w-full h-full flex flex-col justify-center pl-4 lg:max-w-[55%]">
          
          {/* Stats Row */}
          <motion.div 
            initial="hidden"
            animate={controls}
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="flex gap-12 lg:gap-16 mb-12 lg:mb-16"
          >
            {totalProjects && (
              <div className="flex flex-col">
                <span className="text-4xl lg:text-5xl font-semibold text-gray-900">+{totalProjects}</span>
                <span className="text-gray-500 text-sm mt-2 font-medium">Project Completed</span>
              </div>
            )}
            {yearsExperience && (
              <div className="flex flex-col">
                <span className="text-4xl lg:text-5xl font-semibold text-gray-900">+{yearsExperience}</span>
                <span className="text-gray-500 text-sm mt-2 font-medium">Years of Experience</span>
              </div>
            )}
          </motion.div>

          {/* Main Headline */}
          <motion.div 
              initial="hidden"
              animate={controls}
              variants={fadeInRight}
              transition={{ delay: 0.4 }}
              className="space-y-2 lg:space-y-4"
          >
            <p className="text-lg text-gray-600 font-medium ml-1">Hello</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium text-gray-900 leading-[1.1] tracking-tight font-aeonik">
              <span className="block mb-2">—It’s {name || 'Nobel'}</span>
              <span className="block">{role || 'UX & UI Designer'}</span>
            </h1>
          </motion.div>

          {/* Scroll Down Indicator - Positioned to right of sidebar */}
          <motion.div 
            initial="hidden"
            animate={controls}
            variants={fadeIn}
            className="absolute bottom-12 left-8 md:left-32 flex items-center gap-2 text-gray-500 text-sm font-medium hidden md:flex"
          >
            Scroll Down
            <ArrowDown size={16} className="animate-bounce" />
          </motion.div>
        </div>

        {/* Right Content - Hero Image */}
        <div className="flex-1 w-full h-full relative block group overflow-hidden">
            {displayImage && (
              <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={controls}
                  variants={{
                      visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut", delay: 0.3 } }
                  }}
                  className="absolute bottom-0 right-0 w-full h-[50vh] lg:h-[85vh] flex items-end justify-center lg:justify-end"
              >
                  {/* Blur Placeholder */}
                  <div className={`absolute inset-0 bg-gray-200/50 backdrop-blur-xl transition-opacity duration-700 z-20 ${imgLoaded ? 'opacity-0' : 'opacity-100'}`} />
                  
                  <img 
                    src={displayImage} 
                    alt={name} 
                    onLoad={() => setImgLoaded(true)}
                    className={`max-h-full w-auto object-contain object-bottom transition-all duration-1000 ease-out 
                        ${imgLoaded ? 'blur-0 scale-100 opacity-100' : 'blur-xl scale-105 opacity-0'}
                        grayscale contrast-110 group-hover:grayscale-0
                    `}
                    loading="eager" // Hero image must be eager for LCP
                    decoding="async"
                  />
                  {/* White Fade Gradient */}
                  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
              </motion.div>
            )}
        </div>
      </div>
    </section>
  );
};

export default Hero;