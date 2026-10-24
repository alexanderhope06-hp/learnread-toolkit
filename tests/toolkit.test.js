import test from "node:test";
import assert from "node:assert/strict";

import {
  scoreQuiz,
  calculateCourseProgress,
  createQuizAttempt,
  summarizeQuizAttempts,
  summarizeLessonProgress,
  saveQuizAttempt,
  getQuizAttempts,
  calculateReadingProgress,
  saveBookmark,
  getBookmark
} from "../src/index.js";

// --------------------------------------------------
// QUIZ SCORING TESTS
// --------------------------------------------------

test("scores a quiz with correct and incorrect answers", () => {
  const questions = [
    {
      id: "q1",
      options: ["HTML", "CSS", "JavaScript"],
      correctAnswer: 2
    },
    {
      id: "q2",
      options: ["Windows", "Linux", "macOS"],
      correctAnswer: 1
    }
  ];

  const result = scoreQuiz(questions, {
    q1: 2,
    q2: 0
  });

  assert.equal(result.totalQuestions, 2);
  assert.equal(result.correctAnswers, 1);
  assert.equal(result.earnedPoints, 1);
  assert.equal(result.totalPoints, 2);
  assert.equal(result.percentage, 50);
});

test("supports questions with different point values", () => {
  const questions = [
    {
      id: "q1",
      options: ["A", "B"],
      correctAnswer: 1,
      points: 3
    },
    {
      id: "q2",
      options: ["A", "B"],
      correctAnswer: 0,
      points: 1
    }
  ];

  const result = scoreQuiz(questions, {
    q1: 1,
    q2: 1
  });

  assert.equal(result.earnedPoints, 3);
  assert.equal(result.totalPoints, 4);
  assert.equal(result.percentage, 75);
});

test("rejects duplicate question IDs", () => {
  const questions = [
    { id: "q1", options: ["A", "B"], correctAnswer: 0 },
    { id: "q1", options: ["C", "D"], correctAnswer: 1 }
  ];

  assert.throws(
    () => scoreQuiz(questions, {}),
    /Duplicate question ID/
  );
});

// --------------------------------------------------
// READING PROGRESS AND BOOKMARK TESTS
// --------------------------------------------------

test("calculates reading progress", () => {
  assert.equal(calculateReadingProgress(25, 100), 25);
  assert.equal(calculateReadingProgress(50, 100), 50);
  assert.equal(calculateReadingProgress(150, 100), 100);
  assert.equal(calculateReadingProgress(0, 100), 0);
  assert.equal(calculateReadingProgress(0, 0), 0);
});

test("rejects invalid reading positions", () => {
  assert.throws(
    () => calculateReadingProgress(-1, 100),
    /non-negative numbers/
  );
});

test("saves and retrieves bookmarks", () => {
  const data = new Map();

  const storage = {
    setItem(key, value) {
      data.set(key, value);
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    }
  };

  saveBookmark("chapter-1", 250, storage);

  assert.deepEqual(
    getBookmark("chapter-1", storage),
    { position: 250 }
  );

  assert.equal(getBookmark("chapter-2", storage), null);
});

// --------------------------------------------------
// COURSE PROGRESS TESTS
// --------------------------------------------------

test("calculates course completion progress", () => {
  assert.equal(calculateCourseProgress(0, 10), 0);
  assert.equal(calculateCourseProgress(5, 10), 50);
  assert.equal(calculateCourseProgress(7, 10), 70);
  assert.equal(calculateCourseProgress(10, 10), 100);
  assert.equal(calculateCourseProgress(0, 0), 0);
});

test("rejects invalid course progress values", () => {
  assert.throws(
    () => calculateCourseProgress(-1, 10),
    /valid non-negative integers/
  );

  assert.throws(
    () => calculateCourseProgress(11, 10),
    /valid non-negative integers/
  );
});

// --------------------------------------------------
// QUIZ ATTEMPT HISTORY TESTS
// --------------------------------------------------

