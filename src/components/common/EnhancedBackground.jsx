import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext.jsx';

export default function EnhancedBackground({ children, variant = 'default' }) {
  const canvasRef = useRef(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const color = isDarkMode ? `rgba(255, 255, 255, ${this.opacity})` : `rgba(0, 0, 0, ${this.opacity * 0.3})`;
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            const lineColor = isDarkMode 
              ? `rgba(255, 255, 255, ${0.1 * (1 - distance / 120)})`
              : `rgba(0, 0, 0, ${0.05 * (1 - distance / 120)})`;
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      connectParticles();
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDarkMode]);

  const gradients = {
    default: isDarkMode ? 'from-slate-900 via-blue-900 to-slate-900' : 'from-blue-50 via-indigo-50 to-slate-50',
    dark: isDarkMode ? 'from-gray-900 via-slate-900 to-black' : 'from-gray-50 via-slate-50 to-white',
    blue: isDarkMode ? 'from-blue-950 via-indigo-950 to-slate-950' : 'from-blue-100 via-indigo-100 to-slate-100',
    purple: isDarkMode ? 'from-purple-950 via-violet-950 to-slate-950' : 'from-purple-100 via-violet-100 to-slate-100',
  };

  return (
    <div className={`relative min-h-screen bg-gradient-to-br ${gradients[variant]} overflow-hidden`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.4 }}
      />

      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
