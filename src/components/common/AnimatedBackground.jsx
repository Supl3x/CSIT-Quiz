import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground({ children, variant = 'default' }) {
  const variants = {
    default: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    blue: {
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    },
    purple: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    dark: {
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
    }
  };

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={variants[variant]}
    >
      {/* Optimized animated geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-white bg-opacity-8 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30, // Much slower for better performance
            repeat: Infinity,
            ease: "linear"
          }}
        />
        {/* Removed additional animations for performance */}
      </div>
      
      {/* Reduced floating particles for performance */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white bg-opacity-30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 5 + Math.random() * 3, // Slower and more varied for performance
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}