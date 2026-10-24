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
