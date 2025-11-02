// import React, { useState, useEffect } from 'react';
// import { useQuiz } from '../../contexts/QuizContext.jsx';
// import { X, Plus, Minus } from 'lucide-react';

// export default function QuestionForm({ question, onClose }) {
//   const { addQuestion, updateQuestion } = useQuiz();
//   const [formData, setFormData] = useState({
//     text: '',
//     options: ['', '', '', ''],
//     correctAnswer: 0,
//     category: 'Programming',
//     difficulty: 'Medium',
//     points: 10
//   });

//   useEffect(() => {
//     if (question) {
//       setFormData({
//         text: question.text,
//         options: [...question.options],
//         correctAnswer: question.correctAnswer,
//         category: question.category,
//         difficulty: question.difficulty,
//         points: question.points
//       });
//     }
//   }, [question]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (formData.text.trim() === '' || formData.options.some(opt => opt.trim() === '')) {
//       alert('Please fill in all fields');
//       return;
//     }

//     if (question) {
//       updateQuestion(question.id, formData);
//     } else {
//       addQuestion(formData);
//     }
    
//     onClose();
//   };

//   const handleOptionChange = (index, value) => {
//     const newOptions = [...formData.options];
//     newOptions[index] = value;
//     setFormData({ ...formData, options: newOptions });
//   };

//   const addOption = () => {
//     setFormData({
//       ...formData,
//       options: [...formData.options, '']
//     });
//   };

//   const removeOption = (index) => {
//     if (formData.options.length > 2) {
//       const newOptions = formData.options.filter((_, i) => i !== index);
//       setFormData({
//         ...formData,
//         options: newOptions,
//         correctAnswer: formData.correctAnswer >= newOptions.length ? 0 : formData.correctAnswer
//       });
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//               {question ? 'Edit Question' : 'Add New Question'}
//             </h2>
//             <button
//               onClick={onClose}
//               className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Question Text
//             </label>
//             <textarea
//               value={formData.text}
//               onChange={(e) => setFormData({ ...formData, text: e.target.value })}
//               rows={3}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//               placeholder="Enter your question..."
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Answer Options
//             </label>
//             <div className="space-y-3">
//               {formData.options.map((option, index) => (
//                 <div key={index} className="flex items-center space-x-3">
//                   <input
//                     type="radio"
//                     name="correctAnswer"
//                     checked={formData.correctAnswer === index}
//                     onChange={() => setFormData({ ...formData, correctAnswer: index })}
//                     className="text-blue-600"
//                   />
//                   <input
//                     type="text"
//                     value={option}
//                     onChange={(e) => handleOptionChange(index, e.target.value)}
//                     placeholder={`Option ${index + 1}`}
//                     className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//                     required
//                   />
//                   {formData.options.length > 2 && (
//                     <button
//                       type="button"
//                       onClick={() => removeOption(index)}
//                       className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
//                     >
//                       <Minus className="w-4 h-4" />
//                     </button>
//                   )}
//                 </div>
//               ))}
              
//               <button
//                 type="button"
//                 onClick={addOption}
//                 className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
//               >
//                 <Plus className="w-4 h-4" />
//                 <span>Add Option</span>
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Category
//               </label>
//               <select
//                 value={formData.category}
//                 onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//               >
//                 <option value="Programming">Programming</option>
//                 <option value="DBMS">DBMS</option>
//                 <option value="Networks">Networks</option>
//                 <option value="AI">AI</option>
//                 <option value="Cybersecurity">Cybersecurity</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Difficulty
//               </label>
//               <select
//                 value={formData.difficulty}
//                 onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//               >
//                 <option value="Easy">Easy</option>
//                 <option value="Medium">Medium</option>
//                 <option value="Hard">Hard</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Points
//               </label>
//               <input
//                 type="number"
//                 value={formData.points}
//                 onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
//                 min="1"
//                 max="20"
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//                 required
//               />
//             </div>
//           </div>

//           <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               {question ? 'Update Question' : 'Add Question'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useQuiz } from '../../contexts/QuizContext.jsx';
import { X, Plus, Minus, Loader2 } from 'lucide-react';

