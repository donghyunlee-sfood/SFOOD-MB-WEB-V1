# Iteration 02 Test Result (WEB)

## Objective
Run live API test against running backend (`localhost:8080`) with real HTTP requests from WEB repo.

## Test File
- `tests/live-api-e2e.sh`

## Key Condition
- Login request includes `googleToken` field.

## Executed Command
- `./tests/live-api-e2e.sh`

## Result
- PASS (`LIVE_API_E2E_OK`)

## Endpoint Results
- PASS `GET /api/auth/me` before login -> 401
- PASS `POST /api/auth/login` with `googleToken` -> 200
- PASS `GET /api/auth/me` after login -> 200
- PASS `GET /api/memo-types` -> 200
- PASS `POST /api/boards` -> 200
- PASS `POST /api/memos` -> 200
- PASS `PATCH /api/memos/{memoId}` -> 200
- PASS `DELETE /api/memos/{memoId}` -> 200
- PASS `DELETE /api/boards/{boardId}` -> 200
- PASS `POST /api/auth/logout` -> 200
- PASS `GET /api/auth/me` after logout -> 401

## Generated Test IDs
- userId: `web-live-user-20260303101156`
- boardId: `web-live-board-20260303101156`
- memoId: `web-live-memo-20260303101156`
