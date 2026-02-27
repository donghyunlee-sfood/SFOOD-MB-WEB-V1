# Testing Strategy

## Test Levels
- Unit tests: pure utility logic (ID generation, validation, ordering).
- Integration-like smoke tests: app bootstrap and key user flows in browser.
- Manual UX checks: responsive layout and keyboard/mouse interactions.

## Required Checks Per Iteration
- Run `npm test`.
- Run a local smoke check for app startup behavior.
- Record command, result, and notes in `docs/test/results/iteration-XX-test-result.md`.

## Scope for Iteration 01
- Memo create, edit, delete.
- Persistence to browser storage.
- Board create/select/delete.
- Basic visual and responsive checks.

## Current Regression Focus (2026-02-27)
- API payload integrity: memo `content` must be sent as HTML string without client-side flattening.
- Edit-mode rendering parity: checklist/list/line-break HTML must not collapse when entering memo input mode.
- If edit-mode parity fails in manual test, record details in:
  - `docs/reports/issues/issue-2026-02-27-memo-edit-html-loss.md`
