# Phase 2 Test Document

## Scope

- 메모 툴바 타입 선택 생성
- 메모 드래그 이동 저장
- 메모 리사이즈 저장
- 보드 줌(Ctrl + Wheel)
- 편집 모드 진입/blur 자동 저장
- 줌/중앙좌표 유틸 함수

## Automated Test Cases

1. 줌 보정 유틸
- `clampZoom`, `nextZoom` 경계값 검증

2. 메모 중앙 좌표 계산
- `centerMemoPosition`이 스크롤/줌 반영 좌표를 반환하는지 검증

3. 기존 도메인 유틸 회귀
- 보드명 검증
- ID 생성 접두사
- 롤백 유틸

## Manual Validation Checklist

- 메모 툴바 버튼 클릭 시 중앙에 새 메모 생성
- 메모 헤더 드래그 후 마우스 업 시 위치 저장 메시지 표시
- 메모 우하단 핸들 드래그 후 크기 저장 메시지 표시
- Ctrl + Wheel로 줌 퍼센트 변경
- 더블클릭으로 편집 모드 진입, blur 후 1초 뒤 자동 저장 메시지 표시
- API 실패 시 오류 메시지 및 롤백 동작 확인

## Execution Result (2026-02-26)

1. Automated tests
- Command: `npm test`
- Result: PASS (1 passed, 0 failed)

2. Runtime smoke check
- Command: `timeout 3s npm run dev`
- Result: PASS (server start log confirmed: `http://localhost:4173`)
- Note: command ended by timeout intentionally after startup verification.
