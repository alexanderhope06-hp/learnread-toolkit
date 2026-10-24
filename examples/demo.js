import {
  scoreQuiz,
  calculateCourseProgress,
  calculateReadingProgress,
  saveBookmark,
  getBookmark,
  createQuizAttempt,
  summarizeQuizAttempts,
  saveQuizAttempt,
  getQuizAttempts,
  saveReadingProgress,
  getReadingProgress,
  saveChapterBookmark,
  getChapterBookmarks,
  deleteChapterBookmark,
  recordReadingHistory,
  getReadingHistory
} from "../src/index.js";

const $ = (selector) => document.querySelector(selector);

const QUIZ_HISTORY_KEY = "demo-student";
const READING_CHAPTER_ID = "value-of-learning";
const READING_CHAPTER_TITLE = "The Value of Learning";

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
const submitQuizButton = $("#submit-quiz");

let quizStartedAt = new Date().toISOString();

/* =====================================================
   SHARED DISPLAY HELPERS
   ===================================================== */

function formatPercentage(value) {
  const percentage = Number(value);

  if (!Number.isFinite(percentage)) {
    return "0%";
  }

  return `${Math.round(percentage * 10) / 10}%`;
}

function formatDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString();
}

function createStatCard(label, value) {
  const card = document.createElement("div");
  card.className = "quiz-stat-card";

  const title = document.createElement("span");
  title.className = "quiz-stat-label";
  title.textContent = label;

  const number = document.createElement("strong");
  number.className = "quiz-stat-value";
  number.textContent = value;

  card.append(title, number);

  return card;
}

function showStorageMessage(container, message) {
  const paragraph = document.createElement("p");

  paragraph.className = "storage-note";
  paragraph.textContent = message;

  container.replaceChildren(paragraph);
}

/* =====================================================
   QUIZ HISTORY AND PERFORMANCE
   ===================================================== */

function createHistorySection() {
  let section = $("#quiz-history");

  if (section) {
    return section;
  }

  section = document.createElement("section");
  section.id = "quiz-history";
  section.className = "quiz-history-section";

  const heading = document.createElement("h3");
  heading.textContent = "Your Quiz Performance";

  const description = document.createElement("p");
  description.textContent =
    "Review your previous attempts and track your progress.";

  const stats = document.createElement("div");
  stats.id = "quiz-history-stats";
  stats.className = "quiz-history-stats";

  const historyHeading = document.createElement("h4");
  historyHeading.textContent = "Previous Attempts";

  const historyList = document.createElement("ol");
  historyList.id = "quiz-history-list";

  section.append(
    heading,
    description,
    stats,
    historyHeading,
    historyList
  );

  const quizForm =
    submitQuizButton.closest("form") ||
    submitQuizButton.parentElement;

  quizForm.insertAdjacentElement("afterend", section);

  return section;
}

function renderQuizHistory() {
  createHistorySection();

  const statsContainer = $("#quiz-history-stats");
  const historyList = $("#quiz-history-list");

  if (!statsContainer || !historyList) {
    return;
  }

  statsContainer.replaceChildren();
  historyList.replaceChildren();

  let attempts;

  try {
    attempts = getQuizAttempts(localStorage, QUIZ_HISTORY_KEY);
  } catch (error) {
    console.error("Unable to read quiz history:", error);

    showStorageMessage(
      historyList,
      "Quiz history is unavailable. Check your browser storage settings."
    );

    return;
  }

  if (!attempts.length) {
    showStorageMessage(
      historyList,
      "No quiz attempts yet. Complete the quiz to start tracking your progress."
    );

    return;
  }

  const summary = summarizeQuizAttempts(attempts);

  statsContainer.append(
    createStatCard(
      "Total Attempts",
      String(summary.attemptCount)
    ),
    createStatCard(
      "Average Score",
      formatPercentage(summary.averageScore)
    ),
    createStatCard(
      "Highest Score",
      formatPercentage(summary.bestScore)
    ),
    createStatCard(
      "Latest Score",
      formatPercentage(summary.latestScore)
    )
  );

  [...attempts].reverse().forEach((attempt, index) => {
    const item = document.createElement("li");
    item.className = "quiz-history-item";

    const title = document.createElement("strong");

    title.textContent =
      `Attempt ${attempts.length - index}: ` +
      `${formatPercentage(attempt.percentage)}`;

    const details = document.createElement("p");

    details.textContent =
      `${attempt.correctAnswers ?? "—"} of ` +
      `${attempt.totalQuestions ?? "—"} questions correct`;

    const date = document.createElement("time");

    date.dateTime = attempt.completedAt || "";
    date.textContent = formatDate(attempt.completedAt);

    item.append(title, details, date);

    historyList.append(item);
  });
}

