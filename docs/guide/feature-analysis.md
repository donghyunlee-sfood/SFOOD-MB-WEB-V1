# Memo Web Feature Analysis (Phase 1)

## Input Analysis

- Requirement source: `docs/guide/requirement.md` (SRS v1.0)
- API source: `docs/guide/api-spec.md` (Step 4 기준)
- 제외 기능(정렬/검색/첨부/설정 등)은 구현 대상에서 제외한다.

## Target User Value

- 사용자는 로그인 후 즉시 본인 보드/메모를 조회하고 수정할 수 있어야 한다.
- 메모 편집 완료 시 별도 저장 버튼 없이 자동 저장되어야 한다.
- 보드/메모 CRUD 동작은 API 스펙과 일치해야 한다.

## Phase 1 Feature Scope

1. Auth 흐름
- 로그인(`POST /auth/login`)
- 세션 확인(`GET /auth/session`)
- 로그아웃(`POST /auth/logout`)

2. Board CRUD
- 보드 목록 조회(`GET /boards`)
- 보드 생성(`POST /boards`)
- 보드명 수정(`PATCH /boards/{boardId}/name`)
- 보드 삭제(`DELETE /boards/{boardId}`)

3. Memo CRUD
- 메모 목록 조회(`GET /memos`)
- 메모 생성(`POST /memos`)
- 메모 수정(`PATCH /memos/{memoId}`)
- 메모 삭제(`DELETE /memos/{memoId}`)

4. 자동 저장
- 편집 완료(blur) 시 1초 딜레이 후 수정 API 호출
- 저장 중 상태/실패 메시지 표기

5. UI baseline
- 로그인 화면 + 메인 화면(좌측 LNB, 우측 보드)
- 모바일에서도 사용 가능한 반응형 레이아웃

## Non-Goals (Phase 1)

- 구글 OAuth 실제 인증 연동 (API 스펙에도 미구현 명시)
- 메모 드래그/리사이즈/줌 (Phase 2에서 진행)
- 첨부, 설정, 검색/정렬 기능 (요구사항 제외 항목)

## Technical Design Summary

- Vanilla HTML/CSS/JS 기반 SPA로 구현.
- `src/api.js`: 인증/보드/메모 API 호출.
- `src/state.js`: 앱 상태 및 파생 선택자.
- `src/app.js`: 화면 렌더링 및 이벤트 연결.
- `tests/*.test.js`: 유틸/상태 로직 단위 테스트.
