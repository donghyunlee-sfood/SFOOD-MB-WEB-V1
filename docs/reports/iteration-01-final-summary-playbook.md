# Iteration 01 Final Summary Playbook (Standalone)

## 0. 사용 규칙 (중요)
- 이 문서는 "단일 소스"로 작성되었다.
- 다른 문서를 읽지 않아도 동일한 결과를 재구현할 수 있어야 한다.
- 구현자는 이 문서의 값(사이즈/좌표/규칙/알고리즘)을 우선 적용한다.

## 1. 목표 결과 (최종 상태 정의)
- 로그인/세션/로그아웃이 Google GIS + 서버 세션 기반으로 정상 동작
- LNB에서만 보드 생성/수정/삭제/이동 처리
- 메모는 3타입(기본/둥근/그림자)으로 명확히 구분
- 메모는 완료 모드에서만 이동/리사이즈 가능
- 에디터 툴바는 메모 하단 바깥(10px) 위치
- 컨텍스트 메뉴는 마우스 포인터 위치 + 최상위 포털 렌더
- 메시지는 2종으로 분리
  - 결과 알림: 우하단 토스트
  - 사용자 질의: 중앙 모달
- API는 "화면 선반영 -> API 호출 -> 실패 시 롤백" 원칙

## 2. 기술 스택/기본 설정
- React + TypeScript + Vite
- 상태: Zustand
- HTTP: Axios (`withCredentials: true`)
- 에디터: ReactQuill (무료 에디터)
- API Base URL: `/api/v1`
- Google Client ID는 `.env` (`VITE_GOOGLE_CLIENT_ID`)로만 관리, UI 노출 금지

## 3. 화면/레이아웃 고정값

### 3.1 LNB/캔버스
- LNB 너비 범위: 최소 `220`, 최대 `460`, 기본 `320`
- LNB 리사이즈 핸들: 폭 `7px`
- 캔버스 내부 크기: `3200 x 2000`
- 줌 범위: `50% ~ 200%`, 증감 단위 `10%`
- 줌 표시: 헤더 우측에 `%` 텍스트 + `+/-` 버튼 + 범위 문구

### 3.2 메모 기본값
- 생성 기본 크기: `240 x 180`
- 최소 크기: `180 x 140`
- 리사이즈 핸들: 우하단 `14 x 14`

### 3.3 하단 메모 툴바
- 위치: `position: fixed`, 초기 중앙 하단
- 초기 계산:
  - `width = 520`
  - `x = max(12, round(window.innerWidth/2 - width/2))`
  - `y = max(12, window.innerHeight - 120)`
- 툴바 박스: `height 64`, `border-radius 14`
- 핸들 폭: `36`
- 타입 버튼: `86 x 38`

### 3.4 레이어 우선순위
- 컨텍스트 메뉴: `z-index: 9999`
- 토스트: `z-index: 10000`
- 중앙 확인 모달: `z-index: 10001`

## 4. 상태/스토어 구조 (필수)

### 4.1 authStore
- `user`, `isAuthenticated`, `sessionChecked`
- `setUser(user|null)` 호출 시 `isAuthenticated` 동기화

### 4.2 boardStore
- `boards`, `selectedBoardId`

### 4.3 memoStore
- `memos`, `memoTypes`, `selectedTypeId`, `editingMemoId`
- `setMemoTypes` 시 `selectedTypeId`가 없으면 첫 타입 자동 선택

### 4.4 uiStore
- `zoom` 기본 `100`
- `lnbWidth` 기본 `320`
- `toast: {id, text} | null`
- `setMessage(message)`는 항상 새 `id=Date.now()` 생성

## 5. 인증 정책 (정확 규칙)
- 앱 부팅 시 `GET /auth/me`
  - 성공: 사용자 상태 저장
  - 실패: 사용자 `null` + 로그인 필요 메시지(로그인 관련 메시지는 과도 노출 방지)
- 로그인 화면:
  - 세션 유효하면 "연결 계정 표시 + 메인으로 들어가기" 버튼 제공
  - 재연동(구글 버튼) 강제하지 않음
- 로그아웃:
  - `POST /auth/logout` 후 사용자 상태 초기화, `/login` 이동
- 로그인 payload는 이름/프로필 포함
  - `googleAccount`, `token`, `name`, `profileImage`

## 6. 보드 기능 상세 명세

### 6.1 생성/수정
- 최상위 생성: LNB 헤더 `+` 클릭 -> 인라인 입력폼
- 하위 생성: 각 보드의 하위 추가 버튼 -> 인라인 입력폼
- 이름 수정: 인라인 입력폼
- 이름 제한: `trim` 후 `1~20자`

### 6.2 삭제
- 삭제 전 중앙 확인 모달 필수 (`window.confirm` 금지)
- 확인 시 화면 선삭제 후 API 호출, 실패 시 롤백

