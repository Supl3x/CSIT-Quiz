import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useQuiz } from '../../contexts/QuizContext.jsx';
import { 
  TrendingUp, 
  Target, 
  Award, 
  AlertCircle,
  BookOpen,
  Clock,
  BarChart3,
  Calendar,
  Trophy
} from 'lucide-react';

export default function StudentAnalytics() {
  const { user } = useAuth();
  const { quizzes, getStudentAttempts } = useQuiz();

  const studentAttempts = getStudentAttempts(user?._id || '');
  
  const totalAttempts = studentAttempts.length;
  const attemptsWithPercentage = studentAttempts.map(attempt => {
    const total = attempt.totalScore || 0;
    const max = attempt.maxScore || 0;
    const percentage = (max > 0) ? (total / max) * 100 : 0;
    return { ...attempt, percentageScore: percentage };
  });
  const averageScore = totalAttempts > 0 
    ? Math.round(attemptsWithPercentage.reduce((sum, attempt) => sum + attempt.percentageScore, 0) / totalAttempts)
    : 0;
  const bestScore = totalAttempts > 0 
    ? Math.round(Math.max(...attemptsWithPercentage.map(attempt => attempt.percentageScore)))
    : 0;
  const totalTimeSpent = studentAttempts.reduce((sum, attempt) => sum + attempt.timeTakenSeconds, 0);

  const categoryPerformance = studentAttempts.reduce((acc, attempt) => {
    Object.entries(attempt.categoryScores).forEach(([category, scores]) => {
      if (!acc[category]) {
        acc[category] = { correct: 0, total: 0, attempts: 0, totalScore: 0 };
      }
      acc[category].correct += scores.correct;
      acc[category].total += scores.total;
      acc[category].attempts++;
      acc[category].totalScore += (scores.correct / scores.total) * 100;
    });
    return acc;
  }, {});

  Object.keys(categoryPerformance).forEach(category => {
    categoryPerformance[category].avgScore = 
      categoryPerformance[category].totalScore / categoryPerformance[category].attempts;
  });

  const weakAreas = Object.entries(categoryPerformance)
    .filter(([_, performance]) => performance.avgScore < 60)
    .sort((a, b) => a[1].avgScore - b[1].avgScore);

  const strongAreas = Object.entries(categoryPerformance)
    .filter(([_, performance]) => performance.avgScore >= 80)
    .sort((b, a) => a[1].avgScore - b[1].avgScore);

  const recentAttempts = attemptsWithPercentage // Use the array with percentages
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()) // Use 'submittedAt' to match model
    .slice(0, 5);

  const isImproving = recentAttempts.length >= 2 && 
    recentAttempts[0].percentageScore > recentAttempts[recentAttempts.length - 1].percentageScore; // Compare percentages

  const availableQuizzes = quizzes.filter(quiz => quiz.isPublished).length;
  const completedQuizzes = new Set(studentAttempts.map(attempt => attempt.quiz?._id)).size;
  const completionRate = availableQuizzes > 0 ? Math.round((completedQuizzes / availableQuizzes) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Progress Analytics</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Track your performance and identify areas for improvement
        </p>
      </div>

      {totalAttempts === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No Quiz Attempts Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start taking quizzes to see your performance analytics and track your progress.
          </p>
          <div className="text-sm text-gray-400 dark:text-gray-500">
            Your journey to CSIT mastery begins with your first quiz!
          </div>
        </div>
      ) : (
        <>
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Attempts</p>
                  <p className="text-3xl font-bold">{totalAttempts}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Average Score</p>
                  <p className="text-3xl font-bold">{averageScore}%</p>
                </div>
                <Target className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Best Score</p>
                  <p className="text-3xl font-bold">{bestScore}%</p>
                </div>
                <Award className="w-8 h-8 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Completion Rate</p>
                  <p className="text-3xl font-bold">{completionRate}%</p>
                </div>
                <Trophy className="w-8 h-8 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Performance Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Performance by Category
              </h3>

              <div className="space-y-4">
                {Object.entries(categoryPerformance).map(([category, performance]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {performance.attempts} attempts
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          performance.avgScore >= 80 ? 'bg-green-500' :
                          performance.avgScore >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(performance.avgScore, 5)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {performance.correct}/{performance.total} correct
                      </span>
                      <span className={`text-sm font-medium ${
                        performance.avgScore >= 80 ? 'text-green-600 dark:text-green-400' :
                        performance.avgScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {Math.round(performance.avgScore)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity & Trends */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recent Performance
              </h3>

              <div className="space-y-4">
                {recentAttempts.map((attempt) => {
                  const quiz = quizzes.find(q => q._id === attempt.quiz?._id);
                  return (
                    <div key={attempt._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {quiz?.title || 'Unknown Quiz'}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(attempt.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          attempt.totalScore >= 80 ? 'text-green-600 dark:text-green-400' :
                          attempt.totalScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {Math.round(attempt.percentageScore)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trend Indicator */}
              {recentAttempts.length >= 2 && (
                <div className={`mt-6 p-4 rounded-lg ${
                  isImproving 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className={`w-5 h-5 ${
                      isImproving ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                    }`} />
                    <span className={`font-medium ${
                      isImproving ? 'text-green-800 dark:text-green-200' : 'text-blue-800 dark:text-blue-200'
                    }`}>
                      {isImproving ? 'Improving Trend!' : 'Keep Practicing!'}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    isImproving ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'
                  }`}>
                    {isImproving 
                      ? 'Your scores are getting better. Great work!'
                      : 'Consistent practice will help improve your performance.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Insights & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Strong Areas */}
            {strongAreas.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Trophy className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Your Strong Areas
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {strongAreas.map(([category, performance]) => (
                    <div key={category} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">{category}</span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {Math.round(performance.avgScore)}%
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Excellent understanding! Consider helping others or taking advanced topics.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weak Areas */}
            {weakAreas.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                    Areas for Improvement
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {weakAreas.map(([category, performance]) => (
                    <div key={category} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">{category}</span>
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {Math.round(performance.avgScore)}%
                        </span>
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Focus your study efforts here. Practice more questions in this category.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Study Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Study Statistics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(totalTimeSpent / 3600)}h {Math.floor((totalTimeSpent % 3600) / 60)}m
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Study Time</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(totalTimeSpent / totalAttempts / 60)}m
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Avg Time per Quiz</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedQuizzes}/{availableQuizzes}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Quizzes Completed</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}