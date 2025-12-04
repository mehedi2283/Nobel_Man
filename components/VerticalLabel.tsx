import React from 'react';
import { motion } from 'framer-motion';

const VerticalLabel: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 0.8 }}
      className="hidden lg:flex fixed left-0 top-0 h-screen w-24 flex-col justify-between items-center z-40 pointer-events-none py-12"
    >
      {/* Top Label - Text removed as requested */}
      <div className="h-1/2 flex items-start pt-32">
      <div className="flex items-center justify-center w-8">
           <span className="text-gray-400 text-xs tracking-[0.2em] font-medium -rotate-90 whitespace-nowrap">
             UX & UI Designer
           </span>
        </div>
      </div>

      {/* Top Label - Text removed as requested */}
      <div className="h-1/2 flex items-center pt-24">
      <div className="flex items-center justify-center w-8">
           <span className="text-gray-400 text-xs tracking-[0.2em] font-medium -rotate-90 whitespace-nowrap">
           ---------------------------------------------------------------------------
           </span>
        </div>
      </div>
      
      {/* Bottom Label - 2024 */}
      <div className="h-1/2 flex items-end pb-8">
        <div className="flex items-center justify-center w-8">
           <span className="text-gray-400 text-xs tracking-[0.2em] font-medium -rotate-90 whitespace-nowrap">
             2024
           </span>
        </div>
      </div>
    </motion.div>
  );
};

export default VerticalLabel;