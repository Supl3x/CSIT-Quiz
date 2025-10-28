import React, { createContext, useContext, useState, useEffect } from 'react';

const QuizContext = createContext(undefined);

// Import notification context
import { useNotification } from './useNotification.js';
const initialQuestions = [
  // ========== PROGRAMMING QUIZ QUESTIONS ==========
  {
    id: 'prog-quiz-1',
    type: 'multiple-choice',
    text: 'Which of the following is NOT a programming paradigm?',
    options: ['Object-Oriented', 'Functional', 'Procedural', 'Sequential'],
    correctAnswer: 3,
    category: 'Programming',
    difficulty: 'Medium',
    points: 10,
    explanation: 'Sequential is not a programming paradigm.'
  },
  {
    id: 'prog-quiz-2', 
    type: 'true-false',
    text: 'JavaScript is a statically typed language.',
    correctAnswer: false,
    category: 'Programming',
    difficulty: 'Easy',
    points: 5,
    explanation: 'JavaScript is dynamically typed, not statically typed.'
  },
  {
    id: 'prog-quiz-3',
    type: 'drag-drop',
    text: 'Match the programming language with its paradigm.',
    dragDropData: {
      items: ['Python', 'Haskell', 'Java', 'C++'],
      targets: ['Multi-paradigm', 'Functional', 'Object-Oriented', 'Procedural'],
      correctOrder: [0, 1, 2, 3],
      instruction: 'Drag each language to its correct paradigm'
    },
    category: 'Programming',
    difficulty: 'Medium',
    points: 12,
    explanation: 'Python is multi-paradigm, Haskell is functional, Java is object-oriented, C++ supports procedural programming.'
  },

  // ========== DBMS QUIZ QUESTIONS ==========
  {
    id: 'dbms-quiz-1',
    type: 'multiple-choice',
    text: 'What does SQL stand for?',
    options: [
      'Structured Query Language',
      'Simple Query Language',
      'Standard Query Language', 
      'System Query Language'
    ],
    correctAnswer: 0,
    category: 'DBMS',
    difficulty: 'Easy',
    points: 5,
    explanation: 'SQL stands for Structured Query Language.'
  },
  {
    id: 'dbms-quiz-2',
    type: 'true-false',
    text: 'A primary key can contain NULL values.',
    correctAnswer: false,
    category: 'DBMS', 
    difficulty: 'Medium',
    points: 8,
    explanation: 'Primary keys cannot contain NULL values as they must uniquely identify each record.'
  },
  {
    id: 'dbms-quiz-3',
    type: 'drag-drop',
    text: 'Match the database terms with their definitions.',
    dragDropData: {
      items: ['Primary Key', 'Foreign Key', 'Index', 'Transaction'],
      targets: ['Uniquely identifies records', 'References another table', 'Improves query performance', 'Atomic operation unit'],
      correctOrder: [0, 1, 2, 3],
      instruction: 'Drag each term to its correct definition'
    },
    category: 'DBMS',
    difficulty: 'Medium',
    points: 12,
    explanation: 'Primary keys uniquely identify records, foreign keys reference other tables, indexes improve performance, and transactions are atomic units.'
  },

  // ========== NETWORKS QUIZ QUESTIONS ==========
  {
    id: 'net-quiz-1',
    type: 'multiple-choice',
    text: 'Which layer of the OSI model handles routing?',
    options: ['Physical', 'Data Link', 'Network', 'Transport'],
    correctAnswer: 2,
    category: 'Networks',
    difficulty: 'Medium',
    points: 10,
    explanation: 'The Network layer handles routing and addressing.'
  },

  {
    id: 'net-quiz-2',
    type: 'true-false', 
    text: 'TCP is a connectionless protocol.',
    correctAnswer: false,
    category: 'Networks',
    difficulty: 'Medium',
    points: 8,
    explanation: 'TCP is connection-oriented, while UDP is connectionless.'
  },
  {
    id: 'net-quiz-3',
    type: 'drag-drop',
    text: 'Match the network devices with their functions.',
    dragDropData: {
      items: ['Router', 'Switch', 'Hub', 'Firewall'],
      targets: ['Connects different networks', 'Connects devices in LAN', 'Broadcasts to all ports', 'Filters network traffic'],
      correctOrder: [0, 1, 2, 3],
      instruction: 'Drag each device to its correct function'
    },
    category: 'Networks',
    difficulty: 'Hard',
    points: 15,
    explanation: 'Routers connect networks, switches connect LAN devices, hubs broadcast, and firewalls filter traffic.'
  }
];

