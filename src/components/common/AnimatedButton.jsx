import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  ...props 
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white',
    danger: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white bg-transparent',
    glass: 'backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/20'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17 
      }}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        font-semibold rounded-xl
        shadow-lg hover:shadow-xl
        transition-all duration-300
        transform-gpu
        disabled:opacity-50 disabled:cursor-not-allowed
        relative overflow-hidden
        ${className}
      `}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}