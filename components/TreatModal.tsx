import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Utensils } from 'lucide-react';

interface TreatModalProps {
  isEnabled: boolean;
  title?: string;
  message?: string;
  image?: string;
  buttonText?: string;
  interval?: number;
  maxShowCount?: number;
}

const TreatModal: React.FC<TreatModalProps> = ({ 
  isEnabled,
  title = "Treat Pending!",
  message = "Need treat ASAP! Don't keep the hunger waiting.",
  image = "https://i.ibb.co/fGSfy2RF/Kacchi-Biryani-Mutton-large.webp",
  buttonText = "Okay, I'll Treat You!",
  interval = 5,
  maxShowCount = 3
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCount, setShowCount] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isEnabled && showCount < maxShowCount) {
      // If enabled and under limit, logic to show
      if (!isVisible) {
        timer = setTimeout(() => {
          setIsVisible(true);
        }, interval * 1000); // interval in seconds
      }
    } else {
      setIsVisible(false);
    }

    return () => clearTimeout(timer);
  }, [isEnabled, isVisible, showCount, interval, maxShowCount]);

  const handleClose = () => {
    setIsVisible(false);
    setShowCount(prev => prev + 1);
    // The useEffect will trigger again because isVisible changed to false,
    // restarting the interval timer if showCount < maxShowCount
  };

  return (
    <AnimatePresence>
      {isVisible && isEnabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full relative border border-gray-100"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-black transition-colors backdrop-blur-md shadow-sm"
            >
              <X size={18} />
            </button>

            {/* Image Section */}
            {image && (
                <div className="relative h-64 w-full bg-gray-100">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-6 text-white">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                            Pending
                        </span>
                    </div>
                    <h3 className="text-xl font-bold">{title}</h3>
                </div>
                </div>
            )}

            {/* Content Section */}
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-500 mb-6 leading-relaxed text-sm">
                {message}
              </p>
              
              <button 
                onClick={handleClose}
                className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200/50"
              >
                {buttonText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TreatModal;