test("creates a quiz attempt with score and duration", () => {
  const questions = [
    {
      id: "q1",
      options: ["HTML", "CSS"],
      correctAnswer: 0
    },
    {
      id: "q2",
      options: ["Windows", "Linux"],
      correctAnswer: 1
    }
  ];

  const attempt = createQuizAttempt(
    questions,
    {
      q1: 0,
      q2: 0
    },
    {
      id: "attempt-1",
      startedAt: "2026-01-01T10:00:00.000Z",
      completedAt: "2026-01-01T10:02:30.000Z"
    }
  );

  assert.equal(attempt.id, "attempt-1");
  assert.equal(attempt.score, 1);
  assert.equal(attempt.totalPoints, 2);
  assert.equal(attempt.percentage, 50);
  assert.equal(attempt.correctAnswers, 1);
  assert.equal(attempt.totalQuestions, 2);
  assert.equal(attempt.durationSeconds, 150);
  assert.deepEqual(attempt.answers, {
    q1: 0,
    q2: 0
  });
});

test("rejects invalid or incorrectly ordered attempt timestamps", () => {
  const questions = [
    {
      id: "q1",
      options: ["A", "B"],
      correctAnswer: 0
    }
  ];

  assert.throws(
    () =>
      createQuizAttempt(
        questions,
        { q1: 0 },
        {
          startedAt: "not-a-date",
          completedAt: "2026-01-01T10:00:00.000Z"
        }
      ),
    /valid and chronological/
  );

  assert.throws(
    () =>
      createQuizAttempt(
        questions,
        { q1: 0 },
        {
          startedAt: "2026-01-01T11:00:00.000Z",
          completedAt: "2026-01-01T10:00:00.000Z"
        }
      ),
    /valid and chronological/
  );
});

test("summarizes quiz attempts", () => {
  const attempts = [
    {
      id: "attempt-1",
      percentage: 50,
      completedAt: "2026-01-01T10:00:00.000Z"
    },
    {
      id: "attempt-2",
      percentage: 80,
      completedAt: "2026-01-02T10:00:00.000Z"
    },
    {
      id: "attempt-3",
      percentage: 100,
      completedAt: "2026-01-03T10:00:00.000Z"
    }
  ];

  const summary = summarizeQuizAttempts(attempts);

  assert.equal(summary.attemptCount, 3);
  assert.equal(summary.averageScore, 76.67);
  assert.equal(summary.bestScore, 100);
  assert.equal(summary.latestScore, 100);
});

test("returns an empty summary when there are no quiz attempts", () => {
  assert.deepEqual(
    summarizeQuizAttempts([]),
    {
      attemptCount: 0,
      averageScore: 0,
      bestScore: 0,
      latestScore: null
    }
  );
});

test("summarizes lesson completion progress", () => {
  const summary = summarizeLessonProgress(
    ["lesson-1", "lesson-2", "lesson-3", "lesson-4"],
    ["lesson-1", "lesson-3"]
  );

  assert.equal(summary.totalLessons, 4);
  assert.equal(summary.completedLessons, 2);
  assert.equal(summary.remainingLessons, 2);
  assert.equal(summary.percentage, 50);
});

test("saves and retrieves quiz attempt history", () => {
  const data = new Map();

  const storage = {
    setItem(key, value) {
      data.set(key, value);
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    }
  };

  const attempt = {
    id: "attempt-1",
    percentage: 75,
    completedAt: "2026-01-01T10:00:00.000Z"
  };

  const savedAttempts = saveQuizAttempt(
    attempt,
    storage,
    "student-1"
  );

  assert.equal(savedAttempts.length, 1);
  assert.deepEqual(savedAttempts[0], attempt);

  assert.deepEqual(
    getQuizAttempts(storage, "student-1"),
    [attempt]
  );

  assert.deepEqual(
    getQuizAttempts(storage, "student-2"),
    []
  );
});

test("prevents saving the same quiz attempt twice", () => {
  const data = new Map();

  const storage = {
    setItem(key, value) {
      data.set(key, value);
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    }
  };

  const attempt = {
    id: "attempt-1",
    percentage: 75,
    completedAt: "2026-01-01T10:00:00.000Z"
  };

  saveQuizAttempt(attempt, storage, "student-1");

  assert.throws(
    () => saveQuizAttempt(attempt, storage, "student-1"),
    /already been saved/
  );
});