import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Minus, 
  Type, 
  Move, 
  ListOrdered, 
  Link, 
  CheckCircle,
  XCircle,
  Save,
  Trash2
} from 'lucide-react';

const QUESTION_TYPES = {
  'multiple-choice': { icon: Type, color: 'blue', label: 'Multiple Choice' },
  'drag-drop': { icon: Move, color: 'green', label: 'Drag & Drop' },
  'sequence': { icon: ListOrdered, color: 'purple', label: 'Sequence' },
  'matching': { icon: Link, color: 'orange', label: 'Matching' },
  'true-false': { icon: CheckCircle, color: 'cyan', label: 'True/False' }
};

export default function QuestionForm({ question, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    text: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: 'Programming',
    difficulty: 'Medium',
    points: 10,
    explanation: '',
    dragDropData: {
      items: ['', '', '', ''],
      correctOrder: [0, 1, 2, 3],
      instruction: 'Drag the items to arrange them in the correct order:'
    },
    sequenceData: {
      items: ['', '', '', ''],
      correctSequence: [0, 1, 2, 3]
    },
    matchingData: {
      pairs: [
        { left: '', right: '' },
        { left: '', right: '' },
        { left: '', right: '' }
      ]
    }
  });

  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (question) {
      setFormData({
        text: question.text || '',
        type: question.type || 'multiple-choice',
        options: question.options || ['', '', '', ''],
        correctAnswer: question.correctAnswer || 0,
        category: question.category || 'Programming',
        difficulty: question.difficulty || 'Medium',
        points: question.points || 10,
        explanation: question.explanation || '',
        dragDropData: question.dragDropData || {
          items: ['', '', '', ''],
          correctOrder: [0, 1, 2, 3],
          instruction: 'Drag the items to arrange them in the correct order:'
        },
        sequenceData: question.sequenceData || {
          items: ['', '', '', ''],
          correctSequence: [0, 1, 2, 3]
        },
        matchingData: question.matchingData || {
          pairs: [
            { left: '', right: '' },
            { left: '', right: '' },
            { left: '', right: '' }
          ]
        }
      });
    }
  }, [question]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form based on question type
    if (!formData.text.trim()) {
      alert('Please enter a question text');
      return;
    }

    if (formData.type === 'multiple-choice') {
      if (formData.options.some(opt => !opt.trim())) {
        alert('Please fill in all options for multiple choice question');
        return;
      }
    }

    if (formData.type === 'drag-drop') {
      if (formData.dragDropData.items.some(item => !item.trim())) {
        alert('Please fill in all items for drag & drop question');
        return;
      }
    }

    if (formData.type === 'sequence') {
      if (formData.sequenceData.items.some(item => !item.trim())) {
        alert('Please fill in all items for sequence question');
        return;
      }
    }

    if (formData.type === 'matching') {
      if (formData.matchingData.pairs.some(pair => !pair.left.trim() || !pair.right.trim())) {
        alert('Please fill in all pairs for matching question');
        return;
      }
    }

    onSubmit(formData);
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions,
        correctAnswer: prev.correctAnswer >= newOptions.length ? 0 : prev.correctAnswer
      }));
    }
  };

  const updateDragDropItem = (index, value) => {
    const newItems = [...formData.dragDropData.items];
    newItems[index] = value;
    setFormData(prev => ({
      ...prev,
      dragDropData: { ...prev.dragDropData, items: newItems }
    }));
  };

  const addDragDropItem = () => {
    if (formData.dragDropData.items.length < 6) {
      const newItems = [...formData.dragDropData.items, ''];
      const newOrder = [...Array(newItems.length).keys()];
      setFormData(prev => ({
        ...prev,
        dragDropData: { 
          ...prev.dragDropData, 
          items: newItems,
          correctOrder: newOrder
        }
      }));
    }
  };

  const removeDragDropItem = (index) => {
    if (formData.dragDropData.items.length > 2) {
      const newItems = formData.dragDropData.items.filter((_, i) => i !== index);
      const newOrder = newItems.map((_, index) => index);
      setFormData(prev => ({
        ...prev,
        dragDropData: { 
          ...prev.dragDropData, 
          items: newItems,
          correctOrder: newOrder
        }
      }));
    }
  };

  const updateSequenceItem = (index, value) => {
    const newItems = [...formData.sequenceData.items];
    newItems[index] = value;
    setFormData(prev => ({
      ...prev,
      sequenceData: { ...prev.sequenceData, items: newItems }
    }));
  };

  const addSequenceItem = () => {
    if (formData.sequenceData.items.length < 6) {
      const newItems = [...formData.sequenceData.items, ''];
      const newSequence = [...Array(newItems.length).keys()];
      setFormData(prev => ({
        ...prev,
        sequenceData: { 
          ...prev.sequenceData, 
          items: newItems,
          correctSequence: newSequence
        }
      }));
    }
  };

  const removeSequenceItem = (index) => {
    if (formData.sequenceData.items.length > 2) {
      const newItems = formData.sequenceData.items.filter((_, i) => i !== index);
      const newSequence = newItems.map((_, index) => index);
      setFormData(prev => ({
        ...prev,
        sequenceData: { 
          ...prev.sequenceData, 
          items: newItems,
          correctSequence: newSequence
        }
      }));
    }
  };

  const updateMatchingPair = (index, field, value) => {
    const newPairs = [...formData.matchingData.pairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      matchingData: { ...prev.matchingData, pairs: newPairs }
    }));
  };

  const addMatchingPair = () => {
    if (formData.matchingData.pairs.length < 6) {
      setFormData(prev => ({
        ...prev,
        matchingData: { 
          ...prev.matchingData, 
          pairs: [...prev.matchingData.pairs, { left: '', right: '' }]
        }
      }));
    }
  };

  const removeMatchingPair = (index) => {
    if (formData.matchingData.pairs.length > 2) {
      const newPairs = formData.matchingData.pairs.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        matchingData: { ...prev.matchingData, pairs: newPairs }
      }));
    }
  };

  const renderQuestionTypeFields = () => {
    switch (formData.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Answer Options
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, correctAnswer: index }))}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-medium flex-shrink-0 ${
                      formData.correctAnswer === index
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </button>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    required
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {formData.options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Option</span>
              </button>
            )}
          </div>
        );

      case 'drag-drop':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Instruction Text
              </label>
              <input
                type="text"
                value={formData.dragDropData.instruction}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dragDropData: { ...prev.dragDropData, instruction: e.target.value }
                }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
                placeholder="Enter instruction text..."
              />
            </div>

            <label className="block text-sm font-medium text-slate-300 mb-3">
              Drag & Drop Items
            </label>
            <div className="space-y-3">
              {formData.dragDropData.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="w-8 h-8 bg-slate-700 text-slate-400 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateDragDropItem(index, e.target.value)}
                    required
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
                    placeholder={`Item ${index + 1}`}
                  />
                  {formData.dragDropData.items.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeDragDropItem(index)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {formData.dragDropData.items.length < 6 && (
              <button
                type="button"
                onClick={addDragDropItem}
                className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            )}
          </div>
        );

      case 'sequence':
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Sequence Items (in correct order)
            </label>
            <div className="space-y-3">
              {formData.sequenceData.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="w-8 h-8 bg-blue-500/20 text-blue-300 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateSequenceItem(index, e.target.value)}
                    required
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
                    placeholder={`Step ${index + 1}`}
                  />
                  {formData.sequenceData.items.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeSequenceItem(index)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {formData.sequenceData.items.length < 6 && (
              <button
                type="button"
                onClick={addSequenceItem}
                className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            )}
          </div>
        );

      case 'matching':
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Matching Pairs
            </label>
            <div className="space-y-3">
              {formData.matchingData.pairs.map((pair, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={pair.left}
                    onChange={(e) => updateMatchingPair(index, 'left', e.target.value)}
                    required
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
                    placeholder={`Left item ${index + 1}`}
                  />
                  <span className="text-slate-500">→</span>
                  <input
                    type="text"
                    value={pair.right}
                    onChange={(e) => updateMatchingPair(index, 'right', e.target.value)}
                    required
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
                    placeholder={`Right item ${index + 1}`}
                  />
                  {formData.matchingData.pairs.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeMatchingPair(index)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {formData.matchingData.pairs.length < 6 && (
              <button
                type="button"
                onClick={addMatchingPair}
                className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Pair</span>
              </button>
            )}
          </div>
        );

      case 'true-false':
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Correct Answer
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, correctAnswer: true }))}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  formData.correctAnswer === true
                    ? 'bg-green-500/20 border-green-500 text-green-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">True</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, correctAnswer: false }))}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  formData.correctAnswer === false
                    ? 'bg-red-500/20 border-red-500 text-red-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">False</span>
                </div>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              {question ? <Save className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              {question ? 'Edit Question' : 'Create New Question'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(90vh-80px)]">
          {/* Tabs */}
          <div className="flex border-b border-slate-700 bg-slate-800/30">
            {['basic', 'type', 'advanced'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-medium text-sm transition-all ${
                  activeTab === tab
                    ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/20'
                }`}
              >
                {tab === 'basic' && 'Basic Info'}
                {tab === 'type' && 'Question Type'}
                {tab === 'advanced' && 'Advanced'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'basic' && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      value={formData.text}
                      onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white resize-none transition-all"
                      rows={4}
                      placeholder="Enter your question here..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
                        required
                      >
                        <option value="Programming">Programming</option>
                        <option value="DBMS">DBMS</option>
                        <option value="Networks">Networks</option>
                        <option value="AI">AI</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Difficulty *
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
                        required
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Points *
                      </label>
                      <input
                        type="number"
                        value={formData.points}
                        onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                        min="1"
                        max="100"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'type' && (
                <motion.div
                  key="type"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Question Type *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(QUESTION_TYPES).map(([type, config]) => {
                        const Icon = config.icon;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type }))}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              formData.type === type
                                ? `bg-${config.color}-500/20 border-${config.color}-500 text-${config.color}-300`
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5" />
                              <div>
                                <div className="font-medium">{config.label}</div>
                                <div className="text-xs opacity-75">
                                  {type === 'multiple-choice' && 'Choose one correct answer'}
                                  {type === 'drag-drop' && 'Drag items to correct positions'}
                                  {type === 'sequence' && 'Arrange items in order'}
                                  {type === 'matching' && 'Match items from left to right'}
                                  {type === 'true-false' && 'Select true or false'}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {renderQuestionTypeFields()}
                </motion.div>
              )}

              {activeTab === 'advanced' && (
                <motion.div
                  key="advanced"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={formData.explanation}
                      onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white resize-none transition-all"
                      rows={3}
                      placeholder="Explain why this answer is correct..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-700 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="text-slate-400 text-sm">
                {formData.type && (
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-${QUESTION_TYPES[formData.type]?.color}-500`} />
                    {QUESTION_TYPES[formData.type]?.label}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-slate-400 hover:text-white transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  <Save className="w-5 h-5" />
                  <span>{question ? 'Update Question' : 'Create Question'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}