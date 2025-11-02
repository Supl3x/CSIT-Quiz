import React, { useState } from 'react';
import { useQuiz } from '../../contexts/QuizContext.jsx'; // We use QuizContext to get course functions
import { Plus, Edit, Trash2, Library, BookOpen } from 'lucide-react';
import CourseForm from './CourseForm.jsx'; // We will create this next

export default function CourseManager() {
  const { courses, deleteCourse } = useQuiz();
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDelete = async (courseId) => {
    // Use confirm for simplicity, but a modal is better in production
    if (confirm('Are you sure you want to delete this course? This is permanent.')) {
      try {
        await deleteCourse(courseId);
      } catch (error) {
        alert('Error deleting course: ' + error.message);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Course Management</h2>
          <p className="text-slate-400">Create, edit, and manage courses.</p>
        </div>
        <button
          onClick={() => { setEditingCourse(null); setShowForm(true); }}
          className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-700 transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Create Course</span>
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-lg border border-slate-700 overflow-hidden">
            {/* Course Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {course.title}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {course.code}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(course)}
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <div className="flex items-center space-x-2">
                  <Library className="w-4 h-4" />
                  <span>{course.department}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.questions ? course.questions.length : 0} questions</span>
                </div>
              </div>
              
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                Instructors: {course.instructors?.length || 0}
              </div>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full bg-slate-800/90 rounded-xl p-12 text-center shadow-lg border border-slate-700">
            <Library className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Courses Yet</h3>
            <p className="text-slate-400 mb-6">
              Create your first course to organize your quizzes and questions.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-700 transition-colors mx-auto shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Course</span>
            </button>
          </div>
        )}
      </div>

      {/* Course Form Modal */}
      {showForm && (
        <CourseForm
          course={editingCourse}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
