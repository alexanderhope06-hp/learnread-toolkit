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