import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import apiClient from '../lib/apiClient';

const QuizContext = createContext(undefined);

export function QuizProvider({ children }) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadInitialData();
    } else {
      setQuestions([]);
      setQuizzes([]);
      setAttempts([]);
      setCourses([]);
      setLoading(false);
    }
  }, [user]);

  // const loadInitialData = async () => {
  //   try {
  //     setLoading(true);
  //     await Promise.all([
  //       loadQuestions(),
  //       loadQuizzes(),
  //       loadAttempts()
  //     ]);
  //   } catch (error) {
  //     console.error('Error loading initial data:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const loadQuestions = async () => {
  //   const { data, error } = await supabase
  //     .from('questions')
  //     .select('*')
  //     .order('created_at', { ascending: true });

  //   if (error) {
  //     console.error('Error loading questions:', error);
  //     return;
  //   }

  //   setQuestions(data || []);
  // };

  // const loadQuizzes = async () => {
  //   const { data, error } = await supabase
  //     .from('quizzes')
  //     .select('*')
  //     .order('created_at', { ascending: false });

  //   if (error) {
  //     console.error('Error loading quizzes:', error);
  //     return;
  //   }

  //   setQuizzes(data || []);
  // };

  // const loadAttempts = async () => {
  //   const { data, error } = await supabase
  //     .from('quiz_attempts')
  //     .select('*')
  //     .order('completed_at', { ascending: false });

  //   if (error) {
  //     console.error('Error loading attempts:', error);
  //     return;
  //   }

  //   setAttempts(data || []);
  // };

  // const setupRealtimeSubscriptions = () => {
  //   const quizzesChannel = supabase
  //     .channel('quizzes-changes')
  //     .on('postgres_changes',
  //       { event: '*', schema: 'public', table: 'quizzes' },
  //       (payload) => {
  //         if (payload.eventType === 'INSERT') {
  //           setQuizzes(prev => [payload.new, ...prev]);
  //         } else if (payload.eventType === 'UPDATE') {
  //           setQuizzes(prev => prev.map(q => q.id === payload.new.id ? payload.new : q));
  //         } else if (payload.eventType === 'DELETE') {
  //           setQuizzes(prev => prev.filter(q => q.id !== payload.old.id));
  //         }
  //       }
  //     )
  //     .subscribe();

  //   const questionsChannel = supabase
  //     .channel('questions-changes')
  //     .on('postgres_changes',
  //       { event: '*', schema: 'public', table: 'questions' },
  //       (payload) => {
  //         if (payload.eventType === 'INSERT') {
  //           setQuestions(prev => [...prev, payload.new]);
  //         } else if (payload.eventType === 'UPDATE') {
  //           setQuestions(prev => prev.map(q => q.id === payload.new.id ? payload.new : q));
  //         } else if (payload.eventType === 'DELETE') {
  //           setQuestions(prev => prev.filter(q => q.id !== payload.old.id));
  //         }
  //       }
  //     )
  //     .subscribe();

  //   const attemptsChannel = supabase
  //     .channel('attempts-changes')
  //     .on('postgres_changes',
  //       { event: 'INSERT', schema: 'public', table: 'quiz_attempts' },
  //       (payload) => {
  //         setAttempts(prev => [payload.new, ...prev]);
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(quizzesChannel);
  //     supabase.removeChannel(questionsChannel);
  //     supabase.removeChannel(attemptsChannel);
  //   };
  // };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const quizApiUrl = user.role === 'student' 
        ? '/quiz?isPublished=true&isActive=true' 
        : '/quiz';
      const [questionsRes, quizzesRes, coursesRes, attemptsRes] = await Promise.all([
        apiClient.get('/question'),
        apiClient.get(quizApiUrl),
        apiClient.get('/course'),
        user.role === 'student' ? apiClient.get('/attempt') : Promise.resolve( null)

      ]);

      if (questionsRes && questionsRes.data?.success) {
        setQuestions(questionsRes.data?.data?.questions || []);
      }
      if (quizzesRes && quizzesRes.data?.success) {
        setQuizzes(quizzesRes.data?.data?.quizzes || []);
      }
      if (coursesRes && coursesRes.data?.success) {
        setCourses(coursesRes.data?.data?.courses || []); // --- NEW: Set courses ---
      }
      if (attemptsRes && attemptsRes.data?.success) {
        setAttempts(attemptsRes.data?.data?.attempts || []);
      }

    } catch (error) {
      console.error('Error loading initial quiz data:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

//   const addQuestion = async (question) => {
//     const { data, error } = await supabase
//       .from('questions')
//       .insert([{
//         text: question.text,
//         options: question.options,
//         correct_answer: question.correctAnswer,
//         category: question.category,
//         difficulty: question.difficulty,
//         points: question.points
//       }])
//       .select()
//       .single();

//     if (error) {
//       console.error('Error adding question:', error);
//       throw error;
//     }

//     return data;
//   };

//   const updateQuestion = async (id, question) => {
//     const { error } = await supabase
//       .from('questions')
//       .update({
//         text: question.text,
//         options: question.options,
//         correct_answer: question.correctAnswer,
//         category: question.category,
//         difficulty: question.difficulty,
//         points: question.points
//       })
//       .eq('id', id);

//     if (error) {
//       console.error('Error updating question:', error);
//       throw error;
//     }
//   };

//   const deleteQuestion = async (id) => {
//     const { error } = await supabase
//       .from('questions')
//       .delete()
//       .eq('id', id);

//     if (error) {
//       console.error('Error deleting question:', error);
//       throw error;
//     }
//   };

//   const addQuiz = async (quiz) => {
//     const { data: quizData, error: quizError } = await supabase
//       .from('quizzes')
//       .insert([{
//         title: quiz.title,
//         category: quiz.category,
//         duration: quiz.duration,
//         total_questions: quiz.totalQuestions,
//         is_active: quiz.isActive,
//         created_by: quiz.createdBy
//       }])
//       .select()
//       .single();

//     if (quizError) {
//       console.error('Error adding quiz:', quizError);
//       throw quizError;
//     }

//     if (quiz.selectedQuestions && quiz.selectedQuestions.length > 0) {
//       const quizQuestions = quiz.selectedQuestions.map((questionId, index) => ({
//         quiz_id: quizData.id,
//         question_id: questionId,
//         order_index: index
//       }));

//       const { error: linkError } = await supabase
//         .from('quiz_questions')
//         .insert(quizQuestions);

//       if (linkError) {
//         console.error('Error linking questions to quiz:', linkError);
//       }
//     }

//     return quizData;
//   };

//   const updateQuiz = async (id, quiz) => {
//     const { error } = await supabase
//       .from('quizzes')
//       .update({
//         title: quiz.title,
//         category: quiz.category,
//         duration: quiz.duration,
//         total_questions: quiz.totalQuestions,
//         is_active: quiz.isActive
//       })
//       .eq('id', id);

//     if (error) {
//       console.error('Error updating quiz:', error);
//       throw error;
//     }
//   };

//   const deleteQuiz = async (id) => {
//     const { error } = await supabase
//       .from('quizzes')
//       .delete()
//       .eq('id', id);

//     if (error) {
//       console.error('Error deleting quiz:', error);
//       throw error;
//     }
//   };

//   const getQuizQuestions = async (quizId) => {
//     const { data, error } = await supabase
//       .from('quiz_questions')
//       .select(`
//         order_index,
//         questions (*)
//       `)
//       .eq('quiz_id', quizId)
//       .order('order_index', { ascending: true });

//     if (error) {
//       console.error('Error loading quiz questions:', error);
//       return [];
//     }

//     return data.map(item => item.questions);
//   };

//   const submitQuizAttempt = async (attempt) => {
//     const { data, error } = await supabase
//       .from('quiz_attempts')
//       .insert([{
//         quiz_id: attempt.quizId,
//         student_id: attempt.studentId,
//         student_name: attempt.studentName || 'Student',
//         answers: attempt.answers,
//         score: attempt.score,
//         total_questions: attempt.totalQuestions,
//         time_spent: attempt.timeSpent,
//         category_scores: attempt.categoryScores || {}
//       }])
//       .select()
//       .single();

//     if (error) {
//       console.error('Error submitting quiz attempt:', error);
//       throw error;
//     }

//     return data;
//   };

//   const getStudentAttempts = (studentId) => {
//     return attempts.filter(attempt => attempt.student_id === studentId);
//   };

//   const getQuizStatistics = (quizId) => {
//     const quizAttempts = attempts.filter(attempt => attempt.quiz_id === quizId);
//     if (quizAttempts.length === 0) return null;

//     const totalAttempts = quizAttempts.length;
//     const averageScore = quizAttempts.reduce((sum, attempt) => sum + parseFloat(attempt.score), 0) / totalAttempts;
//     const highestScore = Math.max(...quizAttempts.map(attempt => parseFloat(attempt.score)));
//     const lowestScore = Math.min(...quizAttempts.map(attempt => parseFloat(attempt.score)));

//     return {
//       totalAttempts,
//       averageScore,
//       highestScore,
//       lowestScore
//     };
//   };

//   return (
//     <QuizContext.Provider value={{
//       questions,
//       quizzes,
//       attempts,
//       loading,
//       addQuestion,
//       updateQuestion,
//       deleteQuestion,
//       addQuiz,
//       updateQuiz,
//       deleteQuiz,
//       getQuizQuestions,
//       submitQuizAttempt,
//       getStudentAttempts,
//       getQuizStatistics
//     }}>
//       {children}
//     </QuizContext.Provider>
//   );
// }

// export function useQuiz() {
//   const context = useContext(QuizContext);
//   if (context === undefined) {
//     throw new Error('useQuiz must be used within a QuizProvider');
//   }
//   return context;
// }
  const addQuestion = async (questionData) => {
    try {
      const response = await apiClient.post('/question', questionData);
      if (response.data?.success) {
        const newQuestion = response.data.data.question;
        setQuestions(prev => [...prev, newQuestion]);
        return newQuestion;
      }
    } catch (error) {
      console.error('Add Question Error:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Failed to add question');
    }
  };

  const updateQuestion = async (id, questionData) => {
    try {
      const response = await apiClient.patch(`/question/${id}`, questionData); // Hits PATCH /api/question/:questionId
      if (response.data?.success) {
        const updatedQuestion = response.data.data.question;
        setQuestions(prev => prev.map(q => q._id === id ? updatedQuestion : q)); // Use _id from MongoDB
      }
    } catch (error) {
       console.error('Update Question Error:', error.response?.data?.message || error.message);
       throw new Error(error.response?.data?.message || 'Failed to update question');
    }
  };

   const deleteQuestion = async (id) => {
     try {
       const response = await apiClient.delete(`/question/${id}`);
       if (response.data?.success) {
         setQuestions(prev => prev.map(q => q._id === id ? { ...q, isActive: false } : q));

       }
     } catch (error) {
        console.error('Delete Question Error:', error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Failed to delete question');
     }
   };

  // --- Quiz CRUD --- (Similar pattern for addQuiz, updateQuiz, deleteQuiz using /api/quiz endpoints)
  const addQuiz = async (quizData) => {
     try {
       // Adapt quizData from frontend form to match backend Quiz model
       // (e.g., durationMinutes, questionPool [{question, weight}], isPublished)
       const response = await apiClient.post('/quiz', quizData); // Hits POST /api/quiz
       if (response.data?.success) {
         const newQuiz = response.data.data.quiz;
         setQuizzes(prev => [newQuiz, ...prev]);
         return newQuiz;
       }
     } catch (error) {
       console.error('Add Quiz Error:', error.response?.data?.message || error.message);
       throw new Error(error.response?.data?.message || 'Failed to create quiz');
     }
   };

   const updateQuiz = async (id, quizData) => { // Note: Backend uses PATCH for updates
     try {
       const response = await apiClient.patch(`/quiz/${id}`, quizData); // Hits PATCH /api/quiz/:quizId
       if (response.data?.success) {
         const updatedQuiz = response.data.data.quiz;
         setQuizzes(prev => prev.map(q => q._id === id ? updatedQuiz : q));
       }
     } catch (error) {
       console.error('Update Quiz Error:', error.response?.data?.message || error.message);
       throw new Error(error.response?.data?.message || 'Failed to update quiz');
     }
   };

   const deleteQuiz = async (id) => {
     try {
       const response = await apiClient.delete(`/quiz/${id}`);
       if (response.data?.success) {
         setQuizzes(prev => prev.filter(q => q._id !== id));
       }
     } catch (error) {
        console.error('Delete Quiz Error:', error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Failed to delete quiz');
     }
   };

  const toggleQuizActive = async (id) => {
    try {
      const response = await apiClient.post(`/quiz/${id}/toggle`); 
      if (response.data?.success) {
        const updatedQuiz = response.data.data.quiz;
        setQuizzes(prev => prev.map(q => q._id === id ? updatedQuiz : q));
      }
    } catch (error) {
      console.error('Toggle Quiz Status Error:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Failed to toggle quiz status');
    }
};


   const addCourse = async (courseData) => {
    try {
      const response = await apiClient.post('/course', courseData);
      if (response.data?.success) {
        const newCourse = response.data.data.course;
        setCourses(prev => [newCourse, ...prev]);
        return newCourse;
      }
    } catch (error) {
      console.error('Add Course Error:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create course');
    }
  };

  const updateCourse = async (id, courseData) => {
    try {
      const response = await apiClient.patch(`/course/${id}`, courseData);
      if (response.data?.success) {
        const updatedCourse = response.data.data.course;
        setCourses(prev => prev.map(c => (c._id === id ? updatedCourse : c)));
        return updatedCourse;
      }
    } catch (error) {
      console.error('Update Course Error:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update course');
    }
  };

  const deleteCourse = async (id) => {
    try {
      const response = await apiClient.delete(`/course/${id}`);
      if (response.data?.success) {
        setCourses(prev => prev.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error('Delete Course Error:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Failed to delete course');
    }
  };


  const startQuizAttempt = async (quizId) => {
    try {
      const response = await apiClient.post(`/attempt/${quizId}/start`); // Hits POST /api/attempt/:quizId/start
      if (response.data?.success) {
        return response.data.data; // Returns { attemptId, questions, durationMinutes, etc. }
      }
    } catch (error) {
      console.error('Start Quiz Error:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Failed to start quiz attempt');
    }
  };

  const submitQuizAttempt = async (attemptId, answers) => {
    try {
       // Backend expects { answers: [{ questionId OR questionAttemptId, answer: {...} }] }
      const response = await apiClient.post(`/attempt/${attemptId}/submit`, { answers }); // Hits POST /api/attempt/:attemptId/submit
      if (response.data?.success) {
        const submittedAttempt = response.data.data;
        // Update local state - replace or add the submitted attempt
        setAttempts(prev => {
           const existingIndex = prev.findIndex(a => a._id === attemptId);
           if (existingIndex > -1) {
             const updated = [...prev];
             updated[existingIndex] = submittedAttempt; // Or merge necessary fields
             return updated;
           } else {
             return [submittedAttempt, ...prev];
           }
        });
        return submittedAttempt; // Return full graded attempt details
      }
    } catch (error) {
      console.error('Submit Attempt Error:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Failed to submit quiz attempt');
    }
  };

  // --- Getters ---
  const getStudentAttempts = (studentId) => {
    return attempts.filter(attempt => attempt.student?._id === studentId || attempt.student === studentId); // Handle populated vs non-populated student field
  };

  const getQuizQuestions = async (quizId) => {
       // NOTE: The frontend previously fetched specific questions for a quiz.
       // The backend's `/api/quiz/:quizId?includeQuestions=true` can do this for admins/authors.
       // The student gets questions via the `/api/attempt/:quizId/start` endpoint.
       // This function might need rethinking depending on where it's used.
       // If used by admin to *view* quiz questions:
       try {
           const response = await apiClient.get(`/quiz/${quizId}?includeQuestions=true`);
           return response.data?.data?.quiz?.questions || []; // Adjust based on actual response structure
       } catch (error) {
           console.error('Error fetching quiz questions for admin:', error.response?.data?.message || error.message);
           return [];
       }
   };

  // getQuizStatistics might remain similar, operating on the locally stored `attempts` state.
  const getQuizStatistics = (quizId) => {
      // ... (implementation based on `attempts` state is likely okay)
      const quizAttempts = attempts.filter(attempt => attempt.quiz?._id === quizId || attempt.quiz === quizId);
       if (quizAttempts.length === 0) return null;

       const totalAttempts = quizAttempts.length;
       // Ensure score is treated as a number
       const averageScore = quizAttempts.reduce((sum, attempt) => sum + Number(attempt.totalScore || 0), 0) / totalAttempts;
       const highestScore = Math.max(...quizAttempts.map(attempt => Number(attempt.totalScore || 0)));
       const lowestScore = Math.min(...quizAttempts.map(attempt => Number(attempt.totalScore || 0)));

       return {
         totalAttempts,
         averageScore,
         highestScore,
         lowestScore
       };
  };


  return (
    <QuizContext.Provider value={{
      questions, quizzes, attempts, courses, loading,
      addQuestion, updateQuestion, deleteQuestion,
      addQuiz, updateQuiz, deleteQuiz,
      addCourse, updateCourse, deleteCourse,
      startQuizAttempt, // New function for starting
      submitQuizAttempt, // Modified function
      getStudentAttempts,
      getQuizQuestions, // Review usage context
      getQuizStatistics
    }}>
      {children}
    </QuizContext.Provider>
  );
}

// useQuiz hook remains the same
export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
