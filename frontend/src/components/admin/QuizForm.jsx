// import React, { useState, useEffect } from 'react';
// import { useQuiz } from '../../contexts/QuizContext.jsx';
// import { X, Search } from 'lucide-react';

// export default function QuizForm({ quiz, onClose }) {
//   const { addQuiz, updateQuiz, questions } = useQuiz();
//   const [formData, setFormData] = useState({
//     title: '',
//     category: '',
//     duration: 30,
//     totalQuestions: 10,
//     isActive: true,
//     createdBy: '1' // This would be the current admin's ID
//   });

//   const [selectedQuestions, setSelectedQuestions] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('All');

//   useEffect(() => {
//     if (quiz) {
//       setFormData({
//         title: quiz.title,
//         category: quiz.category,
//         duration: quiz.duration,
//         totalQuestions: quiz.totalQuestions,
//         isActive: quiz.isActive,
//         createdBy: quiz.createdBy
//       });
//     }
//   }, [quiz]);

//   const categories = ['All', 'Programming', 'DBMS', 'Networks', 'AI', 'Cybersecurity'];

//   const filteredQuestions = questions.filter(question => {
//     const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = categoryFilter === 'All' || question.category === categoryFilter;
    
//     return matchesSearch && matchesCategory;
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (formData.title.trim() === '' || formData.category === '') {
//       alert('Please fill in all required fields');
//       return;
//     }

//     if (selectedQuestions.length === 0) {
//       alert('Please select at least one question for the quiz');
//       return;
//     }

//     if (selectedQuestions.length !== formData.totalQuestions) {
//       alert(`Please select exactly ${formData.totalQuestions} questions`);
//       return;
//     }

//     try {
//       if (quiz) {
//         await updateQuiz(quiz.id, formData);
//       } else {
//         await addQuiz({ ...formData, selectedQuestions });
//       }
//       onClose();
//     } catch (error) {
//       alert('Error saving quiz: ' + error.message);
//     }
//   };

//   const handleQuestionSelect = (questionId) => {
//     setSelectedQuestions(prev => {
//       if (prev.includes(questionId)) {
//         return prev.filter(id => id !== questionId);
//       } else if (prev.length < formData.totalQuestions) {
//         return [...prev, questionId];
//       }
//       return prev;
//     });
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//               {quiz ? 'Edit Quiz' : 'Create New Quiz'}
//             </h2>
//             <button
//               onClick={onClose}
//               className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           {/* Basic Quiz Information */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Quiz Title *
//               </label>
//               <input
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
//                 className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//                 placeholder="Enter quiz title"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Category *
//               </label>
//               <select
//                 value={formData.category}
//                 onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
//                 className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//                 required
//               >
//                 <option value="">Select Category</option>
//                 <option value="Programming">Programming</option>
//                 <option value="DBMS">DBMS</option>
//                 <option value="Networks">Networks</option>
//                 <option value="AI">AI</option>
//                 <option value="Cybersecurity">Cybersecurity</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Duration (minutes)
//               </label>
//               <input
//                 type="number"
//                 value={formData.duration}
//                 onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
//                 min="5"
//                 max="180"
//                 className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Number of Questions
//               </label>
//               <input
//                 type="number"
//                 value={formData.totalQuestions}
//                 onChange={(e) => {
//                   const newTotal = parseInt(e.target.value) || 10;
//                   setFormData(prev => ({ ...prev, totalQuestions: newTotal }));
//                   if (selectedQuestions.length > newTotal) {
//                     setSelectedQuestions(prev => prev.slice(0, newTotal));
//                   }
//                 }}
//                 min="1"
//                 max={questions.length}
//                 className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//               />
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                 Available: {questions.filter(q => categoryFilter === 'All' || q.category === categoryFilter).length}
//               </p>
//             </div>
//           </div>

//           {/* Quiz Status */}
//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               id="isActive"
//               checked={formData.isActive}
//               onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
//               className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//             />
//             <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
//               Make quiz active immediately
//             </label>
//           </div>

//           {/* Question Selection */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//               Available Questions ({questions.length})
//             </h3>
            
//             {/* Question Filters */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search questions..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//                 />
//               </div>

//               <select
//                 value={categoryFilter}
//                 onChange={(e) => setCategoryFilter(e.target.value)}
//                 className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//               >
//                 {categories.map(category => (
//                   <option key={category} value={category}>{category}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Questions List */}
//             <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto">
//               {filteredQuestions.length === 0 ? (
//                 <div className="p-4 text-center text-gray-500 dark:text-gray-400">
//                   No questions found matching your criteria.
//                 </div>
//               ) : (
//                 <div className="divide-y divide-gray-200 dark:divide-gray-700">
//                   {filteredQuestions.map((question) => (
//                     <div key={question.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
//                       <div className="flex items-start space-x-3">
//                         <input
//                           type="checkbox"
//                           checked={selectedQuestions.includes(question.id)}
//                           onChange={() => handleQuestionSelect(question.id)}
//                           disabled={!selectedQuestions.includes(question.id) && selectedQuestions.length >= formData.totalQuestions}
//                           className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                         />
//                         <div className="flex-1">
//                           <p className="text-sm text-gray-900 dark:text-white font-medium">
//                             {question.text}
//                           </p>
//                           <div className="flex items-center space-x-2 mt-1">
//                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                               question.category === 'Programming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
//                               question.category === 'DBMS' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
//                               question.category === 'Networks' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' :
//                               question.category === 'AI' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
//                               'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
//                             }`}>
//                               {question.category}
//                             </span>
//                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                               question.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
//                               question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
//                               'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
//                             }`}>
//                               {question.difficulty}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
            
//             <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
//               Selected: {selectedQuestions.length}/{formData.totalQuestions}
//             </p>
//           </div>

//           {/* Form Actions */}
//           <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
//             >
//               {quiz ? 'Update Quiz' : 'Create Quiz'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useQuiz } from '../../contexts/QuizContext.jsx';
import { X, Search, Loader2, Library } from 'lucide-react';

export default function QuizForm({ quiz, onClose }) {
  const { addQuiz, updateQuiz, questions, courses } = useQuiz();

  // Cleaned form data state, removed fields not in backend model
  const [formData, setFormData] = useState({
    title: '',
    duration: 30,
    totalQuestions: 10,
    isPublished: true,
    course: '',
  });

  // State for the question list
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All'); // This is for FILTERING ONLY

  // State for loading and error handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Effect to populate form when editing
  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || '',
        duration: quiz.durationMinutes || 30, // Map durationMinutes
        totalQuestions: (quiz.questionPool && quiz.questionPool.length) || 10,
        isPublished: quiz.isPublished || false,
        course: quiz.course?._id || '',
      });
      // Populate selected questions from the backend's questionPool
      setSelectedQuestions((quiz.questionPool || []).map(p => p.question));
    } else {
      setFormData({
        title: '',
        duration: 30,
        totalQuestions: 10,
        isPublished: true,
        course: courses.length > 0 ? courses[0]._id : '',
      });
      setSelectedQuestions([]);
    }
  }, [quiz, courses]); // Re-run if quiz prop changes

  // List of categories for the FILTER dropdown
  const categories = ['All', 'Programming', 'DBMS', 'Networks', 'AI', 'Cybersecurity'];

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = (question.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || (question.tags && question.tags.includes(categoryFilter));
    
    return matchesSearch && matchesCategory;
  });

  /**
   * Handles the form submission (async)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (formData.title.trim() === '') {
      setError('Quiz Title is required.');
      return;
    }
    if (selectedQuestions.length === 0) {
      setError('Please select at least one question for the quiz.');
      return;
    }
    if (selectedQuestions.length !== formData.totalQuestions) {
      setError(`Please select exactly ${formData.totalQuestions} questions.`);
      return;
    }

    setIsSubmitting(true);

    // 1. Map Frontend State (formData) to Backend Schema (quiz.model.js)
    const quizData = {
      title: formData.title,
      description: `A quiz about ${categoryFilter === 'All' ? 'various topics' : categoryFilter}.`, // Add a default description
      
      questionPool: selectedQuestions.map(qId => ({
        question: qId,
        weight: 1
      })),

      durationMinutes: formData.duration,
      isPublished: formData.isPublished,
      isActive: formData.isPublished,
      course: formData.course || null,
      randomizeQuestions: true,
      randomizeOptions: true,
      allowRetake: false,
      attemptsAllowed: 1,
      autoGrade: true,
    };

    try {
      if (quiz) {
        await updateQuiz(quiz._id, quizData);
      } else {
        await addQuiz(quizData);
      }
      
      onClose();
    } catch (err) {
      // 5. Handle errors from the context/API
      console.error("Failed to save quiz:", err);
      setError(err.message || "An unknown error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId); 
      } else if (prev.length < formData.totalQuestions) {
        return [...prev, questionId];
      }
      return prev; 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {quiz ? 'Edit Quiz' : 'Create New Quiz'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Quiz Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter quiz title"
                required
              />
            </div>

            {/* --- NEW: Course Selection Dropdown --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course (Optional)
              </label>
              <div className="relative">
                <Library className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={formData.course}
                  onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a course...</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.code} - {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* --- END: Course Selection --- */}
            
            {/* NOTE: Removed the 'Category' field from the form data,
                as it's not part of the backend 'quiz' model.
                The category filter for the question list below is separate. */}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value, 10) || 30 }))}
                min="5"
                max="180"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                value={formData.totalQuestions}
                onChange={(e) => {
                  const newTotal = parseInt(e.target.value, 10) || 10;
                  setFormData(prev => ({ ...prev, totalQuestions: newTotal }));
                  // If new total is less, trim the selected questions
                  if (selectedQuestions.length > newTotal) {
                    setSelectedQuestions(prev => prev.slice(0, newTotal));
                  }
                }}
                min="1"
                max={questions.length} // Can't be more than all available questions
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Quiz Status (Published/Active) */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Publish quiz (make visible and active for students)
            </label>
          </div>

          {/* Question Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Available Questions ({filteredQuestions.length} matching)
            </h3>
            
            {/* Question Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <select
                value={categoryFilter} // This controls the filter
                onChange={(e) => setCategoryFilter(e.target.value)} // This updates the filter
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Questions List */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto">
              {filteredQuestions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No questions found matching your criteria.
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredQuestions.map((question) => (
                    <div key={question._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question._id)}
                          onChange={() => handleQuestionSelect(question._id)}
                          // Disable if already at max questions and this one isn't selected
                          disabled={!selectedQuestions.includes(question._id) && selectedQuestions.length >= formData.totalQuestions}
                          className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white font-medium">
                            {question.title} {/* Use 'title' from backend */}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {/* Use 'tags[0]' from backend for category */}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              question.tags?.includes('Programming') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              question.tags?.includes('DBMS') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              question.tags?.includes('Networks') ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' :
                              question.tags?.includes('AI') ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {question.tags && question.tags.length > 0 ? question.tags[0] : 'General'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              question.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {question.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Selected: {selectedQuestions.length}/{formData.totalQuestions}
            </p>
          </div>

          {/* NEW: Error Display */}
          {error && (
            <div className="p-3 text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {quiz ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                quiz ? 'Update Quiz' : 'Create Quiz'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
