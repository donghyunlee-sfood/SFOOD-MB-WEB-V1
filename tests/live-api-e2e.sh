#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
GOOGLE_TOKEN="${GOOGLE_TOKEN:-test-google-token-from-web}"
TS="$(date +%Y%m%d%H%M%S)"
USER_ID="web-live-user-${TS}"
BOARD_ID="web-live-board-${TS}"
MEMO_ID="web-live-memo-${TS}"
COOKIE_FILE="/tmp/sfood-web-live-${TS}.cookie"

request() {
  local method="$1"
  local url="$2"
  local data="${3:-}"
  local out status body

  if [[ -n "$data" ]]; then
    out=$(curl -sS -X "$method" "$url" \
      -H 'Content-Type: application/json' \
      -b "$COOKIE_FILE" -c "$COOKIE_FILE" \
      -d "$data" \
      -w '\n%{http_code}')
  else
    out=$(curl -sS -X "$method" "$url" \
      -b "$COOKIE_FILE" -c "$COOKIE_FILE" \
      -w '\n%{http_code}')
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
echo "BOARD_ID=${BOARD_ID}"
echo "MEMO_ID=${MEMO_ID}"

# 1) me before login
resp=$(request GET "${BASE_URL}/api/auth/me")
status=$(printf "%s" "$resp" | head -n1)
assert_status "$status" "401" "GET /api/auth/me before login"

# 2) login with googleToken in payload
login_payload=$(cat <<JSON
{"userId":"${USER_ID}","name":"Web Live User","googleToken":"${GOOGLE_TOKEN}"}
JSON
)
resp=$(request POST "${BASE_URL}/api/auth/login" "$login_payload")
status=$(printf "%s" "$resp" | head -n1)
body=$(printf "%s" "$resp" | tail -n +2)
assert_status "$status" "200" "POST /api/auth/login (with googleToken)"
printf "%s" "$body" | rg -q '"success":true' && echo "[PASS] login response success=true"

# 3) load me
resp=$(request GET "${BASE_URL}/api/auth/me")
status=$(printf "%s" "$resp" | head -n1)
assert_status "$status" "200" "GET /api/auth/me after login"

# 4) memo types
resp=$(request GET "${BASE_URL}/api/memo-types")
status=$(printf "%s" "$resp" | head -n1)
assert_status "$status" "200" "GET /api/memo-types"

# 5) create board
board_payload=$(cat <<JSON
{"boardId":"${BOARD_ID}","name":"Web Live Board"}
JSON
)
resp=$(request POST "${BASE_URL}/api/boards" "$board_payload")
status=$(printf "%s" "$resp" | head -n1)
assert_status "$status" "200" "POST /api/boards"

# 6) create memo
memo_payload=$(cat <<JSON
{"memoId":"${MEMO_ID}","boardId":"${BOARD_ID}","memoTypeId":"basic-yellow","content":"live from web test","x":10,"y":20,"width":320,"height":240,"zIndex":1}
JSON
)
resp=$(request POST "${BASE_URL}/api/memos" "$memo_payload")
status=$(printf "%s" "$resp" | head -n1)
assert_status "$status" "200" "POST /api/memos"

# 7) update memo
resp=$(request PATCH "${BASE_URL}/api/memos/${MEMO_ID}" '{"content":"updated from web test","x":15,"y":25,"width":360,"height":260,"zIndex":2}')
status=$(printf "%s" "$resp" | head -n1)
assert_status "$status" "200" "PATCH /api/memos/{memoId}"

# 8) delete memo
resp=$(request DELETE "${BASE_URL}/api/memos/${MEMO_ID}")
status=$(printf "%s" "$resp" | head -n1)
assert_status "$status" "200" "DELETE /api/memos/{memoId}"

# 9) delete board
resp=$(request DELETE "${BASE_URL}/api/boards/${BOARD_ID}")
status=$(printf "%s" "$resp" | head -n1)
assert_status "$status" "200" "DELETE /api/boards/{boardId}"

# 10) logout
resp=$(request POST "${BASE_URL}/api/auth/logout")
status=$(printf "%s" "$resp" | head -n1)
assert_status "$status" "200" "POST /api/auth/logout"

# 11) me after logout
resp=$(request GET "${BASE_URL}/api/auth/me")
status=$(printf "%s" "$resp" | head -n1)
assert_status "$status" "401" "GET /api/auth/me after logout"

rm -f "$COOKIE_FILE"
echo "LIVE_API_E2E_OK"
