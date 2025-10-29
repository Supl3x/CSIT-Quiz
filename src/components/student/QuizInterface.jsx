import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../../contexts/QuizContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotification } from '../../contexts/useNotification.js';
import { shuffleQuestionsForStudent, shuffleOptionsForStudent, mapAnswerToOriginal, mapOriginalToShuffled } from '../../utils/shuffleUtils.js';
import { 
  Sparkles,
  Eye, 
  EyeOff,
  ListOrdered,
  Move,
  Type,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  ArrowLeft,
  Play,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Send,
  Check,
  Home,
  Bell
} from 'lucide-react';
import DragDropQuestion from './DragDropQuestion.jsx';
import CodeArrangementQuestion from './CodeArrangementQuestion.jsx';

// Question type icons and colors
const QUESTION_TYPES = {
  'multiple-choice': { icon: Type, color: 'blue', label: 'Multiple Choice' },
  'drag-drop': { icon: Move, color: 'green', label: 'Drag & Drop' },
  'true-false': { icon: CheckCircle, color: 'cyan', label: 'True/False' },
  'codearrangement': { icon: ListOrdered, color: 'indigo', label: 'Code Arrangement' }
};

function QuestionItem({ question, onAnswer, userAnswer, questionNumber, totalQuestions, onNext, onPrevious, onSubmit, currentIndex, isLastQuestion, studentId }) {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedOption, setSelectedOption] = useState(userAnswer || null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [optionMapping, setOptionMapping] = useState([]);

  const QuestionTypeIcon = QUESTION_TYPES[question.type]?.icon || Type;
  const typeColor = QUESTION_TYPES[question.type]?.color || 'blue';

  // Shuffle options for multiple choice questions based on student ID
  useEffect(() => {
    if (question.type === 'multiple-choice' && question.options) {
      const { shuffledOptions: shuffled, mapping } = shuffleOptionsForStudent(
        question.options, 
        studentId, 
        question.id
      );
      setShuffledOptions(shuffled);
      setOptionMapping(mapping);
    }
  }, [question.id, question.options, studentId, question.type]);

  // Update selectedOption if userAnswer changes (e.g., when navigating questions)
  useEffect(() => {
    if (question.type === 'multiple-choice' && userAnswer !== null && userAnswer !== undefined && optionMapping.length > 0) {
      // Convert original answer index to shuffled index for display
      const shuffledIndex = mapOriginalToShuffled(userAnswer, optionMapping);
      setSelectedOption(shuffledIndex);
    } else {
      setSelectedOption(userAnswer || null);
    }
  }, [userAnswer, question.id, optionMapping, question.type]);

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
    // Map the shuffled option index back to the original index for scoring
    const originalIndex = mapAnswerToOriginal(optionIndex, optionMapping);
    onAnswer(question.id, originalIndex);
  };

  const handleTrueFalseSelect = (value) => {
    setSelectedOption(value);
    onAnswer(question.id, value);
  };

  const handleDragDropAnswer = (answer) => {
    onAnswer(question.id, answer);
  };

  const handleCodeArrangementAnswer = (answer) => {
    onAnswer(question.id, answer);
  };

  const isAnswered = () => {
    if (userAnswer === undefined || userAnswer === null) return false;
    
    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        return userAnswer !== null;
      
      case 'drag-drop':
        if (question.dragDropData && question.dragDropData.items && question.dragDropData.targets) {
          const simpleCorrectOrderMapping = Object.fromEntries(
            question.dragDropData.items.map((item, index) => [
              question.dragDropData.targets[index], // target as key
              item  // item as value
            ])
          );

          if (Object.keys(userAnswer || {}).length === question.dragDropData.items.length) {
            return question.dragDropData.targets.every(
              (target) => userAnswer[target] === simpleCorrectOrderMapping[target]
            );
          }
        }
        return false;
      
      case 'codearrangement':
      case 'sequence':
        const correctOrderIds = question.correctOrder?.map(item => item.id) || 
                          question.sequenceData?.correctSequence || [];
        return JSON.stringify(userAnswer) === JSON.stringify(correctOrderIds);
      
      default:
        return false;
    }
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {shuffledOptions && shuffledOptions.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleOptionSelect(index)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedOption === index
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                    : 'bg-slate-800/50 border-slate-700/30 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
                    selectedOption === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="flex gap-4">
            <button
              onClick={() => handleTrueFalseSelect(true)}
              className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                selectedOption === true
                  ? 'bg-green-500/20 border-green-500 text-green-300'
                  : 'bg-slate-800/50 border-slate-700/30 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-medium">True</span>
              </div>
            </button>
            <button
              onClick={() => handleTrueFalseSelect(false)}
              className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                selectedOption === false
                  ? 'bg-red-500/20 border-red-500 text-red-300'
                  : 'bg-slate-800/50 border-slate-700/30 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <XCircle className="w-6 h-6" />
                <span className="text-lg font-medium">False</span>
              </div>
            </button>
          </div>
        );

      case 'drag-drop':
        return (
          <DragDropQuestion
            question={question}
            onAnswer={handleDragDropAnswer}
            userAnswer={userAnswer}
          />
        );

      case 'codearrangement':
      case 'sequence':
        return (
          <CodeArrangementQuestion
            question={question}
            onAnswer={handleCodeArrangementAnswer}
            userAnswer={userAnswer}
          />
        );

      default:
        return (
          <div className="text-slate-400 text-center p-8 bg-slate-800/50 rounded-xl border border-slate-700/30">
            This question type is not yet supported for solving.
          </div>
        );
    }
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className={`px-3 py-1 bg-${typeColor}-500/20 text-${typeColor}-300 rounded-full text-sm font-medium border border-${typeColor}-500/30`}>
              <QuestionTypeIcon className="w-4 h-4 inline mr-1" />
              {QUESTION_TYPES[question.type]?.label}
            </span>
            <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm font-medium border border-slate-600/50">
              <Award className="w-4 h-4 inline mr-1" />
              {question.points} points
            </span>
            {isAnswered() && (
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30">
                <Check className="w-4 h-4 inline mr-1" />
                Answered
              </span>
            )}
          </div>
          
          <h3 className="text-white text-lg font-medium leading-relaxed mb-4">
            {question.text}
          </h3>
        </div>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className="p-2 text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0"
        >
          {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Question Input Area */}
      <div className="mb-6">
        {renderQuestionInput()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-700/50">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            currentIndex === 0
              ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-3">
          {isLastQuestion ? (
            <button
              onClick={onSubmit}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-green-500/50 transition-all"
            >
              <Send className="w-4 h-4" />
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={onNext}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700/50">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          question.category === 'Programming' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
          question.category === 'DBMS' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
          question.category === 'Networks' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
          'bg-orange-500/20 text-orange-300 border border-orange-500/30'
        }`}>
          {question.category}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          question.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
          question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
          'bg-rose-500/20 text-rose-300 border border-rose-500/30'
        }`}>
          {question.difficulty}
        </span>
      </div>

      {/* Preview (if enabled) */}
      <AnimatePresence>
        {showPreview && question.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/30"
          >
            <h4 className="text-cyan-400 font-medium mb-2">Explanation:</h4>
            <p className="text-slate-300 text-sm">{question.explanation}</p>
            {(question.type === 'multiple-choice' || question.type === 'true-false') && (
              <p className="text-sm mt-2 font-semibold">
                Correct Answer: 
                <span className="text-green-400 ml-2">
                  {question.type === 'multiple-choice' 
                    ? question.options[question.correctAnswer]
                    : (question.correctAnswer ? 'True' : 'False')
                  }
                </span>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function QuizInterface({ quizId, onComplete, onCancel }) {
  const { quizzes, getQuizzesWithQuestions, getQuizWithQuestions, initializeSampleData, submitQuizAttempt } = useQuiz();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null); // in seconds
  const [timerActive, setTimerActive] = useState(false);
  
  // Store shuffled questions in localStorage to maintain consistency
  const getShuffledQuestionsForStudent = (questions, studentId, quizId) => {
    // Add timestamp to make it unique for each attempt
    const timestamp = new Date().getTime();
    const shuffled = shuffleQuestionsForStudent(questions, `${studentId}-${timestamp}`, quizId);
    return shuffled;
  };

  // Get active quizzes with their full questions
  const activeQuizzes = getQuizzesWithQuestions().filter(quiz => 
    quiz.isActive && quiz.questions && quiz.questions.length > 0
  );

  // Select quiz based on quizId prop; fallback to quiz selection
  useEffect(() => {
    if (!user) return; // Exit if no user
    
    if (quizId) {
      const q = getQuizWithQuestions(quizId);
      if (q) {
        setSelectedQuiz(q);
        // Shuffle questions for this specific student
        if (q.questions) {
          const shuffled = shuffleQuestionsForStudent(q.questions, user.id, q.id);
          setShuffledQuestions(shuffled);
        }
        // Reset quiz state when starting a new quiz
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setQuizCompleted(false);
        setScore(null);
        // Initialize timer
        if (q.duration) {
          setTimeRemaining(q.duration * 60); // Convert minutes to seconds
          setTimerActive(true);
        }
      }
    }
    // If no quizId provided, let user select from available quizzes
  }, [quizId, user]);

  // Timer effect - countdown every second
  useEffect(() => {
    let interval = null;
    
    if (timerActive && timeRemaining > 0 && !quizCompleted) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up! Auto-submit the quiz
            setTimerActive(false);
            addNotification('Time\'s up! Quiz submitted automatically.', 'warning');
            handleSubmitQuiz();
            return 0;
          }
          
          // Show warnings at specific time points
          if (prev === 300) { // 5 minutes remaining
            addNotification('⏰ 5 minutes remaining!', 'warning');
          } else if (prev === 120) { // 2 minutes remaining
            addNotification('⏰ 2 minutes remaining!', 'warning');
          } else if (prev === 60) { // 1 minute remaining
            addNotification('⚠️ 1 minute remaining!', 'error');
          } else if (prev === 30) { // 30 seconds remaining
            addNotification('🚨 30 seconds remaining!', 'error');
          }
          
          return prev - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0 || quizCompleted) {
      setTimerActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeRemaining, quizCompleted, addNotification]);

  // Format time display (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get questions from the shuffled quiz questions
  const currentQuestions = shuffledQuestions.length > 0 ? shuffledQuestions : [];
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;

  const handleAnswer = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Stop the timer
    setTimerActive(false);
    
    let correct = 0;
    let totalPoints = 0;
    let maxPoints = 0;

    currentQuestions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      maxPoints += question.points;
      
      if (userAnswer !== undefined && userAnswer !== null) {
        let isCorrect = false;

        switch (question.type) {
          case 'multiple-choice':
          case 'true-false':
            isCorrect = userAnswer === question.correctAnswer;
            break;

          case 'drag-drop':
          case 'matching':
            if (question.dragDropData) {
              const simpleCorrectOrderMapping = Object.fromEntries(
                question.dragDropData.items.map((item, index) => [
                  question.dragDropData.targets[index], // target as key
                  item  // item as value
                ])
              );

              if (Object.keys(userAnswer).length === question.dragDropData.items.length) {
                isCorrect = question.dragDropData.targets.every(target => 
                  userAnswer[target] === simpleCorrectOrderMapping[target]
                );
              } else {
                isCorrect = false;
              }
            } else if (question.pairs) {
              isCorrect = question.pairs.every(pair => userAnswer[pair.left] === pair.right);
            }
            break;

          case 'codearrangement':
          case 'sequence':
            const correctOrderIds = question.correctOrder?.map(item => item.id) || 
                              question.sequenceData?.correctSequence || [];
            isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctOrderIds);
            break;

          default:
            isCorrect = false;
        }

        if (isCorrect) {
          correct++;
          totalPoints += question.points;
        }
      }
    });

    const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    
    const finalScore = {
      correct,
      total: currentQuestions.length,
      points: totalPoints,
      maxPoints,
      percentage
    };

    setScore(finalScore);
    setQuizCompleted(true);

    submitQuizAttempt({
      quizId: selectedQuiz.id,
      studentId: user?.id || 'anonymous',
      answers: userAnswers,
      score: finalScore.percentage,
      completedAt: new Date()
    });
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizCompleted(false);
    setScore(null);
    // Restart timer
    if (selectedQuiz.duration) {
      setTimeRemaining(selectedQuiz.duration * 60);
      setTimerActive(true);
    }
  };

  const handleSelectDifferentQuiz = () => {
    // Reset internal state
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizCompleted(false);
    setScore(null);
    setShuffledQuestions([]);
    // Stop timer
    setTimerActive(false);
    setTimeRemaining(null);
    
    // Call parent callback to return to quiz selection
    if (onCancel) {
      onCancel();
    }
  };
  
  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizCompleted(false);
    setScore(null);
    
    // Shuffle questions for this specific student
    if (user && quiz.questions) {
      const shuffled = shuffleQuestionsForStudent(quiz.questions, user.id, quiz.id);
      setShuffledQuestions(shuffled);
    }
  };

  const handleResetData = () => {
    if (window.confirm('This will reset all quiz data to sample data. Continue?')) {
      initializeSampleData();
      setSelectedQuiz(null);
      setUserAnswers({});
      setQuizCompleted(false);
      setScore(null);
    }
  };

  if (quizCompleted && score) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-cyan-400" />
              Quiz Completed!
            </h2>
            <p className="text-slate-400 mt-1">Here's how you performed on **{selectedQuiz.title}**</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-8 text-center border border-slate-700/50"
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">{selectedQuiz.title}</h3>
            <p className="text-slate-400">{selectedQuiz.category}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-300">{score.correct}/{score.total}</div>
              <div className="text-slate-400 text-sm">Correct Answers</div>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-300">{score.points}/{score.maxPoints}</div>
              <div className="text-slate-400 text-sm">Points Earned</div>
            </div>
            <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-xl p-6">
              <div className="text-3xl font-bold text-cyan-300">{score.percentage}%</div>
              <div className="text-slate-400 text-sm">Overall Score</div>
            </div>
          </div>

          {/* Answer Review Section */}
          <div className="mt-8 border-t border-slate-700/50 pt-8">
            <h4 className="text-xl font-bold text-white mb-4">Detailed Answer Review</h4>
            <div className="space-y-4">
              {currentQuestions.map((question, index) => {
                const userAnswer = userAnswers[question.id];
                const isCorrect = (() => {
                  if (userAnswer === undefined || userAnswer === null) return false;
                  
                  switch (question.type) {
                    case 'multiple-choice':
                    case 'true-false':
                      return userAnswer === question.correctAnswer;
                    
                    case 'drag-drop':
                      if (question.dragDropData) {
                        const correctOrderMapping = Object.fromEntries(
                          question.dragDropData.items.map((item, i) => [
                            question.dragDropData.targets[i], // target as key
                            item  // item as value
                          ])
                        );
                        return Object.keys(userAnswer || {}).every(
                          key => userAnswer[key] === correctOrderMapping[key]
                        );
                      }
                      return false;
                    
                    case 'codearrangement':
                      const correctOrderIds = question.correctOrder?.map(item => item.id) || [];
                      return JSON.stringify(userAnswer) === JSON.stringify(correctOrderIds);
                    
                    default:
                      return false;
                  }
                })();

                return (
                  <div
                    key={question.id}
                    className={`bg-slate-800/50 rounded-xl p-6 border ${
                      isCorrect ? 'border-green-500/30' : 'border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isCorrect
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'} • {question.points} points
                          </span>
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                            Question {index + 1}
                          </span>
                        </div>
                        <p className="text-white mb-4">{question.text}</p>
                        
                        {/* Answer Display */}
                        <div className="space-y-3">
                          {question.type === 'multiple-choice' && (
                            <>
                              <div className="text-sm text-slate-400">Your Answer:</div>
                              <div className={`p-3 rounded-lg ${
                                isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                              }`}>
                                {userAnswer !== null ? question.options[userAnswer] : 'No answer provided'}
                              </div>
                              {!isCorrect && (
                                <>
                                  <div className="text-sm text-slate-400 mt-2">Correct Answer:</div>
                                  <div className="p-3 rounded-lg bg-green-500/20 text-green-300">
                                    {question.options[question.correctAnswer]}
                                  </div>
                                </>
                              )}
                            </>
                          )}

                          {question.type === 'true-false' && (
                            <>
                              <div className="text-sm text-slate-400">Your Answer:</div>
                              <div className={`p-3 rounded-lg ${
                                isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                              }`}>
                                {userAnswer !== null ? (userAnswer ? 'True' : 'False') : 'No answer provided'}
                              </div>
                              {!isCorrect && (
                                <>
                                  <div className="text-sm text-slate-400 mt-2">Correct Answer:</div>
                                  <div className="p-3 rounded-lg bg-green-500/20 text-green-300">
                                    {question.correctAnswer ? 'True' : 'False'}
                                  </div>
                                </>
                              )}
                            </>
                          )}

                          {question.type === 'drag-drop' && (
                            <>
                              <div className="text-sm text-slate-400">Your Matches:</div>
                              <div className={`space-y-2 ${
                                isCorrect ? 'text-green-300' : 'text-red-300'
                              }`}>
                                {question.dragDropData?.items.map((item, i) => {
                                  // Find which target this item was matched to
                                  const matchedTarget = Object.keys(userAnswer || {}).find(target => userAnswer[target] === item);
                                  return (
                                    <div key={i} className="flex items-center gap-2">
                                      <span>{item}</span>
                                      <span>→</span>
                                      <span>{matchedTarget || 'Not matched'}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              {!isCorrect && (
                                <>
                                  <div className="text-sm text-slate-400 mt-2">Correct Matches:</div>
                                  <div className="space-y-2 text-green-300">
                                    {question.dragDropData?.items.map((item, i) => (
                                      <div key={i} className="flex items-center gap-2">
                                        <span>{item}</span>
                                        <span>→</span>
                                        <span>{question.dragDropData.targets[i]}</span>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </>
                          )}

                          {question.explanation && (
                            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                              <div className="text-sm text-blue-300 font-medium mb-1">Explanation:</div>
                              <div className="text-slate-300">{question.explanation}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={handleRestartQuiz}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Quiz
            </button>
            <button
              onClick={handleSelectDifferentQuiz}
              className="flex items-center gap-2 bg-slate-700/50 text-slate-300 px-6 py-3 rounded-xl font-medium hover:bg-slate-600/50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Choose Another Quiz
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  if (activeQuizzes.length === 0) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-cyan-400" />
              Quiz Practice Arena
            </h2>
            <p className="text-slate-400 mt-1">Test your knowledge with interactive questions</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center"
        >
          <p className="text-slate-300">
            There are no active quizzes available right now. Please load sample data to begin.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!selectedQuiz) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-cyan-400" />
              Choose Your Quiz
            </h2>
            <p className="text-slate-400 mt-1">Select a quiz to begin your practice session.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {activeQuizzes.map(quiz => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleSelectQuiz(quiz)}
              className="cursor-pointer bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/50 transition-all shadow-lg hover:shadow-cyan-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{quiz.title}</h3>
                <Play className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-slate-400 text-sm mb-4">{quiz.questions.length} Questions</p>
              
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  quiz.category === 'Programming' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  quiz.category === 'DBMS' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                  quiz.category === 'Networks' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                  'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                }`}>
                  {quiz.category}
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                  <Clock className="w-3 h-3" />
                  {quiz.duration} min
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl font-bold text-white mb-1">{selectedQuiz.title}</h2>
          <p className="text-slate-400">{selectedQuiz.category} | {currentQuestions.length} Questions</p>
          {timeRemaining !== null && (
            <div className={`mt-2 flex items-center gap-2 ${timeRemaining <= 300 ? 'text-red-400' : timeRemaining <= 600 ? 'text-orange-400' : 'text-green-400'}`}>
              <Clock className="w-4 h-4" />
              <span className="font-medium">Time Remaining: {formatTime(timeRemaining)}</span>
            </div>
          )}
        </motion.div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onCancel()} // Using onCancel to return to dashboard
            className="flex items-center gap-2 bg-cyan-600/50 text-cyan-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-cyan-600/70 transition-all"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={handleSelectDifferentQuiz}
            className="flex items-center gap-2 bg-slate-700/50 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-600/50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Change Quiz
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentQuestion && (
          <QuestionItem
            question={currentQuestion}
            onAnswer={handleAnswer}
            userAnswer={userAnswers[currentQuestion.id]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={currentQuestions.length}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSubmit={handleSubmitQuiz}
            currentIndex={currentQuestionIndex}
            isLastQuestion={isLastQuestion}
            studentId={user?.id}
          />
        )}
      </AnimatePresence>

      {/* Quiz Progress/Navigation Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl"
      >
        <div className="text-sm font-medium text-slate-300 mr-2 self-center">Progress:</div>
        {currentQuestions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestionIndex(index)}
            title={q.text}
            className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
              index === currentQuestionIndex
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/50'
                : userAnswers[q.id] !== undefined && userAnswers[q.id] !== null && Object.keys(userAnswers[q.id] || {}).length > 0
                  ? 'bg-green-600/50 text-green-300 border border-green-600 hover:bg-green-600'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </motion.div>
    </div>
  );
}