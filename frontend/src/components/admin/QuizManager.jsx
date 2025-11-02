import { useState } from 'react';
import { useQuiz } from '../../contexts/QuizContext.jsx';
import { Plus, Edit, Trash2, Play, Pause, Clock, FileText } from 'lucide-react';
import QuizForm from './QuizForm.jsx';

export default function QuizManager() {
  const { quizzes, deleteQuiz, updateQuiz, getQuizStatistics } = useQuiz();
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setShowForm(true);
  };

  const handleDelete = async (quizId) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteQuiz(quizId);
      } catch (error) {
        alert('Error deleting quiz: ' + error.message);
      }
    }
  };

  const toggleQuizStatus = async (quiz) => {
    try {
      await updateQuiz(quiz._id, { isActive: !quiz.isActive });
    } catch (error) {
      alert('Error updating quiz status: ' + error.message);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingQuiz(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Management</h2>
          <p className="text-gray-600 dark:text-gray-300">Create and manage quizzes for students</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Quiz</span>
        </button>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => {
          const stats = getQuizStatistics(quiz._id);
          
          return (
            <div key={quiz._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Quiz Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {quiz.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      quiz.category === 'Programming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      quiz.category === 'DBMS' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      quiz.category === 'Networks' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' :
                      quiz.category === 'AI' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {quiz.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(quiz)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(quiz._id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quiz Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>{quiz.questionPool.length} questions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{quiz.durationMinutes} min</span>
                  </div>
                </div>

                {/* Quiz Statistics */}
                {stats && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-300">Attempts:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{stats.totalAttempts}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Avg Score:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{Math.round(stats.averageScore)}%</span>
                    </div>
                  </div>
                )}

                {/* Quiz Status & Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      quiz.isPublished
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {quiz.isActive ? 'Active' : 'Archived'}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleQuizStatus(quiz)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      quiz.isActive
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                  >
                    {quiz.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{quiz.isActive ? 'Archive' : 'Activate'}</span>
                  </button>
                </div>

                {/* Creation Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                  Created on {new Date(quiz.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}

        {quizzes.length === 0 && (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg border border-gray-200 dark:border-gray-700">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Quizzes Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first quiz to get started with the CSIT Quiz Portal.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Quiz</span>
            </button>
          </div>
        )}
      </div>

      {/* Quiz Form Modal */}
      {showForm && (
        <QuizForm
          quiz={editingQuiz}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}