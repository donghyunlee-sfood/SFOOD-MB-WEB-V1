# Backend API Error Report (2026-02-27)

## Purpose
Capture API failures to hand off to backend team when errors occur.

## Current Re-test Result
- Command: `npm run test:api`
- Result: PASS (all endpoints)
- Timestamp: 2026-02-27 (KST)

## Endpoint Verification (All PASS)
- POST `/api/v1/auth/login`
- GET `/api/v1/auth/me`
- POST `/api/v1/auth/logout`
- GET `/api/v1/boards`
- POST `/api/v1/boards`
- PATCH `/api/v1/boards/{boardId}/name`
- PATCH `/api/v1/boards/{boardId}/move`
- DELETE `/api/v1/boards/{boardId}`
- GET `/api/v1/boards/{boardId}/memos`
- POST `/api/v1/boards/{boardId}/memos`
- PATCH `/api/v1/memos/{memoId}/content`
- PATCH `/api/v1/memos/{memoId}/position`
- PATCH `/api/v1/memos/{memoId}/size`
- PATCH `/api/v1/boards/{boardId}/memos/zindex`
- DELETE `/api/v1/memos/{memoId}`
- GET `/api/v1/memo-types`

## Notes for Backend Handoff (If Issue Reappears)
- Use `npm run test:api` to reproduce full flow.
- Correlate by board id pattern: `b_<timestamp>_e2e`.
- Check controller entry logs and exception stack traces for the matching request time.