### 6.3 이동 규칙 (핵심)
- 같은 레벨 내 이동이 기본
- 드래그 시작 지점은 `li` 전체가 아닌 `.board-row`만 허용
- 드롭 위치의 상/하 절반으로 `before/after` 결정
- 자기 자신 이동 금지
- 자기 하위(descendant) 아래 이동 금지
- 이동 시 부모는 `target.parentBoardId`로 맞춤
- `sortOrder`는 sibling 재정렬 후 `index+1`로 재부여

### 6.4 선택 스타일 규칙
- 선택 스타일은 해당 `li`의 직접 `.board-row .board-name`에만 적용
- 상위 선택 시 하위가 함께 선택 스타일 되면 실패

## 7. 메모 타입/생성 규칙

### 7.1 타입 매핑
- 서버 타입명을 신뢰하지 말고 UI는 "순서 기반 고정 매핑" 사용
- 매핑:
  - index `0 mod 3` => `basic`
  - index `1 mod 3` => `rounded`
  - index `2 mod 3` => `shadow`

### 7.2 카드 스타일
- `basic`: `border-radius: 0px`
- `rounded`: `border-radius: 22px`
- `shadow`: `border-radius: 0px` + 강한 shadow

### 7.3 하단 메모 툴바 버튼 스타일
- 카드 타입과 동일 규칙을 버튼에도 반영
- `basic`: 직각 버튼
- `rounded`: `border-radius: 14px`
- `shadow`: `box-shadow: 0 8px 14px rgba(45,35,24,0.25)`

### 7.4 생성 좌표 (핵심)
- 메모 생성은 현재 캔버스 "보이는 화면 중심"
- 계산식:
  - `centerX = canvas.scrollLeft + rect.width/2`
  - `centerY = canvas.scrollTop + rect.height/2`
  - `posX = round(centerX * (100/zoom) - width/2)`
  - `posY = round(centerY * (100/zoom) - height/2)`
  - 최소 0 보정

## 8. 메모 카드 상호작용 상세

### 8.1 모드
- 완료모드: 이동/리사이즈 가능
- 입력모드: 에디터 활성, 이동/리사이즈 금지
- 더블클릭으로 입력모드 시작
- 외부 클릭으로 완료모드 전환 + 저장

### 8.2 이동
- 포인터 오프셋 저장:
  - `offsetX = e.clientX - rect.left`
  - `offsetY = e.clientY - rect.top`
- 이동 중 좌표:
  - `clientX - offsetX`, `clientY - offsetY`
- 캔버스 좌표 환산:
  - `posX = round((clientX - canvasRect.left + scrollLeft) * (100/zoom))`
  - `posY = round((clientY - canvasRect.top + scrollTop) * (100/zoom))`
- `+10` 같은 임의 보정값 금지 (포인터-카드 어긋남 원인)
- mouseup 시 1회 API 저장

### 8.3 리사이즈
- 우하단 핸들(`.memo-resize-handle`)로만 시작
- 드래그 중 로컬 상태 반영
- mouseup 시 1회 API 저장
- 최소치 `180x140`

## 9. 에디터/폰트 유지 규칙

### 9.1 편집툴바 위치
- 메모 내부가 아니라 메모 아래 바깥
- `top: calc(100% + 10px)`
- 카드 `overflow: visible` 필요 (툴바 잘림 방지)

### 9.2 폰트/크기/색상 유지
- 저장 시 컨텐츠를 다음 래퍼로 감싼 HTML 저장:
```html
<div style="font-family:...;font-size:...px;color:...">...</div>
```
- 편집 재진입 시 위 style을 파싱해 `fontFamily/fontSize/fontColor` 복원
- Quill 루트 스타일을 실시간 동기화:
  - `quill.root.style.fontFamily = ...`
  - `quill.root.style.fontSize = ...`
  - `quill.root.style.color = ...`

### 9.3 지원 기능
- 폰트 선택, 글자 크기, 글자 색상
- Bold/Italic/Underline/Link
- 불릿 리스트/번호 리스트/체크리스트

## 10. 컨텍스트 메뉴 (중요 장애 포인트 포함)

### 10.1 반드시 지킬 구조
- 메모 내부 렌더 금지
- `createPortal(..., document.body)` 사용
- 좌표는 `clientX/clientY` 그대로 사용
- CSS는 `position: fixed`

### 10.2 닫힘 조건
- 외부 클릭 시 닫힘
- 스크롤 시 닫힘
- 메뉴 액션 클릭 시 닫힘
- 메뉴 자체 클릭은 이벤트 전파 차단

