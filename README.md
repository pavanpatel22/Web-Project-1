# Activity Tracker Widget

## Overview

Build an **Activity Tracker Widget** using **only HTML, CSS and Vanilla JavaScript**. The widget must track user activity (page views, button clicks, form submissions) and display them in a **timeline** widget that can expand/collapse.

This specification is deliberately **exact** about class names, text labels, formats and behavior so the implementation will pass the provided Playwright tests.

-----

## Getting Started and Project Setup 

This assignment requires the use of Git for version control. You must set up your local development environment by **forking** the provided template repository. Adhering to this process and the required file structure is mandatory.

### 1\. Version Control Setup 

You must use Git and GitHub to manage your project. **Do not clone an empty repository.**

1.  **Fork the Template:** Navigate to the provided GitHub template repository URL and click the **"Fork"** button. This creates a complete copy of the template in your own GitHub account. 
2.  **Clone Your Fork Locally:** Use the `git clone` command to download your personal fork to your local machine. This creates your root project directory:
    ```bash
    # Replace <your-fork-url> with the URL of the repository you just forked
    git clone <your-fork-url>
    cd activity-tracker
    ```
3.  **Establish Upstream (Optional but Recommended):** To pull updates from the original template repository (if the instructor ever pushes fixes), add an "upstream" remote:
    ```bash
    git remote add upstream <original-template-repo-url>
    ```
4.  **Initial Status Check:** The template should already contain the required file structure (`activity-tracker.js`, `activity-tracker.css`, and the `/demo` folder). Verify the files are present before proceeding.

### 2\. Project Directory Structure (Required)

Your cloned repository **must** contain the following files and directories exactly as named:

```
/activity-tracker (Your Git root)
|
├── activity-tracker.js     <-- Your core JavaScript logic
├── activity-tracker.css    <-- Your CSS stylesheet
|
└── /demo
    ├── index.html          <-- Primary testing page (Homepage)
    └── products.html       <-- Secondary testing page (Navigation test)
```

### 3\. Local Web Server Installation (Required for Testing)

To properly test the **cross-page persistence** via `localStorage`, you **cannot** open the files directly using the `file://` protocol. You must run a local web server.

  * **VS Code Users:** Install the **Live Server** extension. Right-click on `demo/index.html` and select "Open with Live Server."

### 4\. Code Implementation Start

1.  **HTML Verification:** Ensure that all `demo/` pages have the required widget container, the target button, and correct links to your assets.
2.  **JavaScript Initialization:** Begin implementing your logic inside the provided `ActivityTracker` class in `activity-tracker.js`, ensuring it is instantiated on `DOMContentLoaded`.
3.  **Commit Your Work:** Commit frequently\! Every time you implement a new feature (e.g., persistence, click tracking), commit and push your changes.
    ```bash
    git add .
    git commit -m "FEAT: Implemented localStorage persistence logic"
    git push origin main
    ```

---

## Implementation Requirements

This project is a strict test of compliance and functionality. Students **must** implement the following core requirements exactly as specified in the technical document:

### 1. Data Persistence and Session Management (Mandatory Logic)

* **Cross-Page Persistence:** The entire session state (events, stats, etc.) **must** be stored in and restored from **`localStorage`** using a key like `activity-tracker-data`.
* **Session ID Generation:** A unique `Session ID` must be generated upon the first load, following the exact format: `session_<digits>_<alphanum>` (e.g., `session_1727895123456_ab12cd`). This section is invalidated after 1 hour of inactivity from the user. Upon returning to the page after this time a new session and new events should be stored.
* **Immediate Updates:** `localStorage` must be updated **immediately** after every tracked event (page view, click, form submission).

### 2. Event Tracking and Statistics (Mandatory Functionality)

* **Page View Tracking:** Automatically record a page view event on every page load. The event details must include the page name (e.g., `Visited: products.html`).
* **Targeted Click Tracking:** A single, delegated event listener must detect clicks on elements with the **exact class `.btn-primary`**. This must increment **`Total Clicks`** and create a specific timeline entry including the exact substring: `Clicked link: Shop Now`.
* **Form Submission Tracking:** Detect and record the submission of **any** `<form>` element, which must increment **`Forms Submitted`** and add an interaction entry.
* **Statistic Rendering:** The four session statistics (`Session Duration`, `Pages Viewed`, `Total Clicks`, `Forms Submitted`) must be rendered in the **exact specified order** and format within the `.session-stats` container.

### 3. DOM Structure and Presentation (Mandatory Compliance)

