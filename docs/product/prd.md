# PRD (Web Development)

## 문서 정보
- 버전: v1.0
- 작성일: 2026-03-03
- 상태: Active
- 기준 문서: `docs/product/api-spec.md`, `docs/guide/requirements.md`, `docs/guide/architectures.md`
- UI 체크리스트: `docs/guide/ui-checklist.md`

## 목표
- 백엔드 `/api/v1`와 연동되는 웹 앱의 MVP를 기능 단위로 순차 구현한다.
- 각 단계 완료 여부를 체크리스트로 관리한다.
- 화면 처리 후 API 통신(Optimistic UI + 실패 롤백) 원칙을 전체 기능에 적용한다.

## 개발 단계 (기능별)

### Stage 1. 프로젝트 기반/공통 인프라
- [x] 라우팅 구조(Login/Main) 구성
- [x] API 클라이언트(axios, withCredentials, 인터셉터) 구성
- [x] 공통 응답/에러 타입 정의
- [x] 전역 에러 알림 방식(토스트/배너) 확정
- [x] 환경변수(`VITE_API_BASE_URL`) 적용
- [x] 환경변수(`VITE_GOOGLE_CLIENT_ID=720537531905-4srngg493kr4k2ql4d17e1pq3tvbiick.apps.googleusercontent.com`) 적용

### Stage 2. 인증(Auth)
- [x] `POST /auth/login` 연동
- [x] `GET /auth/me` 세션 확인 + 초기 진입 분기
- [x] `POST /auth/logout` 연동
- [x] 401 수신 시 로그인 리다이렉트 처리
- [x] auth 상태 스토어 구성
- [x] 사용자 정보/로그아웃 버튼을 헤더가 아닌 LNB 하단에 배치

### Stage 3. 보드(Board)
- [x] `GET /boards` 연동 및 트리 렌더링
- [x] `POST /boards` 생성 연동
- [x] `PATCH /boards/{boardId}/name` 수정 연동
- [x] `PATCH /boards/{boardId}/move` 이동 연동
- [x] `DELETE /boards/{boardId}` 삭제 연동
- [x] 보드명 20자 제한 UI 검증
- [x] 최상위/하위 보드 추가 액션을 LNB 내부로 한정
- [x] 보드 이동 테스트 케이스 작성 및 필수 통과

### Stage 4. 메모 타입(Memo Types)
- [x] `GET /memo-types` 연동
- [x] 하단 메모 툴바 렌더링
- [x] 타입별 기본 스타일 매핑
- [x] 메모 툴바 선택 타입별로 다른 스타일 메모 생성 검증

### Stage 5. 메모(Memo) 기본
- [x] `GET /boards/{boardId}/memos` 연동
- [x] `POST /boards/{boardId}/memos` 생성 연동
- [x] `PATCH /memos/{memoId}/content` 연동
- [x] `DELETE /memos/{memoId}` 연동
- [x] 편집모드/완료모드 전환 구현
- [x] 에디터 툴바를 메모 컴포넌트 하단 분리 영역으로 구현

### Stage 6. 메모 고급 동작
- [x] `PATCH /memos/{memoId}/position` 드래그 저장
- [x] `PATCH /memos/{memoId}/size` 리사이즈 저장
- [x] `PATCH /boards/{boardId}/memos/zindex` 순서 변경 저장
- [x] 컨텍스트 메뉴(앞/뒤/맨앞/맨뒤) 동작 구현

### Stage 7. 자동저장/복원력
- [x] blur 후 1초 debounce 저장
- [x] 저장 중복 호출 제어
- [x] 저장 실패 시 롤백
- [x] 실패 메시지 표준화

### Stage 8. UX 보강
- [x] LNB 리사이즈 구현
- [x] 보드 줌(Ctrl+Wheel) 구현
- [x] 현재 줌 퍼센트(%) 표시 UI 추가
- [x] 수동 줌 버튼(+/-) 추가
- [x] 로딩/빈 상태/오류 상태 화면 정리

### Stage 9. 테스트/릴리즈 문서화
- [ ] 핵심 플로우 테스트 작성/정비
- [x] `npm run test` 실행
- [x] 테스트 결과 문서 업데이트
- [x] iteration 결과 리포트 업데이트
- [ ] 화면 선반영 -> API 후처리 -> 실패 롤백 시나리오 테스트 반영

## 수용 기준
- 로그인 후 보드/메모 기본 플로우가 정상 동작한다.
- 자동저장과 실패 롤백 동작이 재현 가능하다.
- 400/401/404/409 에러 분기가 사용자 메시지로 구분된다.
