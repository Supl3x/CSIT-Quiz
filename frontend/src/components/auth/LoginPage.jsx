import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  AlertCircle, 
  Moon, 
  Sun, 
  Eye, 
  EyeOff,
  User,
  UserPlus,
  Sparkles,
  Shield,
  BookOpen
} from 'lucide-react';
import AnimatedBackground from '../common/AnimatedBackground.jsx';
import GlassCard from '../common/GlassCard.jsx';
import AnimatedButton from '../common/AnimatedButton.jsx';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, isValidNeduetEmail } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!isValidNeduetEmail(email)) {
        throw new Error('Please use your @cloud.neduet.edu.pk email address');
      }

      if (isLogin) {
        const success = await login(email, password);
        if (!success) {
          setError('Invalid credentials. Try admin@cloud.neduet.edu.pk or student@cloud.neduet.edu.pk');
        }
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        await register({ email, password, name });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <AnimatedBackground variant="dark">
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              {i % 3 === 0 ? (
                <BookOpen className="w-6 h-6 text-blue-400/30" />
              ) : i % 3 === 1 ? (
                <GraduationCap className="w-8 h-8 text-purple-400/30" />
              ) : (
                <Sparkles className="w-5 h-5 text-pink-400/30" />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="w-full max-w-md relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Theme Toggle */}
          <motion.div 
            className="flex justify-end mb-6"
            variants={itemVariants}
          >
            <motion.button
              onClick={toggleDarkMode}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 text-white/80 hover:text-white bg-white/10 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-xl transition-all border border-white/20"
            >
              <AnimatePresence mode="wait">
                {isDarkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            variants={itemVariants}
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-3xl mb-6 shadow-2xl relative overflow-hidden"
              whileHover={{ 
                scale: 1.1,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.5)",
                  "0 0 30px rgba(147, 51, 234, 0.5)",
                  "0 0 20px rgba(59, 130, 246, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              <GraduationCap className="w-10 h-10 text-white relative z-10" />
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              NED CSIT Portal
            </motion.h1>
            <motion.p 
              className="text-white/80 text-lg"
              variants={itemVariants}
            >
              Department of Computer Science & IT
            </motion.p>
            <motion.div
              className="flex items-center justify-center mt-2 text-sm text-white/60"
              variants={itemVariants}
            >
              <Shield className="w-4 h-4 mr-2" />
              <span>NED University of Engineering & Technology</span>
            </motion.div>
          </motion.div>

          {/* Login/Register Toggle */}
          <motion.div 
            className="flex mb-8 bg-white/10 backdrop-blur-xl rounded-2xl p-1 border border-white/20"
            variants={itemVariants}
          >
            <motion.button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                isLogin 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <User className="w-4 h-4 inline mr-2" />
              Sign In
            </motion.button>
            <motion.button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                !isLogin 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Sign Up
            </motion.button>
          </motion.div>

          {/* Form */}
          <GlassCard className="p-8" delay={0.3}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <motion.input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-white/50 transition-all"
                        placeholder="Enter your full name"
                        required={!isLogin}
                        whileFocus={{ scale: 1.02 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <motion.input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-white/50 transition-all"
                    placeholder="your.name@cloud.neduet.edu.pk"
                    required
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Only @cloud.neduet.edu.pk email addresses are accepted
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <motion.input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-white/50 transition-all"
                    placeholder="Enter your password"
                    required
                    whileFocus={{ scale: 1.02 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <motion.input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-white/50 transition-all"
                        placeholder="Confirm your password"
                        required={!isLogin}
                        whileFocus={{ scale: 1.02 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-2 text-red-300 bg-red-500/20 backdrop-blur-xl p-4 rounded-xl border border-red-500/30"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatedButton
                type="submit"
                disabled={isLoading}
                variant="glass"
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )}
              </AnimatedButton>
            </form>

            {/* Demo Credentials */}
            <motion.div 
              className="mt-8 pt-6 border-t border-white/20"
              variants={itemVariants}
            >
              <p className="text-sm text-white/60 text-center mb-4">Demo Credentials:</p>
              <div className="space-y-3 text-xs">
                <motion.div 
                  className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <p className="font-medium text-white/80">Faculty Access:</p>
                  <p className="text-white/60">admin@cloud.neduet.edu.pk</p>
                </motion.div>
                <motion.div 
                  className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <p className="font-medium text-white/80">Student Access:</p>
                  <p className="text-white/60">student@cloud.neduet.edu.pk</p>
                </motion.div>
              </div>
            </motion.div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
}