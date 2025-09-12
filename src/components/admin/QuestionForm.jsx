import React, { useState, useEffect } from "react";
import { useQuiz } from "../../contexts/QuizContext.jsx";
import { X } from "lucide-react";

export default function QuestionForm({ question, onClose }) {
  const { addQuestion, updateQuestion } = useQuiz();

  const [formData, setFormData] = useState({
    text: "",
    type: "mcq",
    options: [""],
    correctAnswer: "",
    pairs: [{ left: "", right: "" }],
    steps: [""],
    category: "Programming",
    difficulty: "Medium",
    points: 10,
  });

  useEffect(() => {
    if (question) {
      setFormData({
        text: question.text,
        type: question.type || "mcq",
        options: question.options || [""],
        correctAnswer: question.correctAnswer || "",
        pairs: question.pairs || [{ left: "", right: "" }],
        steps: question.steps || [""],
        category: question.category || "Programming",
        difficulty: question.difficulty || "Medium",
        points: question.points || 10,
      });
    }
  }, [question]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      alert("Please enter question text.");
      return;
    }

    const newQuestion = { ...formData, id: question?.id || Date.now() };
    onSave(newQuestion); // <--- IMPORTANT
    onClose();
  };
}

  const updateOption = (i, value) => {
    const updated = [...formData.options];
    updated[i] = value;
    setFormData({ ...formData, options: updated });
  };

  const updatePair = (i, field, value) => {
    const updated = [...formData.pairs];
    updated[i][field] = value;
    setFormData({ ...formData, pairs: updated });
  };

  const updateStep = (i, value) => {
    const updated = [...formData.steps];
    updated[i] = value;
    setFormData({ ...formData, steps: updated });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {question ? "Edit Question" : "Add New Question"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="mcq">Multiple Choice</option>
              <option value="dragdrop">Drag & Drop</option>
              <option value="flowchart">Flowchart</option>
            </select>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Text
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Enter your question..."
            />
          </div>

          {/* Dynamic Inputs */}
          {formData.type === "mcq" && (
            <div>
              <h3 className="font-semibold mb-2">Options</h3>
              {formData.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={formData.correctAnswer === opt}
                    onChange={() => setFormData({ ...formData, correctAnswer: opt })}
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        options: formData.options.filter((_, idx) => idx !== i),
                      })
                    }
                    className="text-red-500"
                  >
                    ❌
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, options: [...formData.options, ""] })}
                className="text-blue-500"
              >
                + Add Option
              </button>
            </div>
          )}

          {formData.type === "dragdrop" && (
            <div>
              <h3 className="font-semibold mb-2">Pairs</h3>
              {formData.pairs.map((pair, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Left"
                    value={pair.left}
                    onChange={(e) => updatePair(i, "left", e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Right"
                    value={pair.right}
                    onChange={(e) => updatePair(i, "right", e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        pairs: formData.pairs.filter((_, idx) => idx !== i),
                      })
                    }
                    className="text-red-500"
                  >
                    ❌
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, pairs: [...formData.pairs, { left: "", right: "" }] })
                }
                className="text-blue-500"
              >
                + Add Pair
              </button>
            </div>
          )}

          {formData.type === "flowchart" && (
            <div>
              <h3 className="font-semibold mb-2">Steps</h3>
              {formData.steps.map((step, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateStep(i, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        steps: formData.steps.filter((_, idx) => idx !== i),
                      })
                    }
                    className="text-red-500"
                  >
                    ❌
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, steps: [...formData.steps, ""] })}
                className="text-blue-500"
              >
                + Add Step
              </button>
            </div>
          )}

          {/* Extra Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option>Programming</option>
                <option>DBMS</option>
                <option>Networks</option>
                <option>AI</option>
                <option>Cybersecurity</option>
              </select>
            </div>
            <div>
              <label>Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label>Points</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {question ? "Update Question" : "Add Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
