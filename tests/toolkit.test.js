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
  getBookmark,
  saveReadingProgress,
  getReadingProgress,
  saveChapterBookmark,
  getChapterBookmarks,
  deleteChapterBookmark,
  recordReadingHistory,
  getReadingHistory
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
    /non-negative number/
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



// --------------------------------------------------
// SAVED READING PROGRESS TESTS
// --------------------------------------------------

test("saves and retrieves reading progress for a chapter", () => {
  const data = new Map();

  const storage = {
    setItem(key, value) {
      data.set(key, value);
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    }
  };

  const progress = saveReadingProgress(
    "chapter-1",
    250,
    1000,
    storage
  );

  assert.equal(progress.chapterId, "chapter-1");
  assert.equal(progress.position, 250);
  assert.equal(progress.totalLength, 1000);
  assert.equal(progress.percentage, 25);

  const saved = getReadingProgress("chapter-1", storage);

  assert.equal(saved.chapterId, "chapter-1");
  assert.equal(saved.position, 250);
  assert.equal(saved.percentage, 25);
  assert.ok(saved.updatedAt);

  assert.equal(getReadingProgress("chapter-2", storage), null);
});

test("keeps reading progress separate for different chapters", () => {
  const data = new Map();

  const storage = {
    setItem(key, value) {
      data.set(key, value);
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    }
  };

  saveReadingProgress("chapter-1", 200, 1000, storage);
  saveReadingProgress("chapter-2", 600, 1200, storage);

  assert.equal(
    getReadingProgress("chapter-1", storage).percentage,
    20
  );

  assert.equal(
    getReadingProgress("chapter-2", storage).percentage,
    50
  );
});

test("clamps saved reading position to the chapter length", () => {
  const data = new Map();

  const storage = {
    setItem(key, value) {
      data.set(key, value);
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    }
  };

  const progress = saveReadingProgress(
    "chapter-1",
    1500,
    1000,
    storage
  );

  assert.equal(progress.position, 1000);
  assert.equal(progress.percentage, 100);
});

test("rejects invalid saved reading progress values", () => {
  const data = new Map();

  const storage = {
    setItem(key, value) {
      data.set(key, value);
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    }
  };

  assert.throws(
    () => saveReadingProgress("", 100, 1000, storage),
    /Chapter ID/
  );

  assert.throws(
    () => saveReadingProgress("chapter-1", -1, 1000, storage),
    /non-negative number/
  );

  assert.throws(
    () => saveReadingProgress("chapter-1", 100, -1, storage),
    /non-negative number/
  );
});

// --------------------------------------------------
// MULTIPLE CHAPTER BOOKMARK TESTS
// --------------------------------------------------

test("saves and retrieves multiple chapter bookmarks", () => {
  const data = new Map();

  const storage = {
    setItem(key, value) {
      data.set(key, value);
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    }
  };

  saveChapterBookmark(
    "chapter-1",
    "The Beginning",
    150,
    storage
  );

  saveChapterBookmark(
    "chapter-2",
    "The Journey",
    450,
    storage
  );

  const bookmarks = getChapterBookmarks(storage);

  assert.equal(bookmarks.length, 2);

  assert.deepEqual(
    bookmarks.map((bookmark) => bookmark.chapterId),
    ["chapter-1", "chapter-2"]
  );

  assert.equal(bookmarks[0].title, "The Beginning");
  assert.equal(bookmarks[0].position, 150);

  assert.equal(bookmarks[1].title, "The Journey");
  assert.equal(bookmarks[1].position, 450);
});

test("updates an existing chapter bookmark instead of duplicating it", () => {
  const data = new Map();

  const storage = {
    setItem(key, value) {
      data.set(key, value);
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    }
  };

  saveChapterBookmark(
    "chapter-1",
    "Old Title",
    100,
    storage
  );

  saveChapterBookmark(
    "chapter-1",
    "Updated Title",
    350,
    storage
  );

  const bookmarks = getChapterBookmarks(storage);

  assert.equal(bookmarks.length, 1);
  assert.equal(bookmarks[0].title, "Updated Title");
  assert.equal(bookmarks[0].position, 350);
});

