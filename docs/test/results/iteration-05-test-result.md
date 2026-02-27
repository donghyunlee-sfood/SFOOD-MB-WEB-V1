# Iteration 05 Test Result (Live API)

## Re-run Context
- Re-run date: 2026-02-27 09:49:56 KST
- Command: `npm run test:api`
- Purpose: full endpoint-by-endpoint verification after `docs/guide/api-spec.md` update.

## Result Summary
- PASS: Login, Me, GetBoards, CreateBoard, MemoTypes, Logout
- FAIL (500): RenameBoard, MoveBoard, CreateMemo, GetMemos, UpdateMemoContent, UpdateMemoPosition, UpdateMemoSize, UpdateMemoZIndex, DeleteMemo, DeleteBoard

## Raw Endpoint Result
- PASS [200] POST /auth/login
- PASS [200] GET /auth/me
- PASS [200] GET /boards
- PASS [200] POST /boards
- FAIL [500] PATCH /boards/{boardId}/name
- FAIL [500] PATCH /boards/{boardId}/move
- PASS [200] GET /memo-types
- FAIL [500] POST /boards/{boardId}/memos
- FAIL [500] GET /boards/{boardId}/memos
- FAIL [500] PATCH /memos/{memoId}/content
- FAIL [500] PATCH /memos/{memoId}/position
- FAIL [500] PATCH /memos/{memoId}/size
- FAIL [500] PATCH /boards/{boardId}/memos/zindex
- FAIL [500] DELETE /memos/{memoId}
- FAIL [500] DELETE /boards/{boardId}
- PASS [200] POST /auth/logout

## Backend Log Correlation Guide
- During the above test, every endpoint was actually requested to backend (`http://127.0.0.1:8080/api/v1`).
- Verify backend controller log pattern (`API IN - <METHOD> <PATH>`) for each endpoint above.
- If some endpoint has no backend log entry, inspect reverse proxy / route mapping before controller.

## Notes
- Failure message body from backend: `Unexpected error occurred`.
- Next action is backend stacktrace analysis for failing handlers.

## Re-run Context (After backend fix + drag UX patch)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify API endpoints still pass after memo/canvas drag interaction update.

## Result Summary
- PASS: all API endpoints in `test/api.e2e.js`
- PASS: all unit tests in `test/core.test.js` and `test/api-client.test.js`

## Raw Endpoint Result
- PASS [200] POST /auth/login
- PASS [200] GET /auth/me
- PASS [200] GET /boards
- PASS [200] POST /boards
- PASS [200] PATCH /boards/{boardId}/name
- PASS [200] PATCH /boards/{boardId}/move
- PASS [200] GET /memo-types
- PASS [200] POST /boards/{boardId}/memos
- PASS [200] GET /boards/{boardId}/memos
- PASS [200] PATCH /memos/{memoId}/content
- PASS [200] PATCH /memos/{memoId}/position
- PASS [200] PATCH /memos/{memoId}/size
- PASS [200] PATCH /boards/{boardId}/memos/zindex
- PASS [200] DELETE /memos/{memoId}
- PASS [200] DELETE /boards/{boardId}
- PASS [200] POST /auth/logout

## Re-run Context (Detached editor + pointer/drag update)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after memo detached-editor behavior and drag/pointer changes.

## Result Summary
- PASS: all API endpoints in `test/api.e2e.js`
- PASS: all unit tests in `test/core.test.js` and `test/api-client.test.js`

## Re-run Context (Fixed white editor + dblclick entry fix)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after converting to fixed-size white textarea editor and card-level double-click edit trigger.

## Result Summary
- PASS: all API endpoints in `test/api.e2e.js`
- PASS: all unit tests in `test/core.test.js` and `test/api-client.test.js`

## Re-run Context (In-card edit + floating toolbar)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after changing to direct memo editing with memo-follow toolbar.

## Result Summary
- PASS: all API endpoints in `test/api.e2e.js`
- PASS: all unit tests in `test/core.test.js` and `test/api-client.test.js`

## Re-run Context (Toolbar wrap + outside-click complete)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after changing edit-complete condition and two-line toolbar wrap.

