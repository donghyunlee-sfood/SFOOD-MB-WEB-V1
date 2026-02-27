# Iteration 01 Plan

## Objective
Build a working memo web site MVP aligned with `api-spec.md`, `architectures.md`, and `requirements.md` for core board/memo behavior.

## Constraints
- Keep to memo website core scope for Iteration 01.
- Exclude explicitly forbidden features (search, sort, attachments, import/export, settings).
- Keep architecture simple and maintainable in current empty repository.

## Step Plan
1. Planning and analysis artifacts
- Create feature analysis document for step-1 scope and risks.
- Define data model and UX flow for board/memo CRUD.

2. Foundation implementation
- Create static frontend app structure (`index.html`, `styles.css`, `app.js`).
- Add mobile-first layout and centralized design tokens.

3. Feature implementation (core)
- Board: list/select/create/rename/delete.
- Memo: create/edit/auto-save/delete.
- Persistence: localStorage state read/write and restore.

4. Quality and testing
- Add unit tests for pure logic in separate module.
- Write test result documentation.
- Execute `npm test` and smoke check command.

5. Iteration reporting
- Record delivered scope and known gaps.

## Definition of Done for Iteration 01
- Memo website runs locally in browser.
- Core board/memo workflows are operational.
- Tests pass and test report is documented.
