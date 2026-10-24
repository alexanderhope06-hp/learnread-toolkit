/**
 * Validate a multiple-choice quiz and calculate its score.
 *
 * Questions must have unique IDs and a valid correct answer.
 * Submitted answers use question IDs as keys.
 *
 * @param {Array} questions
 * @param {Object} answers
 * @returns {Object}
 */
export function scoreQuiz(questions, answers) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new TypeError("Questions must be a non-empty array.");
  }

  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    throw new TypeError("Answers must be an object.");
  }

  const questionIds = new Set();
  let correct = 0;

  for (const question of questions) {
    if (
      !question ||
      typeof question.id !== "string" ||
      question.id.trim() === ""
    ) {
      throw new TypeError("Every question must have a valid string ID.");
    }

    if (questionIds.has(question.id)) {
      throw new Error(`Duplicate question ID: ${question.id}`);
    }

    questionIds.add(question.id);

    if (
      !Array.isArray(question.options) ||
      question.options.length < 2 ||
      question.options.some(
        (option) => typeof option !== "string" || option.trim() === ""
      )
    ) {
      throw new TypeError(
        `Question "${question.id}" must have at least two valid options.`
      );
    }

    if (
      !Number.isInteger(question.correctAnswer) ||
      question.correctAnswer < 0 ||
      question.correctAnswer >= question.options.length
    ) {
      throw new TypeError(
        `Question "${question.id}" has an invalid correct answer.`
      );
    }

    if (
      question.points !== undefined &&
      (!Number.isFinite(question.points) || question.points < 0)
    ) {
      throw new TypeError(
        `Question "${question.id}" must have a non-negative point value.`
      );
    }

    const submittedAnswer = answers[question.id];

    if (
      Number.isInteger(submittedAnswer) &&
      submittedAnswer === question.correctAnswer
    ) {
      correct += question.points ?? 1;
    }
  }

  const total = questions.reduce(
    (sum, question) => sum + (question.points ?? 1),
    0
  );

  const earned = Number(correct.toFixed(4));

  return {
    totalQuestions: questions.length,
    correctAnswers: questions.filter(
      (question) => answers[question.id] === question.correctAnswer
    ).length,
    earnedPoints: earned,
    totalPoints: total,
    percentage:
      total === 0 ? 0 : Number(((earned / total) * 100).toFixed(2))
  };
}


/**
 * Calculate course completion progress.
 *
 * @param {number} completedLessons
 * @param {number} totalLessons
 * @returns {number}
 */
export function calculateCourseProgress(completedLessons, totalLessons) {
  if (
    !Number.isInteger(completedLessons) ||
    !Number.isInteger(totalLessons) ||
    completedLessons < 0 ||
    totalLessons < 0 ||
    completedLessons > totalLessons
  ) {
    throw new TypeError("Lesson counts must be valid non-negative integers.");
  }

  if (totalLessons === 0) {
    return 0;
  }

  return Number(
    ((completedLessons / totalLessons) * 100).toFixed(2)
  );
}


/**
 * Create a record of a completed quiz attempt.
 *
 * @param {Array} questions
 * @param {Object} answers
 * @param {Object} options
 * @returns {Object}
 */
export function createQuizAttempt(questions, answers, options = {}) {
  const result = scoreQuiz(questions, answers);

  const completedAt = options.completedAt ?? new Date().toISOString();
  const startedAt = options.startedAt ?? completedAt;

  const startTime = Date.parse(startedAt);
  const endTime = Date.parse(completedAt);

  if (
    !Number.isFinite(startTime) ||
    !Number.isFinite(endTime) ||
    endTime < startTime
  ) {
    throw new TypeError("Attempt timestamps must be valid and chronological.");
  }

  return {
    id: options.id ?? globalThis.crypto.randomUUID(),
    answers: { ...answers },
    score: result.earnedPoints,
    totalPoints: result.totalPoints,
    percentage: result.percentage,
    correctAnswers: result.correctAnswers,
    totalQuestions: result.totalQuestions,
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date(endTime).toISOString(),
    durationSeconds: Math.round((endTime - startTime) / 1000)
  };
}

/**
 * Calculate performance statistics from quiz attempts.
 *
 * @param {Array<Object>} attempts
 * @returns {Object}
 */
