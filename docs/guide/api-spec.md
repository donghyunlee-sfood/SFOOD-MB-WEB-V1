# API Spec for WEB

## Base
- Base URL: `http://localhost:8080`
- Auth: session cookie (`JSESSIONID`)
- Frontend fetch option: `credentials: include`

## Common Envelope
- Success: `{ success: true, data: ..., error: null }`
- Error: `{ success: false, data: null, error: { code, message, path, timestamp } }`

## Auth
- `POST /api/auth/login`
  - req required: `{ userId, name, googleToken }`
  - example:
    - `{"userId":"google-user@example.com","name":"Google User","googleToken":"<google_jwt_credential>"}`
  - res.data: `{ userId, name }`
- `GET /api/auth/me`
- `POST /api/auth/logout`

## Boards
- `POST /api/boards`
  - req: `{ boardId, name }` (`name <= 20`)
- `GET /api/boards`
- `PATCH /api/boards/{boardId}/name`
- `DELETE /api/boards/{boardId}`
- `PATCH /api/boards/{boardId}/move`
  - Status: currently not available in backend (requirement gap)

## Memo Types
- `GET /api/memo-types`

## Memos
- `POST /api/memos`
  - req: `{ memoId, boardId, memoTypeId, content, x, y, width, height, zIndex }`
- `GET /api/memos?boardId={boardId}`
- `PATCH /api/memos/{memoId}`
- `DELETE /api/memos/{memoId}`

## Frontend ID Generation Rule
- Board ID auto generation: `<userId>_<10-char random>`
- Memo ID auto generation: `<boardId>_<10-char random>`
- Random char set: `A-Z a-z 0-9 !@#$%`

## Error Codes
- `VALIDATION_ERROR` -> 400
- `UNAUTHORIZED` -> 401
- `INVALID_GOOGLE_TOKEN` -> 401
- `BOARD_NOT_FOUND`, `MEMO_NOT_FOUND`, `MEMO_TYPE_NOT_FOUND` -> 404
- `CONFLICT` -> 409
