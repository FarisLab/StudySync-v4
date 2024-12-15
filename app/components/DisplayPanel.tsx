import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Props for the DisplayPanel component
 * @property {React.ReactNode} children - Content to be displayed in the panel
 * @property {number} minWidth - Minimum width before content is hidden
 * @property {number} minHeight - Minimum height before content is hidden
 * @property {string} className - Additional CSS classes
 * @property {boolean} animate - Whether to animate size changes
 */
interface DisplayPanelProps {
  children: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
  className?: string;
  animate?: boolean;
}

/**
 * A responsive panel component that gracefully handles content visibility
 * based on its dimensions
 */
const DisplayPanel: React.FC<DisplayPanelProps> = ({ 
  children, 
  minWidth = 480, 
  minHeight = 320,
  className = '',
  animate = true
}) => {
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
      className={`fixed inset-y-0 left-16 right-0 flex flex-col p-6 z-10 ${className}`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={panelVariants}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="glow-orb absolute -top-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-70" />
        <div className="glow-orb absolute bottom-20 right-20 w-[30rem] h-[30rem] bg-blue-500/20 rounded-full blur-3xl opacity-60" />
        <div className="glow-orb absolute top-1/3 left-1/2 w-[35rem] h-[35rem] bg-pink-500/10 rounded-full blur-3xl opacity-50" />
      </div>
      <div 
        className={`relative flex-1 transition-opacity duration-300 ${
          isContentVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {isContentVisible ? (
          <div className="h-full">
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
