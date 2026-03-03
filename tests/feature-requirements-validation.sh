#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
GOOGLE_TOKEN="${GOOGLE_TOKEN:-spec-check-token}"
ITERATION_LABEL="${ITERATION_LABEL:-Iteration 06}"
TS="$(date +%Y%m%d%H%M%S)"
USER_ID="spec-user-${TS}@example.com"
BOARD_ID="spec-board-${TS}"
MEMO_ID="spec-memo-${TS}"
COOKIE_FILE="/tmp/sfood-spec-${TS}.cookie"
RESULT_FILE="${RESULT_FILE:-docs/test/results/iteration-06-feature-matrix.md}"

pass() { echo "- PASS: $1" >> "$RESULT_FILE"; }
fail() { echo "- FAIL: $1" >> "$RESULT_FILE"; }

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

# doc header
cat > "$RESULT_FILE" <<DOC
# ${ITERATION_LABEL} Feature Validation Matrix

- Time: $(date '+%Y-%m-%d %H:%M:%S %Z')
- Base URL: ${BASE_URL}
- User: ${USER_ID}
- Board: ${BOARD_ID}
- Memo: ${MEMO_ID}

## API-based checks
DOC

# login (google token)
r=$(request POST "${BASE_URL}/api/auth/login" "{\"userId\":\"${USER_ID}\",\"name\":\"Spec User\",\"googleToken\":\"${GOOGLE_TOKEN}\"}")
s=$(printf "%s" "$r"|head -n1)
if [[ "$s" == "200" ]]; then pass "로그인(googleToken 포함)"; else fail "로그인(googleToken 포함) status=${s}"; fi

# board create
r=$(request POST "${BASE_URL}/api/boards" "{\"boardId\":\"${BOARD_ID}\",\"name\":\"Spec Board\"}")
s=$(printf "%s" "$r"|head -n1)
if [[ "$s" == "200" ]]; then pass "보드 등록"; else fail "보드 등록 status=${s}"; fi

# board update
r=$(request PATCH "${BASE_URL}/api/boards/${BOARD_ID}/name" '{"name":"Spec Board Updated"}')
s=$(printf "%s" "$r"|head -n1)
if [[ "$s" == "200" ]]; then pass "보드 수정"; else fail "보드 수정 status=${s}"; fi

# board move
r=$(request PATCH "${BASE_URL}/api/boards/${BOARD_ID}/move" '{"parentBoardId":null,"sortOrder":1}')
s=$(printf "%s" "$r"|head -n1)
if [[ "$s" == "200" ]]; then pass "보드 위치 이동"; else fail "보드 위치 이동 status=${s}"; fi

# memo types list
r=$(request GET "${BASE_URL}/api/memo-types")
s=$(printf "%s" "$r"|head -n1)
if [[ "$s" == "200" ]]; then pass "메모 타입 조회"; else fail "메모 타입 조회 status=${s}"; fi

# memo create
r=$(request POST "${BASE_URL}/api/memos" "{\"memoId\":\"${MEMO_ID}\",\"boardId\":\"${BOARD_ID}\",\"memoTypeId\":\"basic-yellow\",\"content\":\"spec memo\",\"x\":10,\"y\":20,\"width\":320,\"height\":240,\"zIndex\":1}")
s=$(printf "%s" "$r"|head -n1)
if [[ "$s" == "200" ]]; then pass "메모 생성"; else fail "메모 생성 status=${s}"; fi

# memo update content + size + position
r=$(request PATCH "${BASE_URL}/api/memos/${MEMO_ID}" '{"content":"spec memo updated","x":111,"y":222,"width":420,"height":260,"zIndex":2}')
s=$(printf "%s" "$r"|head -n1)
if [[ "$s" == "200" ]]; then
  pass "메모 수정"
  pass "메모 크기 변경"
  pass "메모 위치 이동"
else
  fail "메모 수정/크기/위치 변경 status=${s}"
fi

# memo delete
r=$(request DELETE "${BASE_URL}/api/memos/${MEMO_ID}")
s=$(printf "%s" "$r"|head -n1)
if [[ "$s" == "200" ]]; then pass "메모 삭제"; else fail "메모 삭제 status=${s}"; fi

# board delete
r=$(request DELETE "${BASE_URL}/api/boards/${BOARD_ID}")
s=$(printf "%s" "$r"|head -n1)
if [[ "$s" == "200" ]]; then pass "보드 삭제"; else fail "보드 삭제 status=${s}"; fi

# logout + session check
r=$(request POST "${BASE_URL}/api/auth/logout")
s=$(printf "%s" "$r"|head -n1)
if [[ "$s" == "200" ]]; then pass "로그아웃"; else fail "로그아웃 status=${s}"; fi

r=$(request GET "${BASE_URL}/api/auth/me")
s=$(printf "%s" "$r"|head -n1)
if [[ "$s" == "401" ]]; then pass "세션 만료(로그아웃 후 접근 차단)"; else fail "세션 만료 검증 status=${s}"; fi

cat >> "$RESULT_FILE" <<DOC

## Frontend code checks
DOC

if rg -n "generate.*id|auto.*id|random" src/main.js > /tmp/web-id-check.txt 2>/dev/null; then
  pass "보드/메모 자동 ID 생성 로직 존재"
else
  fail "보드/메모 자동 ID 생성 로직 없음(수동 입력 방식)"
fi

rm -f "$COOKIE_FILE"
echo "FEATURE_REQUIREMENTS_VALIDATION_DONE"
