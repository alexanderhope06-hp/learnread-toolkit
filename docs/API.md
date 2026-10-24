# LearnRead Toolkit — API Reference

LearnRead Toolkit provides reusable JavaScript utilities for learning and reading
applications.

It can be used with plain JavaScript or integrated into applications built with
frameworks such as React, Vue, and other JavaScript frameworks.

The toolkit focuses on reusable logic. Your application remains responsible for
authentication, user accounts, database integration, and server-side security.

## Table of Contents

- [Learning API](#learning-api)
- [Reading API](#reading-api)
- [Storage](#storage)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Learning API

Import learning utilities from the main entry point:

\`\`\`js
import {
  scoreQuiz,
  calculateCourseProgress,
  createQuizAttempt,
  summarizeQuizAttempts,
  summarizeLessonProgress,
  saveQuizAttempt,
  getQuizAttempts
} from "../src/index.js";
\`\`\`

Adjust the import path to match your application's directory structure.

### `scoreQuiz(questions, answers)`

Scores a quiz using its questions and the answers submitted by a learner.

**Parameters**
- `questions`: The quiz questions and their correct-answer information.
- `answers`: The learner's submitted answers.

**Example**

\`\`\`js
const result = scoreQuiz(questions, answers);
console.log(result);
\`\`\`

The returned result contains the scoring information produced by the toolkit.
Check the implementation in `src/learning/index.js` for the exact result shape.

### `calculateCourseProgress(completedLessons, totalLessons)`

Calculates course progress from completed lessons and the total number of lessons.

**Parameters**
- `completedLessons`: The number of completed lessons.
- `totalLessons`: The total number of lessons.

**Example**

\`\`\`js
const progress = calculateCourseProgress(6, 10);
console.log(progress);
\`\`\`

### `createQuizAttempt(questions, answers, options)`

Creates a quiz-attempt record from the questions and submitted answers.

The options object can provide timestamps such as `startedAt` and `completedAt`.

**Example**

\`\`\`js
const attempt = createQuizAttempt(
  questions,
  answers,
  {
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  }
);
\`\`\`

Inspect the implementation for the complete attempt structure.

### `summarizeQuizAttempts(attempts)`

Summarizes a collection of quiz attempts.

**Parameter**
- `attempts`: The quiz-attempt records to summarize.

**Example**

\`\`\`js
const summary = summarizeQuizAttempts(attempts);
console.log(summary);
\`\`\`

Use the returned summary to display learner performance in a dashboard.

### `summarizeLessonProgress(...)`

Provides a summary of lesson-progress information.

See `src/learning/index.js` for the current function signature, expected input
structure, and returned summary.

### `saveQuizAttempt(attempt, storage, storageKey)`

Saves a quiz attempt using a compatible storage object and storage key.

**Parameters**
- `attempt`: The quiz-attempt record to save.
- `storage`: The storage implementation to use.
- `storageKey`: The key used to store quiz attempts.

**Example**

\`\`\`js
saveQuizAttempt(
  attempt,
  localStorage,
  "learnread:quiz-attempts"
);
\`\`\`

### `getQuizAttempts(storage, storageKey)`

Retrieves saved quiz attempts using the supplied storage object and key.

**Example**

\`\`\`js
const attempts = getQuizAttempts(
  localStorage,
  "learnread:quiz-attempts"
);
\`\`\`

Review the source for the behavior when no attempts have been saved or when
stored data is invalid.

---

## Reading API

Import reading utilities from the main entry point:

\`\`\`js
import {
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
\`\`\`

### `calculateReadingProgress(currentPosition, totalLength)`

Calculates reading progress from the current position and total length.

\`\`\`js
const percentage = calculateReadingProgress(450, 1000);
console.log(percentage);
\`\`\`

The function's exact handling of invalid or boundary values is defined by the
implementation and tests.

### `saveBookmark(key, position, storage)`

Saves a bookmark using a key and reading position.

The optional `storage` argument defaults to `globalThis.localStorage` when
available.

\`\`\`js
saveBookmark("chapter-1", 450);
\`\`\`

### `getBookmark(key, storage)`

Retrieves a previously saved bookmark.

\`\`\`js
const position = getBookmark("chapter-1");
\`\`\`

### `saveReadingProgress(chapterId, position, totalLength, storage)`

Saves the reader's position and progress for a chapter.

\`\`\`js
saveReadingProgress(
  "chapter-1",
  450,
  1000,
  localStorage
);
\`\`\`

### `getReadingProgress(chapterId, storage)`

Retrieves the saved reading progress for a chapter.

\`\`\`js
const progress = getReadingProgress(
  "chapter-1",
  localStorage
);
\`\`\`

### `saveChapterBookmark(chapterId, title, position, storage)`

Saves a bookmark associated with a chapter.

\`\`\`js
saveChapterBookmark(
  "chapter-1",
  "The Value of Learning",
  450,
  localStorage
);
\`\`\`

### `getChapterBookmarks(storage)`

Retrieves the saved chapter bookmarks.

\`\`\`js
const bookmarks = getChapterBookmarks(localStorage);
\`\`\`

### `deleteChapterBookmark(chapterId, storage)`

Deletes the saved bookmark associated with a chapter.

\`\`\`js
deleteChapterBookmark("chapter-1", localStorage);
\`\`\`

### `recordReadingHistory(chapterId, title, position, totalLength, storage)`

Records reading activity for a chapter.

\`\`\`js
recordReadingHistory(
  "chapter-1",
  "The Value of Learning",
  450,
  1000,
  localStorage
);
\`\`\`

### `getReadingHistory(storage)`

Retrieves the saved reading history.

\`\`\`js
const history = getReadingHistory(localStorage);
\`\`\`

The current implementation limits reading history to 50 entries.

---

## Storage

The reading utilities use the following storage-key patterns:

| Feature | Storage key |
|---|---|
| Reading progress | `learnread:reading-progress:<chapterId>` |
| Legacy bookmark | `learnread:bookmark:<key>` |
| Chapter bookmarks | `learnread:chapter-bookmarks` |
| Reading history | `learnread:reading-history` |

Quiz-attempt storage keys are supplied by the consuming application.

The toolkit accepts compatible storage objects in functions that support storage
injection. This makes it easier to test the toolkit without depending on a
browser's real `localStorage`.

### Important limitations

Browser `localStorage`:

- Is specific to a browser origin and browser profile.
- Is not a shared database between users or devices.
- Can be cleared by the user or browser.
- Should not be treated as a secure place for sensitive information.
- Is not a substitute for server-side validation or authorization.

For applications that need accounts, synchronization, or cross-device progress,
connect the toolkit to an appropriate backend or database.

---

## Error Handling

Provide valid inputs and a compatible storage implementation when required.

The exact validation rules and error behavior are defined by each function's
implementation and tests. Do not assume every function handles invalid input
in the same way.

When integrating the toolkit, test cases such as:

- Missing or invalid input.
- Empty quiz attempts or reading history.
- Invalid reading positions.
- Missing browser storage.
- Malformed or unavailable saved data.

---

## Examples

The repository includes example integrations:

- `examples/integrations/learning-example.js`
- `examples/integrations/reading-example.js`

The interactive demonstration is available in:

- `examples/index.html`
- `examples/demo.js`
- `examples/styles.css`

These examples demonstrate how the toolkit can be used by a consuming
application.

---

## Contributing

Contributions are welcome.

Before submitting changes, run:

\`\`\`bash
npm test
npm run check
\`\`\`

Please include tests for new functionality and bug fixes.
