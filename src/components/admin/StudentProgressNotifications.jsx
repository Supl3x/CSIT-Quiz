import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Award,
  X
} from 'lucide-react';
import GlassCard from '../common/GlassCard.jsx';

export default function StudentProgressNotifications({ attempts = [], quizzes = [], onClose }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    generateNotifications();
  }, [attempts, quizzes]);

  const generateNotifications = () => {
    const newNotifications = [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Recent attempts in last 24 hours
    const recentAttempts = attempts.filter(attempt => 
      new Date(attempt.completedAt) > oneDayAgo
    );

    if (recentAttempts.length > 0) {
      newNotifications.push({
        id: 'recent-activity',
        type: 'info',
        icon: Users,
        title: 'Recent Activity',
        message: `${recentAttempts.length} quiz attempts completed in the last 24 hours`,
        timestamp: now.toISOString(),
        priority: 'medium'
      });
    }

    // High performers (score > 85)
    const highPerformers = recentAttempts.filter(attempt => attempt.score > 85);
    if (highPerformers.length > 0) {
      const uniqueStudents = [...new Set(highPerformers.map(a => a.studentId))];
      newNotifications.push({
        id: 'high-performers',
        type: 'success',
        icon: Award,
        title: 'Excellent Performance',
        message: `${uniqueStudents.length} student(s) scored above 85% recently`,
        timestamp: now.toISOString(),
        priority: 'low'
      });
    }

    // Students needing attention (score < 50)
    const lowPerformers = recentAttempts.filter(attempt => attempt.score < 50);
    if (lowPerformers.length > 0) {
      const uniqueStudents = [...new Set(lowPerformers.map(a => a.studentId))];
      newNotifications.push({
        id: 'needs-attention',
        type: 'warning',
        icon: AlertCircle,
        title: 'Students Need Support',
        message: `${uniqueStudents.length} student(s) scored below 50% and may need additional help`,
        timestamp: now.toISOString(),
        priority: 'high'
      });
    }

    // Quiz completion trends
    const studentStats = {};
    attempts.forEach(attempt => {
      if (!studentStats[attempt.studentId]) {
        studentStats[attempt.studentId] = [];
      }
      studentStats[attempt.studentId].push(attempt.score);
    });

    let improvingStudents = 0;
    let decliningStudents = 0;

    Object.entries(studentStats).forEach(([studentId, scores]) => {
      if (scores.length >= 2) {
        const recent = scores.slice(-3); // Last 3 attempts
        const trend = recent.length >= 2 ? recent[recent.length - 1] - recent[0] : 0;
        
        if (trend > 10) improvingStudents++;
        else if (trend < -10) decliningStudents++;
      }
    });

    if (improvingStudents > 0) {
      newNotifications.push({
        id: 'improving-trend',
        type: 'success',
        icon: TrendingUp,
        title: 'Positive Trends',
        message: `${improvingStudents} student(s) showing improvement in recent quizzes`,
        timestamp: now.toISOString(),
        priority: 'medium'
      });
    }

    if (decliningStudents > 0) {
      newNotifications.push({
        id: 'declining-trend',
        type: 'warning',
        icon: TrendingDown,
        title: 'Declining Performance',
        message: `${decliningStudents} student(s) showing declining scores - consider reaching out`,
        timestamp: now.toISOString(),
        priority: 'high'
      });
    }

    // Active quizzes with no recent attempts
    const activeQuizzes = quizzes.filter(quiz => quiz.isActive);
    const quizzesWithNoRecentAttempts = activeQuizzes.filter(quiz => 
      !recentAttempts.some(attempt => attempt.quizId === quiz.id)
    );

    if (quizzesWithNoRecentAttempts.length > 0) {
      newNotifications.push({
        id: 'inactive-quizzes',
        type: 'info',
        icon: Clock,
        title: 'Low Quiz Activity',
        message: `${quizzesWithNoRecentAttempts.length} active quiz(es) have no recent attempts`,
        timestamp: now.toISOString(),
        priority: 'low'
      });
    }

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    newNotifications.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    setNotifications(newNotifications);
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'from-green-500 to-emerald-500';
      case 'warning': return 'from-yellow-500 to-orange-500';
      case 'error': return 'from-red-500 to-pink-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/20';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'error': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">All Caught Up!</h3>
          <p className="text-white/60">No new notifications at this time.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          Student Progress Notifications
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {notifications.map((notification, index) => {
            const IconComponent = notification.icon;
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className={`p-4 border ${getNotificationBg(notification.type)}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getNotificationColor(notification.type)}`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white">{notification.title}</h4>
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="p-1 text-white/40 hover:text-white/80 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-white/80 text-sm mt-1">{notification.message}</p>
                      <p className="text-white/50 text-xs mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}