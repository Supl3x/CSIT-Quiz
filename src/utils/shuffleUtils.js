// Utility functions for deterministic shuffling based on student ID and quiz ID

/**
 * Simple hash function to convert string to number
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded random number generator
 */
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Shuffle array randomly based on student ID and quiz ID
 * New random order for each attempt
 */
export function shuffleQuestionsForStudent(questions, studentId, quizId) {
  if (!questions || questions.length === 0) return [];
  
  // Create a copy to avoid mutating original
  const shuffled = [...questions];
  
  // Fisher-Yates shuffle with Math.random()
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Shuffle multiple choice options for a question deterministically
 */
export function shuffleOptionsForStudent(options, studentId, questionId) {
  if (!options || options.length === 0) return { shuffledOptions: [], mapping: [] };
  
  const seed = hashString(`${studentId}-${questionId}-options`);
  
  // Create array of indices with original values
  const indexedOptions = options.map((option, index) => ({ option, originalIndex: index }));
  
  // Shuffle the indexed options
  for (let i = indexedOptions.length - 1; i > 0; i--) {
    const randomSeed = seed + i;
    const j = Math.floor(seededRandom(randomSeed) * (i + 1));
    [indexedOptions[i], indexedOptions[j]] = [indexedOptions[j], indexedOptions[i]];
  }
  
  return {
    shuffledOptions: indexedOptions.map(item => item.option),
    mapping: indexedOptions.map(item => item.originalIndex) // Maps new index to original index
  };
}

/**
 * Convert user's answer index (from shuffled options) back to original index
 */
export function mapAnswerToOriginal(userAnswerIndex, mapping) {
  if (userAnswerIndex === null || userAnswerIndex === undefined || !mapping) {
    return userAnswerIndex;
  }
  return mapping[userAnswerIndex];
}

/**
 * Convert original answer index to shuffled index for display
 */
export function mapOriginalToShuffled(originalIndex, mapping) {
  if (originalIndex === null || originalIndex === undefined || !mapping) {
    return originalIndex;
  }
  return mapping.indexOf(originalIndex);
}