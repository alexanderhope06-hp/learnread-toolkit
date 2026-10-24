/**
 * LearnRead Toolkit
 * Learning Integration Example
 *
 * Demonstrates:
 * - Scoring a quiz
 * - Creating and saving a quiz attempt
 * - Retrieving quiz attempts
 * - Summarizing quiz performance
 * - Calculating course progress
 */

import {
  scoreQuiz,
  calculateCourseProgress,
  createQuizAttempt,
  saveQuizAttempt,
  getQuizAttempts,
  summarizeQuizAttempts
} from "../../src/index.js";

/**
 * Example quiz.
 *
 * Each question has an ID, possible options, and the index
 * of the correct answer.
 */
export const sampleQuestions = [
  {
    id: "web-q1",
    options: [
      "HyperText Markup Language",
      "HighText Machine Language",
      "Home Tool Markup Language"
    ],
    correctAnswer: 0
  },
  {
    id: "web-q2",
    options: [
      "Styling web pages",
      "Structuring web content",
      "Managing databases"
    ],
    correctAnswer: 1
  },
  {
    id: "web-q3",
    options: [
      "JavaScript",
      "HTML",
      "CSS"
    ],
    correctAnswer: 0
  }
];

/**
 * Example answers.
 *
 * The keys match the question IDs.
 * The values are the selected option indexes.
 */
export const sampleAnswers = {
  "web-q1": 0,
  "web-q2": 1,
  "web-q3": 0
};

/**
 * Score a quiz, save the attempt, and return a performance summary.
 *
 * @param {Object} options
 * @param {Array} options.questions Quiz question definitions.
 * @param {Object} options.answers Answers keyed by question ID.
 * @param {string} [options.startedAt] ISO timestamp for the start.
 * @param {Storage} [options.storage] Compatible storage object.
 * @param {string} [options.storageKey] Key used for quiz history.
 * @returns {Object} Score, attempt, and history summary.
 */
export function gradeAndSaveQuiz({
  questions,
  answers,
  startedAt = new Date().toISOString(),
  storage = globalThis.localStorage,
  storageKey = "learnread:integration:quiz-attempts"
}) {
  if (!storage) {
    throw new Error(
      "A compatible storage object must be provided."
    );
  }

  const completedAt = new Date().toISOString();

  // 1. Calculate the quiz result.
  const result = scoreQuiz(questions, answers);

  // 2. Create an attempt record.
  const attempt = createQuizAttempt(
    questions,
    answers,
    {
      startedAt,
      completedAt
    }
  );

  // 3. Save the attempt.
  saveQuizAttempt(
    attempt,
    storage,
    storageKey
  );

  // 4. Retrieve the updated attempt history.
  const attempts = getQuizAttempts(
    storage,
    storageKey
  );

  // 5. Summarize the student's performance.
  const summary = summarizeQuizAttempts(attempts);

  return {
    result,
    attempt,
    attempts,
    summary
  };
}

/**
 * Calculate the percentage of a course completed.
 *
 * @param {number} completedLessons Number of completed lessons.
 * @param {number} totalLessons Total lessons in the course.
 * @returns {number} Course completion percentage.
 */
export function getCourseProgress(
  completedLessons,
  totalLessons
) {
  return calculateCourseProgress(
    completedLessons,
    totalLessons
  );
}

/**
 * Demonstration entry point.
 *
 * Call this function from your own application or test page.
 */
export function runLearningExample(
  storage = globalThis.localStorage
) {
  const quiz = gradeAndSaveQuiz({
    questions: sampleQuestions,
    answers: sampleAnswers,
    storage
  });

  const courseProgress = getCourseProgress(6, 10);

  return {
    quiz,
    courseProgress
  };
}
