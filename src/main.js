const API_BASE = "http://localhost:8080";
const DEFAULT_GOOGLE_CLIENT_ID = "720537531905-4srngg493kr4k2ql4d17e1pq3tvbiick.apps.googleusercontent.com";
const ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";

const state = {
  user: null,
  boards: [],
  selectedBoardId: null,
  memoTypes: [],
  memos: [],
  selectedMemoTypeId: "basic-yellow",
  googleCredential: null,
  googleProfile: null,
  googleInitialized: false
};

function $(id) {
  return document.getElementById(id);
}

function randomSuffix(length = 10) {
  let value = "";
  for (let i = 0; i < length; i += 1) {
    value += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
  }
  return value;
}

function generateBoardId() {
  const accountId = state.user?.userId || "guest";
  return `${accountId}_${randomSuffix()}`;
}

function generateMemoId() {
  const parent = state.selectedBoardId || "memo";
  return `${parent}_${randomSuffix()}`;
}

async function api(path, method = "GET", body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });

  const json = await response.json();
  if (!response.ok || json.success === false) {
    const code = json?.error?.code || `HTTP_${response.status}`;
    const message = json?.error?.message || "Request failed";
    throw new Error(`${code}: ${message}`);
  }
  return json.data;
}

function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length < 2) {
    throw new Error("INVALID_GOOGLE_TOKEN: malformed jwt");
  }
  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const payload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join("")
  );
  return JSON.parse(payload);
}

function setStatus(message) {
  $("status-message").textContent = message;
  $("error-message").textContent = "";
}

function setError(error) {
  $("error-message").textContent = error.message;
}

function renderAuth() {
  $("auth-info").textContent = state.user
    ? `Logged in as ${state.user.userId} (${state.user.name})`
    : "Not logged in";

  if (state.googleProfile) {
    $("google-info").textContent = `Google credential loaded: ${state.googleProfile.email || state.googleProfile.sub}`;
  }
}

async function attemptMoveBoard(boardId) {
  const sortOrderRaw = prompt("Move sort order", "1");
  if (sortOrderRaw === null) return;
  const sortOrder = Number(sortOrderRaw);
  if (Number.isNaN(sortOrder)) {
    throw new Error("VALIDATION_ERROR: sortOrder must be a number");
  }

  try {
    await api(`/api/boards/${encodeURIComponent(boardId)}/move`, "PATCH", {
      parentBoardId: null,
      sortOrder
    });
    setStatus(`Board moved: ${boardId}`);
  } catch (error) {
    if (String(error.message).startsWith("INTERNAL_ERROR") || String(error.message).startsWith("HTTP_404")) {
      throw new Error("BOARD_MOVE_UNSUPPORTED: backend board move API is not implemented");
    }
    throw error;
  }
}

function renderBoards() {
  const list = $("board-list");
  list.innerHTML = "";

  state.boards.forEach((board) => {
    const item = document.createElement("li");
    const title = document.createElement("button");
    title.className = "btn ghost";
    title.textContent = `${board.boardId} / ${board.name}`;
    title.onclick = withError(async () => {
      state.selectedBoardId = board.boardId;
      $("memo-id").value = generateMemoId();
      await refreshMemos();
      setStatus(`Selected board: ${board.boardId}`);
    });

    const actions = document.createElement("div");
    actions.className = "row";

    const rename = document.createElement("button");
    rename.className = "btn";
    rename.textContent = "Rename";
    rename.onclick = withError(async () => {
      const nextName = prompt("New board name", board.name);
      if (!nextName) return;
      if (nextName.length > 20) {
        throw new Error("VALIDATION_ERROR: board name must be <= 20");
      }
      await api(`/api/boards/${encodeURIComponent(board.boardId)}/name`, "PATCH", { name: nextName });
      await refreshBoards();
      setStatus(`Renamed ${board.boardId}`);
    });

    const move = document.createElement("button");
    move.className = "btn";
    move.textContent = "Move";
    move.onclick = withError(async () => {
      await attemptMoveBoard(board.boardId);
    });

    const remove = document.createElement("button");
    remove.className = "btn";
    remove.textContent = "Delete";
    remove.onclick = withError(async () => {
      await api(`/api/boards/${encodeURIComponent(board.boardId)}`, "DELETE");
      if (state.selectedBoardId === board.boardId) {
        state.selectedBoardId = null;
        state.memos = [];
        renderMemos();
      }
      await refreshBoards();
      setStatus(`Deleted ${board.boardId}`);
    });

    actions.append(rename, move, remove);
    item.append(title, actions);
    list.appendChild(item);
  });
}

