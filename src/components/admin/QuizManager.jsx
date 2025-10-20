import { useState } from 'react';
import { useQuiz } from '../../contexts/QuizContext.jsx';
import { Plus, Edit, Trash2, Play, Pause, Clock, FileText } from 'lucide-react';
import QuizForm from './QuizForm.jsx';

export default function QuizManager() {
  const { quizzes, deleteQuiz, updateQuiz, addQuiz, getQuizStatistics } = useQuiz();
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setShowForm(true);
  };

  const handleDelete = (quizId) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      deleteQuiz(quizId);
    }
  };

  const toggleQuizStatus = (quiz) => {
    updateQuiz(quiz.id, { isActive: !quiz.isActive });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingQuiz(null);
  };

  const handleSaveQuiz = (quizData) => {
    if (editingQuiz) {
      updateQuiz(editingQuiz.id, quizData);
    } else {
      addQuiz({ ...quizData, id: Date.now() });
    }
    handleCloseForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Create Quiz</span>
        </button>
      </div>

      {/* Quiz List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.length === 0 && (
          <div className="col-span-full text-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Quizzes Yet</h3>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Your First Quiz
            </button>
          </div>
        )}

        {quizzes.map((quiz) => {
          const stats = getQuizStatistics(quiz.id);
          return (
            <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{quiz.title}</h3>
                  {Array.isArray(quiz.categories) && quiz.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {quiz.categories.map(cat => (
                        <span key={cat} className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 dark:text-blue-200">{cat}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 dark:text-blue-200">{quiz.category}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(quiz)}><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(quiz.id)}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>{quiz.totalQuestions} questions</span>
                  <span>{quiz.duration} min</span>
                </div>

                {stats && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm">
                    <div className="flex justify-between"><span>Attempts:</span><span>{stats.totalAttempts}</span></div>
                    <div className="flex justify-between"><span>Avg Score:</span><span>{Math.round(stats.averageScore)}%</span></div>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${quiz.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                    {quiz.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => toggleQuizStatus(quiz)}
                    className={`flex items-center gap-1 text-sm px-3 py-1 rounded-lg ${quiz.isActive ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {quiz.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{quiz.isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiz Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <QuizForm
              editingQuiz={editingQuiz}
              onSave={handleSaveQuiz}
              onClose={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
