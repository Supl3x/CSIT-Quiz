import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../../contexts/QuizContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle, Zap, Star, Award as AwardIcon, TrendingUp as TrendIcon } from 'lucide-react';

export default function QuizInterface({ quizId, onComplete, onCancel }) {
  const { user } = useAuth();
  const { quizzes, startQuizAttempt, submitQuizAttempt } = useQuiz();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState(null);

  const quiz = quizzes.find(q => q._id === quizId);
  const startTime = React.useRef(Date.now());

  useEffect(() => {
    if (quiz) {
      loadQuizQuestions();
    }
  }, [quiz]);

  const loadQuizQuestions = async () => {
    setLoading(true);
    try {
      // const questions = await getQuizQuestions(quizId);
      // setQuizQuestions(questions);
      // setTimeLeft(quiz.duration * 60);
      const attemptData = await startQuizAttempt(quizId);
      setAttemptId(attemptData.attemptId);

      const formattedQuestions = attemptData.questions.map(q => ({
        _id: q.snapshot.questionId,
        text: q.snapshot.title,
        options: q.snapshot.choices,
        category: q.snapshot.tags ? q.snapshot.tags[0] : 'General', 
        points: q.snapshot.points,
        difficulty: q.snapshot.difficulty
      }));

      setQuizQuestions(formattedQuestions);
      setTimeLeft(quiz.durationMinutes * 60);

    } catch (error) {
      console.error('Error starting quiz ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(loading) return;
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizQuestions.length > 0 && !isSubmitting && !showResults) {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleAnswerSelect = (questionId, choiceId) => {
    setAnswers(prev => ({ ...prev, [questionId]: choiceId }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || !attemptId) return;
    
    setIsSubmitting(true);
    
    // const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
    
    // Calculate score and category breakdown
    // let correctAnswers = 0;
    // const categoryScores = {};
    
    // quizQuestions.forEach(question => {
    //   const isCorrect = answers[question.id] === question.correctAnswer;
    //   if (isCorrect) correctAnswers++;
      
    //   if (!categoryScores[question.category]) {
    //     categoryScores[question.category] = { correct: 0, total: 0 };
    //   }
    //   categoryScores[question.category].total++;
    //   if (isCorrect) {
    //     categoryScores[question.category].correct++;
    //   }
    // });

    const backendAnswers = Object.keys(answers).map(qId => ({
      questionId: qId,
      answer: {
        selectedChoice: answers[qId] // This is the choice _id we saved
      }
    }));

    // const score = Math.round((correctAnswers / quizQuestions.length) * 100);
    
  //   const attempt = {
  //     quizId,
  //     studentId: user?.id || '',
  //     studentName: user?.name || 'Student',
  //     answers,
  //     score,
  //     totalQuestions: quizQuestions.length,
  //     timeSpent,
  //     categoryScores
  //   };

  //   await submitQuizAttempt(attempt);
    
  //   // Show results
  //   const resultsData = {
  //     score,
  //     correctAnswers,
  //     totalQuestions: quizQuestions.length,
  //     timeSpent,
  //     categoryScores,
  //     questions: quizQuestions.map(q => ({
  //       ...q,
  //       userAnswer: answers[q.id],
  //       isCorrect: answers[q.id] === q.correctAnswer
  //     }))
  //   };
    
  //   setResults(resultsData);
  //   setShowResults(true);
  //   setIsSubmitting(false);
  // };

    try {
      // 2. Submit answers to the backend for secure grading
      const gradedAttempt = await submitQuizAttempt(attemptId, backendAnswers);


      const categoryScores = {};
      gradedAttempt.questions.forEach(q => {
        const category = q.snapshot.tags ? q.snapshot.tags[0] : 'General';
        if (!categoryScores[category]) {
          categoryScores[category] = { correct: 0, total: 0 };
        }
        categoryScores[category].total++;
        if (q.autoScore > 0) {
          categoryScores[category].correct++;
        }
      });

      // 3. Use the backend's results to show the results page
      // The backend returns the full, graded attempt object
      const resultsData = {
        score: gradedAttempt.totalScore,
        correctAnswers: gradedAttempt.questions.filter(q => q.autoScore > 0).length,
        totalQuestions: gradedAttempt.questions.length,
        timeSpent: gradedAttempt.timeTakenSeconds,
        categoryScores: gradedAttempt.categoryScores,
        questions: [] 
      };

      setResults(resultsData);
      setShowResults(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      // Show an error to the user
    } finally {
      setIsSubmitting(false);
    }

  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if(quizQuestions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  };

  if (!quiz || loading || quizQuestions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-slate-400 text-lg">Loading quiz...</p>
        </div>
      </motion.div>
    );
  }

  if (showResults && results) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`relative p-12 text-center overflow-hidden ${
            results.totalScore >= 80 ? 'bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600' :
            results.totalScore >= 60 ? 'bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-600' :
            'bg-gradient-to-br from-rose-600 via-red-600 to-pink-600'
          } text-white`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
              className="mb-6"
            >
              {results.totalScore >= 80 ? (
                <div className="relative inline-block">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-white/20 rounded-full blur-xl"
                  />
                  <CheckCircle className="w-24 h-24 mx-auto relative" />
                </div>
              ) : results.totalScore >= 60 ? (
                <Flag className="w-24 h-24 mx-auto" />
              ) : (
                <XCircle className="w-24 h-24 mx-auto" />
              )}
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-5xl font-bold mb-4 drop-shadow-lg"
            >
              Quiz Completed!
            </motion.h2>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.6 }}
              className="text-7xl font-black mb-2 bg-white/20 backdrop-blur-sm rounded-2xl py-6 px-8 inline-block"
            >
              {results.totalScore}%
            </motion.div>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-2xl opacity-90 font-medium"
            >
              {results.correctAnswers} out of {results.totalQuestions} questions correct
            </motion.p>
          </div>
        </motion.div>

        <div className="p-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {[
              { icon: Star, label: 'Score', value: `${results.totalScore}%`, color: 'cyan' },
              { icon: Clock, label: 'Time', value: `${Math.floor(results.timeTakenSeconds / 60)}:${(results.timeTakenSeconds % 60).toString().padStart(2, '0')}`, color: 'purple' },
              { icon: Zap, label: 'Accuracy', value: `${Math.round((results.correctAnswers / results.totalQuestions) * 100)}%`, color: 'pink' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-6 text-center border border-slate-600/50 overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <stat.icon className={`w-8 h-8 text-${stat.color}-400 mx-auto mb-3`} />
                <h4 className="font-semibold text-slate-300 mb-2">{stat.label}</h4>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendIcon className="w-6 h-6 text-cyan-400" />
              Performance by Category
            </h3>
            <div className="space-y-4">
              {Object.entries(results.categoryScores).map(([category, scores], index) => {
                const percentage = Math.round((scores.correct / scores.total) * 100);
                return (
                  <motion.div
                    key={category}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-semibold text-slate-200">
                        {category}
                      </span>
                      <span className="text-sm text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
                        {scores.correct}/{scores.total} ({percentage}%)
                      </span>
                    </div>
                    <div className="relative w-full bg-slate-900/50 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.7 + index * 0.1, ease: "easeOut" }}
                        className={`h-3 rounded-full relative overflow-hidden ${
                          percentage >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                          percentage >= 60 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                          'bg-gradient-to-r from-rose-500 to-red-500'
                        }`}
                      >
                        <motion.div
                          animate={{ x: ['0%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-cyan-500/30"
          >
            <h3 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-2">
              <AwardIcon className="w-6 h-6 text-cyan-400" />
              Recommendations
            </h3>
            <div className="space-y-3 text-cyan-200">
              {results.totalScore >= 80 ? (
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-base"
                >
                  Excellent work! You have a strong understanding of this topic. Consider taking more advanced quizzes.
                </motion.p>
              ) : results.totalScore >= 60 ? (
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-base"
                >
                  Good job! You have a solid foundation. Review the topics you missed to improve further.
                </motion.p>
              ) : (
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-base"
                >
                  Keep practicing! Focus on understanding the fundamental concepts and try the quiz again.
                </motion.p>
              )}

              {Object.entries(results.categoryScores)
                .filter(([_, scores]) => scores.correct / scores.total < 0.6)
                .map(([category], index) => (
                  <motion.p
                    key={category}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Consider reviewing <strong className="text-cyan-300">{category}</strong> topics
                  </motion.p>
                ))
              }
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Back to Dashboard
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowResults(false);
                setCurrentQuestionIndex(0);
                setAnswers({});
                loadQuizQuestions();
                startTime.current = Date.now();
              }}
              className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-slate-500/50 transition-all"
            >
              Retake Quiz
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];

  if (!currentQuestion) {
     return (
       <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Preparing your quiz...</p>
        </div>
      </motion.div>
     );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-gradient-to-br from-cyan-600 via-blue-700 to-blue-800 p-8 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        <div className="relative flex items-center justify-between mb-6">
          <motion.h2
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-3xl font-bold drop-shadow-lg"
          >
            {quiz.title}
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCancel}
            className="text-cyan-200 hover:text-white transition-colors bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl font-medium"
          >
            Exit Quiz
          </motion.button>
        </div>
        
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center space-x-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl"
            >
              <Clock className={`w-6 h-6 ${timeLeft < 300 ? 'text-red-300 animate-pulse' : 'text-cyan-300'}`} />
              <span className={`font-mono text-2xl font-bold ${timeLeft < 300 ? 'text-red-200' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </motion.div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-cyan-100 text-lg font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl"
            >
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </motion.span>
          </div>
        </div>

        <div className="relative mt-6">
          <div className="w-full bg-slate-900/50 backdrop-blur-sm rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 h-4 rounded-full relative overflow-hidden"
            >
              <motion.div
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentQuestionIndex}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <motion.h3
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-semibold text-white leading-relaxed flex-1"
            >
              {currentQuestion.text}
            </motion.h3>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-xl border ${
                currentQuestion.category === 'Programming' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                currentQuestion.category === 'DBMS' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                currentQuestion.category === 'Networks' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                currentQuestion.category === 'AI' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                'bg-red-500/20 text-red-300 border-red-500/30'
              }`}>
                {currentQuestion.category}
              </span>
              <span className="text-sm text-cyan-300 font-semibold bg-slate-700/50 px-3 py-1.5 rounded-xl border border-slate-600/50">
                {currentQuestion.points} pts
              </span>
            </motion.div>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={option._id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(currentQuestion._id, option._id)}
                  className={`group relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                    answers[currentQuestion.id] === option._id
                      ? 'border-cyan-500 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 shadow-lg shadow-cyan-500/20'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/70'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity ${
                    answers[currentQuestion._id] === option._id ? 'opacity-100' : ''
                  }`} />
                  <div className="relative flex items-center gap-4">
                    <motion.div
                      animate={{
                        scale: answers[currentQuestion._id] === option._id ? [1, 1.2, 1] : 1,
                        rotate: answers[currentQuestion._id] === option._id ? [0, 360] : 0
                      }}
                      transition={{ duration: 0.5 }}
                      className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-bold ${
                        answers[currentQuestion._id] === option._id
                          ? 'border-cyan-400 bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                          : 'border-slate-600 bg-slate-700/50 text-slate-400 group-hover:border-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </motion.div>
                    <span className={`text-base font-medium ${
                      answers[currentQuestion._id] === option._id ? 'text-white' : 'text-slate-300'
                    }`}>{option.text}</span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-slate-700/50 rounded-xl disabled:bg-slate-800/30 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </motion.button>

          <div className="flex items-center gap-2 flex-wrap justify-center max-w-xl">
            {quizQuestions.map((_, index) => (
              <motion.button
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.02 }}
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 ring-2 ring-cyan-400'
                    : answers[quizQuestions[index]._id] !== undefined
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md'
                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 border border-slate-600'
                }`}
              >
                {index + 1}
              </motion.button>
            ))}
          </div>

          {currentQuestionIndex < quizQuestions.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentQuestionIndex(Math.min(quizQuestions.length - 1, currentQuestionIndex + 1))}
              className="flex items-center gap-2 px-6 py-3 text-slate-300 hover:text-white transition-all bg-slate-700/50 rounded-xl font-medium"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Quiz</span>
                  <Flag className="w-5 h-5" />
                </>
              )}
            </motion.button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-xl px-6 py-3 rounded-xl border border-slate-700">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-sm text-slate-300">
              <span className="font-bold text-white">{Object.keys(answers).length}</span> of{' '}
              <span className="font-bold text-white">{quizQuestions.length}</span> questions answered
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}