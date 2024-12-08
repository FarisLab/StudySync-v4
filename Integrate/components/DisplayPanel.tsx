import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface DisplayPanelProps {
  children: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
}

const DisplayPanel = ({ 
  children, 
  minWidth = 480, 
  minHeight = 320
}: DisplayPanelProps) => {
  const [isContentVisible, setIsContentVisible] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setIsContentVisible(width >= minWidth && height >= minHeight);
      }
    });

    resizeObserver.observe(panelRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [minWidth, minHeight]);

  const panelVariants = {
    initial: {
      opacity: 0,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div 
      ref={panelRef}
      className="relative ml-16 min-h-screen p-2 sm:p-4 md:p-6 lg:p-8"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={panelVariants}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="glow-orb absolute top-10 -left-10 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="glow-orb absolute bottom-10 right-10 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="glow-orb absolute top-1/2 left-1/2 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-pink-500/20 rounded-full blur-3xl" />
      </div>
      <div 
        className={`relative z-10 bg-black/40 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/10 p-2 sm:p-4 md:p-6 transition-opacity duration-300 ${
          isContentVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {isContentVisible ? (
          <div className="min-w-[280px]">
            {children}
          </div>
        ) : (
          <div className="flex items-center justify-center h-20 sm:h-32 text-sm sm:text-base text-gray-400">
            <p>Please expand window for optimal viewing</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DisplayPanel;
