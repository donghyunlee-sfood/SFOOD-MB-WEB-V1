# Iteration 05 Test Result (WEB)

## Executed Commands
1. `npm run test`
- Result: PASS (`smoke-test:ok`)

2. `./tests/feature-requirements-validation.sh`
- Sandbox run: localhost 접근 제한으로 연결 실패
- Escalated run: PASS (스크립트 정상 완료, 결과 문서 생성)
- Matrix: `docs/test/results/iteration-05-feature-matrix.md`

3. `GOOGLE_TOKEN=web-google-flow-token ./tests/google-login-process-check.sh`
- Escalated run: PASS (`GOOGLE_LOGIN_PROCESS_CHECK_OK`)

4. `./tests/google-login-main-entry-validation.sh`
- Sandbox run: localhost 접근 제한으로 실패
- Escalated run: PASS (`GOOGLE_LOGIN_MAIN_ENTRY_VALIDATION_OK`)
- Result doc: `docs/test/results/iteration-05-google-login-main-entry.md`

## Result Summary
- PASS: 로그인/로그아웃/세션 차단, 보드 등록/수정/삭제, 메모 타입 조회, 메모 생성/수정/삭제, 메모 크기/위치 변경, 자동 ID 로직
- PASS: Google Client ID 기본 반영, Google 로그인 UI 이벤트 연결, Google 로그인 후 `me/boards` 확인 기반 메인 진입 플로우
- FAIL: 보드 위치 이동 API (`/api/boards/{boardId}/move`) 응답 `500`

## Board Move Re-test (2026-03-03)
- Command: direct curl flow (`login -> create board -> PATCH move -> cleanup`) against `http://localhost:8080`
- Result: FAIL
- Move response:
  - HTTP: `500`
  - Body error code: `INTERNAL_ERROR`
  - Path: `/api/boards/move-retest-board-20260303105423/move`