* **Exact HTML Structure:** The widget must render the **required HTML structure and class hierarchy** for the header, stats, and timeline (e.g., `.activity-tracker-widget` containing `.activity-tracker-timeline`, which in turn contains `.timeline-header`, etc.).
* **Timeline Toggle:** Clicking the `.activity-tracker-button` must **only** add or remove the class **`.expanded`** from the `.activity-tracker-timeline` element.
* **Fixed Scrollability:** The element with class `.timeline-content` **must** have the exact required CSS properties: `overflow-y: auto` and `max-height: 350px`.
* **Timestamp Format:** All timestamps (in the header and in timeline items) must use the 24-hour format: **`HH:MM:SS`**.

### 4. Code Quality (Mandatory Best Practices)

* **Class Structure:** The primary logic **must** be encapsulated within the **`ActivityTracker` class** and instantiated on `DOMContentLoaded`.
* **Event Delegation:** Use the recommended method of attaching a single listener high in the DOM tree for tracking user interactions, rather than attaching many individual listeners.
* **Best practices:** The code should follow the best practices discussed in class, as well as follow modern Javascript code standards.

---

## Required file structure

- `activity-tracker.js` — main script (should define `ActivityTracker` class and instantiate it on DOM ready).
- `activity-tracker.css` — stylesheet (inline `<style>` is allowed if the CSS rules are identical).
- `demo/index.html` — homepage for testing.
- `demo/products.html` — secondary page for navigation tests.

Both demo pages must:

- Load `activity-tracker.js`.
- Immediately render an element with class `.activity-tracker-widget`.
- Contain the button shown below (exact class and text):

```html
<button class="btn-primary">Shop Now</button>
```

---

## Required HTML structure (must be present exactly)

The widget must render the following structure on every page (class names and hierarchy are required):

```html
<div class="activity-tracker-widget">
  <button class="activity-tracker-button" aria-label="Open activity timeline">
    🕒
  </button>

  <aside class="activity-tracker-timeline">
    <header class="timeline-header">
      <h3>Activity Timeline</h3>
      <div>
        <div>Session ID: session_1234567890_ab12cd</div>
        <div>Started: 14:22:18</div>
      </div>
    </header>
    <section class="session-stats">
      <div class="stat">
        <div class="stat-label">Session Duration</div>
        <div class="stat-value">0 min</div>
      </div>
      <div class="stat">
        <div class="stat-label">Pages Viewed</div>
        <div class="stat-value">1</div>
      </div>
      <div class="stat">
        <div class="stat-label">Total Clicks</div>
        <div class="stat-value">0</div>
      </div>
      <div class="stat">
        <div class="stat-label">Forms Submitted</div>
        <div class="stat-value">0</div>
      </div>
    </section>

    <div class="timeline-content">
      <div class="timeline-wrapper">
        <!-- timeline-item entries appended here -->
        <div class="timeline-item pageview">
          <div class="time">14:22:20</div>
          <div class="event-title">Page View</div>
          <div class="event-details">Visited: index.html — 45% viewed</div>
        </div>
      </div>
    </div>
  </aside>
</div>
```

---

## Required class/content rules (exact expectations)

### Widget and button

- `.activity-tracker-widget` must always exist in the DOM.
- `.activity-tracker-button` toggles the timeline visibility.
- When open, `.activity-tracker-timeline` **must have** the class `.expanded`.

### Timeline header

