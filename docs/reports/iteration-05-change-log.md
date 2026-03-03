# Iteration 05 Change Log (WEB)

## Added
- `docs/plan/iteration/iteration-05-plan.md`
- `docs/test/results/iteration-05-feature-matrix.md`
- `docs/test/results/iteration-05-google-login-main-entry.md`
- `docs/test/results/iteration-05-test-result.md`
- `docs/reports/iteration-05-result.md`
- `docs/reports/iteration-05-change-log.md`
- `tests/google-login-main-entry-validation.sh`

## Updated
- `src/index.html`
  - Google Client ID 입력 필드 기본값 반영
- `src/main.js`
  - `DEFAULT_GOOGLE_CLIENT_ID` 상수 추가 및 초기값 주입
- `tests/feature-requirements-validation.sh`
  - 결과 파일 기본 경로를 iteration-05 문서로 변경
  - 문서 헤더를 iteration-05로 갱신

## Purpose
- 제공된 Google Client ID를 반영한 로그인 프로세스 검증을 명시적으로 수행하고,
  실 API 기준 전체 기능 매트릭스 최신 결과를 문서화.
