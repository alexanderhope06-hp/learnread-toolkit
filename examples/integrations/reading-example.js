/**
 * LearnRead Toolkit
 * Reading Integration Example
 *
 * Demonstrates:
 * - Calculating reading progress
 * - Saving and restoring reading positions
 * - Saving chapter bookmarks
 * - Retrieving and deleting bookmarks
 * - Recording and retrieving reading history
 */

import {
  calculateReadingProgress,
  saveReadingProgress,
  getReadingProgress,
  saveChapterBookmark,
  getChapterBookmarks,
  deleteChapterBookmark,
  recordReadingHistory,
  getReadingHistory
} from "../../src/index.js";

/**
 * Save a reader's current position and update reading history.
 *
 * Call this after the reader scrolls, preferably using a
 * debounce or throttle to avoid writing on every scroll event.
 *
 * @param {Object} options
 * @param {string} options.chapterId Unique chapter identifier.
 * @param {string} options.title Chapter title.
 * @param {number} options.position Current reading position.
 * @param {number} options.totalLength Total scrollable length.
 * @param {Storage} [options.storage] Compatible storage object.
 * @returns {Object} Reading progress information.
 */
export function trackReadingPosition({
  chapterId,
  title,
  position,
  totalLength,
  storage = globalThis.localStorage
}) {
  if (!storage) {
    throw new Error(
      "A compatible storage object must be provided."
    );
  }

  // Calculate the visible progress percentage.
  const percentage = calculateReadingProgress(
    position,
    totalLength
  );

  // Save the reader's current position.
  saveReadingProgress(
    chapterId,
    position,
    totalLength,
    storage
  );

  // Update the reading history for this chapter.
  recordReadingHistory(
    chapterId,
    title,
    position,
    totalLength,
    storage
  );

  return {
    chapterId,
    title,
    position,
    totalLength,
    percentage
  };
}

/**
 * Retrieve saved progress for a chapter.
 *
 * @param {string} chapterId Unique chapter identifier.
 * @param {Storage} [storage] Compatible storage object.
 * @returns {Object|null} Saved progress, if available.
 */
export function resumeChapter(
  chapterId,
  storage = globalThis.localStorage
) {
  return getReadingProgress(
    chapterId,
    storage
  );
}

/**
 * Save a bookmark for a chapter.
 *
 * @param {Object} options
 * @param {string} options.chapterId Unique chapter identifier.
 * @param {string} options.title Chapter title.
 * @param {number} options.position Position to bookmark.
 * @param {Storage} [options.storage] Compatible storage object.
 */
export function bookmarkChapter({
  chapterId,
  title,
  position,
  storage = globalThis.localStorage
}) {
  return saveChapterBookmark(
    chapterId,
    title,
    position,
    storage
  );
}

/**
 * Get all saved chapter bookmarks.
 *
 * @param {Storage} [storage] Compatible storage object.
 * @returns {Array} Saved bookmarks.
 */
export function listBookmarks(
  storage = globalThis.localStorage
) {
  return getChapterBookmarks(storage);
}

/**
 * Delete a bookmark for a specific chapter.
 *
 * @param {string} chapterId Unique chapter identifier.
 * @param {Storage} [storage] Compatible storage object.
 */
export function removeBookmark(
  chapterId,
  storage = globalThis.localStorage
) {
  return deleteChapterBookmark(
    chapterId,
    storage
  );
}

/**
 * Retrieve reading history.
 *
 * @param {Storage} [storage] Compatible storage object.
 * @returns {Array} Reading history entries.
 */
export function listReadingHistory(
  storage = globalThis.localStorage
) {
  return getReadingHistory(storage);
}

/**
 * Demonstration entry point.
 *
 * This example records a position in a sample chapter and
 * creates a bookmark at that position.
 */
export function runReadingExample(
  storage = globalThis.localStorage
) {
  const chapter = {
    chapterId: "sample-chapter-1",
    title: "The Value of Learning",
    position: 450,
    totalLength: 1000
  };

  const progress = trackReadingPosition({
    ...chapter,
    storage
  });

  bookmarkChapter({
    chapterId: chapter.chapterId,
    title: chapter.title,
    position: chapter.position,
    storage
  });

  return {
    progress,
    savedProgress: resumeChapter(
      chapter.chapterId,
      storage
    ),
    bookmarks: listBookmarks(storage),
    history: listReadingHistory(storage)
  };
}
