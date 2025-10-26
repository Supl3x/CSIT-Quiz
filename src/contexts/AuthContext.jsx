import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

// Mock users for demo - in production, this would be handled by a backend
const mockUsers = [
  {
    id: '1',
    email: 'admin@cloud.neduet.edu.pk',
    name: 'Dr. Ahmad Khan',
    role: 'admin',
    department: 'CSIT'
  },
  {
    id: '2',
    email: 'student@cloud.neduet.edu.pk', 
    name: 'Ali Ahmed',
    role: 'student',
    department: 'CSIT'
  },
  {
    id: '3',
    email: 'student2@cloud.neduet.edu.pk', 
    name: 'Sara Khan',
    role: 'student',
    department: 'CSIT'
  }
];

// Email validation function
const isValidNeduetEmail = (email) => {
  return email.endsWith('@cloud.neduet.edu.pk');
};
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('csit-quiz-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Validate email domain first
    if (!isValidNeduetEmail(email)) {
      throw new Error('Only @cloud.neduet.edu.pk email addresses are allowed');
    }
    
    // Mock authentication - in production, this would call your backend
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('csit-quiz-user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (userData) => {
    // Validate email domain
    if (!isValidNeduetEmail(userData.email)) {
      throw new Error('Only @cloud.neduet.edu.pk email addresses are allowed');
    }
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    
    // In production, this would call your backend
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      role: 'student' // Default role for new registrations
    };
    
    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('csit-quiz-user', JSON.stringify(newUser));
    return true;
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('csit-quiz-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isValidNeduetEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}