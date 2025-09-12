import React, { useState, useEffect, useRef } from "react";
import { useQuiz } from "../../contexts/QuizContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import DragDropQuestion from "./DragDropQuestion.jsx";
import CodeArrangementQuestion from "./CodeArrangementQuestion.jsx";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function QuizInterface({ quizId, onComplete, onCancel }) {
  const { user } = useAuth();
  const { quizzes, questions, submitQuizAttempt } = useQuiz();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // answers[q.id] => for codearrangement: array of ids (strings)
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const startTime = useRef(Date.now());

  const quiz = quizzes.find((q) => q.id === quizId);

  // Load questions
  useEffect(() => {
    if (quiz) {
      const shuffled = [...(questions || [])]
        .filter((q) => q.category === quiz.category || quiz.category === "Mixed")
        .sort(() => Math.random() - 0.5)
        .slice(0, quiz.totalQuestions);

      setQuizQuestions(shuffled);
      setTimeLeft(quiz.duration * 60); // minutes → seconds
    }
  }, [quiz, questions]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizQuestions.length > 0) {
      handleSubmit();
    }
  }, [timeLeft]); // eslint-disable-line

  // Save answer - generic
  const handleAnswerSelect = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // Submit quiz
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);

    let correctAnswers = 0;
    const categoryScores = {};

    quizQuestions.forEach((q) => {
      let isCorrect = false;

      if (q.type === "mcq") {
        isCorrect = answers[q.id] === q.correctAnswer;
      } else if (q.type === "dragdrop") {
        // for pairs, ensure consistent structure before comparing
        isCorrect = JSON.stringify(answers[q.id]) === JSON.stringify(q.pairs || q.correctPairs);
      } else if (q.type === "codearrangement") {
        // answers[q.id] expected to be array of snippet ids (strings)
        const userIds = Array.isArray(answers[q.id]) ? answers[q.id].map(String) : [];
        const correctIds = Array.isArray(q.correctOrder)
          ? q.correctOrder.map((s) => String(s.id))
          : [];
        isCorrect = JSON.stringify(userIds) === JSON.stringify(correctIds);
      }

      if (isCorrect) {
        correctAnswers += 1;
      }

      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { correct: 0, total: 0 };
      }
      categoryScores[q.category].total++;
      if (isCorrect) categoryScores[q.category].correct++;
    });

    const score = Math.round((correctAnswers / quizQuestions.length) * 100);

    const attempt = {
      quizId,
      studentId: user?.id || "",
      answers,
      score,
      totalQuestions: quizQuestions.length,
      timeSpent,
      categoryScores,
    };

    submitQuizAttempt(attempt);

    // Build results data with user-friendly userAnswer for codearrangement
    const resultsData = {
      score,
      correctAnswers,
      totalQuestions: quizQuestions.length,
      timeSpent,
      categoryScores,
      questions: quizQuestions.map((q) => {
        if (q.type === "codearrangement") {
          const userIds = Array.isArray(answers[q.id]) ? answers[q.id].map(String) : [];
          const userCodeLines = userIds.map((id) => {
            const found = (q.codeSnippets || []).find((s) => String(s.id) === String(id));
            return found ? found.code : String(id);
          });
          const correctCodeLines = (q.correctOrder || []).map((s) => s.code);
          return {
            ...q,
            userAnswer: userCodeLines,
            correctAnswer: correctCodeLines,
            isCorrect: JSON.stringify(userIds) === JSON.stringify((q.correctOrder || []).map((s) => String(s.id))),
          };
        }

        // default for other types
        return {
          ...q,
          userAnswer: answers[q.id],
          isCorrect:
            q.type === "mcq"
              ? answers[q.id] === q.correctAnswer
              : JSON.stringify(answers[q.id]) === JSON.stringify(q.pairs || q.correctPairs),
        };
      }),
    };

    setResults(resultsData);
    setShowResults(true);
    setIsSubmitting(false);
  };

  // Helpers
  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const progress = () =>
    ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  if (!quiz || quizQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];

  // ✅ Results screen
  if (showResults && results) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div
          className={`p-8 text-center ${
            results.score >= 80
              ? "bg-gradient-to-r from-green-500 to-green-600"
              : results.score >= 60
              ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
              : "bg-gradient-to-r from-red-500 to-red-600"
          } text-white`}
        >
          <div className="mb-4">
            {results.score >= 80 ? (
              <CheckCircle className="w-16 h-16 mx-auto" />
            ) : results.score >= 60 ? (
              <Flag className="w-16 h-16 mx-auto" />
            ) : (
              <XCircle className="w-16 h-16 mx-auto" />
            )}
          </div>
          <h2 className="text-3xl font-bold">Quiz Completed!</h2>
          <p className="text-xl">You scored {results.score}%</p>
          <p>
            {results.correctAnswers} / {results.totalQuestions} correct
          </p>
        </div>

        <div className="p-8">
          {results.questions.map((q, idx) => (
            <div key={q.id} className="mb-6 border-b pb-4">
              <h4 className="font-semibold mb-2">
                {idx + 1}. {q.text}
              </h4>

              {q.type === "mcq" && (
                <>
                  <p>
                    Your Answer:{" "}
                    {q.userAnswer !== undefined
                      ? q.options?.[q.userAnswer]
                      : "Not answered"}
                  </p>
                  <p>Correct Answer: {q.options?.[q.correctAnswer]}</p>
                </>
              )}

              {q.type === "dragdrop" && (
                <>
                  <p>Your Answer: {JSON.stringify(q.userAnswer)}</p>
                  <p>Correct: {JSON.stringify(q.pairs || q.correctPairs)}</p>
                </>
              )}

              {q.type === "codearrangement" && (
                <>
                  <p className="font-semibold mt-2">Your Answer:</p>
                  <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">
                    {(q.userAnswer || []).join("\n")}
                  </pre>

                  <p className="font-semibold mt-2">Correct Answer:</p>
                  <pre className="bg-green-100 p-2 rounded text-sm whitespace-pre-wrap">
                    {(q.correctAnswer || []).join("\n")}
                  </pre>
                </>
              )}

              <p className={q.isCorrect ? "text-green-600" : "text-red-600"}>
                {q.isCorrect ? "Correct" : "Incorrect"}
              </p>
            </div>
          ))}

          <div className="flex gap-4">
            <button
              onClick={onComplete}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentQuestionIndex(0);
                setAnswers({});
                setTimeLeft(quiz.duration * 60);
                startTime.current = Date.now();
              }}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Quiz screen
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">{quiz.title}</h2>
          <button onClick={onCancel} className="text-blue-200 hover:text-white">
            Exit Quiz
          </button>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span
                className={`font-mono text-lg ${
                  timeLeft < 300 ? "text-red-200" : ""
                }`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
            <span>
              Question {currentQuestionIndex + 1} / {quizQuestions.length}
            </span>
          </div>
        </div>

        <div className="mt-4 w-full bg-blue-500/30 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full"
            style={{ width: `${progress()}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="p-8">
        <h3 className="text-xl font-semibold mb-6">{currentQuestion.text}</h3>

        {currentQuestion.type === "mcq" &&
          currentQuestion.options?.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
              className={`w-full text-left p-4 rounded-lg border-2 mb-3 ${
                answers[currentQuestion.id] === idx
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-full border-2 ${
                    answers[currentQuestion.id] === idx
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <span>{opt}</span>
              </div>
            </button>
          ))}

        {currentQuestion.type === "dragdrop" && (
          <DragDropQuestion
            question={currentQuestion}
            userAnswer={answers[currentQuestion.id]}
            onAnswerChange={(ans) => handleAnswerSelect(currentQuestion.id, ans)}
          />
        )}

        {currentQuestion.type === "codearrangement" && (
          <CodeArrangementQuestion
            question={currentQuestion}
            onAnswer={(ans) => handleAnswerSelect(currentQuestion.id, ans)}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() =>
              setCurrentQuestionIndex((i) => Math.max(0, i - 1))
            }
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {currentQuestionIndex < quizQuestions.length - 1 ? (
            <button
              onClick={() =>
                setCurrentQuestionIndex((i) =>
                  Math.min(quizQuestions.length - 1, i + 1)
                )
              }
              className="flex items-center gap-2 px-4 py-2 text-gray-600"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