function renderMemoTypes() {
  const root = $("memo-types");
  root.innerHTML = "";
  state.memoTypes.forEach((type) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = `${type.memoTypeId}`;
    chip.style.background = type.defaultColor;
    chip.onclick = () => {
      state.selectedMemoTypeId = type.memoTypeId;
      setStatus(`Selected memo type: ${type.memoTypeId}`);
    };
    root.appendChild(chip);
  });
}

function renderMemos() {
  const list = $("memo-list");
  list.innerHTML = "";

  state.memos.forEach((memo) => {
    const item = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = `${memo.memoId} / ${memo.content || "(empty)"} / z:${memo.zIndex}`;

    const actions = document.createElement("div");
    actions.className = "row";

    const update = document.createElement("button");
    update.className = "btn";
    update.textContent = "Update";
    update.onclick = withError(async () => {
      const content = prompt("Content", memo.content || "");
      if (content === null) return;
      await api(`/api/memos/${encodeURIComponent(memo.memoId)}`, "PATCH", {
        content,
        x: memo.x,
        y: memo.y,
        width: memo.width,
        height: memo.height,
        zIndex: memo.zIndex + 1
      });
      await refreshMemos();
      setStatus(`Updated ${memo.memoId}`);
    });

    const remove = document.createElement("button");
    remove.className = "btn";
    remove.textContent = "Delete";
    remove.onclick = withError(async () => {
      await api(`/api/memos/${encodeURIComponent(memo.memoId)}`, "DELETE");
      await refreshMemos();
      setStatus(`Deleted ${memo.memoId}`);
    });

    actions.append(update, remove);
    item.append(text, actions);
    list.appendChild(item);
  });
}

async function refreshBoards() {
  state.boards = await api("/api/boards");
  renderBoards();
}

async function refreshMemoTypes() {
  state.memoTypes = await api("/api/memo-types");
  renderMemoTypes();
}

async function refreshMemos() {
  if (!state.selectedBoardId) {
    state.memos = [];
    renderMemos();
    return;
  }
  state.memos = await api(`/api/memos?boardId=${encodeURIComponent(state.selectedBoardId)}`);
  renderMemos();
}

async function handleLogin() {
  const userId = $("login-user-id").value.trim();
  const name = $("login-name").value.trim();
  const googleToken = $("login-token").value.trim();
  if (!userId || !name || !googleToken) {
    throw new Error("VALIDATION_ERROR: userId, name and googleToken are required");
  }
  state.user = await api("/api/auth/login", "POST", { userId, name, googleToken });
  renderAuth();
  $("board-id").value = generateBoardId();
  $("memo-id").value = generateMemoId();
  await refreshBoards();
  await refreshMemoTypes();
  setStatus("Manual login success");
}

async function loginWithGoogleCredential() {
  if (!state.googleCredential || !state.googleProfile) {
    throw new Error("GOOGLE_AUTH_ERROR: credential is not ready");
  }

  const userId = state.googleProfile.email || state.googleProfile.sub;
  const name = state.googleProfile.name || "Google User";
  if (!userId) {
    throw new Error("GOOGLE_AUTH_ERROR: user identifier missing from token");
  }

  state.user = await api("/api/auth/login", "POST", {
    userId,
    name,
    googleToken: state.googleCredential
  });

  renderAuth();
  $("board-id").value = generateBoardId();
  $("memo-id").value = generateMemoId();
  await refreshBoards();
  await refreshMemoTypes();
  setStatus("Google login success");
}

function initGoogle() {
  const clientId = $("google-client-id").value.trim();
  if (!clientId) {
    throw new Error("VALIDATION_ERROR: Google Client ID is required");
  }
  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    throw new Error("GOOGLE_SDK_ERROR: Google SDK not loaded");
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      state.googleCredential = response.credential;
      state.googleProfile = decodeJwtPayload(response.credential);
      $("login-user-id").value = state.googleProfile.email || state.googleProfile.sub || "";
      $("login-name").value = state.googleProfile.name || "Google User";
      $("login-token").value = response.credential;
      renderAuth();
      setStatus("Google credential received");
    }
  });

  const container = $("google-render");
  container.innerHTML = "";
  window.google.accounts.id.renderButton(container, {
    theme: "outline",
    size: "large",
    text: "signin_with",
    width: 260
  });

  state.googleInitialized = true;
  setStatus("Google initialized");
}

