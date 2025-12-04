import React from 'react';
import { motion, Variants } from 'framer-motion';

const processSteps = [
  {
    title: "Business Analysis",
    description: "Understanding product goals, user needs, and constraints through requirements analysis and stakeholder context to define clear design direction."
  },
  {
    title: "Mood board Creation",
    description: "Exploring visual references, brand tone, and UI patterns to align design direction before moving into detailed screen design."
  },
  {
    title: "Wireframing",
    description: "Structuring user flows and layouts to ensure clarity, usability, and logical navigation before visual refinement."
  },
  {
    title: "High Fidelity Design",
    description: "Designing polished, responsive interfaces with visual consistency and handoff-ready components aligned with UX principles."
  }
];

const Process: React.FC = () => {
  // Define animation variants for cleaner control and smoother effect
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.15, // Slightly slower stagger for better visual flow
        duration: 0.6,
        ease: "easeOut"
      }
    })
  };

  return (
    <section id="process" className="py-20 lg:py-32 bg-gray-50">
      <div className="container mx-auto px-6 md:px-16 max-w-[1400px]">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-normal text-gray-900 mb-16 tracking-tight"
        >
          Design Process
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processSteps.map((step, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={itemVariants}
              className="bg-white p-8 lg:p-10 h-full flex flex-col justify-start items-start hover:shadow-lg transition-shadow duration-300 ease-in-out cursor-default"
            >
              <h3 className="text-xl md:text-2xl text-gray-900 mb-6 font-normal">{step.title}</h3>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;