submitQuizButton.addEventListener("click", () => {
  const answers = {};

  for (const question of quizQuestions) {
    const selected = document.querySelector(
      `input[name="${question.id}"]:checked`
    );

    if (!selected) {
      quizResult.hidden = false;
      quizResult.className = "result error";

      quizResult.textContent =
        "Please answer all three questions before submitting.";

      return;
    }

    answers[question.id] = Number(selected.value);
  }

  const result = scoreQuiz(quizQuestions, answers);

  quizResult.hidden = false;
  quizResult.className = "result";

  quizResult.textContent =
    `You scored ${result.earnedPoints} out of ` +
    `${result.totalPoints} points (${result.percentage}%). ` +
    `You answered ${result.correctAnswers} of ` +
    `${result.totalQuestions} questions correctly.`;

  try {
    const attempt = createQuizAttempt(
      quizQuestions,
      answers,
      {
        startedAt: quizStartedAt,
        completedAt: new Date().toISOString()
      }
    );

    saveQuizAttempt(
      attempt,
      localStorage,
      QUIZ_HISTORY_KEY
    );

    renderQuizHistory();
  } catch (error) {
    console.error("Unable to save quiz attempt:", error);

    const storageWarning = document.createElement("p");

    storageWarning.className = "result error";
    storageWarning.textContent =
      "Your score was calculated, but the attempt could not be saved.";

    quizResult.insertAdjacentElement(
      "afterend",
      storageWarning
    );
  }

  quizStartedAt = new Date().toISOString();
});

renderQuizHistory();

/* =====================================================
   COURSE / LESSON PROGRESS
   ===================================================== */

const lessonChecks = [
  ...document.querySelectorAll(".lesson-check")
];

const coursePercent = $("#course-percent");
const lessonCount = $("#lesson-count");
const courseFill = $("#course-fill");
const courseBar = $("#course-bar");

function updateCourseProgress() {
  const completed = lessonChecks.filter(
    (checkbox) => checkbox.checked
  ).length;

  const percentage = calculateCourseProgress(
    completed,
    lessonChecks.length
  );

  coursePercent.textContent = `${percentage}%`;

  lessonCount.textContent =
    `${completed} of ${lessonChecks.length} lessons`;

  courseFill.style.width = `${percentage}%`;

  courseBar.setAttribute(
    "aria-valuenow",
    String(percentage)
  );

  try {
    localStorage.setItem(
      "learnread:demo:lessons",
      JSON.stringify(
        lessonChecks.map((checkbox) => checkbox.checked)
      )
    );
  } catch {
    // Progress remains usable during the current page session.
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
  checkbox.addEventListener(
    "change",
    updateCourseProgress
  );
});

updateCourseProgress();

/* =====================================================
   READING PROGRESS, BOOKMARKS, AND HISTORY
   ===================================================== */

const reader = $("#reader-content");
const readingPercent = $("#reading-percent");
const readingFill = $("#reading-fill");
const readingBar = $("#reading-bar");
const bookmarkStatus = $("#bookmark-status");
const bookmarksContainer = $("#chapter-bookmarks");
const historyContainer = $("#reading-history");

let readingSaveTimer = null;
let lastRecordedPosition = -1;

/**
 * Get the reader's current position, total scrollable length,
 * and reading percentage.
 */
function getReaderMetrics() {
  const totalLength = Math.max(
    0,
    reader.scrollHeight - reader.clientHeight
  );

  const position = Math.min(
    Math.max(0, reader.scrollTop),
    totalLength
  );

  return {
    position,
    totalLength,
    percentage: calculateReadingProgress(
      position,
      totalLength
    )
  };
}

/**
 * Update the visible reading progress indicator.
 */
function updateReadingProgress() {
  const { percentage } = getReaderMetrics();

  readingPercent.textContent = `${percentage}%`;
  readingFill.style.width = `${percentage}%`;

  readingBar.setAttribute(
    "aria-valuenow",
    String(percentage)
  );
}

/**
 * Save the current reading position and update reading history.
 */
