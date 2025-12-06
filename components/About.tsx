import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Globe, Linkedin, ArrowDown, Plus, Instagram } from 'lucide-react';
import { projectService } from '../services/projectService';
import { ClientLogo } from '../types';

interface AboutProps {
  aboutImage1?: string;
  aboutImage2?: string;
  resumeUrl?: string;
  linkedin?: string;
  behance?: string;
  instagram?: string;
  statsValue?: string;
  statsLabel?: string;
  bio?: string;
  feature1?: string;
  feature2?: string;
}

const About: React.FC<AboutProps> = ({ 
  aboutImage1, 
  aboutImage2, 
  resumeUrl,
  linkedin,
  behance,
  instagram,
  statsValue,
  statsLabel,
  bio,
  feature1,
  feature2
}) => {
  const [allLogos, setAllLogos] = useState<ClientLogo[]>([]);
  const [displayLogos, setDisplayLogos] = useState<(ClientLogo | null)[]>(Array(8).fill(null));
  const [fadingIndex, setFadingIndex] = useState<number | null>(null);
  const [img1Loaded, setImg1Loaded] = useState(false);
  const [img2Loaded, setImg2Loaded] = useState(false);

  // Parse stat value to number for counter animation
  const statNumber = statsValue ? (parseInt(statsValue.replace(/[^0-9]/g, '')) || 0) : 0;

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const data = await projectService.getClientLogos();
        if (data && data.length > 0) {
          setAllLogos(data);
          // Initialize first 8 logos
          const initial = Array(8).fill(null).map((_, i) => data[i % data.length] || null);
          setDisplayLogos(initial);
        }
      } catch (e) {
         console.debug("Failed to fetch logos");
      }
    };
    fetchLogos();
  }, []);

  // Animation Loop: Swap random logos if we have more than 8
  useEffect(() => {
    if (allLogos.length <= 8) return;

    const interval = setInterval(() => {
      // Pick a random slot to swap (0-7)
      const indexToSwap = Math.floor(Math.random() * 8);
      
      // Start fade out
      setFadingIndex(indexToSwap);

      // Wait for fade out, then swap data, then fade in
      setTimeout(() => {
        setDisplayLogos(prev => {
           const newLogos = [...prev];
           // Find a logo that isn't currently displayed
           const currentIds = newLogos.map(l => l?._id || l?.id);
           const available = allLogos.filter(l => !currentIds.includes(l._id || l.id));
           
           if (available.length > 0) {
               const randomNew = available[Math.floor(Math.random() * available.length)];
               newLogos[indexToSwap] = randomNew;
           } else {
               // Fallback: just pick random from all if filtering fails logic
               const randomAny = allLogos[Math.floor(Math.random() * allLogos.length)];
               newLogos[indexToSwap] = randomAny;
           }
           return newLogos;
        });
        
        // Reset fading index (triggers fade in)
        setFadingIndex(null);
      }, 500); // Wait 500ms for fade out
      
    }, 2500); // Swap every 2.5 seconds

    return () => clearInterval(interval);
  }, [allLogos]);

  return (
    <section id="about" className="py-20 lg:py-32 bg-[#f7f7f7] overflow-hidden">
      <div className="container mx-auto px-6 md:px-16 max-w-[1400px]">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-24">
          
          {/* Column 1: Text & Bio (Span 4) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-4 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-5xl md:text-6xl font-normal text-gray-900 mb-8 tracking-tight">About Me</h2>
              {bio && (
                  <p className="text-gray-600 text-lg leading-relaxed mb-8 whitespace-pre-line">
                    {bio}
                  </p>
              )}
              
              {resumeUrl && (
                  <a 
                    href={resumeUrl}
                    className="group flex items-center gap-3 px-6 py-3 border border-gray-900 text-gray-900 font-medium hover:bg-black hover:text-white transition-all duration-300 w-fit mb-12 cursor-pointer rounded-none"
                  >
                    Download Resume 
                    <ArrowDown size={18} className="group-hover:translate-y-1 transition-transform" />
                  </a>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex gap-4">
              {linkedin && <SocialIcon href={linkedin} icon={<Linkedin size={20} />} />}
              {behance && <SocialIcon href={behance} icon={<span className="font-bold text-lg">Be</span>} />}
              {instagram && <SocialIcon href={instagram} icon={<Instagram size={20} />} />}
            </div>
          </motion.div>

          {/* Column 2: Stats Card (Span 4) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-4"
          >
            <div className="bg-white p-8 h-full shadow-sm flex flex-col items-start text-left relative overflow-hidden group rounded-none">
                {/* Globe Icon */}
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6 text-gray-900">
                    <Globe size={32} strokeWidth={1.5} />
                </div>
                
                {statsValue && (
                    <h3 className="text-5xl font-medium text-gray-900 mb-4 flex items-center">
                        <Counter value={statNumber} />+
                    </h3>
                )}
                
                {statsLabel && (
                    <p className="text-gray-500 mb-8 max-w-xs">
                        {statsLabel}
                    </p>
                )}

                {/* Vertical Portrait - SHARP RADIUS (rounded-none) */}
                {aboutImage1 && (
                    <div className="mt-auto w-full h-[300px] relative overflow-hidden rounded-none bg-gray-50">
                        <img 
                            src={aboutImage1} 
                            alt="Nobel Portrait" 
                            onLoad={() => setImg1Loaded(true)}
                            className={`w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 object-top 
                              ${img1Loaded ? 'blur-0 opacity-100' : 'blur-xl opacity-0'}
                            `}
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                    </div>
                )}
            </div>
          </motion.div>

          {/* Column 3: Image & List (Span 4) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-4 flex flex-col gap-8 group"
          >
            {/* Landscape Image - Sharp Radius (rounded-none) */}
            {aboutImage2 && (
                <div className="w-full h-64 overflow-hidden hidden lg:block rounded-none bg-gray-50">
                    <img 
                        src={aboutImage2} 
                        alt="Nobel Working" 
                        onLoad={() => setImg2Loaded(true)}
                        className={`w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105 rounded-none 
                           ${img2Loaded ? 'blur-0 opacity-100' : 'blur-xl opacity-0'}
                        `}
                        loading="lazy"
                        decoding="async"
                    />
                </div>
            )}

            {/* Feature List */}
            <div className="space-y-6 mt-4">
                {feature1 && <FeatureItem text={feature1} />}
                {feature2 && <FeatureItem text={feature2} />}
            </div>
          </motion.div>
        </div>

        {/* Dynamic Logo Grid */}
        {allLogos.length > 0 && (
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
                className="border-t border-gray-200 pt-16"
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {displayLogos.map((logo, idx) => (
                        <div key={idx} className="h-24 flex items-center justify-center relative">
                             <div 
                                className={`transition-opacity duration-500 ease-in-out w-full h-full flex items-center justify-center ${
                                    fadingIndex === idx ? 'opacity-0' : 'opacity-100'
                                }`}
                             >
                                {logo ? (
                                    <img 
                                        src={logo.url} 
                                        alt={logo.name} 
                                        className="max-h-16 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ) : (
                                    <div className="w-full h-full" />
                                )}
                             </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        )}
      </div>
    </section>
  );
};

const SocialIcon = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
  >
    {icon}
  </a>
);

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 mt-1">
        <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
            <Plus size={14} />
        </div>
    </div>
    <p className="text-gray-600 leading-relaxed text-sm lg:text-base">{text}</p>
  </div>
);

const Counter = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { 
    damping: 30, 
    stiffness: 100 
  });

  useEffect(() => {
    if (inView) {
      motionValue.set(value);
    }
  }, [inView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toString();
      }
    });
  }, [springValue]);

  return <span ref={ref}>0</span>;
};

export default About;