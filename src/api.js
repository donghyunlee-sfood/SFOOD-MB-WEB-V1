const API_BASE_URL = "/api/v1";

async function request(path, { method = "GET", body, sessionToken } = {}) {
  const headers = {
    "Content-Type": "application/json"
  };
  if (sessionToken) {
    headers["X-Session-Token"] = sessionToken;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 204) {
    return null;
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || `API Error: ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export const api = {
  login: (userEmail, userName) =>
    request("/auth/login", {
      method: "POST",
      body: { userEmail, userName }
    }),
  session: (sessionToken) =>
    request("/auth/session", {
      method: "GET",
      sessionToken
    }),
  logout: (sessionToken) =>
    request("/auth/logout", {
      method: "POST",
      sessionToken
    }),
  getBoards: (userEmail, sessionToken) =>
    request(`/boards?userEmail=${encodeURIComponent(userEmail)}`, {
      method: "GET",
      sessionToken
    }),
  createBoard: (body, sessionToken) =>
    request("/boards", {
      method: "POST",
      body,
      sessionToken
    }),
  renameBoard: (boardId, name, sessionToken) =>
    request(`/boards/${encodeURIComponent(boardId)}/name`, {
      method: "PATCH",
      body: { name },
      sessionToken
    }),
  deleteBoard: (boardId, sessionToken) =>
    request(`/boards/${encodeURIComponent(boardId)}`, {
      method: "DELETE",
      sessionToken
    }),
  getMemos: (boardId, sessionToken) =>
    request(`/memos?boardId=${encodeURIComponent(boardId)}`, {
      method: "GET",
      sessionToken
    }),
  createMemo: (body, sessionToken) =>
    request("/memos", {
      method: "POST",
      body,
      sessionToken
    }),
  updateMemo: (memoId, body, sessionToken) =>
    request(`/memos/${encodeURIComponent(memoId)}`, {
      method: "PATCH",
      body,
      sessionToken
    }),
  deleteMemo: (memoId, sessionToken) =>
    request(`/memos/${encodeURIComponent(memoId)}`, {
      method: "DELETE",
      sessionToken
    })
};
