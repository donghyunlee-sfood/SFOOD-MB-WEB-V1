# Change History

## 2026-02-27
- Added live API E2E test script and command.
- File: `test/api.e2e.js`
- File: `package.json` (`test:api`)
- Summary: endpoint-by-endpoint API verification (auth/board/memo/memo-type/logout).

- Hardened API path handling and ID safety.
- File: `src/api.js`
- File: `src/core.js`
- File: `test/api-client.test.js`
- File: `test/core.test.js`
- Summary: URL-encoded path params, URL-safe generated IDs, regression tests.

- Refactored board create/rename UX in LNB.
- File: `app.js`
- Summary: inline board draft row, API-first board creation, rollback on failure, rename submit lock.

- Added Vite dev/preview scripts and fixed-port execution.
- File: `package.json`
- File: `vite.config.js`
- Summary: `dev/build/preview` scripts, strict port behavior, API proxy support.

- Added Google sign-in integration flow and fixed OAuth login UI.
- File: `index.html`
- File: `app.js`
- Summary: GIS script integration, credential callback parsing, API login handoff.

- Switched app to real API mode for runtime flows.
- File: `app.js`
- File: `index.html`
- Summary: removed local mode selector from UI flow, fixed client ID usage.

- Upgraded notification UI and confirmation dialogs.
- File: `index.html`
- File: `styles.css`
- File: `app.js`
- Summary: typed notice component (`success/error/warn/info`), custom center confirm modal replacing native confirm.

- Reworked main layout and toolbar placement.
- File: `index.html`
- File: `styles.css`
- File: `app.js`
- Summary: moved user info to LNB footer, icon-based actions, fixed-bottom memo toolbar, reduced viewport flicker on refresh.

- Fixed memo-type visual mapping from backend fields.
- File: `app.js`
- Summary: support for `typeName`/`defaultColor` and additional alias keys, color normalization and fallback.

- Fixed memo edit completion and autosave trigger behavior.
- File: `app.js`
- Summary: commit on blur, Esc, Cmd/Ctrl+Enter, single completion guard.

- Improved board drag-drop behavior and responsiveness.
- File: `app.js`
- File: `styles.css`
- Summary: drop-line indicator, optimistic local move before API, async API call, rollback on error, before/after drop positioning including top-level ordering.

- Improved board delete behavior with optimistic UI and rollback.
- File: `app.js`
- Summary: immediate local hide/delete visualization, API call after UI change, full rollback on failure.

- Updated documentation artifacts across iterations.
- Files:
  - `docs/plan/iteration/iteration-01-plan.md`
  - `docs/plan/iteration/iteration-02-plan.md`
  - `docs/plan/iteration/iteration-03-plan.md`
  - `docs/plan/iteration/iteration-04-plan.md`
  - `docs/plan/iteration/iteration-05-plan.md`
  - `docs/reports/iteration-01-analysis.md`
  - `docs/reports/iteration-01-result.md`
  - `docs/reports/iteration-02-analysis.md`
  - `docs/reports/iteration-02-result.md`
  - `docs/reports/iteration-03-analysis.md`
  - `docs/reports/iteration-03-result.md`
  - `docs/reports/iteration-04-analysis.md`
  - `docs/reports/iteration-04-result.md`
  - `docs/reports/iteration-05-analysis.md`
  - `docs/reports/iteration-05-result.md`
  - `docs/reports/backend-api-error-report-2026-02-27.md`
  - `docs/test/results/iteration-01-test-result.md`
  - `docs/test/results/iteration-02-test-result.md`
  - `docs/test/results/iteration-03-test-result.md`
  - `docs/test/results/iteration-04-test-result.md`
  - `docs/test/results/iteration-05-test-result.md`
- Summary: plan/analysis/test/result evidence for each iteration.

- Improved memo/card drag usability and canvas pan interaction.
- File: `app.js`
- File: `styles.css`
- Summary: non-editing memo can be dragged from whole card (not only handle), drag cursor state (`is-dragging`) applied, and board background supports right-click hold pan with hand cursor behavior.

- Updated memo edit UX and drag interaction behavior.
- File: `index.html`
- File: `styles.css`
- File: `app.js`
- Summary: removed memo top move-handle icon, changed canvas cursor to arrow except while right-click pan is active, added drag threshold to preserve memo double-click, and introduced detached editor panel shown below memo with same dimensions.

- Refined memo delete/edit UX and standardized detached editor.
- File: `index.html`
- File: `styles.css`
- File: `app.js`
- Summary: changed delete button from text to icon, fixed double-click entry to edit mode at card level, replaced memo-size-linked editor with a single white fixed-width rectangle editor, and hide editor immediately when edit mode completes.

- Reworked memo edit mode to in-card editing with follow toolbar.
- File: `index.html`
- File: `styles.css`
- File: `app.js`
- Summary: changed delete icon again, removed detached textarea editor, restored direct memo content editing on double-click, and rendered a horizontal floating editor toolbar right below the memo that follows memo position while editing.

- Adjusted edit-mode completion trigger, color consistency, and toolbar layout.
- File: `styles.css`
- File: `app.js`
- Summary: kept memo edit background and follow toolbar color consistent with memo, removed blur-based auto-complete (complete only on outside click / Done / Ctrl+Enter), and switched floating toolbar to wrapped two-line layout instead of horizontal scroll.

