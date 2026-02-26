# Login Network Error Resolution

## Date

- 2026-02-26 (KST)

## Symptom

- 로그인 화면에서 로그인 버튼 클릭 시 `네트워크 오류` 메시지 발생
- Windows에서 `http://localhost:8080/api/v1/auth/login` 직접 호출은 성공

## Root Cause

- 프론트 앱은 `http://localhost:4173`에서 실행되고 API는 `http://localhost:8080`으로 호출하는 교차 출처(Cross-Origin) 구조였음
- 브라우저가 로그인 요청 전에 보내는 CORS preflight(`OPTIONS /api/v1/auth/login`)가 백엔드에서 거부됨
- 실제 확인 응답:
  - Status: `403`
  - Body: `Invalid CORS request`

## Why It Looked Like Network Error

- 브라우저에서 CORS가 차단되면 JavaScript `fetch`는 실제 HTTP 에러를 읽지 못하고 `Failed to fetch` 형태로 처리됨
- UI에서는 이를 네트워크 오류로 표시함

## Fix Applied

1. API 호출 경로를 same-origin으로 전환
- File: `src/api.js`
- Before: `const API_BASE_URL = "http://localhost:8080/api/v1";`
- After: `const API_BASE_URL = "/api/v1";`

2. 개발 서버에 API 프록시 추가
- File: `server.mjs`
- Added: `/api/*` 요청을 `localhost:8080`으로 프록시 전달
- 결과: 브라우저 입장에서 `4173` 동일 출처로 요청되어 CORS preflight 문제 제거

## Verification

1. CORS 원인 확인
- Command: `curl -i -X OPTIONS http://localhost:8080/api/v1/auth/login ...`
- Result: `403 Invalid CORS request`

2. 프록시 적용 후 로그인 호출 확인
- Command:
  - `PORT=4310 node server.mjs`
  - `POST http://localhost:4310/api/v1/auth/login`
- Result: `200 OK` + 정상 로그인 payload 수신

3. 코드 회귀 확인
- `node --check server.mjs && node --check src/api.js` pass
- `npm test` pass

## Operational Note

- 변경 반영을 위해 기존 개발 서버를 중지 후 재시작 필요
  - `Ctrl + C`
  - `npm run dev`

## Remaining Backend Issue (Separate)

- 로그인 문제와 별개로, 현재 백엔드 `GET /boards`는 `500`을 반환할 수 있음
- 로그인 성공 후 보드 로딩 실패가 보이면 백엔드 보드 조회 엔드포인트 점검이 필요함
