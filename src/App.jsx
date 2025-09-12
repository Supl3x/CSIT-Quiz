import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { QuizProvider } from './contexts/QuizContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import LoginPage from './components/auth/LoginPage.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import StudentDashboard from './components/student/StudentDashboard.jsx';
import Header from './components/common/Header.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
      </main>
    </div>
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