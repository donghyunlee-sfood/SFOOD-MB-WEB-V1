# Memo Web Development Plan

## Source Status

- `docs/guide/requirement.md`: SRS v1.0 (AUTH/BOARD/MEMO/AUTO/NFR 포함)
- `docs/guide/api-spec.md`: Frontend API Spec v1 (Auth/Board/Memo REST)

## Planning Assumption

- Backend API base URL is `http://localhost:8080/api/v1`.
- Google OAuth는 스펙상 미구현 상태이므로, 현재 로그인 API(`POST /auth/login`) 기반으로 UI를 구현한다.
- 단계별 완료 후 테스트 문서와 테스트 결과를 공유하고 다음 단계는 사용자 승인 후 진행한다.

## Phase Plan

1. Phase 1 - Foundation + 핵심 CRUD (implement now)
- 로그인/세션 확인/로그아웃 UI와 API 연동 구현.
- LNB 보드 목록 조회, 보드 생성/수정/삭제 구현.
- 선택 보드 기준 메모 조회, 메모 생성/수정/삭제 구현.
- 메모 편집 완료 시 1초 딜레이 자동 저장 구현.
- 테스트 문서 작성 및 실행 결과 기록.
- Approval gate: 사용자 승인 후 Phase 2 진행.

2. Phase 2 - 보드/메모 인터랙션 고도화 (after approval)
- 메모 드래그 이동 및 위치 저장.
- 메모 크기 조절 및 저장.
- 메모 툴바(3종 타입) 및 기본 스타일 적용.
- 보드 줌(Ctrl + Wheel) 적용.
- Approval gate: 사용자 승인 후 Phase 3 진행.

3. Phase 3 - 품질 강화 및 마감 (after approval)
- 오류 처리/롤백 UX 강화.
- 테스트 확장(단위 + 수동 시나리오 정교화).
- 운영 가이드 및 릴리즈 문서 정리.
