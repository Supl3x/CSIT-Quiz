export const sanitizeAttemptForStudent = (attemptDoc) => {
  const sanitized = attemptDoc.toObject();
  sanitized.questions = sanitized.questions.map(q => {
    delete q.snapshot.correctAnswer;
    delete q.snapshot.acceptableAnswers;
    return q;
  });
  return sanitized;
};