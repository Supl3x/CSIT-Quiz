import React, { createContext, useContext, useState, useEffect } from 'react';

const QuizContext = createContext(undefined);

// COMPLETELY NEW DATA STRUCTURE - NO CATEGORY FILTERING
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
    // ONLY Programming quiz questions
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
    // ONLY DBMS quiz questions
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
    // ONLY Networks quiz questions
    questions: ['net-quiz-1', 'net-quiz-2', 'net-quiz-3']
  }
  
];

const initialTopics = ["Programming", "DBMS", "Networks", "AI", "Cybersecurity"];

export function QuizProvider({ children }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [attempts, setAttempts] = useState([]);
  const [topics, setTopics] = useState(initialTopics);

  // Load from localStorage
  useEffect(() => {
    console.log('🔄 Loading data from localStorage...');
    
    const savedQuestions = localStorage.getItem('csit-quiz-questions');
    const savedQuizzes = localStorage.getItem('csit-quiz-quizzes');
    const savedAttempts = localStorage.getItem('csit-quiz-attempts');
    const savedTopics = localStorage.getItem('csit-quiz-topics');

    if (savedQuestions) {
      try {
        const parsed = JSON.parse(savedQuestions);
        console.log('📥 Loaded questions:', parsed);
        setQuestions(parsed);
      } catch (e) {
        console.error('❌ Error parsing saved questions:', e);
        setQuestions(initialQuestions);
      }
    } else {
      console.log('📝 No saved questions, using initial data');
    }
    
    if (savedQuizzes) {
      try {
        const parsedQuizzes = JSON.parse(savedQuizzes);
        console.log('📥 Loaded quizzes:', parsedQuizzes);
        const quizzesWithDates = parsedQuizzes.map((quiz) => ({
          ...quiz,
          createdAt: quiz.createdAt ? new Date(quiz.createdAt) : new Date(),
        }));
        setQuizzes(quizzesWithDates);
      } catch (e) {
        console.error('❌ Error parsing saved quizzes:', e);
        setQuizzes(initialQuizzes);
      }
    } else {
      console.log('📝 No saved quizzes, using initial data');
    }
    
    if (savedAttempts) {
      try {
        const parsedAttempts = JSON.parse(savedAttempts);
        const attemptsWithDates = parsedAttempts.map((attempt) => ({
          ...attempt,
          completedAt: attempt.completedAt ? new Date(attempt.completedAt) : new Date(),
        }));
        setAttempts(attemptsWithDates);
      } catch (e) {
        console.error('Error parsing saved attempts:', e);
        setAttempts([]);
      }
    }

    if (savedTopics) {
      try {
        const parsedTopics = JSON.parse(savedTopics);
        console.log('📥 Loaded topics:', parsedTopics);
        setTopics(parsedTopics);
      } catch (e) {
        console.error('❌ Error parsing saved topics:', e);
        setTopics(initialTopics);
      }
    } else {
      console.log('📝 No saved topics, using initial data');
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('csit-quiz-questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('csit-quiz-quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('csit-quiz-attempts', JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem('csit-quiz-topics', JSON.stringify(topics));
  }, [topics]);

  // Helper function to get full quiz with question objects
  const getQuizWithQuestions = (quizId) => {
    console.log(`🔍 Getting quiz: ${quizId}`);
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
      .map(questionId => {
        const question = questions.find(q => q.id === questionId);
        if (!question) {
          console.log(`❌ Question ${questionId} not found in questions list`);
        }
        return question;
      })
      .filter(q => q !== undefined);

    console.log(`✅ Quiz ${quizId} loaded ${quizQuestions.length} questions:`, quizQuestions.map(q => q.text));
    
    return {
      ...quiz,
      questions: quizQuestions
    };
  };

  // Get all quizzes with their full questions
  const getQuizzesWithQuestions = () => {
    console.log('🔄 Getting all quizzes with questions...');
    const quizzesWithQuestions = quizzes.map(quiz => getQuizWithQuestions(quiz.id)).filter(quiz => quiz !== null);
    console.log('✅ All quizzes with questions:', quizzesWithQuestions.map(q => ({
      title: q.title,
      questionCount: q.questions.length,
      questions: q.questions.map(qq => qq.text)
    })));
    return quizzesWithQuestions;
  };

  // Initialize sample data (for testing)
  const initializeSampleData = () => {
    console.log('🔄 Initializing sample data...');
    
    // Clear everything first
    localStorage.removeItem('csit-quiz-questions');
    localStorage.removeItem('csit-quiz-quizzes');
    localStorage.removeItem('csit-quiz-attempts');
    
    setQuestions(initialQuestions);
    setQuizzes(initialQuizzes);
    setAttempts([]);
    
    // Set fresh data
    localStorage.setItem('csit-quiz-questions', JSON.stringify(initialQuestions));
    localStorage.setItem('csit-quiz-quizzes', JSON.stringify(initialQuizzes));
    localStorage.setItem('csit-quiz-attempts', JSON.stringify([]));
    
    console.log('✅ Sample data initialized!');
    console.log('📊 Quizzes:', initialQuizzes);
    console.log('❓ Questions:', initialQuestions);
    
    alert('Sample data loaded successfully! Page will reload...');
    
    // Force reload to see changes
    setTimeout(() => window.location.reload(), 1000);
  };

  // CRUD Operations
  const addQuestion = (question) => {
    const newQuestion = { ...question, id: Date.now().toString() };
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
      questions: quiz.questions || []
    };
    setQuizzes((prev) => [...prev, newQuiz]);
  };

  const updateQuiz = (id, quiz) => {
    setQuizzes((prev) => prev.map((q) => (q.id === id ? { ...q, ...quiz } : q)));
  };

  const deleteQuiz = (id) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  };

  const submitQuizAttempt = (attempt) => {
    const newAttempt = {
      ...attempt,
      id: Date.now().toString(),
      completedAt: new Date(),
    };
    setAttempts((prev) => [...prev, newAttempt]);
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
    const averageScore =
      quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts;
    const highestScore = Math.max(...quizAttempts.map((a) => a.score));
    const lowestScore = Math.min(...quizAttempts.map((a) => a.score));

    return { totalAttempts, averageScore, highestScore, lowestScore };
  };

  return (
    <QuizContext.Provider
      value={{
        questions,
        quizzes,
        attempts,
        topics,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addQuiz,
        updateQuiz,
        deleteQuiz,
        submitQuizAttempt,
        getStudentAttempts,
        getQuizStatistics,
        getQuizWithQuestions,
        getQuizzesWithQuestions,
        initializeSampleData,
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