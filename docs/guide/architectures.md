# 웹 아키텍처 설계서

## 문서 정보
- 프로젝트: SFOOD-MB-WEB-V1
- 버전: v1.0
- 작성일: 2026-03-03

## 아키텍처 원칙
- Frontend/Backend 분리, REST(JSON) 통신
- 세션 쿠키 기반 인증
- 기능별 모듈화(auth/board/memo/type)
- 상태와 API 호출 로직 분리
- 실패를 숨기지 않고 사용자에게 명시적으로 전달
- 화면 상태를 먼저 반영하고 API 동기화는 후행 처리한다.

## 제안 기술 스택
- React + TypeScript + Vite
- 상태관리: Zustand (또는 동급 경량 스토어)
- HTTP 클라이언트: Axios(인터셉터로 에러 표준화)
- 라우팅: React Router

## 디렉토리 구조
```text
src/
  api/            # 기능별 API 모듈
  components/     # UI 컴포넌트
  pages/          # 라우트 페이지
  store/          # auth/board/memo/ui 상태
  hooks/          # useAutoSave 등
  types/          # API DTO 타입
  utils/          # 공통 유틸
```

## 상태 설계
- `authStore`: user, isAuthenticated, sessionChecked
- `boardStore`: boards, selectedBoardId, loading
- `memoStore`: memos, editingMemoId, savingMap
- `uiStore`: zoom, zoomLabel, lnbWidth, contextMenu

## UI 배치 원칙
- 사용자 정보/로그아웃 버튼은 `LNB 하단`에 배치한다.
- 보드 `최상위 추가`/`하위 추가` 액션은 `LNB 내부`에서만 제공한다.
- 메모 에디터 툴바는 메모 카드와 분리해 메모 하단 고정 영역으로 노출한다.
- 줌 UI는 `Ctrl+Wheel`과 별도로 수동 버튼과 현재 `%` 표시를 제공한다.

## API 연동 계층
- `api/client.ts`: baseURL, withCredentials, 응답/에러 인터셉터
- `api/auth.api.ts`: login/me/logout
- `api/board.api.ts`: list/create/rename/move/delete
- `api/memo.api.ts`: list/create/content/position/size/zindex/delete
- `api/memoType.api.ts`: list

## 인증/라우팅
- 앱 시작 시 `GET /api/v1/auth/me` 호출로 세션 확인
- 인증 필요 라우트는 가드 적용
- 401 수신 시 auth 상태 초기화 후 로그인 라우트 이동

## 저장 흐름
- 메모 편집 완료 -> UI 즉시 반영 -> 1초 debounce -> 저장 API 호출
- 요청 중 중복 입력은 최신 요청만 유효하게 관리
- 실패 시 사용자 알림 + 마지막 성공 상태로 롤백
