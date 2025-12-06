import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, Loader2, Linkedin, Instagram, ArrowRight, AlertCircle } from 'lucide-react';
import { projectService } from '../services/projectService';

interface ContactProps {
  email?: string;
  linkedin?: string;
  behance?: string;
  instagram?: string;
}

const Contact: React.FC<ContactProps> = ({ 
  email,
  linkedin,
  behance,
  instagram
}) => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;

    setStatus('loading');
    
    try {
      await projectService.sendMessage(formState);
      setStatus('success');
      setFormState({ name: '', email: '', message: '' });
      // Reset to idle after delay
      setTimeout(() => setStatus('idle'), 4000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-20 lg:py-32 bg-white border-t border-gray-100 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50/50 -skew-x-12 translate-x-32 z-0 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-16 max-w-[1400px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:sticky lg:top-32"
          >
            <h2 className="text-5xl md:text-7xl font-medium text-gray-900 mb-8 tracking-tight">Let's Talk</h2>
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-12 max-w-lg">
              Have a project in mind? Looking to partner or just want to say hi? 
              Fill out the form and I'll get back to you as soon as possible.
            </p>
            
            <div className="space-y-10">
              {email && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Email</h3>
                  <a 
                      href={`mailto:${email}`} 
                      className="text-xl md:text-2xl text-gray-900 hover:text-gray-500 transition-colors inline-flex items-center gap-2 group"
                  >
                    {email}
                    <ArrowRight size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                </div>
              )}
              
              {(linkedin || behance || instagram) && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Socials</h3>
                  <div className="flex gap-4">
                      {linkedin && <SocialLink 
                        href={linkedin} 
                        icon={<Linkedin size={20} />} 
                        label="LinkedIn"
                      />}
                      {behance && <SocialLink 
                        href={behance} 
                        icon={<span className="font-bold text-lg">Be</span>} 
                        label="Behance"
                      />}
                      {instagram && <SocialLink 
                        href={instagram} 
                        icon={<Instagram size={20} />} 
                        label="Instagram"
                      />}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white lg:bg-transparent rounded-3xl lg:rounded-none p-6 md:p-0 shadow-sm lg:shadow-none border lg:border-none border-gray-100"
          >
            <form onSubmit={handleSubmit} className="space-y-10">
                
              <FloatingInput 
                label="Your Name" 
                name="name" 
                value={formState.name} 
                onChange={handleChange} 
              />
              
              <FloatingInput 
                label="Email Address" 
                name="email" 
                type="email"
                value={formState.email} 
                onChange={handleChange} 
              />

              <FloatingInput 
                label="Tell me about your project" 
                name="message" 
                value={formState.message} 
                onChange={handleChange} 
                isTextArea
              />

              <div className="pt-6">
                  <SubmitButton status={status} />
              </div>

            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Sub Components ---

interface FloatingInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
    isTextArea?: boolean;
}

const FloatingInput: React.FC<FloatingInputProps> = ({ label, name, value, onChange, type = "text", isTextArea = false }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value.length > 0;

    return (
        <div className="relative">
            <label
                className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                    isFocused || hasValue
                        ? '-top-6 text-xs text-black font-bold uppercase tracking-wider'
                        : 'top-2 text-xl md:text-2xl text-gray-400 font-light'
                }`}
            >
                {label}
            </label>
            
            {isTextArea ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    rows={1}
                    className="w-full py-2 bg-transparent border-b border-gray-200 text-xl md:text-2xl text-gray-900 focus:outline-none resize-none min-h-[60px]"
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full py-2 bg-transparent border-b border-gray-200 text-xl md:text-2xl text-gray-900 focus:outline-none"
                />
            )}

            {/* Animated Underline */}
            <div className={`absolute bottom-0 left-0 h-[2px] bg-black w-full transition-transform duration-500 ease-out origin-left ${isFocused ? 'scale-x-100' : 'scale-x-0'}`} />
        </div>
    );
};


const SubmitButton: React.FC<{ status: 'idle' | 'loading' | 'success' | 'error' }> = ({ status }) => {
    return (
        <motion.button
            layout
            disabled={status !== 'idle'}
            className={`
                relative h-16 flex items-center justify-center gap-3 font-medium text-lg overflow-hidden transition-colors duration-500
                ${status === 'success' ? 'bg-green-500 text-white' : status === 'error' ? 'bg-red-500 text-white' : 'bg-black text-white hover:bg-gray-800'}
                ${status === 'loading' ? 'w-16 px-0' : 'w-full md:w-auto min-w-[200px] px-8'}
            `}
            transition={{
                layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
            }}
        >
            <AnimatePresence mode="popLayout" initial={false}>
                {status === 'idle' && (
                    <motion.div
                        key="idle"
                        layout="position"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 whitespace-nowrap"
                    >
                        <span>Send Message</span>
                        <Send size={20} />
                    </motion.div>
                )}

                {status === 'loading' && (
                    <motion.div
                        key="loading"
                        layout="position"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center"
                    >
                        <Loader2 size={24} className="animate-spin" />
                    </motion.div>
                )}

                {status === 'success' && (
                    <motion.div
                        key="success"
                        layout="position"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 whitespace-nowrap"
                    >
                        <span>Message Sent</span>
                        <Check size={20} />
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        key="error"
                        layout="position"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 whitespace-nowrap"
                    >
                        <span>Try Again</span>
                        <AlertCircle size={20} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

const SocialLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    aria-label={label}
    className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
  >
    {icon}
  </a>
);

export default Contact;