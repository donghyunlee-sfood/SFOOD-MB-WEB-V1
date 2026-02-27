(function initMemoApi(globalScope) {
  const SERVER_KEY = "memo-board-server-v1";
  const SESSION_KEY = "memo-board-session-v1";

  function now() {
    return new Date().toISOString();
  }

  function envelope(data, message) {
    return { success: true, data: data || {}, message: message || "OK", timestamp: now() };
  }

  function makeError(errorCode, message, status) {
    const err = new Error(message);
    err.status = status;
    err.payload = { success: false, errorCode, message, timestamp: now() };
    return err;
  }

  function parseServerDb() {
    const raw = localStorage.getItem(SERVER_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.users && parsed.boards && parsed.memosByBoard) {
          return parsed;
        }
      } catch (error) {
        console.error(error);
      }
    }
    return {
      users: {},
      boards: {},
      memosByBoard: {},
      memoTypes: [
        { typeId: "TYPE_BASIC", name: "Basic", color: "#fff6af" },
        { typeId: "TYPE_PEACH", name: "Peach", color: "#ffd7b8" },
        { typeId: "TYPE_MINT", name: "Mint", color: "#d5f3d2" },
        { typeId: "TYPE_SKY", name: "Sky", color: "#d6e8ff" }
      ]
    };
  }

  function saveServerDb(db) {
    localStorage.setItem(SERVER_KEY, JSON.stringify(db));
  }

  function parseSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function saveSession(session) {
    if (!session) {
      localStorage.removeItem(SESSION_KEY);
      return;
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function getCurrentUserOrThrow() {
    const session = parseSession();
    if (!session || !session.userId) {
      throw makeError("UNAUTHORIZED", "No valid session", 401);
    }
    return session.userId;
  }

  function LocalApiMock() {}

  LocalApiMock.prototype.login = async function login(googleToken) {
    const parts = String(googleToken || "").split("|");
    const userId = (parts[0] || "").trim();
    const name = (parts[1] || "Dev User").trim() || "Dev User";
    const profileImage = (parts[2] || "").trim();

    if (!userId) {
      throw makeError("VALIDATION_ERROR", "googleToken is required", 400);
    }

    const db = parseServerDb();
    const user = db.users[userId];
    if (!user) {
      db.users[userId] = { userId, name, profileImage, googleToken };
      const board = MemoCore.createDefaultBoard(userId, 1);
      board.boardName = "Welcome Board";
      board.ownerId = userId;
      db.boards[board.boardId] = board;
      db.memosByBoard[board.boardId] = [];
    } else if (user.googleToken !== googleToken) {
      throw makeError("UNAUTHORIZED", "Google token mismatch", 401);
    }

    saveServerDb(db);
    saveSession({ userId, loginAt: now() });
    return envelope({ userId, name, profileImage }, "Login success");
  };

  LocalApiMock.prototype.me = async function me() {
    const userId = getCurrentUserOrThrow();
    const db = parseServerDb();
    const user = db.users[userId];
    if (!user) {
      throw makeError("UNAUTHORIZED", "Unknown user", 401);
    }
    return envelope({ userId: user.userId, name: user.name, profileImage: user.profileImage });
  };

  LocalApiMock.prototype.logout = async function logout() {
    saveSession(null);
    return envelope({}, "Logout success");
  };

  LocalApiMock.prototype.getBoards = async function getBoards() {
    const userId = getCurrentUserOrThrow();
    const db = parseServerDb();
    const boards = Object.values(db.boards).filter(function own(board) {
      return board.ownerId === userId && !board.isHide;
    });
    return envelope(boards);
  };

  LocalApiMock.prototype.createBoard = async function createBoard(payload) {
    const userId = getCurrentUserOrThrow();
    const db = parseServerDb();
    const board = {
      boardId: payload.boardId,
      parentBoardId: payload.parentBoardId || null,
      boardName: payload.boardName,
      sortOrder: payload.sortOrder,
      ownerId: userId,
      isHide: false
    };
    db.boards[board.boardId] = board;
    db.memosByBoard[board.boardId] = db.memosByBoard[board.boardId] || [];
    saveServerDb(db);
    return envelope(board, "Board created");
  };

  LocalApiMock.prototype.renameBoard = async function renameBoard(boardId, boardName) {
    const userId = getCurrentUserOrThrow();
    const db = parseServerDb();
    const board = db.boards[boardId];
    if (!board || board.ownerId !== userId || board.isHide) {
      throw makeError("NOT_FOUND", "Board not found", 404);
    }
    board.boardName = boardName;
    saveServerDb(db);
    return envelope(board, "Board renamed");
  };

  LocalApiMock.prototype.moveBoard = async function moveBoard(boardId, parentBoardId, sortOrder) {
    const userId = getCurrentUserOrThrow();
    const db = parseServerDb();
    const board = db.boards[boardId];
    if (!board || board.ownerId !== userId || board.isHide) {
      throw makeError("NOT_FOUND", "Board not found", 404);
    }
    board.parentBoardId = parentBoardId || null;
    board.sortOrder = sortOrder;
    saveServerDb(db);
    return envelope(board, "Board moved");
  };

  LocalApiMock.prototype.deleteBoard = async function deleteBoard(boardId) {
    const userId = getCurrentUserOrThrow();
    const db = parseServerDb();
    const board = db.boards[boardId];
    if (!board || board.ownerId !== userId || board.isHide) {
      throw makeError("NOT_FOUND", "Board not found", 404);
    }
    board.isHide = true;
    (db.memosByBoard[boardId] || []).forEach(function hideMemo(memo) {
      memo.isHide = true;
    });
    saveServerDb(db);
    return envelope({}, "Board deleted");
  };

  LocalApiMock.prototype.getMemos = async function getMemos(boardId) {
    getCurrentUserOrThrow();
    const db = parseServerDb();
    const list = (db.memosByBoard[boardId] || []).filter(function visible(memo) {
      return !memo.isHide;
    });
    return envelope(list);
  };

  LocalApiMock.prototype.createMemo = async function createMemo(boardId, payload) {
    getCurrentUserOrThrow();
    const db = parseServerDb();
    const list = db.memosByBoard[boardId] || [];
    const memo = Object.assign({}, payload, { boardId, isHide: false });
    list.push(memo);
    db.memosByBoard[boardId] = list;
    saveServerDb(db);
    return envelope(memo, "Memo created");
  };

  LocalApiMock.prototype.updateMemoContent = async function updateMemoContent(memoId, content, format) {
    getCurrentUserOrThrow();
    const db = parseServerDb();
    const memo = findMemo(db, memoId);
    if (!memo) {
      throw makeError("NOT_FOUND", "Memo not found", 404);
    }
    memo.content = content;
    memo.format = format || memo.format;
    saveServerDb(db);
    return envelope(memo, "Memo content updated");
  };

  LocalApiMock.prototype.updateMemoPosition = async function updateMemoPosition(memoId, posX, posY) {
    getCurrentUserOrThrow();
    const db = parseServerDb();
    const memo = findMemo(db, memoId);
    if (!memo) {
      throw makeError("NOT_FOUND", "Memo not found", 404);
    }
    memo.posX = posX;
    memo.posY = posY;
    saveServerDb(db);
    return envelope(memo, "Memo position updated");
  };

  LocalApiMock.prototype.updateMemoSize = async function updateMemoSize(memoId, width, height) {
    getCurrentUserOrThrow();
    const db = parseServerDb();
    const memo = findMemo(db, memoId);
    if (!memo) {
      throw makeError("NOT_FOUND", "Memo not found", 404);
    }
    memo.width = width;
    memo.height = height;
    saveServerDb(db);
    return envelope(memo, "Memo size updated");
  };

  LocalApiMock.prototype.updateMemoZIndex = async function updateMemoZIndex(boardId, memos) {
    getCurrentUserOrThrow();
    const db = parseServerDb();
    const list = db.memosByBoard[boardId] || [];
    const map = new Map(memos.map(function row(item) {
      return [item.memoId, item.zIndex];
    }));
    list.forEach(function each(memo) {
      if (map.has(memo.memoId)) {
        memo.zIndex = map.get(memo.memoId);
      }
    });
    saveServerDb(db);
    return envelope({}, "Memo z-index updated");
  };

  LocalApiMock.prototype.deleteMemo = async function deleteMemo(memoId) {
    getCurrentUserOrThrow();
    const db = parseServerDb();
    const memo = findMemo(db, memoId);
    if (!memo) {
      throw makeError("NOT_FOUND", "Memo not found", 404);
    }
    memo.isHide = true;
    saveServerDb(db);
    return envelope({}, "Memo deleted");
  };

  LocalApiMock.prototype.getMemoTypes = async function getMemoTypes() {
    getCurrentUserOrThrow();
    const db = parseServerDb();
    return envelope(db.memoTypes);
  };

  function findMemo(db, memoId) {
    const boards = Object.keys(db.memosByBoard);
    for (let i = 0; i < boards.length; i += 1) {
      const memo = (db.memosByBoard[boards[i]] || []).find(function byId(item) {
        return item.memoId === memoId;
      });
      if (memo) {
        return memo;
      }
    }
    return null;
  }

  function ApiClient(baseUrl) {
    this.baseUrl = baseUrl || "/api/v1";
  }

  function pathSeg(value) {
    return encodeURIComponent(String(value));
  }

  ApiClient.prototype.request = async function request(path, method, body) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: method || "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    const status = response.status;
    const contentType = response.headers.get("content-type") || "";
    const rawText = await response.text();
    const trimmed = rawText.trim();
    let payload = null;

    if (trimmed) {
      const looksJson = contentType.includes("application/json") || trimmed.startsWith("{") || trimmed.startsWith("[");
      if (looksJson) {
        try {
          payload = JSON.parse(trimmed);
        } catch (error) {
          throw makeError("INVALID_JSON", `Invalid JSON response (HTTP ${status})`, status);
        }
      }
    }

    if (!response.ok) {
      if (payload && typeof payload === "object") {
        throw makeError(payload.errorCode || `HTTP_${status}`, payload.message || `Request failed (HTTP ${status})`, status);
      }
      const snippet = trimmed ? trimmed.slice(0, 120).replace(/\s+/g, " ") : "";
      throw makeError("HTTP_ERROR", snippet ? `HTTP ${status}: ${snippet}` : `HTTP ${status}`, status);
    }

    if (!payload || typeof payload !== "object") {
      const responseType = contentType || "unknown";
      throw makeError("INVALID_RESPONSE", `Expected JSON response but got ${responseType}`, status);
    }

    if (payload.success !== true) {
      throw makeError(payload.errorCode || "UNKNOWN", payload.message || `Request failed (HTTP ${status})`, status);
    }
    return payload;
  };

  ApiClient.prototype.login = function login(googleToken) {
    return this.request("/auth/login", "POST", { googleToken });
  };
  ApiClient.prototype.me = function me() {
    return this.request("/auth/me", "GET");
  };
  ApiClient.prototype.logout = function logout() {
    return this.request("/auth/logout", "POST");
  };
  ApiClient.prototype.getBoards = function getBoards() {
    return this.request("/boards", "GET");
  };
  ApiClient.prototype.createBoard = function createBoard(payload) {
    return this.request("/boards", "POST", payload);
  };
  ApiClient.prototype.renameBoard = function renameBoard(boardId, boardName) {
    return this.request(`/boards/${pathSeg(boardId)}/name`, "PATCH", { boardName });
  };
  ApiClient.prototype.moveBoard = function moveBoard(boardId, parentBoardId, sortOrder) {
    return this.request(`/boards/${pathSeg(boardId)}/move`, "PATCH", { parentBoardId, sortOrder });
  };
  ApiClient.prototype.deleteBoard = function deleteBoard(boardId) {
    return this.request(`/boards/${pathSeg(boardId)}`, "DELETE");
  };
  ApiClient.prototype.getMemos = function getMemos(boardId) {
    return this.request(`/boards/${pathSeg(boardId)}/memos`, "GET");
  };
  ApiClient.prototype.createMemo = function createMemo(boardId, payload) {
    return this.request(`/boards/${pathSeg(boardId)}/memos`, "POST", payload);
  };
  ApiClient.prototype.updateMemoContent = function updateMemoContent(memoId, content, format) {
    return this.request(`/memos/${pathSeg(memoId)}/content`, "PATCH", { content, format });
  };
  ApiClient.prototype.updateMemoPosition = function updateMemoPosition(memoId, posX, posY) {
    return this.request(`/memos/${pathSeg(memoId)}/position`, "PATCH", { posX, posY });
  };
  ApiClient.prototype.updateMemoSize = function updateMemoSize(memoId, width, height) {
    return this.request(`/memos/${pathSeg(memoId)}/size`, "PATCH", { width, height });
  };
  ApiClient.prototype.updateMemoZIndex = function updateMemoZIndex(boardId, memos) {
    return this.request(`/boards/${pathSeg(boardId)}/memos/zindex`, "PATCH", { memos });
  };
  ApiClient.prototype.deleteMemo = function deleteMemo(memoId) {
    return this.request(`/memos/${pathSeg(memoId)}`, "DELETE");
  };
  ApiClient.prototype.getMemoTypes = function getMemoTypes() {
    return this.request("/memo-types", "GET");
  };

  globalScope.MemoApi = {
    ApiClient,
    LocalApiMock
  };
})(typeof window !== "undefined" ? window : globalThis);
