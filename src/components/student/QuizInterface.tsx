import React, { useState, useEffect } from 'react';
import { useQuiz, Question } from '../../contexts/QuizContext';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle } from 'lucide-react';

interface QuizInterfaceProps {
  quizId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function QuizInterface({ quizId, onComplete, onCancel }: QuizInterfaceProps) {
  const { user } = useAuth();
  const { quizzes, questions, submitQuizAttempt } = useQuiz();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const quiz = quizzes.find(q => q.id === quizId);
  const startTime = React.useRef<number>(Date.now());

  useEffect(() => {
    if (quiz) {
      // Shuffle questions for randomization
      const shuffledQuestions = [...questions]
        .filter(q => q.category === quiz.category || quiz.category === 'Mixed')
        .sort(() => Math.random() - 0.5)
        .slice(0, quiz.totalQuestions);
      
      setQuizQuestions(shuffledQuestions);
      setTimeLeft(quiz.duration * 60); // Convert minutes to seconds
    }
  }, [quiz, questions]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizQuestions.length > 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
    
    // Calculate score and category breakdown
    let correctAnswers = 0;
    const categoryScores: { [category: string]: { correct: number; total: number } } = {};
    
    quizQuestions.forEach(question => {
      const isCorrect = answers[question.id] === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { correct: 0, total: 0 };
      }
      categoryScores[question.category].total++;
      if (isCorrect) {
        categoryScores[question.category].correct++;
      }
    });

    const score = Math.round((correctAnswers / quizQuestions.length) * 100);
    
    const attempt = {
      quizId,
      studentId: user?.id || '',
      answers,
      score,
      totalQuestions: quizQuestions.length,
      timeSpent,
      categoryScores
    };

    submitQuizAttempt(attempt);
    
    // Show results
    const resultsData = {
      score,
      correctAnswers,
      totalQuestions: quizQuestions.length,
      timeSpent,
      categoryScores,
      questions: quizQuestions.map(q => ({
        ...q,
        userAnswer: answers[q.id],
        isCorrect: answers[q.id] === q.correctAnswer
      }))
    };
    
    setResults(resultsData);
    setShowResults(true);
    setIsSubmitting(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  };

  if (!quiz || quizQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Results Header */}
        <div className={`p-8 text-center ${
          results.score >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
          results.score >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
          'bg-gradient-to-r from-red-500 to-red-600'
        } text-white`}>
          <div className="mb-4">
            {results.score >= 80 ? (
              <CheckCircle className="w-16 h-16 mx-auto" />
            ) : results.score >= 60 ? (
              <Flag className="w-16 h-16 mx-auto" />
            ) : (
              <XCircle className="w-16 h-16 mx-auto" />
            )}
          </div>
          <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
          <p className="text-xl">You scored {results.score}%</p>
          <p className="text-lg opacity-90">
            {results.correctAnswers} out of {results.totalQuestions} questions correct
          </p>
        </div>

        <div className="p-8">
          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Score</h4>
              <p className={`text-2xl font-bold ${
                results.score >= 80 ? 'text-green-600 dark:text-green-400' :
                results.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {results.score}%
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Time</h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.floor(results.timeSpent / 60)}:{(results.timeSpent % 60).toString().padStart(2, '0')}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Accuracy</h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round((results.correctAnswers / results.totalQuestions) * 100)}%
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Performance by Category</h3>
            <div className="space-y-3">
              {Object.entries(results.categoryScores).map(([category, scores]: [string, any]) => {
                const percentage = Math.round((scores.correct / scores.total) * 100);
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {scores.correct}/{scores.total} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          percentage >= 80 ? 'bg-green-500' :
                          percentage >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
              Recommendations
            </h3>
            <div className="space-y-2 text-blue-800 dark:text-blue-200">
              {results.score >= 80 ? (
                <p>Excellent work! You have a strong understanding of this topic. Consider taking more advanced quizzes.</p>
              ) : results.score >= 60 ? (
                <p>Good job! You have a solid foundation. Review the topics you missed to improve further.</p>
              ) : (
                <p>Keep practicing! Focus on understanding the fundamental concepts and try the quiz again.</p>
              )}
              
              {Object.entries(results.categoryScores)
                .filter(([_, scores]: [string, any]) => scores.correct / scores.total < 0.6)
                .map(([category]) => (
                  <p key={category}>
                    • Consider reviewing <strong>{category}</strong> topics
                  </p>
                ))
              }
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onComplete}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentQuestionIndex(0);
                setAnswers({});
                setTimeLeft(quiz.duration * 60);
                startTime.current = Date.now();
              }}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{quiz.title}</h2>
          <button
            onClick={onCancel}
            className="text-blue-200 hover:text-white transition-colors"
          >
            Exit Quiz
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className={`font-mono text-lg ${timeLeft < 300 ? 'text-red-200' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <span className="text-blue-200">
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-blue-500 bg-opacity-30 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
              {currentQuestion.text}
            </h3>
            <div className="flex items-center space-x-2 ml-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentQuestion.category === 'Programming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                currentQuestion.category === 'DBMS' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                currentQuestion.category === 'Networks' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                currentQuestion.category === 'AI' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {currentQuestion.category}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentQuestion.points} pts
              </span>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  answers[currentQuestion.id] === index
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    answers[currentQuestion.id] === index
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            {/* Question indicators */}
            {quizQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : answers[quizQuestions[index].id] !== undefined
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex < quizQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(Math.min(quizQuestions.length - 1, currentQuestionIndex + 1))}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>

        {/* Answer Status */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {Object.keys(answers).length} of {quizQuestions.length} questions answered
          </p>
        </div>
      </div>
    </div>
  );
}