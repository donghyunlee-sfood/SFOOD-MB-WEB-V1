import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

const RUN_API_TESTS = process.env.RUN_API_TESTS === "1";
const BASE_URL = "http://localhost:8080/api/v1";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["X-Session-Token"] = token;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return { status: response.status, payload };
}

function assertStatus(actualStatus, expectedStatus, context, payload) {
  assert.equal(
    actualStatus,
    expectedStatus,
    `${context} failed: expected ${expectedStatus}, got ${actualStatus}, payload=${JSON.stringify(payload)}`
  );
}

const integrationTest = RUN_API_TESTS ? test : test.skip;

integrationTest("API integration: auth + board + memo lifecycle", async () => {
  const nonce = randomUUID().slice(0, 8);
  const userEmail = `codex-api-${nonce}@test.local`;
  const userName = `codex-${nonce}`;
  const boardId = `${userEmail}_board_${nonce}`;
  const memoId = `${boardId}_memo_${nonce}`;

  let token = "";
  let createdBoardId = "";
  let createdMemoId = "";

  try {
    const login = await request("/auth/login", {
      method: "POST",
      body: { userEmail, userName }
    });
    assertStatus(login.status, 200, "POST /auth/login", login.payload);
    assert.equal(login.payload.userEmail, userEmail);
    assert.equal(login.payload.userName, userName);
    assert.ok(login.payload.sessionToken);
    token = login.payload.sessionToken;

    const session = await request("/auth/session", { token });
    assertStatus(session.status, 200, "GET /auth/session", session.payload);
    assert.equal(session.payload.userEmail, userEmail);

    const boardsBefore = await request(`/boards?userEmail=${encodeURIComponent(userEmail)}`, { token });
    assertStatus(boardsBefore.status, 200, "GET /boards", boardsBefore.payload);
    assert.ok(Array.isArray(boardsBefore.payload));

    const createBoard = await request("/boards", {
      method: "POST",
      token,
      body: {
        boardId,
        userEmail,
        name: "통합테스트보드",
        parentBoardId: null,
        sortOrder: boardsBefore.payload.length
      }
    });
    assertStatus(createBoard.status, 200, "POST /boards", createBoard.payload);
    assert.equal(createBoard.payload.boardId, boardId);
    createdBoardId = boardId;

    const renameBoard = await request(`/boards/${encodeURIComponent(boardId)}/name`, {
      method: "PATCH",
      token,
      body: { name: "통합테스트보드2" }
    });
    assertStatus(renameBoard.status, 200, "PATCH /boards/{boardId}/name", renameBoard.payload);
    assert.equal(renameBoard.payload.name, "통합테스트보드2");

    const createMemo = await request("/memos", {
      method: "POST",
      token,
      body: {
        memoId,
        boardId,
        memoTypeId: "type-basic",
        content: "api integration",
        posX: 10,
        posY: 20,
        width: 320,
        height: 220,
        zIndex: 1,
        textColor: "#222222",
        fontFamily: "Pretendard",
        fontSize: 16
      }
    });
    assertStatus(createMemo.status, 200, "POST /memos", createMemo.payload);
    assert.equal(createMemo.payload.memoId, memoId);
    createdMemoId = memoId;

    const listMemos = await request(`/memos?boardId=${encodeURIComponent(boardId)}`, { token });
    assertStatus(listMemos.status, 200, "GET /memos", listMemos.payload);
    assert.ok(Array.isArray(listMemos.payload));
    assert.ok(listMemos.payload.some((memo) => memo.memoId === memoId));

    const patchMemo = await request(`/memos/${encodeURIComponent(memoId)}`, {
      method: "PATCH",
      token,
      body: {
        content: "api integration updated",
        posX: 30,
        posY: 40
      }
    });
    assertStatus(patchMemo.status, 200, "PATCH /memos/{memoId}", patchMemo.payload);
    assert.equal(patchMemo.payload.content, "api integration updated");
    assert.equal(patchMemo.payload.posX, 30);
    assert.equal(patchMemo.payload.posY, 40);

    const deleteMemo = await request(`/memos/${encodeURIComponent(memoId)}`, {
      method: "DELETE",
      token
    });
    assertStatus(deleteMemo.status, 204, "DELETE /memos/{memoId}", deleteMemo.payload);
    createdMemoId = "";

    const deleteBoard = await request(`/boards/${encodeURIComponent(boardId)}`, {
      method: "DELETE",
      token
    });
    assertStatus(deleteBoard.status, 204, "DELETE /boards/{boardId}", deleteBoard.payload);
    createdBoardId = "";

    const logout = await request("/auth/logout", {
      method: "POST",
      token
    });
    assertStatus(logout.status, 204, "POST /auth/logout", logout.payload);
    token = "";
  } finally {
    if (token && createdMemoId) {
      await request(`/memos/${encodeURIComponent(createdMemoId)}`, { method: "DELETE", token });
    }
    if (token && createdBoardId) {
      await request(`/boards/${encodeURIComponent(createdBoardId)}`, { method: "DELETE", token });
    }
    if (token) {
      await request("/auth/logout", { method: "POST", token });
    }
  }
});