## Result Summary
- PASS: all API endpoints in `test/api.e2e.js`
- PASS: all unit tests in `test/core.test.js` and `test/api-client.test.js`

## Re-run Context (White toolbar + optimistic save)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after toolbar theme/alignment update and optimistic memo-save behavior.

## Result Summary
- PASS: all API endpoints in `test/api.e2e.js`
- PASS: all unit tests in `test/core.test.js` and `test/api-client.test.js`

## Re-run Context (Edit-area full height + toolbar UI refine)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after fixing memo edit-area size and refining toolbar layout/wrap.

## Result Summary
- PASS: all API endpoints in `test/api.e2e.js`
- PASS: all unit tests in `test/core.test.js` and `test/api-client.test.js`

## Re-run Context (Quill editor integration)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after replacing editor command engine with Quill while keeping existing memo/toolbar behavior.

## Result Summary
- PASS: all API endpoints in `test/api.e2e.js`
- PASS: all unit tests in `test/core.test.js` and `test/api-client.test.js`

## Re-run Context (Quill content render parity fix)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after fixing persisted Quill list/checkbox markup rendering in memo view mode.

## Result Summary
- PASS: all API endpoints in `test/api.e2e.js`
- PASS: all unit tests in `test/core.test.js` and `test/api-client.test.js`

## Re-run Context (Edit-mode HTML normalize for Quill)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after normalizing existing memo HTML into Quill-compatible structure on edit-mode entry.

## Result Summary
- PASS: all API endpoints in `test/api.e2e.js`
- PASS: all unit tests in `test/core.test.js` and `test/api-client.test.js`

## Re-run Context (Save-time whitespace/blank-line preserve)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after adding HTML normalization for whitespace and empty-block preservation at save-time.

## Result Summary
- PASS: all API endpoints in `test/api.e2e.js`
- PASS: all unit tests in `test/core.test.js` and `test/api-client.test.js`

## Re-run Context (Payload + checkbox HTML verify)
- Re-run date: 2026-02-27
- Command: `node --test test/api-client.test.js`, `node test/api.e2e.js`, `npm run test`
- Purpose: verify frontend sends raw HTML payload for memo content and backend round-trip keeps checkbox HTML.

## Result Summary
- PASS: `ApiClient sends memo content payload as raw HTML string`
- PASS: E2E `VerifyMemoContentHtml` step (GET memos contains `input type=\"checkbox\"`)
- PASS: full `npm run test` (10/10)

## Re-run Context (Checklist ul[data-checked] normalization fix)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after adding checklist `ul[data-checked]` normalization for edit-mode entry/save and memo-click completion boundary fix.

## Result Summary
- PASS: all tests (10/10)

## Re-run Context (Disable checklist->input conversion)
- Re-run date: 2026-02-27
- Command: `node --test test/api-client.test.js`, `npm run test`
- Purpose: verify regression after removing save-time checklist-to-input conversion that could drop checkbox/text content.

## Result Summary
- PASS: all tests (10/10)

## Re-run Context (Disable edit-entry convert path)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after replacing Quill edit-entry `convert()` path with direct HTML paste path.

## Result Summary
- PASS: all tests (10/10)

## Re-run Context (Edit-entry checkbox adapter)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after replacing edit-entry normalize logic with checkbox-focused Quill adapter.

## Result Summary
- PASS: all tests (10/10)

## Re-run Context (Quill-only enforcement)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after removing legacy editor fallback and enforcing Quill-only edit flow.

## Result Summary
- PASS: all tests (10/10)

## Re-run Context (Mixed checkbox parse in edit mode)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after expanding edit-entry adapter for checkbox HTML and symbol-based checklist text.

## Result Summary
- PASS: all tests (10/10)

## Re-run Context (Raw HTML edit-entry load path)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after replacing edit-entry parse/convert path with direct HTML injection path.

## Result Summary
- PASS: all tests (10/10)

## Re-run Context (Memo color picker + type style variants)
- Re-run date: 2026-02-27
- Command: `npm run test`
- Purpose: verify regression after adding memo color palette interaction and type-based forced style variants.

## Result Summary
- PASS: all tests (10/10)
