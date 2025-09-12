import React, { createContext, useContext, useState, useEffect } from 'react';

const QuizContext = createContext(undefined);

// ---------------- MOCK DATA ----------------
const initialQuestions = [
  // ---------- MCQ QUESTIONS ----------
  {
    id: 'mcq-1',
    type: 'mcq',
    text: 'Which of the following is NOT a programming paradigm?',
    options: ['Object-Oriented', 'Functional', 'Procedural', 'Sequential'],
    correctAnswer: 3,
    category: 'Programming',
    difficulty: 'Medium',
    points: 10,
  },
  {
    id: 'mcq-2',
    type: 'mcq',
    text: 'What does SQL stand for?',
    options: [
      'Structured Query Language',
      'Simple Query Language',
      'Standard Query Language',
      'System Query Language',
    ],
    correctAnswer: 0,
    category: 'DBMS',
    difficulty: 'Easy',
    points: 5,
  },
  {
    id: 'mcq-3',
    type: 'mcq',
    text: 'Which layer of the OSI model handles routing?',
    options: ['Physical', 'Data Link', 'Network', 'Transport'],
    correctAnswer: 2,
    category: 'Networks',
    difficulty: 'Medium',
    points: 10,
  },
  {
    id: 'mcq-4',
    type: 'mcq',
    text: 'What is the primary goal of machine learning?',
    options: [
      'Data storage',
      'Pattern recognition',
      'Network communication',
      'User interface design',
    ],
    correctAnswer: 1,
    category: 'AI',
    difficulty: 'Easy',
    points: 5,
  },
  {
    id: 'mcq-5',
    type: 'mcq',
    text: 'Which encryption algorithm is considered quantum-resistant?',
    options: ['RSA', 'AES', 'Lattice-based cryptography', 'DES'],
    correctAnswer: 2,
    category: 'Cybersecurity',
    difficulty: 'Hard',
    points: 15,
  },

  // ---------- DRAG & DROP QUESTIONS ----------
  {
    id: 'dd-1',
    type: 'dragdrop',
    text: 'Match the programming language with its paradigm.',
    pairs: [
      { left: 'Python', right: 'Multi-paradigm' },
      { left: 'Haskell', right: 'Functional' },
      { left: 'Java', right: 'Object-Oriented' },
    ],
    category: 'Programming',
    difficulty: 'Medium',
    points: 10,
  },
  {
    id: 'dd-2',
    type: 'dragdrop',
    text: 'Match the database to its type.',
    pairs: [
      { left: 'MySQL', right: 'Relational' },
      { left: 'MongoDB', right: 'NoSQL' },
      { left: 'Neo4j', right: 'Graph DB' },
    ],
    category: 'DBMS',
    difficulty: 'Medium',
    points: 10,
  },
  {
    id: 'dd-3',
    type: 'dragdrop',
    text: 'Match the protocol to its layer.',
    pairs: [
      { left: 'IP', right: 'Network' },
      { left: 'TCP', right: 'Transport' },
      { left: 'Ethernet', right: 'Data Link' },
    ],
    category: 'Networks',
    difficulty: 'Hard',
    points: 15,
  },
  {
    id: 'dd-4',
    type: 'dragdrop',
    text: 'Match AI terms with their descriptions.',
    pairs: [
      { left: 'Supervised Learning', right: 'Labeled data' },
      { left: 'Unsupervised Learning', right: 'Clustering' },
      { left: 'Reinforcement Learning', right: 'Rewards & penalties' },
    ],
    category: 'AI',
    difficulty: 'Medium',
    points: 10,
  },
  {
    id: 'dd-5',
    type: 'dragdrop',
    text: 'Match the security concept to its meaning.',
    pairs: [
      { left: 'Confidentiality', right: 'Prevent unauthorized access' },
      { left: 'Integrity', right: 'Data accuracy' },
      { left: 'Availability', right: 'System uptime' },
    ],
    category: 'Cybersecurity',
    difficulty: 'Easy',
    points: 5,
  },

  // ...existing code...
  // ---------- CODE ARRANGEMENT QUESTIONS ----------
  {
    id: 'code-1',
    type: 'codearrangement',
    text: 'Arrange the following Python code in the correct order for calculating factorial:',
    codeSnippets: [
      { id: 's1', code: 'def factorial(n):' },
      { id: 's2', code: '    if n == 0 or n == 1:' },
      { id: 's3', code: '        return 1' },
      { id: 's4', code: '    else:' },
      { id: 's5', code: '        return n * factorial(n-1)' },
      { id: 's6', code: 'result = factorial(5)' },
      { id: 's7', code: 'print(result)' }
    ],
    correctOrder: [
      { id: 's1', code: 'def factorial(n):' },
      { id: 's2', code: '    if n == 0 or n == 1:' },
      { id: 's3', code: '        return 1' },
      { id: 's4', code: '    else:' },
      { id: 's5', code: '        return n * factorial(n-1)' },
      { id: 's6', code: 'result = factorial(5)' },
      { id: 's7', code: 'print(result)' }
    ],
    category: 'Programming',
    difficulty: 'Medium',
    points: 15,
  },
  {
    id: 'code-2',
    type: 'codearrangement',
    text: 'Arrange the SQL query execution order:',
    codeSnippets: [
      { id: 's1', code: 'SELECT name, age FROM users' },
      { id: 's2', code: 'WHERE age > 18' },
      { id: 's3', code: 'ORDER BY name ASC' },
      { id: 's4', code: 'LIMIT 10' }
    ],
    correctOrder: [
      { id: 's1', code: 'SELECT name, age FROM users' },
      { id: 's2', code: 'WHERE age > 18' },
      { id: 's3', code: 'ORDER BY name ASC' },
      { id: 's4', code: 'LIMIT 10' }
    ],
    category: 'DBMS',
    difficulty: 'Easy',
    points: 10,
  },
  {
    id: 'code-3',
    type: 'codearrangement',
    text: 'Arrange the React component lifecycle methods in order:',
    codeSnippets: [
      { id: 's1', code: 'constructor()' },
      { id: 's2', code: 'render()' },
      { id: 's3', code: 'componentDidMount()' },
      { id: 's4', code: 'componentDidUpdate()' },
      { id: 's5', code: 'componentWillUnmount()' }
    ],
    correctOrder: [
      { id: 's1', code: 'constructor()' },
      { id: 's2', code: 'render()' },
      { id: 's3', code: 'componentDidMount()' },
      { id: 's4', code: 'componentDidUpdate()' },
      { id: 's5', code: 'componentWillUnmount()' }
    ],
    category: 'Web Development',
    difficulty: 'Hard',
    points: 20,
  },

];

