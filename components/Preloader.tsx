import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds total loading time
    const intervalTime = 20; // Update every 20ms
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    // Trigger completion slightly after visual counter finishes
    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration + 200);

    return () => {
      clearInterval(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ 
        y: '-100%', 
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
      }}
      className="fixed inset-0 z-[100] bg-black text-white flex flex-col justify-between p-6 md:p-12 lg:p-16 overflow-hidden"
    >
      {/* Top Left - Text Name */}
      <div className="flex items-start overflow-hidden relative z-20">
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="text-2xl md:text-3xl font-bold tracking-tight"
        >
            Nobel.
        </motion.div>
      </div>

      {/* Center Big Logo - Inverted */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-16 md:w-20 lg:w-24"
        >
            <img 
                src="/images/logo_n.svg" 
                alt="Nobel Logo" 
                className="w-full h-full object-contain brightness-0 invert" 
            />
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="flex items-end justify-between w-full relative z-20">
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm md:text-base text-gray-400 max-w-xs hidden md:block leading-relaxed"
         >
            Portfolio &copy; 2026<br/>
            Designing Digital Experiences
         </motion.div>

         <div className="overflow-hidden">
            <motion.h1 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="text-6xl md:text-8xl lg:text-[10rem] leading-none font-bold tracking-tighter"
            >
                {Math.round(count)}%
            </motion.h1>
         </div>
      </div>
    </motion.div>
  );
};

export default Preloader;