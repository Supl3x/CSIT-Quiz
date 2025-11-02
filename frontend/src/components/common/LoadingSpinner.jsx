import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles, BookOpen, Code } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground.jsx';

export default function LoadingSpinner() {
  const icons = [GraduationCap, Sparkles, BookOpen, Code];

  return (
    <AnimatedBackground variant="dark">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* Main Loading Animation */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          >
            {/* Outer Ring */}
            <motion.div
              className="w-32 h-32 border-4 border-blue-500/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner Ring */}
            <motion.div
              className="absolute inset-4 border-4 border-purple-500/50 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Center Icon */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Floating Icons */}
            {icons.map((Icon, index) => (
              <motion.div
                key={index}
                className="absolute w-8 h-8 text-white/60"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0',
                }}
                animate={{
                  rotate: [0, 360],
                  x: [0, Math.cos((index * Math.PI) / 2) * 60],
                  y: [0, Math.sin((index * Math.PI) / 2) * 60],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "linear"
                }}
              >
                <Icon className="w-6 h-6" />
              </motion.div>
            ))}
          </motion.div>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <motion.h2
              className="text-3xl font-bold text-white mb-2"
              animate={{
                textShadow: [
                  "0 0 10px rgba(59, 130, 246, 0.5)",
                  "0 0 20px rgba(147, 51, 234, 0.5)",
                  "0 0 10px rgba(59, 130, 246, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              NED CSIT Portal
            </motion.h2>
            
            <motion.p
              className="text-white/80 text-lg"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Loading your academic experience...
            </motion.p>

            {/* Progress Dots */}
            <div className="flex justify-center space-x-2 mt-6">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>

            {/* Loading Bar */}
            <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mx-auto mt-6">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-white/60 text-sm mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Department of Computer Science & Information Technology
          </motion.p>
        </div>
      </div>
    </AnimatedBackground>
  );
}