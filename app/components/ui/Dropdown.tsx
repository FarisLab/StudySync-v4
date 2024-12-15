'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  placeholder?: string;
  className?: string;
  minWidth?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  icon: Icon,
  placeholder = 'Select option',
  className = '',
  minWidth = '120px',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      ref={dropdownRef}
      className={`relative ${className}`}
      style={{ minWidth }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 pl-4 pr-10 py-2.5 bg-black/40 backdrop-blur-md border border-white/10 
          rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/70 transition-all cursor-pointer
          hover:bg-black/50"
      >
        {Icon && <Icon className="w-5 h-5 text-white/40" />}
        <span className="flex-1 text-left truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon 
          className={`absolute right-3 w-5 h-5 text-white/40 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 py-1 bg-gray-900/90 backdrop-blur-md border border-white/10 
              rounded-xl shadow-xl overflow-hidden"
          >
            {options.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors
                  ${option.value === value 
                    ? 'bg-purple-500/20 text-white' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
