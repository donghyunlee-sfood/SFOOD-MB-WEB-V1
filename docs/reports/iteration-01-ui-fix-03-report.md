# Iteration 01 UI Fix Report (03)

## 작성일
- 2026-03-03

## 분석 내용
- 로그인 정책상 세션이 유효한 동안에는 재연동 없이 메인 진입해야 하나, 기존 로그인 화면은 매번 Google 연동 UI를 노출
- Client ID 노출은 보안/운영 정책상 불필요
- 한글 이름 깨짐 및 profileImage 누락은 로그인 payload 처리와 연관 가능성이 있어 실 API 재검증 필요

## 수정 파일
- `src/pages/LoginPage.tsx`
- `src/types/domain.ts`
- `src/styles/app.css`
- `docs/test/results/iteration-01-test-result.md`

## 수정 결과
- 로그인 페이지 초기 진입 시 `GET /auth/me`로 세션 확인
- 세션 유효 시 로그인 화면에 연결 계정 표시 + `메인으로 들어가기` 버튼 제공
- 세션 유효 상태에서는 Google 연동 버튼 재실행 없이 메인 이동
- 로그아웃 후에는 세션이 해제되어 다시 Google 연동 화면 노출
- Google Client ID는 UI에서 제거 (실제 SDK 초기화에는 그대로 사용)
- Google credential 디코딩 후 `name`, `picture`를 추출해 로그인 요청에 전달
- 로그인 요청 DTO에 `profileImage` 필드 추가

## 검증 결과
- `npm run build`: PASS
- `npm run test`: PASS
- 실 API 검증:
  - `/auth/login` -> 한글 이름/프로필 이미지 포함 성공
  - `/auth/me` -> 한글 이름/프로필 이미지 조회 성공
  - `/boards` -> 기본 보드 조회 성공
