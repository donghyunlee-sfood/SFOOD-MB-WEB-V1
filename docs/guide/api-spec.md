# API Spec (Frontend)

## 1. Common
- Base URL: `/api/v1`
- Auth: server session cookie (`SESSION`)
- Request transport: `fetch(..., { credentials: "include" })`
- Default request header: `Content-Type: application/json`
- Response envelope:
```json
{
  "success": true,
  "data": {},
  "message": "string",
  "timestamp": "2026-02-27T12:00:00.000Z"
}
```
- Error envelope:
```json
{
  "success": false,
  "errorCode": "UNAUTHORIZED",
  "message": "string",
  "timestamp": "2026-02-27T12:00:00.000Z"
}
```

## 2. Client Runtime Contract
- API client implementation: `src/api.js` (`MemoApi.ApiClient`)
- Path params are URL-encoded (`encodeURIComponent`).
- Success response must be JSON envelope (`success: true`); non-JSON/empty success response is treated as `INVALID_RESPONSE`.
- Error response may be JSON envelope or plain text; plain text errors are surfaced as `HTTP_ERROR` with snippet.
- All memo save/update flows are optimistic in UI; rollback runs on API failure only.

## 3. Auth API
1. `POST /auth/login`
- Request:
```json
{ "googleToken": "user@example.com|User Name|https://image" }
```

2. `GET /auth/me`

3. `POST /auth/logout`

## 4. Board API
1. `GET /boards`

2. `POST /boards`
- Request:
```json
{
  "boardId": "user@example.com_ab12CD34ef",
  "parentBoardId": null,
  "boardName": "Board Name",
  "sortOrder": 101
}
```

3. `PATCH /boards/{boardId}/name`
- Request:
```json
{ "boardName": "Updated Name" }
```

4. `PATCH /boards/{boardId}/move`
- Request:
```json
{ "parentBoardId": null, "sortOrder": 102 }
```

5. `DELETE /boards/{boardId}`
- Logical delete (`isHide`/`is_hide`)

## 5. Memo API
1. `GET /boards/{boardId}/memos`

2. `POST /boards/{boardId}/memos`
- Request:
```json
{
  "memoId": "user@example.com_ab12CD34ef_Xy98Kl76Qp",
  "typeId": "TYPE_BASIC",
  "content": "<p>memo html</p>",
  "posX": 210,
  "posY": 145,
  "width": 320,
  "height": 200,
  "zIndex": 2
}
```

3. `PATCH /memos/{memoId}/content`
- Request:
```json
{
  "content": "<p><strong>html</strong></p><ul><li>row</li></ul>",
  "format": {
    "textColor": "#2a2420",
    "fontFamily": "Georgia, serif",
    "fontSize": "16",
    "memoBgColor": "#FEF3C7"
  }
}
```
- Notes:
  - `content` is stored/sent as HTML string.
  - `format.memoBgColor` is used by memo color picker UI.

4. `PATCH /memos/{memoId}/position`
- Request:
```json
{ "posX": 300, "posY": 220 }
```

5. `PATCH /memos/{memoId}/size`
- Request:
```json
{ "width": 360, "height": 240 }
```

6. `PATCH /boards/{boardId}/memos/zindex`
- Request:
```json
{ "memos": [{ "memoId": "...", "zIndex": 5 }] }
```

7. `DELETE /memos/{memoId}`
- Logical delete (`isHide`/`is_hide`)

## 6. Memo Type API
1. `GET /memo-types`
- Returns memo type metadata (`typeId`, `name/typeName`, `color/defaultColor` aliases tolerated by frontend)

## 7. ID Rules (Current Frontend)
- Board ID: `<accountId>_<random10>`
- Memo ID: `<boardId>_<random10>`
- Random token: URL-safe alphanumeric (see `src/core.js`, tests in `test/core.test.js`)

## 8. Google Sign-In Runtime Input
- Frontend converts Google JWT payload to `googleToken` pipe string:
  - `${email}|${name}|${picture}`
- Implemented in `app.js` (`handleGoogleCredential`, `loginWithToken`)

## 9. Verification Snapshot (2026-02-27)
- Verified by:
  - `node --test test/api-client.test.js`
  - `node test/api.e2e.js`
  - `npm run test`
- Current status: PASS
- E2E includes memo HTML persistence check step: `VerifyMemoContentHtml`

## 10. Known Frontend Issue Tracker Link
- Active component-level issue (edit-mode HTML loss investigation):
  - `docs/reports/issues/issue-2026-02-27-memo-edit-html-loss.md`