- Updated toolbar white theme, alignment, and optimistic save behavior.
- File: `styles.css`
- File: `app.js`
- Summary: forced floating editor toolbar background to white, aligned toolbar controls with consistent component height/label structure, added edit-mode visual border on memo/content area, and changed save flow to keep UI state immediately while API sync runs in background (rollback only on error).

- Fixed edit-area full-size rendering and refined toolbar composition.
- File: `styles.css`
- File: `app.js`
- Summary: made memo edit/view area fill full memo height to remove bottom color mismatch, adjusted floating toolbar width range for cleaner 2-line wrapping, and improved toolbar visual grouping/alignment for better readability.

- Integrated free Quill editor engine while preserving current memo UX flow.
- File: `index.html`
- File: `styles.css`
- File: `app.js`
- Summary: added Quill CDN assets, replaced `execCommand`-based edit actions with Quill API, preserved double-click in-place edit and memo-follow toolbar behavior, and added style overrides so Quill container fits existing memo layout.

- Fixed persisted list/checkbox rendering after reload.
- File: `app.js`
- File: `styles.css`
- Summary: applied Quill display class (`ql-editor`) to memo view mode so Quill-generated list/checkbox markup renders correctly after API round-trip.

- Fixed edit-mode formatting loss when loading existing memo HTML.
- File: `app.js`
- Summary: normalized incoming memo HTML into Quill-compatible list/checklist structure before editor load, added escaped-HTML decode handling, and changed checkbox toolbar action to Quill checklist command to preserve structure across edit/save cycles.

- Improved HTML persistence for blank lines and spaces at save-time.
- File: `app.js`
- Summary: added save-time HTML normalization to preserve empty blocks (`<br>`), consecutive spaces (`&nbsp;`), and remove zero-width artifacts before API submission.

- Added payload verification tests and checklist HTML persistence coverage.
- File: `test/api-client.test.js`
- File: `test/api.e2e.js`
- File: `app.js`
- Summary: added unit test validating raw HTML is sent in `updateMemoContent`, added E2E step to verify checkbox HTML round-trip from API, and converted Quill checklist rows to explicit checkbox HTML before save.

- Fixed Quill checklist re-entry parsing and edit-complete click boundary.
- File: `app.js`
- Summary: added normalization for `ul[data-checked]` checklist HTML when entering edit mode, converted that format at save-time too, and prevented edit completion when clicking memo cards while editing.

- Removed checklist-to-input save conversion that caused content loss.
- File: `app.js`
- Summary: stopped converting checklist `li[data-list]` rows into `<input type=\"checkbox\">` blocks at save-time and kept Quill structural markup to prevent checkbox/text disappearance before API persistence.

- Removed edit-entry Delta conversion to prevent HTML format loss.
- File: `app.js`
- Summary: stopped passing memo HTML through `quill.clipboard.convert()` on edit-mode entry and switched to direct `dangerouslyPasteHTML` load so existing tags/structure are preserved while editing.

- Rebuilt edit-entry HTML adapter for checkbox compatibility.
- File: `app.js`
- Summary: replaced broad edit-entry normalization with targeted adapter that converts persisted checkbox HTML (`input[type=checkbox]`, `ul[data-checked]`) into Quill checklist-compatible markup before editor load, preventing format/text loss when entering input mode.

- Enforced Quill-only editor mode by removing legacy fallback path.
- File: `app.js`
- Summary: removed non-Quill editing path, blocked edit-mode entry when Quill is unavailable, and kept runtime strictly on Quill adapter flow.

- Improved edit-entry checklist parsing for mixed checkbox formats.
- File: `app.js`
- Summary: switched Quill load path to `clipboard.convert + setContents`, and expanded edit-entry adapter to convert both HTML checkbox tags and text markers (`☐`, `☑`) into Quill checklist blocks to preserve structure in input mode.

- Switched edit-entry load strategy to raw HTML injection.
- File: `app.js`
- Summary: bypassed Quill HTML re-interpretation path on edit-mode entry by loading memo HTML directly into editor root and updating Quill state, preventing tag flattening/loss reported during edit-mode transitions.

- Consolidated memo input-mode HTML-loss workstream into one issue record.
- File: `docs/reports/issues/issue-2026-02-27-memo-edit-html-loss.md`
- Summary: grouped symptoms, scope, related changes, findings, and next actions for the checklist/list/edit-mode formatting loss issue.

- Added memo color picker and forced 3-style memo variants by type.
- File: `index.html`
- File: `styles.css`
- File: `app.js`
- Summary: added top-left color icon with horizontal pastel palette (optimistic apply + API persist/rollback), and mapped memo types to three visual variants (sharp rectangle, rounded sticky, lined-paper background) independent of color.

- Synchronized guide documents with current implementation and API runtime.
- File: `docs/guide/api-spec.md`
- File: `docs/guide/architectures.md`
- File: `docs/guide/requirements.md`
- File: `docs/guide/development-rules.md`
- File: `docs/guide/testing-strategy.md`
- File: `docs/guide/done-criteria.md`
- Summary: aligned documented API contracts to real frontend calls (`src/api.js`), documented active Google OAuth client ID wiring and session mapping, added docs synchronization policy for same-day auto-update of change/test/issue records, and explicitly linked the memo component failure issue (`issue-2026-02-27-memo-edit-html-loss.md`) as a tracked open problem.
