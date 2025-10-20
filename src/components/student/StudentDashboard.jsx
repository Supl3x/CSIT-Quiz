import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useQuiz } from '../../contexts/QuizContext.jsx';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Award,
  Play,
  BarChart3,
  Target,
  Trophy,
  Calendar
} from 'lucide-react';
import QuizInterface from './QuizInterface.jsx';
import StudentAnalytics from './StudentAnalytics.jsx';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { quizzes, attempts, getStudentAttempts } = useQuiz();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const studentAttempts = getStudentAttempts(user?.id || '');
  const activeQuizzes = quizzes.filter(quiz => quiz.isActive);
  
  // Calculate student statistics
  const totalAttempts = studentAttempts.length;
  const averageScore = totalAttempts > 0 
    ? Math.round(studentAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts)
    : 0;
  const bestScore = totalAttempts > 0 
    ? Math.max(...studentAttempts.map(attempt => attempt.score))
    : 0;
  const completedQuizzes = new Set(studentAttempts.map(attempt => attempt.quizId)).size;

  // Recent attempts
  const recentAttempts = studentAttempts
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'quizzes', label: 'Take Quiz', icon: BookOpen },
    { id: 'analytics', label: 'My Progress', icon: TrendingUp },
  ];

  if (selectedQuiz) {
    return (
      <QuizInterface
        quizId={selectedQuiz}
        onComplete={() => setSelectedQuiz(null)}
        onCancel={() => setSelectedQuiz(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-blue-100">
              Ready to test your CSIT knowledge? Let's continue your learning journey.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4 text-blue-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{totalAttempts}</p>
              <p className="text-sm">Attempts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{averageScore}%</p>
              <p className="text-sm">Avg Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{bestScore}%</p>
              <p className="text-sm">Best Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Available Quizzes</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeQuizzes.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{completedQuizzes}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{averageScore}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Best Score</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{bestScore}%</p>
                </div>
                <Award className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Available Quizzes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Available Quizzes</h3>
              <button
                onClick={() => setActiveTab('quizzes')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All
              </button>
            </div>

            {activeQuizzes.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Active Quizzes
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  Check back later for new quizzes from your instructors.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeQuizzes.slice(0, 6).map((quiz) => {
                  const hasAttempted = studentAttempts.some(attempt => attempt.quizId === quiz.id);
                  const bestAttemptScore = hasAttempted
                    ? Math.max(...studentAttempts
                        .filter(attempt => attempt.quizId === quiz.id)
                        .map(attempt => attempt.score))
                    : null;

                  return (
                    <div key={quiz.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{quiz.title}</h4>
                        {Array.isArray(quiz.categories) && quiz.categories.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {quiz.categories.map(cat => (
                              <span key={cat} className={`px-2 py-1 rounded-full text-xs font-medium ${
                                cat === 'Programming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                cat === 'DBMS' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                cat === 'Networks' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                cat === 'AI' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>{cat}</span>
                            ))}
                          </div>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            quiz.category === 'Programming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            quiz.category === 'DBMS' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            quiz.category === 'Networks' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            quiz.category === 'AI' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>{quiz.category}</span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{quiz.duration} minutes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4" />
                          <span>{quiz.totalQuestions} questions</span>
                        </div>
                        {bestAttemptScore !== null && (
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4" />
                            <span>Best: {bestAttemptScore}%</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedQuiz(quiz.id)}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        <span>{hasAttempted ? 'Retake Quiz' : 'Start Quiz'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          {recentAttempts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Recent Quiz Attempts
              </h3>

              <div className="space-y-4">
                {recentAttempts.map((attempt) => {
                  const quiz = quizzes.find(q => q.id === attempt.quizId);
                  return (
                    <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {quiz?.title || 'Unknown Quiz'}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Completed on {new Date(attempt.completedAt).toLocaleDateString()} • 
                          {Math.floor(attempt.timeSpent / 60)}:{(attempt.timeSpent % 60).toString().padStart(2, '0')} minutes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          attempt.score >= 80 ? 'text-green-600 dark:text-green-400' :
                          attempt.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {attempt.score}%
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {attempt.score >= 80 ? 'Excellent' :
                           attempt.score >= 60 ? 'Good' : 'Needs Improvement'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Available Quizzes</h2>
          
          {activeQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No Active Quizzes
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Your instructors haven't published any quizzes yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeQuizzes.map((quiz) => {
                const hasAttempted = studentAttempts.some(attempt => attempt.quizId === quiz.id);
                const attemptCount = studentAttempts.filter(attempt => attempt.quizId === quiz.id).length;
                const bestScore = hasAttempted
                  ? Math.max(...studentAttempts
                      .filter(attempt => attempt.quizId === quiz.id)
                      .map(attempt => attempt.score))
                  : null;

                return (
                  <div key={quiz.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{quiz.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        quiz.category === 'Programming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        quiz.category === 'DBMS' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        quiz.category === 'Networks' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        quiz.category === 'AI' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {quiz.category}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{quiz.duration} minutes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{quiz.totalQuestions} questions</span>
                      </div>
                      {hasAttempted && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4" />
                            <span>Best Score: {bestScore}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4" />
                            <span>Attempts: {attemptCount}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedQuiz(quiz.id)}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                    >
                      <Play className="w-4 h-4" />
                      <span>{hasAttempted ? 'Retake Quiz' : 'Start Quiz'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && <StudentAnalytics />}
    </div>
  );
}