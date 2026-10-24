# LearnRead Toolkit

**A lightweight, reusable JavaScript toolkit for learning and reading websites.**

LearnRead Toolkit provides reusable functions that help developers build learning platforms, online reading libraries, educational websites, and interactive study applications without implementing common features from scratch.

It focuses on two core areas:

- **Learning:** quiz scoring, quiz attempt history, performance summaries, and course progress.
- **Reading:** reading progress, bookmarks, and reading history.

The toolkit is designed to be framework-independent, so its functions can be integrated into different JavaScript applications.

## Features

### Learning tools

- Calculate quiz scores and percentages.
- Create and store quiz attempts.
- Retrieve previous quiz attempts.
- Summarize quiz performance, including average, highest, and latest scores.
- Calculate course completion progress.
- Summarize lesson progress.

### Reading tools

- Calculate reading progress.
- Save and restore reading positions.
- Save bookmarks for individual chapters.
- Retrieve saved chapter bookmarks.
- Delete chapter bookmarks.
- Record reading history.
- Retrieve previously read chapters.

### Developer-friendly design

- Written in JavaScript using ES modules.
- Framework-independent core functions.
- Browser storage support through `localStorage`.
- Storage can be passed into functions where supported.
- Automated tests for important functionality.
- Includes a demo application for exploring the toolkit.

## Project status

LearnRead Toolkit is an actively developed open-source project.

The core learning and reading utilities are implemented, and the project includes an automated test suite and a browser-based demo.

The toolkit is intended to provide reusable functionality rather than a complete learning management system or publishing platform.

Features such as user authentication, cloud synchronization, databases, payments, and server-side APIs must be provided by the application integrating the toolkit.

## Project structure

```text
learnread-toolkit/
├── src/
│   ├── learning/
│   │   └── index.js
│   ├── reading/
│   │   └── index.js
│   └── index.js
├── tests/
│   └── toolkit.test.js
├── examples/
│   ├── index.html
│   ├── demo.js
│   └── styles.css
├── package.json
└── README.md
```

**Directory overview**

| Path | Purpose |
|---|---|
| `src/learning/` | Learning and course-related utilities |
| `src/reading/` | Reading progress, bookmarks, and history utilities |
| `src/index.js` | Public exports for the toolkit |
| `tests/` | Automated tests |
| `examples/` | Browser-based demonstration |
| `package.json` | Project metadata and development scripts |

## Getting started

### Requirements

- Node.js
- npm
- A modern web browser to run the browser demo

### 1. Clone the repository

```bash
git clone https://github.com/alexanderhope06-hp/learnread-toolkit.git
cd learnread-toolkit
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the tests

```bash
npm test
```

### 4. Run the project checks

```bash
npm run check
```

Run these commands after making changes to help identify problems before committing your work.

> **Note:** The repository must contain the project's committed source files for a fresh clone to work. Until a package release is published, use the repository's source code rather than assuming that the toolkit is available through `npm install learnread-toolkit`.

## Quick start

The toolkit exposes its functions through `src/index.js`.

For example, a project using the source directly can import the functions it needs:

```javascript
import {
  scoreQuiz,
  calculateCourseProgress,
  calculateReadingProgress
} from "./src/index.js";
```

Adjust the import path to match your application's directory structure.

### Example 1: Score a quiz

```javascript
import { scoreQuiz } from "./src/index.js";

const questions = [
  {
    id: "q1",
    options: ["HTML", "JavaScript", "CSS"],
    correctAnswer: 1
  },
  {
    id: "q2",
    options: ["SQL", "Python", "Java"],
    correctAnswer: 1
  }
];

const answers = {
  q1: 1,
  q2: 1
};

const result = scoreQuiz(questions, answers);

console.log(result);
```

The scoring function calculates the result from the supplied questions and answers.

Use the returned result to display a student's score in your own interface.

### Example 2: Calculate course progress

```javascript
import { calculateCourseProgress } from "./src/index.js";

const completedLessons = 6;
const totalLessons = 10;

const progress = calculateCourseProgress(
  completedLessons,
  totalLessons
);

console.log(`${progress}% complete`);
```

This example calculates progress for a course with six completed lessons out of ten.

Your application remains responsible for tracking which lessons a student has completed.

### Example 3: Calculate reading progress

```javascript
import { calculateReadingProgress } from "./src/index.js";

const currentPosition = 450;
const totalLength = 1000;

const progress = calculateReadingProgress(
  currentPosition,
  totalLength
);

console.log(`${progress}% read`);
```

Use the resulting percentage to update a progress bar or reading indicator.

For a scrollable browser element, the scrollable distance can be calculated using:

```javascript
const totalLength = Math.max(
  0,
  reader.scrollHeight - reader.clientHeight
);

const currentPosition = reader.scrollTop;
```

Here, `reader` is the HTML element containing the text.

## Reading progress and bookmarks

The toolkit includes functions for saving reading positions and managing chapter bookmarks.

### Save reading progress

```javascript
import { saveReadingProgress } from "./src/index.js";

saveReadingProgress(
  "chapter-1",
  450,
  1000,
  localStorage
);
```

This records a reading position for the chapter identified by `chapter-1`.

### Retrieve reading progress

```javascript
import { getReadingProgress } from "./src/index.js";