- The header must contain a `<h3>` with the text **Activity Timeline**.
- The header must include exactly two `<div>` elements (direct children of the header's inner `<div>`):

  1. `Session ID: session_<digits>_<alphanum>` (example: `Session ID: session_1727895123456_ab12cd`). The regex the tests expect: `session_\d+_\w+`.
  2. `Started: HH:MM:SS` (example: `Started: 14:22:18`). The regex the tests expect: `Started: \d{1,2}:\d{2}:\d{2}`.

### Session statistics

- `.session-stats` must contain **exactly four** `.stat` elements.
- The **order and exact label text** must be:

  1. `Session Duration` — value like `0 min` (must match `\d+ min`).
  2. `Pages Viewed` — numeric value.
  3. `Total Clicks` — numeric value.
  4. `Forms Submitted` — numeric value.

- Each `.stat` must contain `.stat-label` and `.stat-value` sub-elements.

### Timeline content

- `.timeline-content` must have these CSS properties:

```css
.timeline-content {
  overflow-y: auto;
  max-height: 350px;
}
```

- `.timeline-wrapper` contains `.timeline-item` entries.
- Each `.timeline-item` (including pageviews and interactions) must include:

  - `.time` — format `HH:MM:SS` (24-hour). Tests accept `HH:MM` or `HH:MM:SS`, but prefer `HH:MM:SS`.
  - `.event-title` — e.g. `Page View`, `Interaction`.
  - `.event-details` — descriptive string (for example `Clicked link: Shop Now`).

Example interaction entry (exact phrase included in tests):

```html
<div class="timeline-item interaction">
  <div class="time">14:23:01</div>
  <div class="event-title">Interaction</div>
  <div class="event-details">Clicked link: Shop Now</div>
</div>
```

### Searchable text

- Timeline content must include words such as `button`, `click` or `interaction` when user actions occur — tests run a regex match like `/button|click|interaction/i`.

---

## Required behavior and logic (must implement)

### Timeline toggle

- Clicking `.activity-tracker-button` must add/remove the class `.expanded` on `.activity-tracker-timeline`.

### Event tracking

You must detect and record the following events **immediately** (or within 500ms):

1. **Page view**

   - Automatically record on page load.
   - Create a `.timeline-item.pageview` with `.event-details` that includes the page name (e.g. `Visited: products.html`).

2. **Button click**

   - Clicking `.btn-primary` must:

     - Append a `.timeline-item.interaction`.
     - Increment `Total Clicks` in `.session-stats`.
     - Include `.event-details` with the exact substring: `Clicked link: Shop Now`.

3. **Form submission**

   - Submitting any `<form>` must increment `Forms Submitted` and add an `.interaction` entry.

### Statistics update rules

- Update session stats after each relevant event:

  - `Total Clicks` — increment on button/link clicks.
  - `Pages Viewed` — increment on page loads (persisted across pages).
  - `Forms Submitted` — increment when forms are submitted.
  - `Session Duration` — display minutes since session start, in the format `\d+ min`.

### Timestamp format

- Use `HH:MM:SS` (24-hour) for all timestamps in header and timeline items.

### CSS scrollability

- `.timeline-content` must have `overflow-y: auto` and `max-height: 350px`.

---

## Persistence (mandatory)

- Use `localStorage` with a key like `activity-tracker-data` to persist session data between `index.html` and `products.html`.
- Recommended data format (JSON):

```js
{
    "sessionId": "session_1727895123456_ab12cd",
    "startedAt": 1727895123456,
    "events": [
        { "type": "pageview", "page": "index.html", "time": 1727895123456 },
        { "type": "interaction", "details": "Clicked link: Shop Now", "time": 1727895130000 }
    ]
}
```

- On page load, the script must:

  - Read `localStorage` key.
  - If present, reload the timeline and stats from stored data.
  - Continue writing new events into the same store.

---

## Test compliance checklist (mapping to Playwright tests)

- **Timeline header information**

  - `.activity-tracker-button` toggles `.expanded` on `.activity-tracker-timeline`.
  - `<h3>` contains `Activity Timeline`.
  - First header div contains `Session ID: session_\d+_\w+`.
  - Second header div contains `Started: HH:MM:SS`.

- **Activity tracking display**

  - Clicking `.btn-primary` adds `.timeline-item.interaction` and updates DOM.
  - `.timeline-wrapper` contains text matching `button|click|interaction`.

- **Session statistics display**

  - `.session-stats` exists and has 4 `.stat` items in required order and labels.
  - `Total Clicks` increments when `.btn-primary` is clicked.
  - `Session Duration` matches `\d+ min`.
  - `Pages Viewed` increases after navigation.

- **Timeline content scrolling**

  - `.timeline-content` has `overflow-y: auto` and `max-height: 350px`.

- **Page navigation tracking**

  - Clicking a link to `products.html` registers a pageview entry containing `page|view|products`.

- **Button click timeline entries**

  - The number of `.timeline-item` entries increases after clicking `.btn-primary`.
  - The added `.timeline-item` has `.event-title` containing `Interaction` and `.event-details` containing `Clicked link: Shop Now`.

- **Persistence**

  - Events persist across navigation via `localStorage` and reappear after page load.

- **Timestamps**

  - `.timeline-item .time` matches `\d{1,2}:\d{2}(:\d{2})?` (prefer `HH:MM:SS`).

---

## Implementation recommendations

- JS class skeleton recommendation:

```js
class ActivityTracker {
  constructor() {
    /* generate sessionId, startedAt, load store, render */
  }
}

document.addEventListener("DOMContentLoaded", () => new ActivityTracker());
```

- Generate session ID like:

```js
`session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
```

- Use event delegation for capturing clicks:

```js
document.addEventListener(
  "click",
  (e) => {
    /* detect .btn-primary and links */
  },
  true
);
```

- Update DOM and `localStorage` immediately after each event (within 500ms at most).
- Ensure the `.activity-tracker-timeline` gets the `expanded` class when toggled.

---

## Summary

Follow this specification exactly. The Playwright tests will fail if: class names differ, label text does not match, CSS rules for `.timeline-content` differ, timestamp formats differ, Session ID format differs, or `localStorage` persistence is missing.

## Grading
| Grade | Completeness: Is the project fulfilling all the technical specifications?                                                                                                                                                                                      | Correctness: Are the test passing and the logic correct?                                                                                                                                                                                                                 | Maintainability: Is the code documented, organized, and follow best practices discussed in class?                                                                                                                                                                                                              | Performance: Is the code efficient?                                                                                                                                                                                                                                                |
|-------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| A     | 100% of the required HTML structure, class names, content, and CSS properties are implemented exactly as specified. All required features (page view, button click, form submit tracking, persistence) are present and fully functional.                       | All logic is flawless and all implicit Playwright tests would pass. Timestamps, Session ID format, statistic updates, and localStorage persistence are perfectly implemented. No logical errors or race conditions are present in event handling.                        | Exemplary code structure (e.g., proper class encapsulation, clear separation of concerns). Code is well-documented with clear function/method docstrings and inline comments where necessary. Follows all established best practices (e.g., event delegation, DOM manipulation optimization).                  | Highly optimized. DOM manipulation is batched or minimized (e.g., appending a single new node instead of re-rendering large sections). Event handlers are efficient. The tracking mechanism introduces negligible performance overhead (< 50ms) to page load and user interaction. |
| B     | Nearly complete. One or two minor deviations from the specification (e.g., a non-critical CSS property is missing, one optional timestamp format is slightly off). All core required features are present and functional.                                      | Mostly correct. All major features work, but there may be one minor, non-critical logical issue (e.g., a small edge case in duration calculation, one statistic update lagging slightly). All specified regex patterns for content still pass.                           | Good, professional-level code. The class structure is sound, and the code is generally easy to follow. Adequate documentation is provided, though some minor sections may lack detailed explanation or the documentation style is inconsistent.                                                                | Generally efficient. DOM updates are performed reasonably, and the script does not cause noticeable lag. The event detection and handling is efficient, but could be slightly better optimized in one area (e.g., an unnecessary DOM traversal).                                   |
| C     | Mostly complete, but with several noticeable deviations. Lacks one key requirement (e.g., Form Submission tracking is missing or improperly implemented) OR multiple minor structural/content errors (e.g., incorrect order of stats, one missing class name). | Correct, but with critical flaws. Major logical error in one core area (e.g., Persistence is partially broken across pages, Session Duration is calculated incorrectly). Some Playwright tests for a specific feature would fail.                                        | Functional, but disorganized. The implementation works, but the class structure may be weak, or the code is monolithic. Minimal or inconsistent documentation; understanding the flow requires significant effort. Best practices are sometimes ignored (e.g., direct DOM manipulation inside event handlers). | Acceptable performance. No major slowdowns, but DOM updates are inefficient (e.g., repeated, direct innerHTML updates). The code could be refactored to significantly improve execution speed in one or two key areas.                                                             |
| D     | Incomplete. Missing two or more core required features (e.g., no persistence, only tracks Page Views). Significant structural errors (e.g., the entire header is missing elements, incorrect widget hierarchy) that violate the exact specification.           | Substantially flawed logic. Multiple core statistics (e.g., Clicks, Pages) are counted incorrectly. The widget frequently breaks or fails to record events. Critical failures in data storage (e.g., using sessionStorage instead of localStorage or no storage at all). | Poorly organized and difficult to maintain. Lack of a cohesive structure (e.g., many global variables, DOM queries repeated). Documentation is absent or misleading. No adherence to best practices, making debugging challenging.                                                                             | Slow. The widget's execution causes a noticeable delay in user interaction or page load. Inefficient event handling or excessive, synchronous DOM operations severely impact the user experience.                                                                                  |
| E     | Severely incomplete. The rendered widget is barely recognizable as the one specified. More than half of the required elements, classes, or content are missing or incorrect.                                                                                   | Non-functional. The script throws frequent errors, and the main features (toggling, tracking) do not work as intended. The persisted data is unreadable or corrupts the timeline upon reload.                                                                            | Unstructured "Spaghetti Code." The code is a single, large block of logic with no proper class or function separation. Impossible to follow without significant refactoring.                                                                                                                                   | Unacceptable performance. The page freezes or is unresponsive when the script loads or an event is triggered.                                                                                                                                                                      |
| F     | Submission is not present or non-attempt. No files submitted, or the submitted code does not even attempt to implement the specified Activity Tracker widget.                                                                                                  | No functional logic present.                                                                                                                                                                                                                                             | Code is not present or is an irrelevant submission.                                                                                                                                                                                                                                                            | Code is not present or is an irrelevant submission.                                                                                                                                                                                                                                
