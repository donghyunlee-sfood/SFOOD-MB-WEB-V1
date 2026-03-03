# Iteration 06 Test Result (WEB)

## Executed Commands
1. `npm run test`
- Result: PASS (`smoke-test:ok`)

2. `npm run test:matrix`
- Result: PASS (script completed)
- Matrix file: `docs/test/results/iteration-06-feature-matrix.md`

3. `npm run test:google-main`
- Result: PASS (`GOOGLE_LOGIN_MAIN_ENTRY_VALIDATION_OK`)
- Result file: `docs/test/results/iteration-06-google-login-main-entry.md`

## Validation Summary
- PASS: 로그인/로그아웃/세션 차단, 보드 등록/수정/삭제, 메모 타입 조회, 메모 CRUD, 메모 크기/위치 변경, 자동 ID
- PASS: Google Client ID 반영, Google 로그인 프로세스, 메인 진입 전제 흐름
- FAIL: 보드 위치 이동 API (`PATCH /api/boards/{boardId}/move`) status=`500` on current `localhost:8080`

## UI Test Readiness
- Web UI serve command prepared: `npm run ui:serve` (`http://localhost:5173`)
- UI run guide prepared: `docs/guide/ui-test-runbook.md`
