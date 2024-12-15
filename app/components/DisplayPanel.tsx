import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Breadcrumb from './Breadcrumb';

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
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <motion.div 
      ref={panelRef}
      className={`fixed inset-y-0 left-16 right-0 flex flex-col z-10 ${className}`}
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
      
      <div className="relative flex-1 flex flex-col">
        <Breadcrumb />
        <div 
          className={`flex-1 p-8 transition-opacity duration-300 ${
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
      </div>
    </motion.div>
  );
};

export default DisplayPanel;
