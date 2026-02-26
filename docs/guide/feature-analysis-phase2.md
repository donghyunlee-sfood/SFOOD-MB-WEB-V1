# Memo Web Feature Analysis (Phase 2)

## Goal

- Phase 1 CRUD 기반 위에서 보드/메모 상호작용 UX를 확장한다.
- 실제 요구사항의 핵심 인터랙션인 메모 이동/크기 변경/줌/타입 툴바를 제공한다.

## Implemented Features

1. 메모 툴바(타입 3종)
- 하단 고정 툴바에서 `type-basic`, `type-soft`, `type-alert` 선택 가능
- 선택 시 현재 보드 중앙에 새 메모 생성

2. 메모 드래그 이동
- 메모 헤더를 드래그해 보드 내 좌표 이동
- 드래그 종료 시 `PATCH /memos/{memoId}`로 `posX`, `posY` 저장

3. 메모 크기 조절
- 메모 우하단 리사이즈 핸들 제공
- 리사이즈 종료 시 `PATCH /memos/{memoId}`로 `width`, `height` 저장

4. 보드 줌
- 보드 영역에서 `Ctrl + Wheel` 입력 시 확대/축소
- 줌 범위: `0.6 ~ 2.0`

5. 편집 UX 보완
- 완료 모드: 내용 표시
- 더블클릭 또는 Edit 클릭 시 편집 모드 진입
- blur 시 1초 지연 자동 저장 유지

## Data/Behavior Notes

- 메모 생성 위치는 뷰포트 중앙 기준으로 계산하며 현재 줌/스크롤 값을 반영한다.
- 드래그/리사이즈는 실시간 시각 반영 후 마우스 업 시점에 API 저장을 수행한다.
- 저장 실패 시 로컬 상태는 이전 스냅샷으로 롤백한다.
