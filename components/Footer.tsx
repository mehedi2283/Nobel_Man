import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface FooterProps {
  onAdminClick?: () => void;
  email?: string;
  year?: string;
}

const Footer: React.FC<FooterProps> = ({ 
  onAdminClick, 
  email,
  year
}) => {
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="footer" className="bg-[#0a0a0a] text-white pt-24 pb-8 px-6 md:px-16 overflow-hidden">
      <div className="container mx-auto max-w-[1400px]">
        
        {/* Main CTA Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 lg:mb-32 gap-12">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl"
            >
                <h2 className="text-3xl md:text-4xl lg:text-4xl font-light leading-tight tracking-tight mb-2">
                    Curious about what we can create together?
                </h2>
                <h2 className="text-3xl md:text-4xl lg:text-4xl font-light leading-tight tracking-tight text-gray-400">
                    Let's bring something extraordinary to life!
                </h2>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col md:flex-row items-start md:items-center gap-8"
            >
                 <button 
                    onClick={scrollToContact}
                    className="bg-white text-black px-8 py-4 text-lg font-medium hover:bg-gray-200 transition-colors duration-300"
                 >
                    Get In Touch
                 </button>

                 <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium tracking-wide">Available For Work</span>
                 </div>
            </motion.div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gray-800 mb-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm text-gray-500 gap-4">
            <div>
                {email && (
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                      {email}
                  </a>
                )}
            </div>
            
            <div className="flex items-center gap-4">
                <span>Design & Developed By P4kB0Y</span>
                {onAdminClick && (
                    <button onClick={onAdminClick} className="hover:text-white transition-colors flex items-center gap-1" title="Admin Access">
                        <Lock size={12} />
                        Admin
                    </button>
                )}
            </div>
            
            <div>
                All rights reserved, Nobel {year || new Date().getFullYear().toString()}
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;