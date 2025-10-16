import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../../contexts/QuizContext.jsx';
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
  Check
} from 'lucide-react';
import DragDropQuestion from './DragDropQuestion.jsx';
import CodeArrangementQuestion from './CodeArrangementQuestion.jsx';

// Question type icons and colors
const QUESTION_TYPES = {
  'multiple-choice': { icon: Type, color: 'blue', label: 'Multiple Choice' },
  'drag-drop': { icon: Move, color: 'green', label: 'Drag & Drop' },
  'sequence': { icon: ListOrdered, color: 'purple', label: 'Sequence' },
  'matching': { icon: ListOrdered, color: 'orange', label: 'Matching' },
  'true-false': { icon: CheckCircle, color: 'cyan', label: 'True/False' },
  'codearrangement': { icon: ListOrdered, color: 'indigo', label: 'Code Arrangement' }
};

function QuestionItem({ question, onAnswer, userAnswer, questionNumber, totalQuestions, onNext, onPrevious, onSubmit, currentIndex, isLastQuestion }) {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedOption, setSelectedOption] = useState(userAnswer || null);

  const QuestionTypeIcon = QUESTION_TYPES[question.type]?.icon || Type;
  const typeColor = QUESTION_TYPES[question.type]?.color || 'blue';

  // Update selectedOption if userAnswer changes (e.g., when navigating questions)
  useEffect(() => {
    setSelectedOption(userAnswer || null);
  }, [userAnswer, question.id]);

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
    onAnswer(question.id, optionIndex);
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
        // Check for specific answer value for MC/TF
        return userAnswer !== null;
      
      case 'drag-drop':
      case 'matching':
        // For drag-drop/matching, check if any answer is mapped
        return typeof userAnswer === 'object' && Object.keys(userAnswer || {}).length > 0;
      
      case 'codearrangement':
      case 'sequence':
        // For sequence/arrangement, check if the array has been populated
        return Array.isArray(userAnswer) && userAnswer.length > 0;
      
      default:
        return false;
    }
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options && question.options.map((option, index) => (
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
      case 'matching':
        return (
          // NOTE: Assuming DragDropQuestion and CodeArrangementQuestion are available
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
      key={question.id} // Key added to ensure re-mount on question change for animation
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
              disabled={!isAnswered() && false} // Submission is not strictly disabled if not answered
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
            {/* Display Correct Answer for Multiple Choice/True False */}
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

export default function StudentQuizInterface() {
  const { quizzes, getQuizzesWithQuestions, initializeSampleData, submitQuizAttempt } = useQuiz();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);

  // Get active quizzes with their full questions
  const activeQuizzes = getQuizzesWithQuestions().filter(quiz => 
    quiz.isActive && quiz.questions && quiz.questions.length > 0
  );

  // If no quiz is selected but there are active quizzes, auto-select the first one
  useEffect(() => {
    // Only auto-select if selectedQuiz is null and activeQuizzes are available
    if (!selectedQuiz && activeQuizzes.length > 0) {
      setSelectedQuiz(activeQuizzes[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuizzes]); // Removed selectedQuiz from dependency array to prevent loop

  // Get questions from the selected quiz
  const currentQuestions = selectedQuiz ? selectedQuiz.questions : [];
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
    // Calculate final score
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
            // For drag-drop with dragDropData structure (based on QuizContext's initialQuestions)
            if (question.dragDropData) {
              const correctMapping = Object.fromEntries(
                question.dragDropData.targets.map((target, index) => [
                  question.dragDropData.items[index], // Item is the key
                  question.dragDropData.targets[question.dragDropData.correctOrder.indexOf(index)] // Target is the value based on correctOrder
                ])
              );
              
              // NOTE: The user answer structure for drag-drop needs to be consistent. 
              // Assuming userAnswer is { 'dragItem': 'dropTarget', ... }
              // The initial state definition for drag-drop makes the correct order 
              // a simple index array [0, 1, 2, 3], meaning item[0] -> target[0], item[1] -> target[1] etc.
              const simpleCorrectOrderMapping = Object.fromEntries(
                question.dragDropData.items.map((item, index) => [
                  item, 
                  question.dragDropData.targets[index]
                ])
              );

              // Check if user has answered all parts
              if (Object.keys(userAnswer).length === question.dragDropData.items.length) {
                isCorrect = question.dragDropData.items.every(item => 
                  userAnswer[item] === simpleCorrectOrderMapping[item]
                );
              } else {
                isCorrect = false;
              }
            } else if (question.pairs) {
              // Pairs structure handling (not in initial data, but good to keep)
              isCorrect = question.pairs.every(pair => userAnswer[pair.left] === pair.right);
            }
            break;

          case 'codearrangement':
          case 'sequence':
            const correctOrderIds = question.correctOrder?.map(item => item.id) || 
                              question.sequenceData?.correctSequence || [];
            // Assuming userAnswer is an array of IDs in order
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

    // Submit to context
    submitQuizAttempt({
      quizId: selectedQuiz.id,
      studentId: 'student-1', // Hardcoded student ID for this example
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
  };

  const handleSelectDifferentQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizCompleted(false);
    setScore(null);
  };
  
  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizCompleted(false);
    setScore(null);
  };

  // Reset data function
  const handleResetData = () => {
    if (window.confirm('This will reset all quiz data to sample data. Continue?')) {
      initializeSampleData();
      setSelectedQuiz(null);
      setUserAnswers({});
      setQuizCompleted(false);
      setScore(null);
    }
  };

  // 1. If quiz is completed, show results
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
  
  // 2. If no quizzes are available, show a message and the reset button
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
          <button
            onClick={handleResetData}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Load Sample Quizzes
          </button>
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

  // 3. If selectedQuiz is null (or reset), show the list of quizzes
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
          <button
            onClick={handleResetData}
            className="flex items-center gap-2 bg-slate-700/50 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-600/50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Sample Data
          </button>
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

  // 4. Main Quiz Interface
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl font-bold text-white mb-1">{selectedQuiz.title}</h2>
          <p className="text-slate-400">{selectedQuiz.category} | {currentQuestions.length} Questions</p>
        </motion.div>
        <button
          onClick={handleSelectDifferentQuiz}
          className="flex items-center gap-2 bg-slate-700/50 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-600/50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Change Quiz
        </button>
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