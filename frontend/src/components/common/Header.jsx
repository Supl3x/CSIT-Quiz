import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { 
  GraduationCap, 
  LogOut, 
  Menu, 
  X, 
  Moon, 
  Sun, 
  User,
  Settings,
  Bell,
  Search,
  Sparkles
} from 'lucide-react';
import GlassCard from './GlassCard.jsx';
import AnimatedButton from './AnimatedButton.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: "New quiz available: Advanced Programming", time: "2 min ago", unread: true },
    { id: 2, text: "Your DBMS quiz score: 85%", time: "1 hour ago", unread: true },
    { id: 3, text: "Assignment deadline reminder", time: "3 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <motion.header 
      className="relative bg-gradient-to-r from-blue-900/90 via-purple-900/90 to-indigo-900/90 backdrop-blur-xl shadow-2xl border-b border-white/10"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 p-3 rounded-2xl shadow-lg relative overflow-hidden"
              whileHover={{ 
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)",
                scale: 1.1 
              }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 30px rgba(147, 51, 234, 0.4)",
                  "0 0 20px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
              <GraduationCap className="w-8 h-8 text-white relative z-10" />
            </motion.div>
            <div>
              <motion.h1 
                className="text-2xl font-bold text-white"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(59, 130, 246, 0.5)",
                    "0 0 20px rgba(147, 51, 234, 0.5)",
                    "0 0 10px rgba(59, 130, 246, 0.5)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                NED CSIT Portal
              </motion.h1>
              <p className="text-sm text-white/70">Department Portal</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Search Bar */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-64"
              />
            </motion.div>

            {/* Notifications */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 text-white/80 hover:text-white bg-white/10 backdrop-blur-xl rounded-xl hover:bg-white/20 transition-all border border-white/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 z-50"
                  >
                    <GlassCard className="p-4">
                      <h3 className="text-white font-semibold mb-3">Notifications</h3>
                      <div className="space-y-2">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            className={`p-3 rounded-lg ${
                              notification.unread 
                                ? 'bg-blue-500/20 border border-blue-500/30' 
                                : 'bg-white/5 border border-white/10'
                            }`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <p className="text-white text-sm">{notification.text}</p>
                            <p className="text-white/60 text-xs mt-1">{notification.time}</p>
                          </motion.div>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* User Info */}
            <motion.div 
              className="flex items-center space-x-4 text-white/90"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-right">
                <p className="font-medium">{user?.name}</p>
                <motion.span 
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    user?.role === 'admin' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {user?.role === 'admin' ? 'Faculty' : 'Student'}
                </motion.span>
              </div>
              
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <User className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>
            
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleDarkMode}
              className="p-3 text-white/80 hover:text-white bg-white/10 backdrop-blur-xl rounded-xl hover:bg-white/20 transition-all border border-white/20"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
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

            {/* Settings */}
            <motion.button
              className="p-3 text-white/80 hover:text-white bg-white/10 backdrop-blur-xl rounded-xl hover:bg-white/20 transition-all border border-white/20"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Settings className="w-5 h-5" />
            </motion.button>

            {/* Logout */}
            <AnimatedButton
              onClick={logout}
              variant="glass"
              className="bg-red-500/20 hover:bg-red-500/30 border-red-500/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </AnimatedButton>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 text-white/80 hover:text-white bg-white/10 backdrop-blur-xl rounded-xl border border-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden py-6 border-t border-white/20"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-white/90 p-4 bg-white/10 backdrop-blur-xl rounded-xl">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <User className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user?.role === 'admin' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    }`}>
                      {user?.role === 'admin' ? 'Faculty' : 'Student'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <AnimatedButton
                    onClick={toggleDarkMode}
                    variant="glass"
                    size="sm"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </AnimatedButton>
                  
                  <AnimatedButton
                    onClick={logout}
                    variant="glass"
                    size="sm"
                    className="bg-red-500/20 hover:bg-red-500/30 border-red-500/30"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}