function persistReadingState() {
  const { position, totalLength } = getReaderMetrics();

  try {
    saveReadingProgress(
      READING_CHAPTER_ID,
      position,
      totalLength,
      localStorage
    );

    // Avoid creating repeated history updates at the same position.
    if (position !== lastRecordedPosition) {
      recordReadingHistory(
        READING_CHAPTER_ID,
        READING_CHAPTER_TITLE,
        position,
        totalLength,
        localStorage
      );

      lastRecordedPosition = position;

      renderReadingHistory();
    }
  } catch (error) {
    console.error(
      "Unable to save reading progress:",
      error
    );
  }
}

/**
 * Delay saving while the reader scrolls quickly.
 */
function scheduleReadingSave() {
  window.clearTimeout(readingSaveTimer);

  readingSaveTimer = window.setTimeout(
    persistReadingState,
    250
  );
}

/* =====================================================
   SAVED BOOKMARKS
   ===================================================== */

function renderChapterBookmarks() {
  if (!bookmarksContainer) {
    return;
  }

  let bookmarks;

  try {
    bookmarks = getChapterBookmarks(localStorage);
  } catch (error) {
    console.error(
      "Unable to load chapter bookmarks:",
      error
    );

    showStorageMessage(
      bookmarksContainer,
      "Bookmarks are unavailable. Check your browser storage settings."
    );

    return;
  }

  if (bookmarks.length === 0) {
    showStorageMessage(
      bookmarksContainer,
      "No bookmarks saved yet."
    );

    return;
  }

  const list = document.createElement("ul");
  list.className = "reading-entry-list";

  bookmarks
    .slice()
    .sort(
      (a, b) =>
        new Date(b.savedAt) - new Date(a.savedAt)
    )
    .forEach((bookmark) => {
      const item = document.createElement("li");
      item.className = "reading-entry";

      const details = document.createElement("div");
      details.className = "reading-entry-details";

      const title = document.createElement("strong");
      title.textContent = bookmark.title;

      const position = document.createElement("p");

      position.textContent =
        `Saved at position ${Math.round(bookmark.position)} pixels`;

      const date = document.createElement("time");

      date.dateTime = bookmark.savedAt || "";
      date.textContent = formatDate(bookmark.savedAt);

      details.append(title, position, date);

      const actions = document.createElement("div");
      actions.className = "reading-entry-actions";

      // Return to the saved position.
      const restoreButton = document.createElement("button");

      restoreButton.type = "button";
      restoreButton.className = "button secondary";
      restoreButton.textContent = "Return";

      restoreButton.addEventListener("click", () => {
        restoreReadingPosition(bookmark.position);

        bookmarkStatus.textContent =
          `Returned to "${bookmark.title}".`;
      });

      // Delete the saved bookmark.
      const deleteButton = document.createElement("button");

      deleteButton.type = "button";
      deleteButton.className = "button secondary";
      deleteButton.textContent = "Delete";

      deleteButton.addEventListener("click", () => {
        try {
          deleteChapterBookmark(
            bookmark.chapterId,
            localStorage
          );

          renderChapterBookmarks();

          bookmarkStatus.textContent =
            `Bookmark "${bookmark.title}" deleted.`;
        } catch (error) {
          console.error(
            "Unable to delete bookmark:",
            error
          );

          bookmarkStatus.textContent =
            "Unable to delete this bookmark.";
        }
      });

      actions.append(
        restoreButton,
        deleteButton
      );

      item.append(details, actions);
      list.append(item);
    });

  bookmarksContainer.replaceChildren(list);
}

/* =====================================================
   READING HISTORY
   ===================================================== */

function renderReadingHistory() {
  if (!historyContainer) {
    return;
  }

  let history;

  try {
    history = getReadingHistory(localStorage);
  } catch (error) {
    console.error(
      "Unable to load reading history:",
      error
    );

    showStorageMessage(
      historyContainer,
      "Reading history is unavailable. Check your browser storage settings."
    );

    return;
  }

  if (history.length === 0) {
    showStorageMessage(
      historyContainer,
      "Your reading history will appear here as you read."
    );

    return;
  }

  const list = document.createElement("ul");
  list.className = "reading-entry-list";

  history.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "reading-entry";

    const details = document.createElement("div");
    details.className = "reading-entry-details";

    const title = document.createElement("strong");
    title.textContent = entry.title;

    const progress = document.createElement("p");

    progress.textContent =
      `${formatPercentage(entry.percentage)} complete · ` +
      `${Math.round(entry.position)} pixels read`;

    const date = document.createElement("time");

    date.dateTime = entry.lastReadAt || "";
    date.textContent =
      `Last read: ${formatDate(entry.lastReadAt)}`;

    details.append(title, progress, date);

    const returnButton = document.createElement("button");

    returnButton.type = "button";
    returnButton.className = "button secondary";
    returnButton.textContent = "Continue reading";

    returnButton.addEventListener("click", () => {
      restoreReadingPosition(entry.position);

      bookmarkStatus.textContent =
        `Continuing "${entry.title}".`;
    });

    item.append(details, returnButton);
    list.append(item);
  });

  historyContainer.replaceChildren(list);
}

