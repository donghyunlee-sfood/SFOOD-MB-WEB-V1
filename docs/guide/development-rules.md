# Development Rules

## Core Principles
- Keep changes scoped to iteration goals.
- Prefer small, composable modules over large files.
- Reuse existing utilities before adding new abstractions.
- Fail loudly for invalid states; do not silently ignore errors.

## Frontend Standards
- Use semantic HTML and keyboard-accessible controls.
- Use centralized design tokens in CSS variables.
- Keep mobile-first layouts with responsive breakpoints.
- Separate concerns by file: structure (`index.html`), style (`styles.css`), behavior (`app.js`).

## Data and State
- Use immutable update patterns where practical.
- Validate user input before state persistence.
- Keep memo identifiers unique within a board.

## API Integration
- Align request/response handling with `docs/guide/api-spec.md`.
- Treat API errors by code (`UNAUTHORIZED`, `VALIDATION_ERROR`, `NOT_FOUND`).

## Code Quality
- Use clear naming and short functions.
- Add comments only for non-obvious logic.
- Keep ASCII text unless existing context requires Unicode.

## Documentation Sync (Mandatory)
- Every same-day code change must be appended to `docs/reports/change-history.md`.
- Every same-day verification run must be appended to `docs/test/results/iteration-05-test-result.md`.
- If a bug/regression is found, maintain a dedicated issue file under `docs/reports/issues/`.
- If API payload/response usage changes, update `docs/guide/api-spec.md` in the same change set.
- If runtime flow or component architecture changes, update `docs/guide/architectures.md` in the same change set.
