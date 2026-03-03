#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
GOOGLE_TOKEN="${GOOGLE_TOKEN:-web-google-flow-token}"
CLIENT_ID="${CLIENT_ID:-720537531905-4srngg493kr4k2ql4d17e1pq3tvbiick.apps.googleusercontent.com}"
ITERATION_LABEL="${ITERATION_LABEL:-Iteration 06}"
RESULT_FILE="${RESULT_FILE:-docs/test/results/iteration-06-google-login-main-entry.md}"

pass() { echo "- PASS: $1" >> "$RESULT_FILE"; }
fail() { echo "- FAIL: $1" >> "$RESULT_FILE"; }

cat > "$RESULT_FILE" <<DOC
# ${ITERATION_LABEL} Google Login Main Entry Validation

- Time: $(date '+%Y-%m-%d %H:%M:%S %Z')
- Base URL: ${BASE_URL}
- Client ID: ${CLIENT_ID}

## UI Contract Checks
DOC

if rg -q "${CLIENT_ID}" src/index.html && rg -q "DEFAULT_GOOGLE_CLIENT_ID" src/main.js; then
  pass "로그인 화면 Google Client ID 기본값 반영"
else
  fail "Google Client ID 기본값 미반영"
fi

if rg -q 'id="btn-google-init"' src/index.html && rg -q 'id="btn-google-login"' src/index.html; then
  pass "Google 초기화/로그인 버튼 존재"
else
  fail "Google 초기화/로그인 버튼 누락"
fi

if rg -q 'btn-google-init' src/main.js && rg -q 'btn-google-login' src/main.js && rg -q 'loginWithGoogleCredential' src/main.js; then
  pass "Google 버튼 이벤트와 로그인 핸들러 연결"
else
  fail "Google 로그인 이벤트 연결 누락"
fi

cat >> "$RESULT_FILE" <<DOC

## Live API Flow Check
DOC

set +e
flow_output=$(GOOGLE_TOKEN="$GOOGLE_TOKEN" BASE_URL="$BASE_URL" ./tests/google-login-process-check.sh 2>&1)
flow_status=$?
set -e

if [[ "$flow_status" -eq 0 ]]; then
  pass "Google 토큰 기반 login -> me -> boards -> logout API 플로우 통과"
else
  fail "Google API 플로우 실패"
fi

cat >> "$RESULT_FILE" <<DOC

## Flow Output

\`\`\`
${flow_output}
\`\`\`
DOC

if [[ "$flow_status" -ne 0 ]]; then
  exit 1
fi

echo "GOOGLE_LOGIN_MAIN_ENTRY_VALIDATION_OK"
