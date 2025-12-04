import React from 'react';
import { motion } from 'framer-motion';
import { Download, Globe, Linkedin, ArrowDown, Plus, TreeDeciduous, Hammer, Languages, Building2, HeartHandshake, PaintBucket, Briefcase, Crown, Instagram } from 'lucide-react';

interface ClientLogo {
  id: string;
  name: string;
  sub: string;
  icon: React.ReactNode;
  logoUrl?: string;
}

const clients: ClientLogo[] = [
  { id: 'renowned', name: "RENOWNED", sub: "FINISHING", icon: <PaintBucket size={24}/>, logoUrl: "images\logo_1_color.png" },
  { id: 'house', name: "The House", sub: "Flipping Coach", icon: <Hammer size={24}/>, logoUrl: "images\logo_2_color.png" },
  { id: 'london', name: "LONDON", sub: "LANGUAGE CLUB", icon: <Languages size={24}/>, logoUrl: "images\logo_3_color.png" },
  { id: 'rios', name: "RIOS BROTHERS", sub: "CONCRETE SERVICES", icon: <Building2 size={24}/>, logoUrl: "images\logo_4_color.png" },
  { id: 'foundations', name: "FOUNDATIONS", sub: "TO SUCCESS", icon: <TreeDeciduous size={24}/>, logoUrl: "images\logo_5_color.png" },
  { id: 'tormynak', name: "TORMYNAK", sub: "CONTRACTING", icon: <Briefcase size={24}/>, logoUrl: "images\logo_6_color.png" },
  { id: 'campbell', name: "CAMPBELL", sub: "DERMATOLOGY", icon: <Crown size={24}/>, logoUrl: "images\logo_7_color.png" },
  { id: 'hisnew', name: "HIS NEW", sub: "CREATION MINISTRIES", icon: <HeartHandshake size={24}/>, logoUrl: "images\logo_8_color.png" },
];

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 lg:py-32 bg-gray-50 overflow-hidden">
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
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                I’m a UX/UI Designer with a strong foundation in user-centered design and hands-on experience working on real client projects. I focus on understanding user needs, simplifying complex flows, and turning ideas into clean, usable digital experiences.
              </p>
              
              <a 
                href="https://drive.google.com/uc?export=download&id=1ivQuzujkx1Lwx9XemVSNty7jrtiX6FEZ"
                className="group flex items-center gap-3 px-6 py-3 border border-gray-900 text-gray-900 font-medium hover:bg-black hover:text-white transition-all duration-300 w-fit mb-12 cursor-pointer"
              >
                Download Resume 
                <ArrowDown size={18} className="group-hover:translate-y-1 transition-transform" />
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4">
              <SocialIcon 
                href="https://www.linkedin.com/in/shafiul-nobel/" 
                icon={<Linkedin size={20} />} 
              />
              <SocialIcon 
                href="https://www.behance.net/shafiulnobel" 
                icon={<span className="font-bold text-lg">Be</span>} 
              /> 
              <SocialIcon 
                href="https://www.instagram.com/shafiul_nobel" 
                icon={<Instagram size={20} />} 
              />
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
            <div className="bg-white p-8 pb-0 h-full shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                {/* Globe Icon */}
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6 text-gray-900">
                    <Globe size={32} strokeWidth={1.5} />
                </div>
                
                <h3 className="text-5xl font-medium text-gray-900 mb-4">100+</h3>
                <p className="text-gray-500 mb-8 max-w-[200px]">
                    User-focused screens created from wireframes to polished UI.
                </p>

                {/* Vertical Portrait */}
                <div className="mt-auto w-full h-[300px] relative">
                     <img 
                        src="images\about_img1_color.png" 
                        alt="Nobel Portrait" 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 object-top"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                </div>
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
            {/* Landscape Image */}
            <div className="w-full h-64 overflow-hidden">
                <img 
                    src="images\about_img2_color.png" 
                    alt="Nobel Working" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
            </div>

            {/* Feature List */}
            <div className="space-y-6 mt-4">
                <FeatureItem text="Agency & startup experience working on UX research, wireframes, UI design, and usability improvements for real clients." />
                <FeatureItem text="Strong UX fundamentals - user research, pain-point analysis, information architecture, and usability testing." />
            </div>
          </motion.div>
        </div>

        {/* Logos Grid */}
        <motion.div 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1, delay: 0.5 }}
             className="border border-gray-200 bg-white"
        >
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-gray-200">
                {clients.map((client) => (
                    <LogoItem 
                        icon={client.icon} 
                        name={client.name} 
                        logoUrl={client.logoUrl}
                    />
                ))}
            </div>
        </motion.div>
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

const LogoItem = ({ icon, name, logoUrl }: { icon: React.ReactNode, name: string, logoUrl?: string }) => (
    <div className="h-32 flex items-center justify-center p-8 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">
        {logoUrl ? (
            <img src={logoUrl} alt={name} className="max-h-full max-w-full object-contain" />
        ) : (
            <div className="text-gray-600 hover:text-black transition-colors transform scale-125">
                {icon}
            </div>
        )}
    </div>
);

export default About;