import React, { useState, useEffect } from 'react';
import { useQuiz } from '../../contexts/QuizContext.jsx';
import { X, Plus, Minus, Loader2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableOptionItem({ id, option, index, onOptionChange, onRemoveOption, optionsLength }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center space-x-3">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <input
        type="text"
        value={option}
        onChange={(e) => onOptionChange(index, e.target.value)}
        placeholder={`Option ${index + 1} (Correct Order)`}
        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        required
      />
      {optionsLength > 2 && (
        <button
          type="button"
          onClick={() => onRemoveOption(index)}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
        >
          <Minus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

const getInitialState = (question = null) => {
  const defaultState = {
    text: '',
    type: 'mcq', 
    options: ['', ''],
    correctAnswer: 0,
    correctAnswerBool: 'true',
    correctAnswers: [],
    acceptableAnswers: [],
    testCases: [],
    category: 'Programming',
    difficulty: 'medium',
    points: 10
  };

  if (!question) {
    return defaultState;
  }

  let state = {
    ...defaultState,
    text: question.title || '',
    type: question.type || 'mcq',
    category: (question.tags && question.tags.length > 0) ? question.tags[0] : 'Programming',
    difficulty: question.difficulty || 'medium',
    points: question.points || 10,
  };

  // Populate answer fields based on question type
  switch (question.type) {
    case 'mcq':
      state.options = (question.choices && question.choices.length > 0)
        ? question.choices.sort((a, b) => a.order - b.order).map(opt => opt.text)
        : ['', ''];
      state.correctAnswer = question.correctAnswer || 0;
      break;
    case 'true_false':
      state.correctAnswerBool = String(question.correctAnswer); // 'true' or 'false'
      break;
    case 'checkbox':
      state.options = (question.choices && question.choices.length > 0)
        ? question.choices.sort((a, b) => a.order - b.order).map(opt => opt.text)
        : ['', ''];
      state.correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
      break;
    case 'drag_drop': // drag_drop uses the options array
      state.options = (question.choices && question.choices.length > 0)
        ? question.choices.sort((a, b) => a.order - b.order).map(opt => opt.text)
        : ['', ''];
      state.correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
      if(question.type === 'drag_drop') state.correctAnswer = null; // Not used for drag_drop
      break;
    // case 'short_answer':
    // case 'fill_blank':
    //   state.acceptableAnswers = Array.isArray(question.acceptableAnswers) ? question.acceptableAnswers : [];
    //   break;
    // case 'code':
    //   state.testCases = Array.isArray(question.testCases) ? question.testCases : [];
    //   break;
    // Add cases for other types (long_answer, drag_drop, etc.) as needed
    default:
      break;
  }
  
  return state;
};
export default function QuestionForm({ question, onClose }) {
  const { addQuestion, updateQuestion } = useQuiz();

  const [formData, setFormData] = useState(() => getInitialState(question))

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  // useEffect(() => {
  //   if (question) {
  //     // Map data from the backend 'question' object to the form's state
  //     setFormData({
  //       text: question.title || '', // Backend 'title' -> maps to 'text' in form state
  //       // Backend 'choices' (array of objects) -> maps to 'options' (array of strings) in form state
  //       options: (question.choices && question.choices.length > 0)
  //         ? question.choices.sort((a, b) => a.order - b.order).map(opt => opt.text)
  //         : ['', '', '', ''],
  //       correctAnswer: question.correctAnswer || 0, // Backend 'correctAnswer' (index) -> maps directly
  //       // Backend 'tags' (array) -> maps to 'category' (string) in form state
  //       category: (question.tags && question.tags.length > 0) ? question.tags[0] : 'Programming',
  //       difficulty: question.difficulty || 'medium',
  //       points: question.points || 10
  //     });
  //   } else {
  //     // Reset form if no question is passed (for "Add New")
  //     setFormData({
  //       text: '',
  //       options: ['', '', '', ''],
  //       correctAnswer: 0,
  //       category: 'Programming',
  //       difficulty: 'medium',
  //       points: 10
  //     });
  //   }
  // }, [question]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.text.trim() === '' || formData.options.some(opt => opt.trim() === '')) {
      setError('Please fill in all fields, including all option texts.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const questionData = {
      title: formData.text,
      type: formData.type,
      tags: [formData.category],
      difficulty: formData.difficulty,
      points: formData.points,
      choices: [],
      correctAnswer: null,
      acceptableAnswers: [],
      testCases: []
    };

    switch (formData.type) {
      case 'mcq':
        questionData.choices = formData.options.map((optText, index) => ({
          text: optText,
          order: index
        }));
        questionData.correctAnswer = formData.correctAnswer; // This is the index (Number)
        break;
        
      case 'checkbox':
        questionData.choices = formData.options.map((optText, index) => ({
          text: optText,
          order: index
        }));
        questionData.correctAnswer = formData.correctAnswers; // This is the array of indices
        break;

      case 'true_false':
        questionData.correctAnswer = (formData.correctAnswerBool === 'true'); 
        break;

      case 'drag_drop':
        questionData.choices = formData.options.map((optText, index) => ({
          text: optText,
          order: index
        }));
        questionData.correctAnswer = null;
        break;

      // case 'short_answer':
      // case 'fill_blank':
      //   questionData.acceptableAnswers = formData.acceptableAnswers; // Pass the array
      //   break;
        
      // case 'code':
      //   questionData.testCases = formData.testCases; // Pass the array
      //   break;
        
      // case 'long_answer':
      //   // No correct answer needed, backend defaults to null
      //   questionData.requiresManualGrading = true; // You might want to set this
      //   break;
      
      // Add other cases here
    }

    try {
      if (question) {
        await updateQuestion(question._id, questionData);
      } else {
        await addQuestion(questionData);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save question:", err);
      setError(err.message || "An unknown error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


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
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      if(formData.type === 'mcq') {
          setFormData({
            ...formData,
            options: newOptions,
            correctAnswer: formData.correctAnswer >= newOptions.length 
              ? 0 
              : (formData.correctAnswer === index ? 0 : formData.correctAnswer)
          });
      } else if (formData.type === 'checkbox') {
          const newCorrectAnswers = formData.correctAnswers
            .filter(i => i !== index)
            .map(i => i > index ? i - 1 : i); 
          setFormData({
             ...formData,
             options: newOptions,
             correctAnswers: newCorrectAnswers
          });
      } else {
         setFormData({
            ...formData,
            options: newOptions,
         });
      }
      
    } else {
      setError("A question must have at least 2 options.");
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.options.indexOf(active.id);
        const newIndex = prev.options.indexOf(over.id);
        const newOptions = arrayMove(prev.options, oldIndex, newIndex);
        
        return {
          ...prev,
          options: newOptions,
        };
      });
    }
  };

  const renderAnswerEditor = () => {
    const { type } = formData;

    switch (type) {
      case 'mcq':
        return (
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
        );

      case 'true_false':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correct Answer
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="trueFalseAnswer"
                  value="true"
                  checked={formData.correctAnswerBool === 'true'}
                  onChange={(e) => setFormData({ ...formData, correctAnswerBool: e.target.value })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span>True</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="trueFalseAnswer"
                  value="false"
                  checked={formData.correctAnswerBool === 'false'}
                  onChange={(e) => setFormData({ ...formData, correctAnswerBool: e.target.value })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span>False</span>
              </label>
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Answer Options (Select all correct answers)
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.correctAnswers.includes(index)}
                    onChange={() => {
                      const newAnswers = [...formData.correctAnswers];
                      if (newAnswers.includes(index)) {
                        setFormData({ ...formData, correctAnswers: newAnswers.filter(i => i !== index) });
                      } else {
                        setFormData({ ...formData, correctAnswers: [...newAnswers, index] });
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
        );

        case 'drag_drop':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Answer Options (Drag to set the correct order)
            </label>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={formData.options} // Use the options themselves as unique IDs
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <SortableOptionItem
                      key={option + index} // Use option text + index as a key (simple unique id)
                      id={option}
                      option={option}
                      index={index}
                      onOptionChange={handleOptionChange}
                      onRemoveOption={removeOption}
                      optionsLength={formData.options.length}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <button
              type="button"
              onClick={addOption}
              className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-3"
            >
              <Plus className="w-4 h-4" />
              <span>Add Option</span>
            </button>
          </div>
        );

      // case 'short_answer':
      // case 'fill_blank':
        // TODO: Build a UI to manage the 'acceptableAnswers' array
        // return (
        //   <div className="p-4 border border-dashed rounded-lg dark:border-gray-600">
        //     <p className="dark:text-gray-400">UI for 'Short Answer' (acceptableAnswers) not built yet.</p>
        //   </div>
        // );
      
      // case 'code':
      //   // TODO: Build a UI to manage the 'testCases' array
      //   return (
      //     <div className="p-4 border border-dashed rounded-lg dark:border-gray-600">
      //       <p className="dark:text-gray-400">UI for 'Code' (testCases) not built yet.</p>
      //     </div>
      //   );
      
      // case 'long_answer':
      //   return (
      //     <div className="p-4 border border-dashed rounded-lg dark:border-gray-600">
      //       <p className="dark:text-gray-400">Long Answer questions are typically graded manually. No answer key needed here.</p>
      //     </div>
      //   );

      default:
        return null;
    }
  };

// ...

// Now, in your main 'return' JSX, find the "Answer Options" div and replace it.
//
// REPLACE THIS:
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Answer Options (Select the correct one)
//             </label>
//             <div className="space-y-3">
//               {formData.options.map((option, index) => (
//                 // ... all the old mcq logic
//               ))}
//             </div>
//           </div>
//
// WITH THIS:
          {renderAnswerEditor()}

  return (
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => {
                const newType = e.target.value;
                setFormData(prev => ({
                    ...getInitialState(null),
                    type: newType,
                    text: prev.text,
                    category: prev.category, 
                    difficulty: prev.difficulty,
                    points: prev.points
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={!!question}
            >
              {/* These values MUST match the enum in question.model.js */}
              <option value="mcq">Multiple Choice (Single Answer)</option>
              <option value="checkbox">Checkbox (Multiple Answers)</option>
              <option value="true_false">True / False</option>
              <option value="drag_drop"> Drag and Drop (Ordering) </option>
              { /* <option value="short_answer">Short Answer</option>
              <option value="code">Code</option>
              <option value="long_answer">Long Answer / Essay</option>
              <option value="fill_blank">Fill in the Blank</option>}
              {/* Add other types like 'drag_drop', 'match' here */}
            </select>
            {question && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Question type cannot be changed after creation.
              </p>
            )}
          </div>

          {/* Answer Options -> maps to 'choices' */}
          {renderAnswerEditor()}

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
                <option value="DSA">DSA</option>
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
                value={formData.difficulty.toLowerCase()}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
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
