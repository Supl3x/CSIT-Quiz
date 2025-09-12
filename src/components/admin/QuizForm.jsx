import React, { useState, useEffect } from "react";
import QuestionForm from "./QuestionForm.jsx";

export default function QuizForm({ quiz, onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Programming");
  const [duration, setDuration] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title);
      setCategory(quiz.category);
      setDuration(quiz.duration);
      setQuestions(quiz.questions || []);
    }
  }, [quiz]);

  // Save a question (new or edited)
  const handleSaveQuestion = (q) => {
    if (editingQuestion) {
      // Edit existing question
      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? q : item))
      );
    } else {
      // Add new question
      setQuestions((prev) => [...prev, q]);
    }
    setShowQuestionForm(false);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion(q);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSaveQuiz = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter quiz title");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    const newQuiz = {
      id: quiz?.id || Date.now(),
      title,
      category,
      duration,
      questions,
      isActive: quiz?.isActive || false,
      createdAt: quiz?.createdAt || new Date(),
    };

    onSave(newQuiz);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setCategory("Programming");
    setDuration(10);
    setQuestions([]);
    setEditingQuestion(null);
    setShowQuestionForm(false);
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
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="Programming">Programming</option>
                <option value="DBMS">DBMS</option>
                <option value="Networks">Networks</option>
                <option value="AI">AI</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
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
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Questions
              </h3>
              <button
                type="button"
                onClick={() => setShowQuestionForm(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
              >
                + Add Question
              </button>
            </div>

            <div className="space-y-2">
              {questions.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">
                  No questions added yet.
                </p>
              )}
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg"
                >
                  <span>
                    {idx + 1}. {q.text} ({q.type})
                  </span>
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
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
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
            editingQuestion={editingQuestion}
            onClose={() => {
              setShowQuestionForm(false);
              setEditingQuestion(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
