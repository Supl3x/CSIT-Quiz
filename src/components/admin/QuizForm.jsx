// ...existing code...
import React, { useState, useEffect } from "react";
import { useQuiz } from '../../contexts/QuizContext.jsx';
import QuestionForm from "./QuestionForm.jsx";

export default function QuizForm({ quiz, onSave, onClose }) {
  const { questions: allQuestions, addQuestion, topics, addTopic } = useQuiz();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Programming");
  const [duration, setDuration] = useState(10);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  // Topic filter state (use 'category' property)
  const uniqueTopics = Array.from(new Set(allQuestions.map(q => q.category).filter(Boolean)));
  const [selectedTopic, setSelectedTopic] = useState("");
  // Multi-category selection for quiz + random generator
  const categoryOptions = topics;
  const [categories, setCategories] = useState([]);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  // State for random quiz generator
  const [randomCount, setRandomCount] = useState(5);
  // UI state for topic dropdown
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  // State for adding new topic
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const handleGenerateRandomQuiz = () => {
    const chosenTopics = (categories && categories.length > 0) ? categories : uniqueTopics;
    // Build a pool per topic excluding already selected
    const poolsByTopic = chosenTopics.reduce((acc, topic) => {
      const list = allQuestions.filter(q => q.category === topic && !selectedQuestionIds.includes(q.id));
      // Shuffle each pool to add randomness within topic
      acc[topic] = list.sort(() => Math.random() - 0.5);
      return acc;
    }, {});

    const totalAvailable = Object.values(poolsByTopic).reduce((sum, arr) => sum + arr.length, 0);
    if (totalAvailable === 0) {
      alert("No questions available for the selected topics.");
      return;
    }

    const target = Math.min(randomCount, totalAvailable);
    const pickedIds = [];

    // Round-robin pick across topics to balance selection
    while (pickedIds.length < target) {
      let madeProgress = false;
      for (const topic of chosenTopics) {
        const pool = poolsByTopic[topic];
        if (pool && pool.length > 0 && pickedIds.length < target) {
          const q = pool.pop();
          pickedIds.push(q.id);
          madeProgress = true;
        }
      }
      if (!madeProgress) break; // No more questions in any pool
    }

    setSelectedQuestionIds(prev => [...prev, ...pickedIds]);
  };

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title);
      setCategory(quiz.category);
      setDuration(quiz.duration);
      setSelectedQuestionIds(Array.isArray(quiz.questions) ? quiz.questions.map(q => typeof q === 'string' ? q : q.id) : []);
      // Initialize multi-categories if present
      if (Array.isArray(quiz.categories)) {
        setCategories(quiz.categories);
      } else if (quiz.category) {
        setCategories([quiz.category]);
      }
    }
  }, [quiz]);

  // Save a question (new or edited)
  const handleSaveQuestion = (q) => {
    let newId = q.id;
    if (!q.id) {
      newId = addQuestion(q);
    }
    setSelectedQuestionIds(prev => [...prev, newId]);
    setShowQuestionForm(false);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion(q);
    setShowQuestionForm(true);
  };

  const handleRemoveQuestion = (id) => {
    setSelectedQuestionIds(prev => prev.filter(qid => qid !== id));
  };

  const handleSaveQuiz = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter quiz title");
      return;
    }

    if (selectedQuestionIds.length === 0) {
      alert("Please add at least one question");
      return;
    }

    const primaryCategory = (categories && categories.length > 0)
      ? (categories.length === 1 ? categories[0] : 'Multiple')
      : 'All';

    const newQuiz = {
      id: quiz?.id || Date.now(),
      title,
      category: primaryCategory,
      categories: categories && categories.length > 0 ? categories : undefined,
      duration,
      questions: selectedQuestionIds,
      // New quizzes should be active by default so students can see them
      isActive: quiz?.isActive ?? true,
      createdAt: quiz?.createdAt || new Date(),
      totalQuestions: selectedQuestionIds.length,
    };

    onSave(newQuiz);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setCategory("Programming");
    setDuration(10);
    setSelectedQuestionIds([]);
    setEditingQuestion(null);
    setShowQuestionForm(false);
  };

  const handleAddTopic = () => {
    if (!newTopicName.trim()) {
      alert("Please enter a topic name");
      return;
    }
    
    const success = addTopic(newTopicName.trim());
    if (success) {
      alert(`Topic "${newTopicName.trim()}" added successfully!`);
      setNewTopicName("");
      setShowAddTopicModal(false);
    } else {
      alert(`Topic "${newTopicName.trim()}" already exists!`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {quiz ? "Edit Quiz" : "Create New Quiz"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✖
          </button>
        </div>

        <form onSubmit={handleSaveQuiz} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categories
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                  onClick={() => setShowCategoriesDropdown(v => !v)}
                >
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {categories.length === 0 ? 'Select categories (default: All)' : categories.join(', ')}
                  </span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showCategoriesDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg p-2 space-y-1">
                    {categoryOptions.map(opt => (
                      <label key={opt} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-checkbox"
                          checked={categories.includes(opt)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCategories(prev => [...prev, opt]);
                            } else {
                              setCategories(prev => prev.filter(c => c !== opt));
                            }
                          }}
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <button type="button" className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700" onClick={() => setCategories([])}>Clear</button>
                      <button type="button" className="text-xs px-2 py-1 rounded bg-blue-600 text-white" onClick={() => setShowCategoriesDropdown(false)}>Done</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min={1}
                max={180}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Questions Count for Random Generator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Questions Count
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={randomCount}
                onChange={(e) => setRandomCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="How many questions?"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Questions
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTopicModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <span>+ Add Topic</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuestionForm(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                >
                  + Add Question
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                    onClick={handleGenerateRandomQuiz}
                  >
                    <span>🎲</span>
                    <span>Random Quiz</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {selectedQuestionIds.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">
                  No questions added yet.
                </p>
              )}
              {selectedQuestionIds.map((qid, idx) => {
                const q = allQuestions.find(q => q.id === qid);
                if (!q) return null;
                return (
                  <div
                    key={q.id}
                    className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
                  >
                    <div className="flex-1">
                      <span className="font-medium">
                        {idx + 1}. {q.text}
                      </span>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          q.type === 'multiple-choice' ? 'bg-blue-100 text-blue-800' :
                          q.type === 'drag-drop' ? 'bg-green-100 text-green-800' :
                          q.type === 'sequence' ? 'bg-purple-100 text-purple-800' :
                          q.type === 'matching' ? 'bg-orange-100 text-orange-800' :
                          'bg-cyan-100 text-cyan-800'
                        }`}>
                          {q.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {q.points} points
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditQuestion(q)}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Question Selector with Topic Filter */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter Questions by Topic
              </label>
              <select
                className="w-full border rounded p-2 mb-4 dark:bg-gray-700 dark:text-white"
                value={selectedTopic}
                onChange={e => setSelectedTopic(e.target.value)}
              >
                <option value="">All Topics</option>
                {uniqueTopics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add Existing Questions
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {allQuestions
                  .filter(q => !selectedQuestionIds.includes(q.id))
                  .filter(q => selectedTopic ? q.category === selectedTopic : true)
                  .map(q => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setSelectedQuestionIds(prev => [...prev, q.id])}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-left"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">{q.text}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ml-auto">{q.category}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Quiz
            </button>
          </div>
        </form>

        {showQuestionForm && (
          <QuestionForm
            onSave={handleSaveQuestion}
            question={editingQuestion}
            onClose={() => {
              setShowQuestionForm(false);
              setEditingQuestion(null);
            }}
          />
        )}

        {showAddTopicModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Topic</h3>
                <button
                  onClick={() => {
                    setShowAddTopicModal(false);
                    setNewTopicName("");
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic Name
                  </label>
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Machine Learning"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddTopicModal(false);
                      setNewTopicName("");
                    }}
                    className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Add Topic
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
