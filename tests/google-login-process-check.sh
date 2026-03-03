#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
GOOGLE_TOKEN="${GOOGLE_TOKEN:-manual-google-token}"
TS="$(date +%Y%m%d%H%M%S)"
USER_ID="google-flow-user-${TS}@example.com"
BOARD_ID="google-flow-board-${TS}"
COOKIE_FILE="/tmp/sfood-google-flow-${TS}.cookie"

request() {
  local method="$1"
  local url="$2"
  local data="${3:-}"
  local out status body

  if [[ -n "$data" ]]; then
    out=$(curl -sS -X "$method" "$url" -H 'Content-Type: application/json' -b "$COOKIE_FILE" -c "$COOKIE_FILE" -d "$data" -w '\n%{http_code}')
  else
    out=$(curl -sS -X "$method" "$url" -b "$COOKIE_FILE" -c "$COOKIE_FILE" -w '\n%{http_code}')
  fi

  status=$(printf "%s" "$out" | tail -n1)
  body=$(printf "%s" "$out" | sed '$d')
  printf "%s\n%s" "$status" "$body"
}

assert_status() {
  local got="$1"
  local expected="$2"
  local label="$3"
  if [[ "$got" != "$expected" ]]; then
    echo "[FAIL] ${label} expected=${expected} got=${got}"
    exit 1
  fi
  echo "[PASS] ${label} status=${got}"
}

echo "BASE_URL=${BASE_URL}"
echo "USER_ID=${USER_ID}"

# login attempt with google token payload
login_payload=$(cat <<JSON
{"userId":"${USER_ID}","name":"Google Flow User","googleToken":"${GOOGLE_TOKEN}"}
JSON
)
resp=$(request POST "${BASE_URL}/api/auth/login" "$login_payload")
status=$(printf "%s" "$resp" | head -n1)
body=$(printf "%s" "$resp" | tail -n +2)
assert_status "$status" "200" "POST /api/auth/login with googleToken"
printf "%s" "$body" | rg -q "$USER_ID" && echo "[PASS] login response has userId"

# verify current user
resp=$(request GET "${BASE_URL}/api/auth/me")
status=$(printf "%s" "$resp" | head -n1)
body=$(printf "%s" "$resp" | tail -n +2)
assert_status "$status" "200" "GET /api/auth/me"
printf "%s" "$body" | rg -q "$USER_ID" && echo "[PASS] me response has userId"

# verify user initialization side effect: default board exists
resp=$(request GET "${BASE_URL}/api/boards")
status=$(printf "%s" "$resp" | head -n1)
body=$(printf "%s" "$resp" | tail -n +2)
assert_status "$status" "200" "GET /api/boards after login"
board_count=$(printf "%s" "$body" | rg -o '"boardId"' | wc -l | tr -d ' ')
if [[ "$board_count" -lt 1 ]]; then
  echo "[FAIL] expected at least 1 board from user initialization, got ${board_count}"
  exit 1
fi
echo "[PASS] board initialization check count=${board_count}"

# additional board create to ensure session usable
resp=$(request POST "${BASE_URL}/api/boards" "{\"boardId\":\"${BOARD_ID}\",\"name\":\"Google Flow Board\"}")
status=$(printf "%s" "$resp" | head -n1)
assert_status "$status" "200" "POST /api/boards"

# logout
resp=$(request POST "${BASE_URL}/api/auth/logout")
status=$(printf "%s" "$resp" | head -n1)
assert_status "$status" "200" "POST /api/auth/logout"

rm -f "$COOKIE_FILE"
echo "GOOGLE_LOGIN_PROCESS_CHECK_OK"
