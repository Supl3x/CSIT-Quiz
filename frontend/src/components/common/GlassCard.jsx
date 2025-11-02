import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ 
  children, 
  className = '', 
  hover = true, 
  delay = 0,
  ...props 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={hover ? { 
        scale: 1.02, 
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
      } : {}}
      className={`
        backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 
        border border-white/20 dark:border-gray-700/30
        rounded-2xl shadow-2xl
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}