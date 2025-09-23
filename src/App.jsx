import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { QuizProvider } from './contexts/QuizContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import LoginPage from './components/auth/LoginPage.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import StudentDashboard from './components/student/StudentDashboard.jsx';
import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';
import AnimatedBackground from './components/common/AnimatedBackground.jsx';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AnimatedBackground variant="dark">
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
                <AdminDashboard />
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
    </AnimatedBackground>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QuizProvider>
          <AppContent />
        </QuizProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;