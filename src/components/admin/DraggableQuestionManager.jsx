import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useQuiz } from '../../contexts/QuizContext.jsx';
import { Plus, Edit, Trash2, Search, GripVertical, Sparkles, Filter, Eye, EyeOff, X } from 'lucide-react';
import QuestionForm from './QuestionForm.jsx';

function SortableQuestionItem({ question, onEdit, onDelete, onTogglePreview, showPreview }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.01, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
      className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 overflow-hidden ${
        isDragging ? 'shadow-2xl ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-start gap-4">
        <motion.div
          {...attributes}
          {...listeners}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-blue-400 transition-colors pt-1"
        >
          <GripVertical className="w-5 h-5" />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <p className="text-white font-medium leading-relaxed flex-1">
              {question.text}
            </p>

            <div className="flex items-center gap-2 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTogglePreview(question.id)}
                className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(question)}
                className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(question.id)}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xl ${
                question.category === 'Programming' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                question.category === 'DBMS' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                question.category === 'Networks' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                question.category === 'AI' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              {question.category}
            </motion.span>

            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xl ${
                question.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {question.difficulty}
            </motion.span>

            <motion.span
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs font-medium border border-slate-600/50"
            >
              {question.points} points
            </motion.span>
          </div>

          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 mt-4 pt-4 border-t border-slate-700/50"
              >
                {question.options && question.options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      index === question.correctAnswer
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-slate-800/50 border border-slate-700/30'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold ${
                      index === question.correctAnswer
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-slate-700/50 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className={`text-sm ${
                      index === question.correctAnswer ? 'text-green-300 font-medium' : 'text-slate-400'
                    }`}>
                      {option}
                    </span>
                    {index === question.correctAnswer && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto text-green-400"
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function DraggableQuestionManager() {
  const { questions, deleteQuestion, addQuestion, updateQuestion, topics, addTopic } = useQuiz();
  const [localQuestions, setLocalQuestions] = useState(questions);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [previewStates, setPreviewStates] = useState({});
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  React.useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const categories = ['All', ...topics];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredQuestions = localQuestions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || question.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'All' || question.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLocalQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleDelete = (questionId) => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteQuestion(questionId);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingQuestion(null);
  };

  const handleSaveQuestion = (questionData) => {
    if (editingQuestion) {
      updateQuestion(editingQuestion.id, questionData);
    } else {
      addQuestion(questionData);
    }
    handleCloseForm();
  };

  const togglePreview = (questionId) => {
    setPreviewStates(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            Question Management
          </h2>
          <p className="text-slate-400 mt-1">Drag and drop to reorder questions</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddTopicModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Topic</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Question</span>
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-500 transition-all"
            />
          </div>

          <motion.select
            whileFocus={{ scale: 1.02 }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </motion.select>

          <motion.select
            whileFocus={{ scale: 1.02 }}
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </motion.select>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700/50 bg-slate-900/50">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-cyan-400" />
            Questions ({filteredQuestions.length})
          </h3>
        </div>

        <div className="p-6">
          {filteredQuestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No questions found matching your criteria.</p>
            </motion.div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredQuestions.map(q => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {filteredQuestions.map((question) => (
                    <SortableQuestionItem
                      key={question.id}
                      question={question}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onTogglePreview={togglePreview}
                      showPreview={previewStates[question.id]}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] overflow-auto"
            >
              <QuestionForm
                question={editingQuestion}
                onClose={handleCloseForm}
                onSave={handleSaveQuestion}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Topic Modal */}
      <AnimatePresence>
        {showAddTopicModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
            onClick={() => {
              setShowAddTopicModal(false);
              setNewTopicName("");
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Add New Topic</h3>
                <button
                  onClick={() => {
                    setShowAddTopicModal(false);
                    setNewTopicName("");
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Topic Name
                  </label>
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white transition-all"
                    placeholder="e.g., Machine Learning"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      setShowAddTopicModal(false);
                      setNewTopicName("");
                    }}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleAddTopic}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    Add Topic
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
