# Architecture (Current Implementation)

## 1. System Overview
- Product: Post-it Board memo web app
- Frontend repo: `SFOOD-MB-WEB-V1`
- Backend repo: `SFOOD-MB-APP-V1`
- Architecture: decoupled Web UI + REST API + server session auth

```text
Browser (Vite static app)
  -> /api/v1 (fetch + credentials: include)
Backend API (Spring Boot)
  -> PostgreSQL / session tables
```

## 2. Frontend Runtime Architecture
### 2.1 Stack (as implemented)
- Build/dev server: Vite (`vite.config.js`, fixed port usage)
- UI: Vanilla HTML/CSS/JS (no React runtime)
- Editor engine: Quill (`cdn.jsdelivr.net`)
- Auth UI: Google Identity Services (GIS)
- HTTP client: custom `MemoApi.ApiClient` in `src/api.js`

### 2.2 Main files
- `index.html`: screen templates, Google/Quill CDN scripts, app mount
- `styles.css`: layout + memo visual variants + toolbar/palette styles
- `app.js`: state, event orchestration, auth flow, board/memo interactions
- `src/api.js`: API client + local mock adapter
- `src/core.js`: IDs, validation, tree helpers, z-index/zoom helpers
- Runtime wiring in `app.js` is fixed to `new MemoApi.ApiClient("/api/v1")` (real API path).

### 2.3 State model (in-memory)
- `authUser`, `boards`, `memosByBoard`, `selectedBoardId`
- `memoTypes`, `selectedTypeId`, `editingMemoId`
- UI state: `zoom`, `lnbWidth`, drag/drop/pan states

### 2.4 Memo rendering architecture
- Card rendering is template-based (`#memo-card-template`).
- Edit mode uses Quill-only adapter path.
- Toolbar is custom UI but command execution is routed to Quill API.
- Memo color picker:
  - top-left palette icon
  - 5 pastel colors
  - optimistic UI apply, rollback on API failure

### 2.5 Memo type styling architecture
Memo type is interpreted as style variant (not only color):
- Variant A: sharp rectangle (`memo-variant-plain`)
- Variant B: rounded sticky (`memo-variant-sticky`)
- Variant C: lined paper background (`memo-variant-lined`)
- Mapping rule: type list index `% 3`

## 3. Auth / Google Integration
### 3.1 Client ID (current runtime)
- Google OAuth Client ID used by frontend:
`720537531905-4srngg493kr4k2ql4d17e1pq3tvbiick.apps.googleusercontent.com`

### 3.2 Auth flow
1. GIS returns credential JWT
2. Frontend parses JWT payload (`email`, `name`, `picture`)
3. Frontend builds `googleToken = email|name|picture`
4. `POST /api/v1/auth/login`
5. Session cookie maintained by browser (`credentials: include`)
6. `GET /api/v1/auth/me` bootstraps user session

## 4. API Contract Alignment Notes
- Source of truth for frontend API call shapes: `src/api.js` + `app.js` caller payloads
- `PATCH /memos/{memoId}/content` currently sends:
  - `content` (HTML string)
  - `format` object (`textColor`, `fontFamily`, `fontSize`, `memoBgColor`)

## 5. Reliability / Rollback Model
- Optimistic UI updates for interactive actions (board move/delete, memo color, memo content)
- API failure triggers rollback where snapshot is available
- Save debounce: 1 second (`scheduleMemoSave`)

## 6. Known Component Issue (Must Track)
- Issue: memo edit-mode HTML/tag loss for checklist/list mixed markup
- Tracker document:
  - `docs/reports/issues/issue-2026-02-27-memo-edit-html-loss.md`
- Status: Open (user scenario still reproducible)

## 7. Documentation Synchronization Policy (2026-02-27)
To recreate current state reliably, each code-impacting change must update:
1. `docs/reports/change-history.md` (same day append)
2. `docs/test/results/iteration-05-test-result.md` (commands + result)
3. If bug/regression related: `docs/reports/issues/*.md`
4. If API shape changed: `docs/guide/api-spec.md`
5. If runtime flow changed: `docs/guide/architectures.md`

This policy is mandatory for daily “today changes” reflection.
