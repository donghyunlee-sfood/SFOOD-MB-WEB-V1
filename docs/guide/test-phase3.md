# Phase 3 Test Document

## Scope

- 오류 메시지 정규화 (`formatErrorMessage`)
- 마지막 실패 동작 재시도 버튼
- 요청 진행 중 busy-state UI
- 기존 롤백/줌/중앙좌표/ID/검증 회귀

## Automated Test Cases

1. `formatErrorMessage`
- null 입력 시 fallback 반환
- `Failed to fetch` 입력 시 네트워크 안내 메시지 반환
- 일반 메시지 입력 시 원문 유지

2. 회귀 테스트
- `validateBoardName`
- `makeBoardId` / `makeMemoId`
- `rollbackMemo`
- `clampZoom` / `nextZoom`
- `centerMemoPosition`

## Manual Validation Checklist

- API 실패 시 오류 메시지가 표시되는지 확인
- 오류 상태에서 `재시도` 버튼 노출/동작 확인
- 요청 중 UI가 busy 상태로 바뀌는지 확인
- 메모 자동 저장 실패 시 롤백 동작 유지 확인

## Execution Result (2026-02-26)

1. Automated tests
- Command: `npm test`
- Result: PASS (1 passed, 0 failed)

2. Syntax checks
- Command: `node --check src/app.js && node --check src/domain.js`
- Result: PASS

3. Runtime smoke check
- Command: `timeout 3s npm run dev`
- Result: PASS (server start log confirmed: `http://localhost:4173`)
- Note: command ended by timeout intentionally after startup verification.
