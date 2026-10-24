import {
  scoreQuiz,
  calculateCourseProgress,
  calculateReadingProgress,
  saveBookmark,
  getBookmark
} from "../src/index.js";

const $ = (selector) => document.querySelector(selector);

const quizQuestions = [
  {
    id: "q1",
    options: ["HTML", "JavaScript", "SQL"],
    correctAnswer: 1
  },
  {
    id: "q2",
    options: ["const", "let", "static"],
    correctAnswer: 1
  },
  {
    id: "q3",
    options: ["JSON.parse()", "JSON.stringify()", "JSON.convert()"],
    correctAnswer: 0
  }
];

const quizResult = $("#quiz-result");

$("#submit-quiz").addEventListener("click", () => {
  const answers = {};

  for (const question of quizQuestions) {
    const selected = document.querySelector(
      `input[name="${question.id}"]:checked`
    );

    if (!selected) {
      quizResult.hidden = false;
      quizResult.className = "result error";
      quizResult.textContent = "Please answer all three questions before submitting.";
      return;
    }

    answers[question.id] = Number(selected.value);
  }

  const result = scoreQuiz(quizQuestions, answers);

  quizResult.hidden = false;
  quizResult.className = "result";
  quizResult.textContent =
    `You scored ${result.earnedPoints} out of ${result.totalPoints} points ` +
    `(${result.percentage}%). You answered ${result.correctAnswers} of ` +
    `${result.totalQuestions} questions correctly.`;

  try {
    const history = JSON.parse(
      localStorage.getItem("learnread:demo:quiz-history") || "[]"
    );

    history.push({
      percentage: result.percentage,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      completedAt: new Date().toISOString()
    });

    localStorage.setItem(
      "learnread:demo:quiz-history",
      JSON.stringify(history.slice(-20))
    );
  } catch {
    // Scoring still works if browser storage is unavailable.
  }
});

const lessonChecks = [...document.querySelectorAll(".lesson-check")];
const coursePercent = $("#course-percent");
const lessonCount = $("#lesson-count");
const courseFill = $("#course-fill");
const courseBar = $("#course-bar");

function updateCourseProgress() {
  const completed = lessonChecks.filter((checkbox) => checkbox.checked).length;
  const percentage = calculateCourseProgress(completed, lessonChecks.length);

  coursePercent.textContent = `${percentage}%`;
  lessonCount.textContent = `${completed} of ${lessonChecks.length} lessons`;
  courseFill.style.width = `${percentage}%`;
  courseBar.setAttribute("aria-valuenow", String(percentage));

  try {
    localStorage.setItem(
      "learnread:demo:lessons",
      JSON.stringify(lessonChecks.map((checkbox) => checkbox.checked))
    );
  } catch {
    // Progress remains usable for the current page session.
  }
}

try {
  const savedLessons = JSON.parse(
    localStorage.getItem("learnread:demo:lessons") || "[]"
  );

  lessonChecks.forEach((checkbox, index) => {
    checkbox.checked = savedLessons[index] === true;
  });
} catch {
  // Start with empty progress if saved data is invalid.
}

lessonChecks.forEach((checkbox) => {
  checkbox.addEventListener("change", updateCourseProgress);
});

updateCourseProgress();

const reader = $("#reader-content");
const readingPercent = $("#reading-percent");
const readingFill = $("#reading-fill");
const readingBar = $("#reading-bar");
const bookmarkStatus = $("#bookmark-status");

function updateReadingProgress() {
  const scrollableDistance = reader.scrollHeight - reader.clientHeight;

  const progress = calculateReadingProgress(
    Math.max(0, reader.scrollTop),
    Math.max(0, scrollableDistance)
  );

  readingPercent.textContent = `${progress}%`;
  readingFill.style.width = `${progress}%`;
  readingBar.setAttribute("aria-valuenow", String(progress));
}

reader.addEventListener("scroll", updateReadingProgress, { passive: true });

let textSize = 16;

$("#increase-text").addEventListener("click", () => {
  textSize = Math.min(24, textSize + 1);
  reader.style.fontSize = `${textSize}px`;
});

$("#decrease-text").addEventListener("click", () => {
  textSize = Math.max(12, textSize - 1);
  reader.style.fontSize = `${textSize}px`;
});

$("#save-bookmark").addEventListener("click", () => {
  try {
    saveBookmark("demo-reading", reader.scrollTop);
    bookmarkStatus.textContent =
      `Bookmark saved at reading position ${Math.round(reader.scrollTop)} pixels.`;
  } catch {
    bookmarkStatus.textContent =
      "Unable to save the bookmark in this browser.";
  }
});

$("#restore-bookmark").addEventListener("click", () => {
  try {
    const bookmark = getBookmark("demo-reading");

    if (!bookmark) {
      bookmarkStatus.textContent = "No bookmark found. Save one first.";
      return;
    }

    reader.scrollTop = Math.min(
      bookmark.position,
      reader.scrollHeight - reader.clientHeight
    );

    updateReadingProgress();
    bookmarkStatus.textContent = "Your saved reading position has been restored.";
  } catch {
    bookmarkStatus.textContent =
      "Unable to restore the bookmark in this browser.";
  }
});

updateReadingProgress();
