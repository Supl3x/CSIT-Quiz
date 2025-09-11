import React from 'react';
import { useQuiz } from '../../contexts/QuizContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  BookOpen,
  Clock,
  Award,
  AlertTriangle
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const { questions, quizzes, attempts } = useQuiz();

  // Calculate overall statistics
  const totalQuestions = questions.length;
  const totalQuizzes = quizzes.length;
  const totalAttempts = attempts.length;
  const activeQuizzes = quizzes.filter(q => q.isActive).length;

  // Category-wise statistics
  const categoryStats = questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = {
        questions: 0,
        attempts: 0,
        totalScore: 0,
        avgScore: 0
      };
    }
    acc[question.category].questions++;
    return acc;
  }, {} as Record<string, any>);

  // Calculate category-wise performance from attempts
  attempts.forEach(attempt => {
    Object.entries(attempt.categoryScores).forEach(([category, scores]) => {
      if (categoryStats[category]) {
        categoryStats[category].attempts++;
        const categoryScore = (scores.correct / scores.total) * 100;
        categoryStats[category].totalScore += categoryScore;
        categoryStats[category].avgScore = categoryStats[category].totalScore / categoryStats[category].attempts;
      }
    });
  });

  // Difficulty distribution
  const difficultyStats = questions.reduce((acc, question) => {
    acc[question.difficulty] = (acc[question.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Performance metrics
  const averageScore = attempts.length > 0 
    ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length)
    : 0;

  const highestScore = attempts.length > 0 
    ? Math.max(...attempts.map(attempt => attempt.score))
    : 0;

  const lowestScore = attempts.length > 0 
    ? Math.min(...attempts.map(attempt => attempt.score))
    : 0;

  // Weak areas identification
  const weakAreas = Object.entries(categoryStats)
    .filter(([_, stats]) => stats.attempts > 0 && stats.avgScore < 60)
    .sort((a, b) => a[1].avgScore - b[1].avgScore);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Comprehensive insights into quiz performance and student engagement
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Questions</p>
              <p className="text-3xl font-bold">{totalQuestions}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Quizzes</p>
              <p className="text-3xl font-bold">{activeQuizzes}</p>
              <p className="text-green-100 text-xs">of {totalQuizzes} total</p>
            </div>
            <Target className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Attempts</p>
              <p className="text-3xl font-bold">{totalAttempts}</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Average Score</p>
              <p className="text-3xl font-bold">{averageScore}%</p>
            </div>
            <Award className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Category Performance
          </h3>
          
          <div className="space-y-4">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {stats.questions} questions • {stats.attempts} attempts
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      stats.avgScore >= 80 ? 'bg-green-500' :
                      stats.avgScore >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.max(stats.avgScore, 5)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Avg: {Math.round(stats.avgScore)}%
                  </span>
                  <span className={`text-xs font-medium ${
                    stats.avgScore >= 80 ? 'text-green-600 dark:text-green-400' :
                    stats.avgScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {stats.avgScore >= 80 ? 'Excellent' :
                     stats.avgScore >= 60 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Score Distribution
          </h3>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {highestScore}%
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">Highest</p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {averageScore}%
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Average</p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {lowestScore}%
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">Lowest</p>
              </div>
            </div>

            {/* Difficulty Distribution */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Question Difficulty Distribution
              </h4>
              <div className="space-y-2">
                {Object.entries(difficultyStats).map(([difficulty, count]) => (
                  <div key={difficulty} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {difficulty}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            difficulty === 'Easy' ? 'bg-green-500' :
                            difficulty === 'Medium' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${(count / totalQuestions) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weak Areas Alert */}
      {weakAreas.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
              Areas Needing Attention
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weakAreas.map(([category, stats]) => (
              <div key={category} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {category}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Average Score:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {Math.round(stats.avgScore)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Attempts:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stats.attempts}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                  Consider adding more practice questions or reviewing teaching materials.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Recent Quiz Attempts
        </h3>

        {attempts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No quiz attempts yet. Students haven't started taking quizzes.
          </div>
        ) : (
          <div className="space-y-4">
            {attempts
              .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
              .slice(0, 10)
              .map((attempt) => {
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
        )}
      </div>
    </div>
  );
}