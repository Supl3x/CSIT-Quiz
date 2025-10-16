import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const QuizContext = createContext(undefined);

export function QuizProvider({ children }) {
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
    setupRealtimeSubscriptions();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadQuestions(),
        loadQuizzes(),
        loadAttempts()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading questions:', error);
      return;
    }

    setQuestions(data || []);
  };

  const loadQuizzes = async () => {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading quizzes:', error);
      return;
    }

    setQuizzes(data || []);
  };

  const loadAttempts = async () => {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error loading attempts:', error);
      return;
    }

    setAttempts(data || []);
  };

  const setupRealtimeSubscriptions = () => {
    const quizzesChannel = supabase
      .channel('quizzes-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quizzes' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setQuizzes(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setQuizzes(prev => prev.map(q => q.id === payload.new.id ? payload.new : q));
          } else if (payload.eventType === 'DELETE') {
            setQuizzes(prev => prev.filter(q => q.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const questionsChannel = supabase
      .channel('questions-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'questions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setQuestions(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setQuestions(prev => prev.map(q => q.id === payload.new.id ? payload.new : q));
          } else if (payload.eventType === 'DELETE') {
            setQuestions(prev => prev.filter(q => q.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const attemptsChannel = supabase
      .channel('attempts-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'quiz_attempts' },
        (payload) => {
          setAttempts(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(quizzesChannel);
      supabase.removeChannel(questionsChannel);
      supabase.removeChannel(attemptsChannel);
    };
  };

  const addQuestion = async (question) => {
    const { data, error } = await supabase
      .from('questions')
      .insert([{
        text: question.text,
        options: question.options,
        correct_answer: question.correctAnswer,
        category: question.category,
        difficulty: question.difficulty,
        points: question.points
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding question:', error);
      throw error;
    }

    return data;
  };

  const updateQuestion = async (id, question) => {
    const { error } = await supabase
      .from('questions')
      .update({
        text: question.text,
        options: question.options,
        correct_answer: question.correctAnswer,
        category: question.category,
        difficulty: question.difficulty,
        points: question.points
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  };

  const deleteQuestion = async (id) => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  };

  const addQuiz = async (quiz) => {
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert([{
        title: quiz.title,
        category: quiz.category,
        duration: quiz.duration,
        total_questions: quiz.totalQuestions,
        is_active: quiz.isActive,
        created_by: quiz.createdBy
      }])
      .select()
      .single();

    if (quizError) {
      console.error('Error adding quiz:', quizError);
      throw quizError;
    }

    if (quiz.selectedQuestions && quiz.selectedQuestions.length > 0) {
      const quizQuestions = quiz.selectedQuestions.map((questionId, index) => ({
        quiz_id: quizData.id,
        question_id: questionId,
        order_index: index
      }));

      const { error: linkError } = await supabase
        .from('quiz_questions')
        .insert(quizQuestions);

      if (linkError) {
        console.error('Error linking questions to quiz:', linkError);
      }
    }

    return quizData;
  };

  const updateQuiz = async (id, quiz) => {
    const { error } = await supabase
      .from('quizzes')
      .update({
        title: quiz.title,
        category: quiz.category,
        duration: quiz.duration,
        total_questions: quiz.totalQuestions,
        is_active: quiz.isActive
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  };

  const deleteQuiz = async (id) => {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  };

  const getQuizQuestions = async (quizId) => {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select(`
        order_index,
        questions (*)
      `)
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error loading quiz questions:', error);
      return [];
    }

    return data.map(item => item.questions);
  };

  const submitQuizAttempt = async (attempt) => {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert([{
        quiz_id: attempt.quizId,
        student_id: attempt.studentId,
        student_name: attempt.studentName || 'Student',
        answers: attempt.answers,
        score: attempt.score,
        total_questions: attempt.totalQuestions,
        time_spent: attempt.timeSpent,
        category_scores: attempt.categoryScores || {}
      }])
      .select()
      .single();

    if (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }

    return data;
  };

  const getStudentAttempts = (studentId) => {
    return attempts.filter(attempt => attempt.student_id === studentId);
  };

  const getQuizStatistics = (quizId) => {
    const quizAttempts = attempts.filter(attempt => attempt.quiz_id === quizId);
    if (quizAttempts.length === 0) return null;

    const totalAttempts = quizAttempts.length;
    const averageScore = quizAttempts.reduce((sum, attempt) => sum + parseFloat(attempt.score), 0) / totalAttempts;
    const highestScore = Math.max(...quizAttempts.map(attempt => parseFloat(attempt.score)));
    const lowestScore = Math.min(...quizAttempts.map(attempt => parseFloat(attempt.score)));

    return {
      totalAttempts,
      averageScore,
      highestScore,
      lowestScore
    };
  };

  return (
    <QuizContext.Provider value={{
      questions,
      quizzes,
      attempts,
      loading,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      addQuiz,
      updateQuiz,
      deleteQuiz,
      getQuizQuestions,
      submitQuizAttempt,
      getStudentAttempts,
      getQuizStatistics
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
