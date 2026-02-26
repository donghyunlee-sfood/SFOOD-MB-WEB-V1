# Phase 1 Test Document

## Scope

- Phase 1 implemented features:
- 로그인/세션/로그아웃 흐름 UI
- 보드 CRUD API 연동
- 메모 CRUD API 연동
- 메모 blur 기반 1초 자동 저장 및 실패 시 롤백 처리
- 도메인 유틸 함수(아이디 생성/이름 검증/롤백)

## Test Environment

- Runtime: Node.js (project local)
- Command: `npm test`
- Frontend manual runtime: `npm run dev` then open `http://localhost:4173`
- Backend dependency: `http://localhost:8080/api/v1` (API spec 기준)

## Automated Test Cases

1. 보드명 검증 - 빈 값 거부
- Input: `""`, `"   "`
- Expected: `"보드명은 비어 있을 수 없습니다."`

2. 보드명 검증 - 20자 초과 거부
- Input: 21자 문자열
- Expected: `"보드명은 20자를 초과할 수 없습니다."`

3. ID 생성 규칙 - 접두사 검증
- Input: `user@test.com`, `boardId`
- Expected: `makeBoardId`는 `user@test.com_` 접두사, `makeMemoId`는 `${boardId}_` 접두사

4. 자동 저장 실패 롤백 유틸
- Input: 변경된 memo 배열 + 이전 memo 스냅샷
- Expected: 이전 스냅샷으로 되돌아감

## Manual Validation Checklist

- 로그인 성공 시 메인 화면 전환
- 보드 추가/수정/삭제 시 목록 갱신
- 보드 선택 시 메모 목록 조회
- 메모 생성/삭제 동작
- 메모 내용 또는 스타일 변경 후 1초 뒤 저장 상태 메시지 확인
- API 실패 시 오류 메시지 표시 확인

## Execution Result (2026-02-26)

1. Automated tests
- Command: `npm test`
- Result: PASS (1 passed, 0 failed)

2. Runtime smoke check
- Command: `timeout 3s npm run dev`
- Result: PASS (server start log confirmed: `http://localhost:4173`)
- Note: command ended by timeout intentionally after startup verification.
