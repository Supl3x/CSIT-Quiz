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
  const { quizzes, getStudentAttempts, attempts } = useQuiz();
  const [localAttempts, setLocalAttempts] = React.useState([]);

  // Update attempts when global attempts change
  React.useEffect(() => {
    setLocalAttempts(getStudentAttempts(user?.id || ''));
  }, [user?.id, getStudentAttempts, attempts]);
  
  // Get recent attempts first as it's used in multiple calculations
  const recentAttempts = React.useMemo(() => [...localAttempts]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5), [localAttempts]);

  // Calculate comprehensive statistics
  const totalAttempts = localAttempts.length;
  const averageScore = totalAttempts > 0 
    ? Math.round(localAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts)
    : 0;
  const bestScore = totalAttempts > 0 
    ? Math.max(...localAttempts.map(attempt => attempt.score))
    : 0;
  const worstScore = totalAttempts > 0
    ? Math.min(...localAttempts.map(attempt => attempt.score))
    : 0;
  const totalTimeSpent = localAttempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0);

  // Calculate improvement metrics
  const improvementRate = totalAttempts >= 2 ? (() => {
    const recentScores = recentAttempts.map(attempt => attempt.score);
    if (recentScores.length >= 2) {
      const averageRecent = recentScores.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(recentScores.length, 3);
      const averageOld = recentScores.slice(-3).reduce((a, b) => a + b, 0) / Math.min(recentScores.length, 3);
      return averageOld !== 0 ? Math.round(((averageRecent - averageOld) / averageOld) * 100) : 0;
    }
    return 0;
  })() : 0;

  // Category-wise performance
  const categoryPerformance = localAttempts.reduce((acc, attempt) => {
    if (attempt.categoryScores) {
      Object.entries(attempt.categoryScores).forEach(([category, scores]) => {
        if (!acc[category]) {
          acc[category] = { correct: 0, total: 0, attempts: 0, totalScore: 0 };
        }
        acc[category].correct += scores.correct;
        acc[category].total += scores.total;
        acc[category].attempts++;
        acc[category].totalScore += (scores.correct / scores.total) * 100;
      });
    }
    return acc;
  }, {});

  // Calculate average for each category
  Object.keys(categoryPerformance).forEach(category => {
    categoryPerformance[category].avgScore = 
      categoryPerformance[category].totalScore / categoryPerformance[category].attempts;
  });

  // Identify weak areas (< 60% average)
  const weakAreas = Object.entries(categoryPerformance)
    .filter(([_, performance]) => performance.avgScore < 60)
    .sort((a, b) => a[1].avgScore - b[1].avgScore);

  // Strong areas (>= 80% average)
  const strongAreas = Object.entries(categoryPerformance)
    .filter(([_, performance]) => performance.avgScore >= 80)
    .sort((b, a) => a[1].avgScore - b[1].avgScore);

  const isImproving = recentAttempts.length >= 2 && 
    recentAttempts[0].score > recentAttempts[recentAttempts.length - 1].score;

  // Quiz completion rate
  const availableQuizzes = quizzes.filter(quiz => quiz.isActive).length;
  const completedQuizzes = new Set(localAttempts.map(attempt => attempt.quizId)).size;
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
            {/* Quiz Completion Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Completion Rate</h3>
                <BookOpen className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">of quizzes completed</span>
              </div>
              <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="h-2 bg-blue-500 rounded-full" 
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {completedQuizzes} out of {availableQuizzes} quizzes
              </div>
            </div>

            {/* Average Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Average Score</h3>
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{averageScore}%</span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">overall performance</span>
              </div>
              <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="h-2 bg-green-500 rounded-full" 
                  style={{ width: `${averageScore}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Based on {totalAttempts} quiz attempts
              </div>
            </div>

            {/* Best Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Best Score</h3>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{bestScore}%</span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">highest achievement</span>
              </div>
              <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="h-2 bg-yellow-500 rounded-full" 
                  style={{ width: `${bestScore}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Room for improvement: {100 - bestScore}%
              </div>
            </div>

            {/* Improvement Rate */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Progress Trend</h3>
                <TrendingUp className={`w-5 h-5 ${improvementRate >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
              </div>
              <div className="flex items-baseline">
                <span className={`text-2xl font-bold ${improvementRate >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {improvementRate >= 0 ? '+' : ''}{improvementRate}%
                </span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">improvement rate</span>
              </div>
              <div className="mt-4 flex space-x-1">
                {recentAttempts.slice(0, 5).map((attempt, index) => (
                  <div 
                    key={index}
                    className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-md relative"
                  >
                    <div 
                      className="absolute bottom-0 w-full bg-cyan-500 rounded-md transition-all duration-300"
                      style={{ height: `${attempt.score}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Based on recent {recentAttempts.length} attempts
              </div>
            </div>
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
                  const quiz = quizzes.find(q => q.id === attempt.quizId);
                  return (
                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {quiz?.title || 'Unknown Quiz'}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(attempt.completedAt).toLocaleDateString()}
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

          {/* Category Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Strong Areas */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Strong Areas</h3>
                <Award className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="space-y-4">
                {strongAreas.map(([category, performance]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-300">{category}</span>
                      <span className="text-emerald-500 font-medium">{Math.round(performance.avgScore)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div 
                        className="h-2 bg-emerald-500 rounded-full"
                        style={{ width: `${performance.avgScore}%` }}
                      />
                    </div>
                  </div>
                ))}
                {strongAreas.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    Keep practicing to develop strong areas!
                  </div>
                )}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Areas for Improvement</h3>
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="space-y-4">
                {weakAreas.map(([category, performance]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-300">{category}</span>
                      <span className="text-amber-500 font-medium">{Math.round(performance.avgScore)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div 
                        className="h-2 bg-amber-500 rounded-full"
                        style={{ width: `${performance.avgScore}%` }}
                      />
                    </div>
                  </div>
                ))}
                {weakAreas.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    Great job! Keep maintaining your performance!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-6">
              {recentAttempts.map((attempt, index) => {
                const date = new Date(attempt.completedAt);
                return (
                  <div key={index} className="flex items-start">
                    <div className={`relative flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full mr-4 ${
                      attempt.score >= 80 ? 'bg-emerald-100 text-emerald-500' :
                      attempt.score >= 60 ? 'bg-blue-100 text-blue-500' :
                      'bg-amber-100 text-amber-500'
                    }`}>
                      {attempt.score >= 80 ? '🌟' : attempt.score >= 60 ? '✓' : '!'}
                      <div className="absolute top-10 w-px h-full bg-gray-300 dark:bg-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-gray-900 dark:text-white font-medium">
                          {quizzes.find(q => q.id === attempt.quizId)?.title || 'Quiz'}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Score: {attempt.score}% • Time: {Math.round(attempt.timeSpent / 60)} minutes
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}