const initialQuizzes = [
  {
    id: 'quiz-programming',
    title: 'Programming Fundamentals',
    category: 'Programming',
    duration: 30,
    isActive: true,
    createdBy: '1',
    createdAt: new Date('2024-01-01'),
    questions: ['prog-quiz-1', 'prog-quiz-2', 'prog-quiz-3']
  },
  {
    id: 'quiz-dbms',
    title: 'Database Management Systems',
    category: 'DBMS',
    duration: 45, 
    isActive: true,
    createdBy: '1',
    createdAt: new Date('2024-01-02'),
    questions: ['dbms-quiz-1', 'dbms-quiz-2', 'dbms-quiz-3']
  },
  {
    id: 'quiz-networks',
    title: 'Computer Networks',
    category: 'Networks',
    duration: 35,
    isActive: true,
    createdBy: '1',
    createdAt: new Date('2024-01-03'),
    questions: ['net-quiz-1', 'net-quiz-2', 'net-quiz-3']
  }
];

const initialTopics = ["Programming", "DBMS", "Networks", "AI", "Cybersecurity"];

export function QuizProvider({ children }) {
  const { addNotification } = useNotification();
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced localStorage functions
  const loadFromLocalStorage = (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.error(`❌ Error loading ${key} from localStorage:`, error);
    }
    return defaultValue;
  };

  const saveToLocalStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`❌ Error saving ${key} to localStorage:`, error);
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    console.log('🔄 Loading data from localStorage...');
    setIsLoading(true);

    const savedQuestions = loadFromLocalStorage('csit-quiz-questions', initialQuestions);
    const savedQuizzes = loadFromLocalStorage('csit-quiz-quizzes', initialQuizzes);
    const savedAttempts = loadFromLocalStorage('csit-quiz-attempts', []);
    const savedTopics = loadFromLocalStorage('csit-quiz-topics', initialTopics);

    // Ensure dates are properly parsed
    const quizzesWithDates = savedQuizzes.map(quiz => ({
      ...quiz,
      createdAt: quiz.createdAt ? new Date(quiz.createdAt) : new Date(),
    }));

    const attemptsWithDates = savedAttempts.map(attempt => ({
      ...attempt,
      completedAt: attempt.completedAt ? new Date(attempt.completedAt) : new Date(),
    }));

    setQuestions(savedQuestions);
    setQuizzes(quizzesWithDates);
    setAttempts(attemptsWithDates);
    setTopics(savedTopics);
    
    console.log('✅ Data loaded:', {
      questions: savedQuestions.length,
      quizzes: quizzesWithDates.length,
      attempts: attemptsWithDates.length,
      topics: savedTopics.length
    });
    
    setIsLoading(false);
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (!isLoading) {
      saveToLocalStorage('csit-quiz-questions', questions);
    }
  }, [questions, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveToLocalStorage('csit-quiz-quizzes', quizzes);
    }
  }, [quizzes, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveToLocalStorage('csit-quiz-attempts', attempts);
    }
  }, [attempts, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveToLocalStorage('csit-quiz-topics', topics);
    }
  }, [topics, isLoading]);

  // Data Management Functions
  const exportData = () => {
    const data = {
      questions,
      quizzes,
      attempts,
      topics,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `csit-quiz-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('📤 Data exported successfully');
  };

  const importData = (jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      if (data.questions) setQuestions(data.questions);
      if (data.quizzes) setQuizzes(data.quizzes);
      if (data.attempts) setAttempts(data.attempts);
      if (data.topics) setTopics(data.topics);
      
      console.log('📥 Data imported successfully');
      return true;
    } catch (error) {
      console.error('❌ Error importing data:', error);
      return false;
    }
  };

  const clearAllData = () => {
    if (window.confirm('⚠️ WARNING: This will delete ALL quiz data including questions, quizzes, and attempts. This cannot be undone. Are you sure?')) {
      setQuestions([]);
      setQuizzes([]);
      setAttempts([]);
      setTopics(initialTopics);
      
      // Clear localStorage
      localStorage.removeItem('csit-quiz-questions');
      localStorage.removeItem('csit-quiz-quizzes');
      localStorage.removeItem('csit-quiz-attempts');
      localStorage.removeItem('csit-quiz-topics');
      
      console.log('🗑️ All data cleared');
    }
  };

  const resetToSampleData = () => {
    if (window.confirm('This will replace all current data with sample data. Continue?')) {
      setQuestions(initialQuestions);
      setQuizzes(initialQuizzes);
      setAttempts([]);
      setTopics(initialTopics);
      
      console.log('🔄 Reset to sample data');
      
      alert('Sample data loaded successfully!');
    }
  };

  // Helper function to get full quiz with question objects
  const getQuizWithQuestions = (quizId) => {
    const quiz = quizzes.find(q => q.id === quizId);
    
    if (!quiz) {
      console.log(`❌ Quiz ${quizId} not found`);
      return null;
    }
    
    if (!quiz.questions || quiz.questions.length === 0) {
      console.log(`❌ Quiz ${quizId} has no questions`);
      return null;
    }
    
    const quizQuestions = quiz.questions
      .map(questionId => questions.find(q => q.id === questionId))
      .filter(q => q !== undefined);

    return {
      ...quiz,
      questions: quizQuestions,
      totalQuestions: quizQuestions.length
    };
  };

  // Get all quizzes with their full questions
  const getQuizzesWithQuestions = () => {
    return quizzes.map(quiz => getQuizWithQuestions(quiz.id)).filter(quiz => quiz !== null);
  };

  // CRUD Operations
  const addQuestion = (question) => {
    const newQuestion = { 
      ...question, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setQuestions((prev) => [...prev, newQuestion]);
    return newQuestion.id;
  };

  const updateQuestion = (id, question) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...question } : q)));
  };

  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    // Remove from quizzes
    setQuizzes(prev => prev.map(quiz => ({
      ...quiz,
      questions: quiz.questions ? quiz.questions.filter(qId => qId !== id) : []
    })));
  };

  const addQuiz = (quiz) => {
    const newQuiz = { 
      ...quiz, 
      id: Date.now().toString(), 
      createdAt: new Date(),
      questions: quiz.questions || [],
      totalQuestions: quiz.questions ? quiz.questions.length : 0
    };
    setQuizzes((prev) => [...prev, newQuiz]);
    return newQuiz.id;
  };

  const updateQuiz = (id, quiz) => {
    setQuizzes((prev) => prev.map((q) => (q.id === id ? { 
      ...q, 
      ...quiz,
      totalQuestions: quiz.questions ? quiz.questions.length : q.questions.length
    } : q)));
  };

  const deleteQuiz = (id) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  };

  const submitQuizAttempt = (attempt) => {
    const newAttempt = {
      ...attempt,
      id: Date.now().toString(),
      completedAt: new Date(),
      timeSpent: attempt.timeSpent || 0
    };
    setAttempts((prev) => [...prev, newAttempt]);
    return newAttempt.id;
  };

  const getStudentAttempts = (studentId) => {
    return attempts.filter((attempt) => attempt.studentId === studentId);
  };

  const addTopic = (topic) => {
    if (!topic || !topic.trim()) {
      return false;
    }
    const trimmedTopic = topic.trim();
    if (topics.includes(trimmedTopic)) {
      return false; // Topic already exists
    }
    setTopics((prev) => [...prev, trimmedTopic]);
    return true;
  };

  const deleteTopic = (topic) => {
    // Check if any questions use this topic
    const questionsWithTopic = questions.filter(q => q.category === topic);
    if (questionsWithTopic.length > 0) {
      return false; // Cannot delete topic with existing questions
    }
    setTopics((prev) => prev.filter((t) => t !== topic));
    return true;
  };

  const getQuizStatistics = (quizId) => {
    const quizAttempts = attempts.filter((attempt) => attempt.quizId === quizId);
    if (quizAttempts.length === 0) return null;

    const totalAttempts = quizAttempts.length;
    const averageScore = Math.round(
      quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts
    );
    const highestScore = Math.max(...quizAttempts.map((a) => a.score));
    const lowestScore = Math.min(...quizAttempts.map((a) => a.score));

    return { totalAttempts, averageScore, highestScore, lowestScore };
  };

  // Get storage statistics
  const getStorageStats = () => {
    const stats = {
      questions: questions.length,
      quizzes: quizzes.length,
      attempts: attempts.length,
      topics: topics.length,
      lastUpdated: new Date().toLocaleString()
    };
    
    // Calculate approximate storage size
    const dataStr = JSON.stringify({ questions, quizzes, attempts, topics });
    stats.approximateSize = Math.round((new Blob([dataStr]).size / 1024) * 100) / 100; // KB
    
    return stats;
  };

  return (
    <QuizContext.Provider
      value={{
        // State
        questions,
        quizzes,
        attempts,
        topics,
        isLoading,
        
        // CRUD Operations
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addQuiz,
        updateQuiz,
        deleteQuiz,
        submitQuizAttempt,
        getStudentAttempts,
        getQuizStatistics,
        
        // Question Validation
        validateAnswer: (question, answer) => {
          switch (question.type) {
            case 'multiple-choice':
              return answer === question.correctAnswer;
            case 'true-false':
              return answer === question.correctAnswer;
            case 'drag-drop':
              return JSON.stringify(Object.values(answer)) === JSON.stringify(question.dragDropData.correctOrder);

            default:
              return false;
          }
        },

        // Data Management
        getQuizWithQuestions,
        getQuizzesWithQuestions,
        exportData,
        importData,
        clearAllData,
        resetToSampleData,
        getStorageStats,
        
        // Topic Management
        addTopic,
        deleteTopic,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}