async function checkUserCreateFlow() {
  if (!state.googleCredential || !state.googleProfile) {
    throw new Error("GOOGLE_AUTH_ERROR: login with Google first");
  }

  const tempUserId = `${state.googleProfile.email || state.googleProfile.sub}-flow-check-${Date.now()}`;
  const tempName = state.googleProfile.name || "Google User";

  await api("/api/auth/login", "POST", {
    userId: tempUserId,
    name: tempName,
    googleToken: state.googleCredential
  });

  const me = await api("/api/auth/me");
  const boards = await api("/api/boards");
  await api("/api/auth/logout", "POST");

  const created = me.userId === tempUserId && Array.isArray(boards) && boards.length > 0;
  if (!created) {
    throw new Error("PROCESS_CHECK_FAIL: user create/init flow check failed");
  }

  setStatus(`Process check success: created user ${tempUserId} with ${boards.length} board(s)`);
}

async function handleMe() {
  state.user = await api("/api/auth/me");
  renderAuth();
  setStatus("Loaded current user");
}

async function handleLogout() {
  await api("/api/auth/logout", "POST");
  state.user = null;
  state.boards = [];
  state.memos = [];
  state.memoTypes = [];
  state.selectedBoardId = null;
  renderAuth();
  renderBoards();
  renderMemoTypes();
  renderMemos();
  setStatus("Logged out");
}

async function handleCreateBoard() {
  let boardId = $("board-id").value.trim();
  const name = $("board-name").value.trim();
  if (!name) {
    throw new Error("VALIDATION_ERROR: board name is required");
  }
  if (name.length > 20) {
    throw new Error("VALIDATION_ERROR: board name must be <= 20");
  }
  if (!boardId) {
    boardId = generateBoardId();
    $("board-id").value = boardId;
  }
  await api("/api/boards", "POST", { boardId, name });
  await refreshBoards();
  setStatus(`Board created: ${boardId}`);
}

async function handleCreateMemo() {
  if (!state.selectedBoardId) {
    throw new Error("VALIDATION_ERROR: select board first");
  }
  let memoId = $("memo-id").value.trim();
  if (!memoId) {
    memoId = generateMemoId();
    $("memo-id").value = memoId;
  }

  const payload = {
    memoId,
    boardId: state.selectedBoardId,
    memoTypeId: state.selectedMemoTypeId,
    content: $("memo-content").value,
    x: Number($("memo-x").value),
    y: Number($("memo-y").value),
    width: Number($("memo-width").value),
    height: Number($("memo-height").value),
    zIndex: Number($("memo-z").value)
  };

  if (payload.width < 1 || payload.height < 1) {
    throw new Error("VALIDATION_ERROR: width and height must be >= 1");
  }

  await api("/api/memos", "POST", payload);
  await refreshMemos();
  setStatus(`Memo created: ${memoId}`);
}

function withError(handler) {
  return async () => {
    try {
      await handler();
    } catch (error) {
      setError(error);
    }
  };
}

function bindEvents() {
  $("btn-login").onclick = withError(handleLogin);
  $("btn-google-init").onclick = withError(initGoogle);
  $("btn-google-login").onclick = withError(loginWithGoogleCredential);
  $("btn-process-check").onclick = withError(checkUserCreateFlow);
  $("btn-me").onclick = withError(handleMe);
  $("btn-logout").onclick = withError(handleLogout);
  $("btn-board-auto-id").onclick = () => {
    $("board-id").value = generateBoardId();
    setStatus("Board ID auto-generated");
  };
  $("btn-board-create").onclick = withError(handleCreateBoard);
  $("btn-board-list").onclick = withError(refreshBoards);
  $("btn-type-list").onclick = withError(refreshMemoTypes);
  $("btn-memo-auto-id").onclick = withError(async () => {
    if (!state.selectedBoardId) {
      throw new Error("VALIDATION_ERROR: select board first");
    }
    $("memo-id").value = generateMemoId();
    setStatus("Memo ID auto-generated");
  });
  $("btn-memo-create").onclick = withError(handleCreateMemo);
  $("btn-memo-list").onclick = withError(refreshMemos);
}

function init() {
  bindEvents();
  renderAuth();
  renderBoards();
  renderMemoTypes();
  renderMemos();
  $("google-client-id").value = DEFAULT_GOOGLE_CLIENT_ID;
  $("board-id").value = generateBoardId();
}

init();