export default function QuestionForm({ question, onClose }) {
  const { addQuestion, updateQuestion } = useQuiz();

  // State for the form fields
  const [formData, setFormData] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: 'Programming',
    difficulty: 'Medium',
    points: 10
  });

  // State for loading and error handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Effect to populate the form when editing an existing question
  useEffect(() => {
    if (question) {
      // Map data from the backend 'question' object to the form's state
      setFormData({
        text: question.title || '', // Backend 'title' -> maps to 'text' in form state
        // Backend 'choices' (array of objects) -> maps to 'options' (array of strings) in form state
        options: (question.choices && question.choices.length > 0)
          ? question.choices.sort((a, b) => a.order - b.order).map(opt => opt.text)
          : ['', '', '', ''],
        correctAnswer: question.correctAnswer || 0, // Backend 'correctAnswer' (index) -> maps directly
        // Backend 'tags' (array) -> maps to 'category' (string) in form state
        category: (question.tags && question.tags.length > 0) ? question.tags[0] : 'Programming',
        difficulty: question.difficulty || 'Medium',
        points: question.points || 10
      });
    } else {
      // Reset form if no question is passed (for "Add New")
      setFormData({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        category: 'Programming',
        difficulty: 'Medium',
        points: 10
      });
    }
  }, [question]); // Re-run this effect if the 'question' prop changes

  /**
   * Handles the form submission.
   * This is now an async function to handle API calls.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.text.trim() === '' || formData.options.some(opt => opt.trim() === '')) {
      setError('Please fill in all fields, including all option texts.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // 1. Map frontend state (formData) to the backend model schema
    const questionData = {
      title: formData.text,           // Form 'text' -> Backend 'title'
      type: 'mcq',                  // Hardcode 'type' as 'mcq' since this form only supports that
      
      // Form 'options' (string array) -> Backend 'choices' (object array)
      choices: formData.options.map((optText, index) => ({
        text: optText,
        order: index
      })),
      
      correctAnswer: formData.correctAnswer, // Form 'correctAnswer' (index) maps directly
      
      // Form 'category' (string) -> Backend 'tags' (string array)
      tags: [formData.category],
      
      difficulty: formData.difficulty,
      points: formData.points
    };

    try {
      if (question) {
        // 2. Call UPDATE: Use 'question._id' (MongoDB ID)
        await updateQuestion(question._id, questionData);
      } else {
        // 3. Call CREATE
        await addQuestion(questionData);
      }
      
      // 4. Success: close the modal
      onClose();
    } catch (err) {
      // 5. Handle errors from the context/API
      console.error("Failed to save question:", err);
      setError(err.message || "An unknown error occurred. Please try again.");
    } finally {
      // 6. Always stop the loading state
      setIsSubmitting(false);
    }
  };

  // --- Helper functions for managing the 'options' array state ---
  // (These are unchanged as they correctly modify the local state)

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, '']
    });
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) { // Minimum 2 options
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        options: newOptions,
        // Reset correct answer to 0 if the deleted one was the correct answer
        correctAnswer: formData.correctAnswer >= newOptions.length 
          ? 0 
          : (formData.correctAnswer === index ? 0 : formData.correctAnswer)
      });
    } else {
      setError("A question must have at least 2 options.");
    }
  };

  return (
    // Modal Backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Modal Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {question ? 'Edit Question' : 'Add New Question'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body: Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Question Text -> maps to 'title' */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Text
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your question..."
              required
            />
          </div>

          {/* Answer Options -> maps to 'choices' */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Answer Options (Select the correct one)
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer === index}
                    onChange={() => setFormData({ ...formData, correctAnswer: index })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addOption}
                className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <Plus className="w-4 h-4" />
                <span>Add Option</span>
              </button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Category -> maps to 'tags' */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="Programming">Programming</option>
                <option value="DBMS">DBMS</option>
                <option value="Networks">Networks</option>
                <option value="AI">AI</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>

            {/* Difficulty -> maps to 'difficulty' */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Points -> maps to 'points' */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Points
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value, 10) || 1 })}
                min="1"
                max="100" // Increased max
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          {/* NEW: Error Display */}
          {error && (
            <div className="p-3 text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Modal Footer: Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {question ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                question ? 'Update Question' : 'Add Question'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