test("deletes a chapter bookmark without deleting other bookmarks", () => {
  const data = new Map();

  const storage = {
    setItem(key, value) {
      data.set(key, value);
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    }
  };

  saveChapterBookmark("chapter-1", "Chapter One", 100, storage);
  saveChapterBookmark("chapter-2", "Chapter Two", 200, storage);

  assert.equal(
    deleteChapterBookmark("chapter-1", storage),
    true
  );

  const bookmarks = getChapterBookmarks(storage);

  assert.equal(bookmarks.length, 1);
  assert.equal(bookmarks[0].chapterId, "chapter-2");

  assert.equal(
    deleteChapterBookmark("chapter-1", storage),
    false
  );
});

test("rejects invalid chapter bookmark data", () => {
  const data = new Map();

  const storage = {
    setItem(key, value) {
      data.set(key, value);
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    }
  };

  assert.throws(
    () => saveChapterBookmark("", "Chapter One", 100, storage),
    /Chapter ID/
  );

  assert.throws(
    () => saveChapterBookmark("chapter-1", "", 100, storage),
    /Chapter title/
  );

  assert.throws(
    () => saveChapterBookmark("chapter-1", "Chapter One", -1, storage),
    /non-negative number/
  );
});

// --------------------------------------------------
// READING HISTORY TESTS
// --------------------------------------------------

test("records and retrieves reading history", () => {
  const data = new Map();

  const storage = {
    setItem(key, value) {
      data.set(key, value);
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    }
  };

  const entry = recordReadingHistory(
    "chapter-1",
    "The Beginning",
    300,
    1000,
    storage
  );

  assert.equal(entry.chapterId, "chapter-1");
  assert.equal(entry.title, "The Beginning");
  assert.equal(entry.position, 300);
  assert.equal(entry.totalLength, 1000);
  assert.equal(entry.percentage, 30);
  assert.ok(entry.lastReadAt);

  const history = getReadingHistory(storage);

  assert.equal(history.length, 1);
  assert.equal(history[0].chapterId, "chapter-1");
  assert.equal(history[0].percentage, 30);
});

test("updates reading history instead of duplicating a chapter", () => {
  const data = new Map();

  const storage = {
    setItem(key, value) {
      data.set(key, value);
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    }
  };

  recordReadingHistory(
    "chapter-1",
    "The Beginning",
    100,
    1000,
    storage
  );

  recordReadingHistory(
    "chapter-2",
    "The Journey",
    200,
    1000,
    storage
  );

  recordReadingHistory(
    "chapter-1",
    "The Beginning",
    700,
    1000,
    storage
  );

  const history = getReadingHistory(storage);

  assert.equal(history.length, 2);

  // The most recently updated chapter should appear first.
  assert.equal(history[0].chapterId, "chapter-1");
  assert.equal(history[0].position, 700);
  assert.equal(history[0].percentage, 70);

  assert.equal(history[1].chapterId, "chapter-2");
  assert.equal(history[1].position, 200);
});

test("limits reading history to the 50 most recent chapters", () => {
  const data = new Map();

  const storage = {
    setItem(key, value) {
      data.set(key, value);
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    }
  };

  for (let index = 1; index <= 55; index += 1) {
    recordReadingHistory(
      `chapter-${index}`,
      `Chapter ${index}`,
      100,
      1000,
      storage
    );
  }

  const history = getReadingHistory(storage);

  assert.equal(history.length, 50);
  assert.equal(history[0].chapterId, "chapter-55");
  assert.equal(history[49].chapterId, "chapter-6");
});

test("rejects invalid reading history values", () => {
  const data = new Map();

  const storage = {
    setItem(key, value) {
      data.set(key, value);
    },
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    }
  };

  assert.throws(
    () => recordReadingHistory("", "Chapter One", 100, 1000, storage),
    /Chapter ID/
  );

  assert.throws(
    () => recordReadingHistory("chapter-1", "", 100, 1000, storage),
    /Chapter title/
  );

  assert.throws(
    () => recordReadingHistory("chapter-1", "Chapter One", -1, 1000, storage),
    /non-negative number/
  );
});