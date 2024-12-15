import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * Props for the PageTransition component
 * @property {ReactNode} children - Content to be animated
 * @property {string} className - Additional CSS classes
 * @property {number} duration - Animation duration in seconds
 * @property {number} delay - Animation delay in seconds
 * @property {Variants} variants - Custom framer-motion variants
 */
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  variants?: Variants;
}

/**
 * A component that wraps page content with smooth transitions
 */
const PageTransition: React.FC<PageTransitionProps> = ({ 
  children,
  className = '',
  duration = 0.4,
  delay = 0,
  variants
}) => {
  const defaultVariants: Variants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Custom bezier curve for smooth fade
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: {
        duration: duration * 0.75,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants || defaultVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