// Example Quizzes
const initialQuizzes = [
  {
    id: '1',
    title: 'Programming Fundamentals',
    category: 'Programming',
    duration: 30,
    totalQuestions: 10,
    isActive: true,
    createdBy: '1',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Database Management Systems',
    category: 'DBMS',
    duration: 45,
    totalQuestions: 15,
    isActive: true,
    createdBy: '1',
    createdAt: new Date('2024-01-02'),
  },
];

export function QuizProvider({ children }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [attempts, setAttempts] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const savedQuestions = localStorage.getItem('csit-quiz-questions');
    const savedQuizzes = localStorage.getItem('csit-quiz-quizzes');
    const savedAttempts = localStorage.getItem('csit-quiz-attempts');

    if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
    if (savedQuizzes) {
      const quizzes = JSON.parse(savedQuizzes).map((quiz) => ({
        ...quiz,
        createdAt: quiz.createdAt ? new Date(quiz.createdAt) : new Date(),
      }));
      setQuizzes(quizzes);
    }
    if (savedAttempts) {
      const attempts = JSON.parse(savedAttempts).map((attempt) => ({
        ...attempt,
        completedAt: attempt.completedAt ? new Date(attempt.completedAt) : new Date(),
      }));
      setAttempts(attempts);
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

  // CRUD Operations
  const addQuestion = (question) => {
    const newQuestion = { ...question, id: Date.now().toString() };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const updateQuestion = (id, question) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...question } : q)));
  };

  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const addQuiz = (quiz) => {
    const newQuiz = { ...quiz, id: Date.now().toString(), createdAt: new Date() };
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
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addQuiz,
        updateQuiz,
        deleteQuiz,
        submitQuizAttempt,
        getStudentAttempts,
        getQuizStatistics,
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
