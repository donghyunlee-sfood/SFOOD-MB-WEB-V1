# API Integration Test Report

## Date

- 2026-02-26 (KST)

## Environment

- Frontend workspace: `SFOOD-MB-WEB-V1`
- API base URL: `http://localhost:8080/api/v1`
- Test command: `npm run test:api`

## Implemented Integration Test

- File: `tests/api.integration.test.js`
- Scenario: Auth -> Session -> Board list -> Board create/rename -> Memo create/list/update/delete -> Board delete -> Logout
- Execution policy:
- `npm test`: API 통합 테스트는 skip
- `npm run test:api`: API 통합 테스트 강제 실행 (`RUN_API_TESTS=1`)

## Execution Result

1. Command result
- `npm run test:api` -> **FAIL**
- Failure point: `GET /boards?userEmail=...`
- Assertion detail: expected `200`, actual `500`
- Error body:
```json
{"timestamp":"2026-02-26T01:23:26.914+00:00","status":500,"error":"Internal Server Error","path":"/api/v1/boards"}
```

2. Endpoint probe result (direct curl)
- `POST /auth/login` -> `200`
- `GET /auth/session` -> `200`
- `GET /boards?userEmail=...` -> `500`
- `POST /auth/logout` -> `204`

## Conclusion

- API 통신 테스트는 인증 관련 엔드포인트는 정상 응답함.
- 보드 목록 조회 API(`GET /boards`)에서 서버 내부 오류(500)가 발생하여 이후 보드/메모 시나리오를 진행할 수 없음.
- 현재 상태에서는 프론트 로직 문제가 아니라 백엔드 `boards` 조회 경로 안정화가 선행되어야 전체 E2E 통신 테스트가 통과 가능함.
