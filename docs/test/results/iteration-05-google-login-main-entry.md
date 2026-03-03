# Iteration 05 Google Login Main Entry Validation

- Time: 2026-03-03 10:52:33 KST
- Base URL: http://localhost:8080
- Client ID: 720537531905-4srngg493kr4k2ql4d17e1pq3tvbiick.apps.googleusercontent.com

## UI Contract Checks
- PASS: 로그인 화면 Google Client ID 기본값 반영
- PASS: Google 초기화/로그인 버튼 존재
- PASS: Google 버튼 이벤트와 로그인 핸들러 연결

## Live API Flow Check
- PASS: Google 토큰 기반 login -> me -> boards -> logout API 플로우 통과

## Flow Output

```
BASE_URL=http://localhost:8080
USER_ID=google-flow-user-20260303105233@example.com
[PASS] POST /api/auth/login with googleToken status=200
[PASS] login response has userId
[PASS] GET /api/auth/me status=200
[PASS] me response has userId
[PASS] GET /api/boards after login status=200
[PASS] board initialization check count=1
[PASS] POST /api/boards status=200
[PASS] POST /api/auth/logout status=200
GOOGLE_LOGIN_PROCESS_CHECK_OK
```
