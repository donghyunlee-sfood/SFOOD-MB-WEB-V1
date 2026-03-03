# Iteration 01 Test Result (Web)

## 메타
- Iteration: 01
- 작성일: 2026-03-03

## 실행 명령
1. `npm run build`
- 결과: PASS
- 요약: TypeScript 빌드 + Vite 프로덕션 번들 성공

2. `npm run test`
- 결과: PASS
- 요약: 프로젝트 스모크 테스트(`smoke: ok`) 통과

3. `curl ... http://localhost:8080/api/v1/*` (login/me/board/memo 시퀀스)
- 결과: FAIL
- 원인: `localhost:8080` 백엔드 미기동(`curl: (7) Failed to connect`)

4. `DB_PASSWORD='!@!L1e2e34!!!' DB_SCHEMA=memo_board_v4 DDL_AUTO=update ./gradlew test --tests ApiPostgresqlIntegrationTest` (backend repo)
- 결과: PASS
- 요약: 실데이터(Supabase PostgreSQL) 기반 API 통합 테스트 성공

5. `curl` 실주소 테스트 (`http://localhost:8080/api/v1/*`)
- 결과: PASS (재검증 기준)
- 검증 시나리오:
  - `POST /auth/login`
  - `GET /auth/me`
  - `POST /boards`
  - `PATCH /boards/{boardId}/move`
  - `POST /boards/{boardId}/memos`
  - `PATCH /memos/{memoId}/content`
  - `PATCH /boards/{boardId}/memos/zindex`
  - `DELETE /memos/{memoId}`
  - `DELETE /boards/{boardId}`
  - `POST /auth/logout`
- 참고: `memoId`에 `#` 등 특수문자가 포함될 수 있으므로 path 변수는 URL 인코딩(`encodeURIComponent`) 필수

6. `npm run dev -- --host 0.0.0.0 --port 5173` (8초 기동 확인)
- 결과: PASS
- 요약: Vite 개발 서버 정상 기동 확인 (`http://localhost:5173/`)

7. 로그인 UI 정책 정렬 (Google GIS)
- 결과: PASS
- 요약: 수동 email/token 입력 폼 제거, `VITE_GOOGLE_CLIENT_ID` 기반 Google 로그인 버튼 렌더 방식으로 교체

## 비고
- 초기 시도에서는 샌드박스 제한으로 `localhost:8080` 연결 실패가 있었고, 상위 권한 재실행으로 실주소 테스트를 완료했다.

8. `npm run build` (UI 대규모 수정 후)
- 결과: PASS
- 요약: 보드 트리/LNB/에디터/툴바/토스트 구조 변경 이후 빌드 성공

9. `npm run test`
- 결과: PASS
- 요약: 스모크 테스트 통과

10. `curl` 실주소 회귀 (`/auth/login`, `/boards`, `/boards/{id}/move`, `/boards`)
- 결과: PASS
- 요약: 최상위 보드 생성 및 최상위 보드 이동 API 응답 성공 확인

11. 로그인 정책 회귀 (`/auth/login`, `/auth/me`, `/boards`)
- 결과: PASS
- 검증 포인트:
  - 한글 이름(`홍길동테스트`) 저장/조회 정상
  - `profileImage` 값 저장/조회 정상
  - 신규 로그인 시 기본 보드(`{account}_default`) 조회 정상

12. UI 정합성 수정 후 회귀 (`npm run build`, `npm run test`)
- 결과: PASS
- 요약: LNB/메모카드/툴바/토스트 구조 수정 이후 빌드 및 스모크 테스트 통과

13. 보드 이동 API 회귀 (`/boards/{id}/move`)
- 결과: PASS
- 요약: 최상위 보드 간 위치 이동 API 응답 성공 확인

14. UI 세부 수정 후 회귀 (`npm run build`)
- 결과: PASS
- 요약: 메모 툴바/메모 카드/에디터/토스트/캔버스 패닝 개선 이후 빌드 성공

15. 보드/메모 상호작용 회귀 (`npm run build`, `npm run test`)
- 결과: PASS
- 요약:
  - 보드 드래그 대상을 `board-row` 기준으로 수정해 하위 보드 동일 레벨 위치 이동 동작 보강
  - 메모 우클릭 컨텍스트 메뉴를 메모 내부 마우스 포인트 위치에 표시하도록 수정
  - 노출 순서 4개 기능(z-index 앞/뒤/맨앞/맨뒤) 알고리즘을 인덱스 기반으로 재작성
  - 메모 드래그 포인터 오프셋 오차 제거, 스크롤된 캔버스 좌표 반영
  - 메모 우하단 리사이즈 핸들 추가 및 드래그 리사이즈 + 마우스업 시 API 저장
  - 메모 타입을 직사각형/둥근 사각형/그림자형으로 시각적으로 구분되도록 보강

16. 메모 타입/메뉴/에디터 툴바 구조 수정 회귀 (`npm run build`, `npm run test`)
- 결과: PASS
- 요약:
  - 메모 타입 스타일을 `memoTypes` 순서 기준으로 `기본/둥근/그림자` 고정 매핑
  - 컨텍스트 메뉴를 별도 컴포넌트 + `document.body` 포털(`position: fixed`, `z-index: 9999`)로 분리
  - 에디터 툴바를 메모 하단 외부(`top: calc(100% + 10px)`)로 표시되도록 조정
  - `memo-card`의 `overflow`를 `visible`로 전환해 하단 툴바 잘림 현상 제거

17. 메시지/팝업/에디터 스타일 보강 회귀 (`npm run build`, `npm run test`)
- 결과: PASS
- 요약:
  - 사용자 질의(삭제 확인)를 중앙 디자인 모달(`ConfirmDialog`)로 전환
  - 보드 삭제/메모 삭제 시 브라우저 `confirm` 제거 후 커스텀 확인 팝업 적용
  - 토스트에 `z-index`/경계 스타일을 부여해 가시성 보강
  - 웹 기본 스타일 리셋(`margin/padding/appearance`) 적용
  - 메모 툴바 높이/버튼 크기를 축소해 화면 점유율 개선
  - 메모 에디터에서 폰트/크기/색상을 저장 컨텐츠에서 파싱해 편집 모드 진입 시 복원
  - 편집 중 Quill 루트 스타일 동기화로 폰트 크기/색상 반영 유지

18. 메모 생성 위치/기본 메모 라운드 수정 회귀 (`npm run build`, `npm run test`)
- 결과: PASS
- 요약:
  - 메모 툴바에서 메모 생성 시 현재 캔버스 화면 중앙 좌표로 생성되도록 변경
  - 기본 메모 타입(`basic`)의 라운드 제거(직각 스타일)

19. 하단 메모툴바 타입 스타일 정합성 회귀 (`npm run build`, `npm run test`)
- 결과: PASS
- 요약:
  - 하단 메모툴바 타입 버튼도 메모 카드와 동일한 스타일 규칙으로 적용
  - 기본(`basic`) 버튼 직각, 둥근(`rounded`) 버튼 라운드, 그림자(`shadow`) 버튼 그림자 표시