export function summarizeQuizAttempts(attempts) {
  if (!Array.isArray(attempts)) {
    throw new TypeError("Attempts must be an array.");
  }

  if (attempts.length === 0) {
    return {
      attemptCount: 0,
      averageScore: 0,
      bestScore: 0,
      latestScore: null
    };
  }

  for (const attempt of attempts) {
    if (
      !attempt ||
      !Number.isFinite(attempt.percentage) ||
      attempt.percentage < 0 ||
      attempt.percentage > 100
    ) {
      throw new TypeError("Every attempt must have a valid percentage score.");
    }
  }

  const total = attempts.reduce(
    (sum, attempt) => sum + attempt.percentage,
    0
  );

  const latest = [...attempts].sort(
    (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt)
  )[0];

  return {
    attemptCount: attempts.length,
    averageScore: Number((total / attempts.length).toFixed(2)),
    bestScore: Math.max(...attempts.map((attempt) => attempt.percentage)),
    latestScore: latest.percentage
  };
}

/**
 * Summarize completion of a set of lessons.
 *
 * @param {Array<string>} lessonIds
 * @param {Array<string>} completedLessonIds
 * @returns {Object}
 */
export function summarizeLessonProgress(lessonIds, completedLessonIds) {
  if (!Array.isArray(lessonIds) || !Array.isArray(completedLessonIds)) {
    throw new TypeError("Lesson IDs and completed lesson IDs must be arrays.");
  }

  if (
    lessonIds.some((id) => typeof id !== "string" || id.trim() === "") ||
    completedLessonIds.some(
      (id) => typeof id !== "string" || id.trim() === ""
    )
  ) {
    throw new TypeError("Lesson IDs must be non-empty strings.");
  }

  if (new Set(lessonIds).size !== lessonIds.length) {
    throw new Error("Lesson IDs must be unique.");
  }

  const lessonSet = new Set(lessonIds);
  const completedSet = new Set(completedLessonIds);

  const completed = lessonIds.filter((id) => completedSet.has(id)).length;

  return {
    totalLessons: lessonIds.length,
    completedLessons: completed,
    remainingLessons: lessonIds.length - completed,
    percentage: calculateCourseProgress(completed, lessonIds.length)
  };
}






/**
 * Save a quiz attempt to a supplied storage implementation.
 *
 * Applications should use a separate storage key for each
 * quiz and user where appropriate.
 *
 * @param {Object} attempt
 * @param {Storage} storage
 * @param {string} key
 * @returns {Array<Object>}
 */
export function saveQuizAttempt(
  attempt,
  storage = globalThis.localStorage,
  key = "default"
) {
  if (
    !attempt ||
    typeof attempt.id !== "string" ||
    !Number.isFinite(attempt.percentage) ||
    attempt.percentage < 0 ||
    attempt.percentage > 100
  ) {
    throw new TypeError("A valid quiz attempt is required.");
  }

  if (typeof key !== "string" || key.trim() === "") {
    throw new TypeError("A non-empty history key is required.");
  }

  if (
    !storage ||
    typeof storage.getItem !== "function" ||
    typeof storage.setItem !== "function"
  ) {
    throw new Error("A compatible storage implementation is required.");
  }

  const storageKey = `learnread:quiz-history:${key}`;
  const saved = storage.getItem(storageKey);
  const history = saved === null ? [] : JSON.parse(saved);

  if (!Array.isArray(history)) {
    throw new Error("Saved quiz history must be an array.");
  }

  if (history.some((item) => item.id === attempt.id)) {
    throw new Error("This quiz attempt has already been saved.");
  }

  const updatedHistory = [...history, attempt];

  storage.setItem(storageKey, JSON.stringify(updatedHistory));

  return updatedHistory;
}

/**
 * Retrieve saved quiz attempts.
 *
 * @param {Storage} storage
 * @param {string} key
 * @returns {Array<Object>}
 */
export function getQuizAttempts(
  storage = globalThis.localStorage,
  key = "default"
) {
  if (typeof key !== "string" || key.trim() === "") {
    throw new TypeError("A non-empty history key is required.");
  }

  if (!storage || typeof storage.getItem !== "function") {
    throw new Error("A compatible storage implementation is required.");
  }

  const saved = storage.getItem(`learnread:quiz-history:${key}`);

  if (saved === null) {
    return [];
  }

  const history = JSON.parse(saved);

  if (!Array.isArray(history)) {
    throw new Error("Saved quiz history must be an array.");
  }

  return history;
}