import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { QuizProvider } from './contexts/QuizContext.jsx';
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx';
import { NotificationProvider } from './contexts/NotificationProvider.jsx';
import EnhancedLoginPage from './components/auth/EnhancedLoginPage.jsx';
import EnhancedAdminDashboard from './components/admin/EnhancedAdminDashboard.jsx';
import StudentDashboard from './components/student/StudentDashboard.jsx';
import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';
import EnhancedBackground from './components/common/EnhancedBackground.jsx';

function AppContent() {
  const { user, loading } = useAuth();
  const { isDarkMode } = useTheme();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <EnhancedBackground variant="default">
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">
            <EnhancedLoginPage />
          </div>
          <Footer />
        </div>
      </EnhancedBackground>
    );
  }

  return (
    <EnhancedBackground variant="default">
      <div className="min-h-screen flex flex-col">
        <Header />
        <motion.main 
          className="flex-1 container mx-auto px-4 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {user.role === 'admin' ? (
              <motion.div
                key="admin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <EnhancedAdminDashboard />
              </motion.div>
            ) : (
              <motion.div
                key="student"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <StudentDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
        <Footer />
      </div>
    </EnhancedBackground>
  );
}

function App() {
  return (
    <NotificationProvider>
      <ThemeProvider>
        <AuthProvider>
          <QuizProvider>
            <AppContent />
          </QuizProvider>
        </AuthProvider>
      </ThemeProvider>
    </NotificationProvider>
  );
}

export default App;