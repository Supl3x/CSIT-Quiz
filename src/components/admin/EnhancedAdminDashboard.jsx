import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../../contexts/QuizContext.jsx';
import {
  BookOpen,
  Users,
  TrendingUp,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  FileText,
  Clock,
  Sparkles,
  Zap,
  Target,
  Award
} from 'lucide-react';
import DraggableQuestionManager from './DraggableQuestionManager.jsx';
import QuizManager from './QuizManager.jsx';
import AnalyticsDashboard from './AnalyticsDashboard.jsx';

export default function EnhancedAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { questions, quizzes, attempts } = useQuiz();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-cyan-500 to-blue-600' },
    { id: 'questions', label: 'Questions', icon: FileText, color: 'from-purple-500 to-pink-600' },
    { id: 'quizzes', label: 'Quizzes', icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-orange-500 to-red-600' },
  ];

  const categoryStats = questions.reduce((acc, question) => {
    acc[question.category] = (acc[question.category] || 0) + 1;
    return acc;
  }, {});

  const activeQuizzes = quizzes.filter(quiz => quiz.isActive).length;
  const totalAttempts = attempts.length;
  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length)
    : 0;

  const stats = [
    { label: 'Total Questions', value: questions.length, icon: FileText, color: 'from-blue-500 to-cyan-600', bgColor: 'from-blue-500/20 to-cyan-500/20' },
    { label: 'Active Quizzes', value: activeQuizzes, icon: BookOpen, color: 'from-emerald-500 to-green-600', bgColor: 'from-emerald-500/20 to-green-500/20' },
    { label: 'Total Attempts', value: totalAttempts, icon: Users, color: 'from-purple-500 to-pink-600', bgColor: 'from-purple-500/20 to-pink-500/20' },
    { label: 'Average Score', value: `${avgScore}%`, icon: Award, color: 'from-orange-500 to-red-600', bgColor: 'from-orange-500/20 to-red-500/20' },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-black text-white mb-2 flex items-center gap-3"
            >
              <Sparkles className="w-10 h-10 text-cyan-400" />
              Faculty Dashboard
            </motion.h1>
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg"
            >
              Manage quizzes, questions, and monitor student performance
            </motion.p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="mt-4 md:mt-0"
          >
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 backdrop-blur-xl px-4 py-3 rounded-xl border border-slate-700">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden"
      >
        <div className="flex overflow-x-auto">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-3 px-8 py-5 font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeAdminTab"
                  className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-20`}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeAdminTabBorder"
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tab.color}`}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <tab.icon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-slate-700/50 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity`} />

                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium mb-2">{stat.label}</p>
                      <motion.p
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 + index * 0.1 }}
                        className="text-4xl font-black text-white"
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                      className={`p-4 bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg`}
                    >
                      <stat.icon className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-cyan-400" />
                Questions by Category
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(categoryStats).map(([category, count], index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05, type: "spring" }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="text-center p-6 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl border border-slate-600/50 hover:border-cyan-500/50 transition-all"
                  >
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.05, type: "spring" }}
                      className="text-4xl font-black text-white mb-2"
                    >
                      {count}
                    </motion.p>
                    <p className="text-sm text-slate-400 font-medium">{category}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-6 h-6 text-cyan-400" />
                  Recent Quizzes
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('quizzes')}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors"
                >
                  View All →
                </motion.button>
              </div>
              <div className="space-y-3">
                {quizzes.slice(0, 5).map((quiz, index) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    whileHover={{ x: 5, scale: 1.01 }}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all"
                  >
                    <div>
                      <h4 className="font-semibold text-white">{quiz.title}</h4>
                      <p className="text-sm text-slate-400">
                        {quiz.category} • {quiz.totalQuestions} questions • {quiz.duration} minutes
                      </p>
                    </div>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        quiz.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
                      }`}
                    >
                      {quiz.isActive ? 'Active' : 'Inactive'}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DraggableQuestionManager />
          </motion.div>
        )}

        {activeTab === 'quizzes' && (
          <motion.div
            key="quizzes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <QuizManager />
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AnalyticsDashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