const progress = getReadingProgress(
  "chapter-1",
  localStorage
);

console.log(progress);
```

Check the returned value before attempting to restore a saved position.

### Save a chapter bookmark

```javascript
import { saveChapterBookmark } from "./src/index.js";

saveChapterBookmark(
  "chapter-1",
  "The Beginning",
  450,
  localStorage
);
```

### Retrieve chapter bookmarks

```javascript
import { getChapterBookmarks } from "./src/index.js";

const bookmarks = getChapterBookmarks(localStorage);

console.log(bookmarks);
```

### Delete a chapter bookmark

```javascript
import { deleteChapterBookmark } from "./src/index.js";

deleteChapterBookmark(
  "chapter-1",
  localStorage
);
```

### Record reading history

```javascript
import { recordReadingHistory } from "./src/index.js";

recordReadingHistory(
  "chapter-1",
  "The Beginning",
  450,
  1000,
  localStorage
);
```

### Retrieve reading history

```javascript
import { getReadingHistory } from "./src/index.js";

const history = getReadingHistory(localStorage);

console.log(history);
```

The consuming application can use this history to display recently read chapters or provide a continue-reading feature.

## Quiz attempts and performance

LearnRead Toolkit also provides functions for recording quiz attempts and summarizing results.

Available functions include:

| Function | Purpose |
|---|---|
| `createQuizAttempt()` | Creates a quiz attempt record |
| `saveQuizAttempt()` | Saves a quiz attempt |
| `getQuizAttempts()` | Retrieves saved quiz attempts |
| `summarizeQuizAttempts()` | Summarizes quiz performance |
| `summarizeLessonProgress()` | Summarizes lesson completion |

A typical application workflow is:

1. Collect the student's answers.
2. Calculate the quiz result.
3. Create an attempt record.
4. Save the attempt.
5. Retrieve attempts when needed.
6. Display performance statistics.

The application controls the quiz interface and decides when an attempt begins and ends.

## Storage and persistence

Several toolkit features can use browser `localStorage` to persist information between page visits.

Examples include reading progress, bookmarks, reading history, quiz attempts, and lesson progress.

### Important considerations

- Browser storage is specific to the browser and origin.
- Clearing browser data can remove locally stored information.
- Data stored in one browser does not automatically synchronize to another device.
- `localStorage` is not a secure database for sensitive information.
- Browser storage does not replace authentication, authorization, or server-side validation.

For applications that need accounts, cross-device synchronization, backups, or shared data, integrate an appropriate backend or database.

Where supported, storage objects can be passed into functions to make testing and integration easier.

## Framework compatibility

The toolkit's core functions are designed to work independently of a specific UI framework.

It can be integrated into applications built with:

- Plain JavaScript and HTML
- React
- Vue
- Other JavaScript frameworks that support compatible module imports

Framework integration examples will be expanded as the project develops.

The toolkit does not require an application to use a particular CSS framework or component library.

## Demo application

The `examples/` directory contains a browser-based demonstration of the toolkit.

The demo illustrates learning and reading features, including:

- Quiz scoring and performance history
- Course lesson progress
- Reading progress indicators
- Saved bookmarks
- Reading history
- Reader text-size controls

The demo is intended to help developers understand how the core functions can be connected to a user interface.

## Documentation

- [API Reference](docs/API.md) — public functions, parameters, and usage.
- [Learning Integration Example](examples/integrations/learning-example.js)
  — quiz scoring, attempts, performance summaries, and course progress.
- [Reading Integration Example](examples/integrations/reading-example.js)
  — reading progress, bookmarks, and reading history.

## Interactive Demo

The interactive demonstration is available in the `examples/` directory.

Main files:

- `examples/index.html`
- `examples/demo.js`
- `examples/styles.css`

The demo illustrates how the toolkit's learning and reading features can be
used together in a browser-based application.

## Testing

The project includes an automated test suite.

Run:

```bash
npm test
```

Run the project's additional checks with:

```bash
npm run check
```

Tests help verify that the toolkit's functions behave as expected and that changes do not unintentionally break existing functionality.

When contributing new features, add tests for normal usage, boundary conditions, and invalid inputs where appropriate.

## Contributing

Contributions, bug reports, suggestions, and documentation improvements are welcome.

A useful contribution workflow is:

1. Explore the existing source code.
2. Identify an issue or improvement.
3. Make a focused change.
4. Add or update tests.
5. Run `npm test`.
6. Run `npm run check`.
7. Submit a pull request with a clear explanation of the change.

Please keep the toolkit lightweight and focused on reusable learning and reading functionality.

## Roadmap

Potential areas of development include:

- More learning and reading integration examples
- Improved API documentation
- Additional automated tests
- TypeScript type definitions
- More framework integration guides
- Improved accessibility guidance
- Better developer onboarding
- Additional reusable educational utilities

Roadmap items may change as the project evolves.

## License

See the repository's `LICENSE` file for the applicable license.

If the project does not yet contain a license file, add one before presenting the repository as formally licensed open-source software.

## Maintainer

**LearnRead Toolkit**

GitHub: https://github.com/alexanderhope06-hp/learnread-toolkit

Built to make common learning and reading features easier to integrate into JavaScript applications.