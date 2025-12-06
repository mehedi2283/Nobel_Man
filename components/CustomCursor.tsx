import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Default to hidden until device check
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Canvas refs for smoke trail
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    life: number;
    maxLife: number;
  }>>([]);
  const animationFrameId = useRef<number>(0);

  // Check for mouse device on mount
  useEffect(() => {
    const checkDevice = () => {
        // Only show if the device has a fine pointer (mouse)
        const hasMouse = window.matchMedia('(pointer: fine)').matches;
        setIsVisible(hasMouse);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    // If not visible (e.g. touch device), do not attach listeners
    if (!isVisible) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16); // Center the 32px cursor
      cursorY.set(e.clientY - 16);
      
      // Add particle on mouse move
      addParticle(e.clientX, e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over clickable elements
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer') ||
        target.classList.contains('group')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('resize', handleResize);

    // Initialize Canvas
    handleResize();
    
    // Start Animation Loop
    renderCanvas();

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [cursorX, cursorY, isVisible]);
  
  const handleResize = () => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
  };

  const addParticle = (x: number, y: number) => {
    // Limit max particles for performance
    if (particles.current.length > 50) {
        particles.current.shift();
    }
    
    particles.current.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.5, // Slight random horizontal drift
      vy: (Math.random() - 0.5) * 0.5, // Slight random vertical drift
      size: Math.random() * 8 + 4, // Random start size
      life: 50, // Frames to live
      maxLife: 50
    });
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      
      p.life--;
      if (p.life <= 0) {
        particles.current.splice(i, 1);
        continue;
      }

      // Physics
      p.x += p.vx;
      p.y += p.vy;
      p.size += 0.15; // Slowly expand

      // Draw
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      
      const opacity = (p.life / p.maxLife) * 0.3; // Fade out
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }

    animationFrameId.current = requestAnimationFrame(renderCanvas);
  };

  // If on a touch device, do not render anything
  if (!isVisible) return null;

  return (
    <>
      {/* Smoke Canvas Overlay */}
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998] mix-blend-difference"
      />
      
      {/* Main Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference bg-white"
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1, // Subtle scale up (1.5 instead of 1)
          backgroundColor: isHovering ? "white" : "transparent",
          borderColor: isHovering ? "transparent" : "white"
        }}
        // Instant movement for x/y (duration 0), Spring for scale
        transition={{ 
            x: { duration: 0 },
            y: { duration: 0 },
            scale: { type: "spring", stiffness: 300, damping: 20 },
            default: { duration: 0.1 }
        }}
      >
          {/* Inner dot that disappears on hover */}
          <motion.div 
              className="w-1 h-1 bg-white rounded-full"
              animate={{ opacity: isHovering ? 0 : 1 }}
          />
      </motion.div>
    </>
  );
};

export default CustomCursor;