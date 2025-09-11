import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category: 'Programming' | 'DBMS' | 'Networks' | 'AI' | 'Cybersecurity';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  category: string;
  duration: number; // in minutes
  totalQuestions: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: { [questionId: string]: number };
  score: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  completedAt: Date;
  categoryScores: { [category: string]: { correct: number; total: number } };
}

interface QuizContextType {
  questions: Question[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  addQuestion: (question: Omit<Question, 'id'>) => void;
  updateQuestion: (id: string, question: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  addQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
  updateQuiz: (id: string, quiz: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  submitQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => void;
  getStudentAttempts: (studentId: string) => QuizAttempt[];
  getQuizStatistics: (quizId: string) => any;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Mock data for demo
const initialQuestions: Question[] = [
  {
    id: '1',
    text: 'Which of the following is NOT a programming paradigm?',
    options: ['Object-Oriented', 'Functional', 'Procedural', 'Sequential'],
    correctAnswer: 3,
    category: 'Programming',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '2',
    text: 'What does SQL stand for?',
    options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'System Query Language'],
    correctAnswer: 0,
    category: 'DBMS',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '3',
    text: 'Which layer of the OSI model handles routing?',
    options: ['Physical', 'Data Link', 'Network', 'Transport'],
    correctAnswer: 2,
    category: 'Networks',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '4',
    text: 'What is the primary goal of machine learning?',
    options: ['Data storage', 'Pattern recognition', 'Network communication', 'User interface design'],
    correctAnswer: 1,
    category: 'AI',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '5',
    text: 'Which encryption algorithm is considered quantum-resistant?',
    options: ['RSA', 'AES', 'Lattice-based cryptography', 'DES'],
    correctAnswer: 2,
    category: 'Cybersecurity',
    difficulty: 'Hard',
    points: 15
  }
];

const initialQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Programming Fundamentals',
    category: 'Programming',
    duration: 30,
    totalQuestions: 10,
    isActive: true,
    createdBy: '1',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    title: 'Database Management Systems',
    category: 'DBMS',
    duration: 45,
    totalQuestions: 15,
    isActive: true,
    createdBy: '1',
    createdAt: new Date('2024-01-02')
  }
];

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const savedQuestions = localStorage.getItem('csit-quiz-questions');
    const savedQuizzes = localStorage.getItem('csit-quiz-quizzes');
    const savedAttempts = localStorage.getItem('csit-quiz-attempts');

    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }
    if (savedQuizzes) {
      // Parse and convert createdAt to Date
      const quizzes = JSON.parse(savedQuizzes).map((quiz: any) => ({
        ...quiz,
        createdAt: quiz.createdAt ? new Date(quiz.createdAt) : new Date()
      }));
      setQuizzes(quizzes);
    }
    if (savedAttempts) {
      // Parse and convert completedAt to Date
      const attempts = JSON.parse(savedAttempts).map((attempt: any) => ({
        ...attempt,
        completedAt: attempt.completedAt ? new Date(attempt.completedAt) : new Date()
      }));
      setAttempts(attempts);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('csit-quiz-questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('csit-quiz-quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('csit-quiz-attempts', JSON.stringify(attempts));
  }, [attempts]);

  const addQuestion = (question: Omit<Question, 'id'>) => {
    const newQuestion = { ...question, id: Date.now().toString() };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (id: string, question: Partial<Question>) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...question } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const addQuiz = (quiz: Omit<Quiz, 'id' | 'createdAt'>) => {
    const newQuiz = { ...quiz, id: Date.now().toString(), createdAt: new Date() };
    setQuizzes(prev => [...prev, newQuiz]);
  };

  const updateQuiz = (id: string, quiz: Partial<Quiz>) => {
    setQuizzes(prev => prev.map(q => q.id === id ? { ...q, ...quiz } : q));
  };

  const deleteQuiz = (id: string) => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
  };

  const submitQuizAttempt = (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
    const newAttempt = { 
      ...attempt, 
      id: Date.now().toString(), 
      completedAt: new Date() 
    };
    setAttempts(prev => [...prev, newAttempt]);
  };

  const getStudentAttempts = (studentId: string) => {
    return attempts.filter(attempt => attempt.studentId === studentId);
  };

  const getQuizStatistics = (quizId: string) => {
    const quizAttempts = attempts.filter(attempt => attempt.quizId === quizId);
    if (quizAttempts.length === 0) return null;

    const totalAttempts = quizAttempts.length;
    const averageScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts;
    const highestScore = Math.max(...quizAttempts.map(attempt => attempt.score));
    const lowestScore = Math.min(...quizAttempts.map(attempt => attempt.score));

    return {
      totalAttempts,
      averageScore,
      highestScore,
      lowestScore
    };
  };

  return (
    <QuizContext.Provider value={{
      questions,
      quizzes,
      attempts,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      addQuiz,
      updateQuiz,
      deleteQuiz,
      submitQuizAttempt,
      getStudentAttempts,
      getQuizStatistics
    }}>
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