/* =====================================================
   RESTORE READING POSITION
   ===================================================== */

function restoreReadingPosition(position) {
  const maximumPosition = Math.max(
    0,
    reader.scrollHeight - reader.clientHeight
  );

  reader.scrollTop = Math.min(
    Math.max(0, position),
    maximumPosition
  );

  updateReadingProgress();
  persistReadingState();
}

/* =====================================================
   READER SCROLLING
   ===================================================== */

reader.addEventListener(
  "scroll",
  () => {
    updateReadingProgress();
    scheduleReadingSave();
  },
  { passive: true }
);

/* =====================================================
   READER TEXT SIZE CONTROLS
   ===================================================== */

let textSize = 16;

$("#increase-text").addEventListener("click", () => {
  textSize = Math.min(24, textSize + 1);

  reader.style.fontSize = `${textSize}px`;

  updateReadingProgress();
  scheduleReadingSave();
});

$("#decrease-text").addEventListener("click", () => {
  textSize = Math.max(12, textSize - 1);

  reader.style.fontSize = `${textSize}px`;

  updateReadingProgress();
  scheduleReadingSave();
});

/* =====================================================
   SAVE BOOKMARK
   ===================================================== */

$("#save-bookmark").addEventListener("click", () => {
  try {
    const { position } = getReaderMetrics();

    // Save the chapter-aware bookmark.
    saveChapterBookmark(
      READING_CHAPTER_ID,
      READING_CHAPTER_TITLE,
      position,
      localStorage
    );

    // Preserve compatibility with the older bookmark API.
    saveBookmark(
      "demo-reading",
      reader.scrollTop,
      localStorage
    );

    bookmarkStatus.textContent =
      `Bookmark saved at reading position ` +
      `${Math.round(position)} pixels.`;

    renderChapterBookmarks();
  } catch (error) {
    console.error(
      "Unable to save bookmark:",
      error
    );

    bookmarkStatus.textContent =
      "Unable to save the bookmark in this browser.";
  }
});

/* =====================================================
   RESTORE BOOKMARK
   ===================================================== */

$("#restore-bookmark").addEventListener("click", () => {
  try {
    const chapterBookmarks =
      getChapterBookmarks(localStorage);

    const chapterBookmark = chapterBookmarks.find(
      (bookmark) =>
        bookmark.chapterId === READING_CHAPTER_ID
    );

    // Prefer the chapter-aware bookmark, then use the legacy one.
    const bookmark =
      chapterBookmark ||
      getBookmark("demo-reading", localStorage);

    if (!bookmark) {
      bookmarkStatus.textContent =
        "No bookmark found. Save one first.";

      return;
    }

    restoreReadingPosition(bookmark.position);

    bookmarkStatus.textContent =
      "Your saved reading position has been restored.";
  } catch (error) {
    console.error(
      "Unable to restore bookmark:",
      error
    );

    bookmarkStatus.textContent =
      "Unable to restore the bookmark in this browser.";
  }
});

/* =====================================================
   RESTORE SAVED READING PROGRESS
   ===================================================== */

function restoreSavedReadingProgress() {
  try {
    const savedProgress = getReadingProgress(
      READING_CHAPTER_ID,
      localStorage
    );

    if (savedProgress) {
      // Wait until the reader layout is ready.
      requestAnimationFrame(() => {
        reader.scrollTop = Math.min(
          savedProgress.position,
          Math.max(
            0,
            reader.scrollHeight - reader.clientHeight
          )
        );

        updateReadingProgress();

        lastRecordedPosition =
          savedProgress.position;
      });
    }
  } catch (error) {
    console.error(
      "Unable to restore reading progress:",
      error
    );
  }
}

/* =====================================================
   INITIALIZE READING FEATURES
   ===================================================== */

renderChapterBookmarks();
renderReadingHistory();
restoreSavedReadingProgress();
updateReadingProgress();

/* =====================================================
   SAVE WHEN LEAVING THE PAGE
   ===================================================== */

window.addEventListener("pagehide", () => {
  window.clearTimeout(readingSaveTimer);
  persistReadingState();
});