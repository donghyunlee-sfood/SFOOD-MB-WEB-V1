# Operations Guide

## 1) Development Run

1. Install dependencies
- `npm install`

2. Run app
- `npm run dev`
- Open `http://localhost:4173`

3. Backend prerequisite
- API server must be running at `http://localhost:8080/api/v1`
- Session header: `X-Session-Token`

## 2) Validation Flow

1. Unit tests
- `npm test`

2. Runtime smoke check
- `timeout 3s npm run dev`
- Confirm startup log is printed

3. Manual critical path
- Login -> board CRUD -> memo create/edit/delete
- Drag memo -> resize memo -> Ctrl+Wheel zoom
- Induce API failure and verify retry button and rollback message

## 3) Failure Handling

- If an API action fails, error message is shown in UI.
- If retry is available, click `재시도` button for the failed action.
- For memo autosave/position/size failure, state rolls back to previous snapshot.

## 4) Release Checklist

- `npm test` passes
- UI smoke check passes
- `docs/guide/test-phase*.md` execution result updated
- `docs/guide/release-notes.md` updated
