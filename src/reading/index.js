/**
 * LearnRead Toolkit — Reading Utilities
 *
 * Provides reading progress, bookmarks, and reading history.
 * Uses browser storage by default but supports compatible
 * storage implementations for testing and other environments.
 */

const PROGRESS_PREFIX = "learnread:reading-progress:";
const LEGACY_BOOKMARK_PREFIX = "learnread:bookmark:";
const CHAPTER_BOOKMARKS_KEY = "learnread:chapter-bookmarks";
const READING_HISTORY_KEY = "learnread:reading-history";

const MAX_HISTORY_ITEMS = 50;

/**
 * Validate that an identifier is a non-empty string.
 *
 * @param {string} value
 * @param {string} label
 */
function validateIdentifier(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
}

/**
 * Validate a non-negative finite number.
 *
 * @param {number} value
 * @param {string} label
 */
function validateNonNegativeNumber(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative number.`);
  }
}

/**
 * Validate a chapter title.
 *
 * @param {string} title
 */
function validateTitle(title) {
  if (typeof title !== "string" || title.trim() === "") {
    throw new TypeError("Chapter title must be a non-empty string.");
  }
}

/**
 * Validate storage capabilities.
 *
 * @param {Storage} storage
 * @param {string[]} methods
 */
function validateStorage(storage, methods) {
  if (
    !storage ||
    methods.some((method) => typeof storage[method] !== "function")
  ) {
    throw new Error("A compatible storage implementation is required.");
  }
}

/**
 * Read and parse a JSON value from storage.
 *
 * @param {Storage} storage
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
function readJSON(storage, key, fallback) {
  const saved = storage.getItem(key);

  if (saved === null) {
    return fallback;
  }

  try {
    return JSON.parse(saved);
  } catch {
    throw new Error(`Saved data for "${key}" is not valid JSON.`);
  }
}

/**
 * Calculate reading progress as a percentage.
 *
 * @param {number} currentPosition
 * @param {number} totalLength
 * @returns {number}
 */
export function calculateReadingProgress(currentPosition, totalLength) {
  validateNonNegativeNumber(currentPosition, "Current position");
  validateNonNegativeNumber(totalLength, "Total length");

  if (totalLength === 0) {
    return 0;
  }

  return Number(
    (
      (Math.min(currentPosition, totalLength) / totalLength) *
      100
    ).toFixed(2)
  );
}

/**
 * Save a bookmark using the original single-bookmark API.
 *
 * This function remains available for backward compatibility.
 *
 * @param {string} key
 * @param {number} position
 * @param {Storage} storage
 */
export function saveBookmark(
  key,
  position,
  storage = globalThis.localStorage
) {
  validateIdentifier(key, "Bookmark key");
  validateNonNegativeNumber(position, "Bookmark position");
  validateStorage(storage, ["setItem"]);

  storage.setItem(
    `${LEGACY_BOOKMARK_PREFIX}${key}`,
    JSON.stringify({ position })
  );
}

/**
 * Retrieve a bookmark saved using the original API.
 *
 * @param {string} key
 * @param {Storage} storage
 * @returns {{position: number}|null}
 */
export function getBookmark(
  key,
  storage = globalThis.localStorage
) {
  validateIdentifier(key, "Bookmark key");
  validateStorage(storage, ["getItem"]);

  const saved = storage.getItem(`${LEGACY_BOOKMARK_PREFIX}${key}`);

  if (saved === null) {
    return null;
  }

  let bookmark;

  try {
    bookmark = JSON.parse(saved);
  } catch {
    throw new Error("Saved bookmark data is not valid JSON.");
  }

  if (
    !bookmark ||
    !Number.isFinite(bookmark.position) ||
    bookmark.position < 0
  ) {
    throw new Error("Saved bookmark data is invalid.");
  }

  return bookmark;
}

/**
 * Save reading progress for a specific chapter.
 *
 * @param {string} chapterId
 * @param {number} position
 * @param {number} totalLength
 * @param {Storage} storage
 * @returns {object} Saved progress
 */
export function saveReadingProgress(
  chapterId,
  position,
  totalLength,
  storage = globalThis.localStorage
) {
  validateIdentifier(chapterId, "Chapter ID");
  validateNonNegativeNumber(position, "Reading position");
  validateNonNegativeNumber(totalLength, "Total length");
  validateStorage(storage, ["setItem"]);

  const safePosition = Math.min(position, totalLength);

  const progress = {
    chapterId,
    position: safePosition,
    totalLength,
    percentage: calculateReadingProgress(safePosition, totalLength),
    updatedAt: new Date().toISOString()
  };

  storage.setItem(
    `${PROGRESS_PREFIX}${chapterId}`,
    JSON.stringify(progress)
  );

  return progress;
}

/**
 * Retrieve reading progress for a specific chapter.
 *
 * @param {string} chapterId
 * @param {Storage} storage
 * @returns {object|null}
 */
export function getReadingProgress(
  chapterId,
  storage = globalThis.localStorage
) {
  validateIdentifier(chapterId, "Chapter ID");
  validateStorage(storage, ["getItem"]);

  const progress = readJSON(
    storage,
    `${PROGRESS_PREFIX}${chapterId}`,
    null
  );

  if (progress === null) {
    return null;
  }

  if (
    !progress ||
    progress.chapterId !== chapterId ||
    !Number.isFinite(progress.position) ||
    progress.position < 0 ||
    !Number.isFinite(progress.totalLength) ||
    progress.totalLength < 0
  ) {
    throw new Error("Saved reading progress data is invalid.");
  }

  return progress;
}

/**
 * Save or update a chapter bookmark.
 *
 * Each chapter has its own bookmark. Saving another chapter's
 * bookmark does not overwrite existing chapter bookmarks.
 *
 * @param {string} chapterId
 * @param {string} title
 * @param {number} position
 * @param {Storage} storage
 * @returns {object} Saved bookmark
 */
export function saveChapterBookmark(
  chapterId,
  title,
  position,
  storage = globalThis.localStorage
) {
  validateIdentifier(chapterId, "Chapter ID");
  validateTitle(title);
  validateNonNegativeNumber(position, "Bookmark position");
  validateStorage(storage, ["getItem", "setItem"]);

  const bookmarks = readJSON(storage, CHAPTER_BOOKMARKS_KEY, []);

  if (!Array.isArray(bookmarks)) {
    throw new Error("Saved chapter bookmarks data is invalid.");
  }

  const bookmark = {
    chapterId,
    title: title.trim(),
    position,
    savedAt: new Date().toISOString()
  };

  const existingIndex = bookmarks.findIndex(
    (item) => item && item.chapterId === chapterId
  );

  if (existingIndex >= 0) {
    bookmarks[existingIndex] = bookmark;
  } else {
    bookmarks.push(bookmark);
  }

  storage.setItem(
    CHAPTER_BOOKMARKS_KEY,
    JSON.stringify(bookmarks)
  );

  return bookmark;
}

/**
 * Retrieve all chapter bookmarks.
 *
 * @param {Storage} storage
 * @returns {object[]}
 */
export function getChapterBookmarks(
  storage = globalThis.localStorage
) {
  validateStorage(storage, ["getItem"]);

  const bookmarks = readJSON(storage, CHAPTER_BOOKMARKS_KEY, []);

  if (!Array.isArray(bookmarks)) {
    throw new Error("Saved chapter bookmarks data is invalid.");
  }

  return bookmarks;
}

/**
 * Delete a bookmark for a specific chapter.
 *
 * @param {string} chapterId
 * @param {Storage} storage
 * @returns {boolean} True if a bookmark was deleted
 */
export function deleteChapterBookmark(
  chapterId,
  storage = globalThis.localStorage
) {
  validateIdentifier(chapterId, "Chapter ID");
  validateStorage(storage, ["getItem", "setItem"]);

  const bookmarks = readJSON(storage, CHAPTER_BOOKMARKS_KEY, []);

  if (!Array.isArray(bookmarks)) {
    throw new Error("Saved chapter bookmarks data is invalid.");
  }

  const remaining = bookmarks.filter(
    (bookmark) => !bookmark || bookmark.chapterId !== chapterId
  );

  const deleted = remaining.length !== bookmarks.length;

  if (deleted) {
    storage.setItem(
      CHAPTER_BOOKMARKS_KEY,
      JSON.stringify(remaining)
    );
  }

  return deleted;
}

/**
 * Record a chapter visit and its latest reading position.
 *
 * Reopening a chapter updates its existing history entry instead
 * of creating a duplicate. The most recently updated chapters
 * appear first.
 *
 * @param {string} chapterId
 * @param {string} title
 * @param {number} position
 * @param {number} totalLength
 * @param {Storage} storage
 * @returns {object} Updated history entry
 */
export function recordReadingHistory(
  chapterId,
  title,
  position,
  totalLength,
  storage = globalThis.localStorage
) {
  validateIdentifier(chapterId, "Chapter ID");
  validateTitle(title);
  validateNonNegativeNumber(position, "Reading position");
  validateNonNegativeNumber(totalLength, "Total length");
  validateStorage(storage, ["getItem", "setItem"]);

  const history = readJSON(storage, READING_HISTORY_KEY, []);

  if (!Array.isArray(history)) {
    throw new Error("Saved reading history data is invalid.");
  }

  const safePosition = Math.min(position, totalLength);

  const entry = {
    chapterId,
    title: title.trim(),
    position: safePosition,
    totalLength,
    percentage: calculateReadingProgress(safePosition, totalLength),
    lastReadAt: new Date().toISOString()
  };

  const updatedHistory = history.filter(
    (item) => !item || item.chapterId !== chapterId
  );

  updatedHistory.unshift(entry);

  storage.setItem(
    READING_HISTORY_KEY,
    JSON.stringify(updatedHistory.slice(0, MAX_HISTORY_ITEMS))
  );

  return entry;
}

/**
 * Retrieve reading history, newest activity first.
 *
 * @param {Storage} storage
 * @returns {object[]}
 */
export function getReadingHistory(
  storage = globalThis.localStorage
) {
  validateStorage(storage, ["getItem"]);

  const history = readJSON(storage, READING_HISTORY_KEY, []);

  if (!Array.isArray(history)) {
    throw new Error("Saved reading history data is invalid.");
  }

  return history;
}