### 10.3 과거 실패 원인
- 원인1: `memo-card` 내부 absolute/fixed 렌더 -> 줌/transform 영향으로 화면 중앙으로 튐
- 원인2: `overflow: hidden` -> 메뉴/툴바가 잘림
- 원인3: 닫힘 조건 누락 -> 메뉴가 계속 남아 있음

## 11. Z-Index 노출 순서 알고리즘 (4기능)
- 입력: `front`, `back`, `front-most`, `back-most`
- 알고리즘:
  - 현재 목록을 `zIndex` 오름차순 정렬
  - 대상 인덱스 찾기
  - 대상만 splice로 분리
  - 규칙에 맞는 위치로 다시 삽입
  - 전체 `zIndex = index+1` 재할당
- API는 일괄 PATCH(`/boards/{id}/memos/zindex`)

## 12. 메시지 처리 규칙

### 12.1 토스트
- API 처리 결과/오류는 우하단 토스트
- 자동 소멸: `2500ms`
- 동일 문구 연속 표시 가능해야 하므로 `id` 매번 신규 생성

### 12.2 중앙 질의 모달
- 삭제 여부 등 사용자 결정을 요구하는 메시지
- `ConfirmDialog` 사용
- 배경 클릭 취소, 확인 시 실제 동작 실행

### 12.3 금지
- `window.alert`, `window.confirm`, `window.prompt` (링크 입력 prompt는 향후 교체 권장)

## 13. 캔버스 줌/패닝 규칙
- Ctrl+Wheel로 줌
- 우클릭 드래그로 캔버스 패닝
- 패닝 시작 조건:
  - 버튼 `2`(우클릭)
  - 대상이 `.memo-card`, `.memo-toolbar-wrap` 내부가 아닐 것

## 14. API 처리 프로세스 템플릿

### 14.1 공통 패턴
1. 로컬 UI 먼저 반영
2. API 호출
3. 실패 시 이전 상태로 롤백
4. `setMessage`로 피드백 노출

### 14.2 URL 인코딩
- `boardId`, `memoId` 등 path variable은 `encodeURIComponent` 필수
- 이유: `memoId`에 `#` 등 특수문자 포함 가능

## 15. CSS 핵심 값 요약 (재사용용)
- `memo-toolbar-wrap`: height `64`, radius `14`
- `memo-toolbar-handle`: width `36`
- `memo-toolbar button`: `86x38`, font `0.68rem`
- `memo-editor-toolbar`: `top: calc(100% + 10px)`, min-height `76`
- `memo-card`: min `180x140`, overflow `visible`
- `memo-resize-handle`: `14x14`
- `toast`: right/bottom `16`, z-index `10000`
- `memo-context-menu`: z-index `9999`
- `confirm-overlay`: z-index `10001`

## 16. 구현 체크리스트 (이 문서만으로 검증)
- [ ] 로그인 후 세션 유효 시 재로그인 없이 메인 진입
- [ ] 로그아웃 후에는 Google 연동 다시 필요
- [ ] 사용자 이름(한글)/프로필 이미지 저장 및 조회 정상
- [ ] 보드 생성은 LNB에서만 가능
- [ ] 최상위/하위 생성 정책 준수
- [ ] 보드 같은 레벨 이동 가능, 하위로의 불법 이동 차단
- [ ] 보드 삭제 시 중앙 모달 확인 노출
- [ ] 메모 3타입(기본/둥근/그림자) 카드 구분됨
- [ ] 하단 툴바 버튼도 3타입 스타일 동일 구분
- [ ] 메모 생성 위치가 현재 화면 중앙
- [ ] 완료모드에서만 메모 이동/리사이즈 가능
- [ ] 우클릭 메뉴가 포인터 위치에 표시되고 외부 클릭/스크롤 시 닫힘
- [ ] 노출 순서 4기능 반복 호출 시도에도 정상 동작
- [ ] 에디터 툴바가 메모 하단 10px 바깥에 표시
- [ ] 편집 재진입 시 폰트/크기/색상 유지
- [ ] 토스트가 우하단에서 보이고 자동 사라짐
- [ ] 캔버스 줌 표시/버튼/Ctrl+Wheel/우클릭 패닝 정상

## 17. 빌드/테스트 통과 기준
- `npm run build` 통과
- `npm run test` 통과
- 실 API 수동 검증(권장):
  - 로그인
  - 보드 CRUD + move
  - 메모 CRUD + position/size/zindex

## 18. 구현 순서 (새 세션용)
1. API 클라이언트/스토어/라우팅 구성
2. 로그인/세션/로그아웃
3. 보드 트리 + 이동 제약
4. 메모 타입 + 하단 툴바
5. 메모 카드 이동/리사이즈/에디터
6. 컨텍스트 메뉴 포털 분리
7. 메시지 체계(토스트 + 중앙 모달) 분리
8. 줌/패닝/세부 UI 값 고정
9. 회귀 테스트 체크리스트 실행
