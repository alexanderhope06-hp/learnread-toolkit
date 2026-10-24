/**
 * Calculate reading progress as a percentage.
 *
 * @param {number} currentPosition
 * @param {number} totalLength
 * @returns {number}
 */
export function calculateReadingProgress(currentPosition, totalLength) {
  if (
    !Number.isFinite(currentPosition) ||
    !Number.isFinite(totalLength) ||
    currentPosition < 0 ||
    totalLength < 0
  ) {
    throw new TypeError("Reading positions must be non-negative numbers.");
  }

  if (totalLength === 0) {
    return 0;
  }

  return Number(
    (Math.min(currentPosition, totalLength) / totalLength * 100).toFixed(2)
  );
}

/**
 * Save a bookmark using browser storage.
 *
 * @param {string} key
 * @param {number} position
 * @param {Storage} storage
 */
export function saveBookmark(key, position, storage = globalThis.localStorage) {
  if (typeof key !== "string" || key.trim() === "") {
    throw new TypeError("Bookmark key must be a non-empty string.");
  }

  if (!Number.isFinite(position) || position < 0) {
    throw new TypeError("Bookmark position must be a non-negative number.");
  }

  if (!storage || typeof storage.setItem !== "function") {
    throw new Error("A compatible storage implementation is required.");
  }

  storage.setItem(
    `learnread:bookmark:${key}`,
    JSON.stringify({ position })
  );
}

/**
 * Retrieve a previously saved bookmark.
 *
 * @param {string} key
 * @param {Storage} storage
 * @returns {{position: number}|null}
 */
export function getBookmark(key, storage = globalThis.localStorage) {
  if (typeof key !== "string" || key.trim() === "") {
    throw new TypeError("Bookmark key must be a non-empty string.");
  }

  if (!storage || typeof storage.getItem !== "function") {
    throw new Error("A compatible storage implementation is required.");
  }

  const saved = storage.getItem(`learnread:bookmark:${key}`);

  if (saved === null) {
    return null;
  }

  const bookmark = JSON.parse(saved);

  if (
    !bookmark ||
    !Number.isFinite(bookmark.position) ||
    bookmark.position < 0
  ) {
    throw new Error("Saved bookmark data is invalid.");
  }

  return bookmark;
}
