import { api } from "./api.js";
import {
  centerMemoPosition,
  formatErrorMessage,
  makeBoardId,
  makeMemoId,
  nextZoom,
  rollbackMemo,
  validateBoardName
} from "./domain.js";

const STORAGE_KEY = "memo-app-session-token";
const MEMO_DEFAULT_WIDTH = 300;
const MEMO_DEFAULT_HEIGHT = 200;
const MIN_MEMO_WIDTH = 220;
const MIN_MEMO_HEIGHT = 160;
const MEMO_TYPES = [
  { id: "type-basic", label: "Basic" },
  { id: "type-soft", label: "Soft" },
  { id: "type-alert", label: "Alert" }
];

const memoTimers = new Map();

const state = {
  sessionToken: localStorage.getItem(STORAGE_KEY),
  userEmail: "",
  userName: "",
  expiresAt: "",
  boards: [],
  selectedBoardId: null,
  memos: [],
  editingMemoId: null,
  zoom: 1,
  isBusy: false,
  lastFailedAction: null,
  lastFailedLabel: "",
  status: "",
  error: ""
};

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setStatus(message) {
  state.status = message;
  state.lastFailedAction = null;
  state.lastFailedLabel = "";
  render();
}

function setError(message, retryAction = null, retryLabel = "") {
  state.error = message;
  state.lastFailedAction = retryAction;
  state.lastFailedLabel = retryLabel;
  render();
}

function clearMessages() {
  state.status = "";
  state.error = "";
  state.lastFailedAction = null;
  state.lastFailedLabel = "";
}

function setBusy(value) {
  state.isBusy = value;
  render();
}

async function runBusyAction(action, { successMessage = "", onErrorPrefix = "", retryAction = null, retryLabel = "" } = {}) {
  setBusy(true);
  try {
    const result = await action();
    if (successMessage) {
      setStatus(successMessage);
    }
    return result;
  } catch (error) {
    const message = formatErrorMessage(error);
    setError(onErrorPrefix ? `${onErrorPrefix}: ${message}` : message, retryAction, retryLabel);
    return null;
  } finally {
    state.isBusy = false;
    render();
  }
}

function memoClassName(memoTypeId) {
  if (memoTypeId === "type-soft") {
    return "memo type-soft";
  }
  if (memoTypeId === "type-alert") {
    return "memo type-alert";
  }
  return "memo";
}

function getSelectedBoard() {
  return state.boards.find((board) => board.boardId === state.selectedBoardId) || null;
}

function getMaxZIndex() {
  return state.memos.reduce((max, memo) => Math.max(max, Number(memo.zIndex || 0)), 0);
}

function patchMemoLocal(memoId, patch) {
  state.memos = state.memos.map((memo) =>
    memo.memoId === memoId
      ? {
          ...memo,
          ...patch
        }
      : memo
  );
}

function updateBoards(boards) {
  state.boards = boards.filter((board) => !board.hide);
  if (!state.selectedBoardId || !state.boards.find((board) => board.boardId === state.selectedBoardId)) {
    state.selectedBoardId = state.boards[0]?.boardId || null;
  }
}

async function loadBoards() {
  if (!state.userEmail || !state.sessionToken) {
    return;
  }
  const boards = await api.getBoards(state.userEmail, state.sessionToken);
  updateBoards(boards);
}

async function loadMemos() {
  if (!state.selectedBoardId || !state.sessionToken) {
    state.memos = [];
    render();
    return;
  }
  const memos = await api.getMemos(state.selectedBoardId, state.sessionToken);
  state.memos = memos.filter((memo) => !memo.hide);
}

async function refreshBoardAndMemo() {
  await loadBoards();
  await loadMemos();
  render();
}

async function init() {
  if (!state.sessionToken) {
    render();
    return;
  }
  try {
    const session = await api.session(state.sessionToken);
    state.userEmail = session.userEmail;
    state.userName = session.userName;
    state.expiresAt = session.expiresAt;
    await refreshBoardAndMemo();
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    state.sessionToken = "";
    setError(`세션 확인 실패: ${formatErrorMessage(error)}`, () => init(), "세션 확인");
  }
  render();
}

function renderAuth() {
  return `
    <section class="screen auth">
      <div class="card">
        <h1>Post-it Board</h1>
        <p>로그인 후 보드와 메모를 관리하세요.</p>
        <form id="login-form">
          <label for="email">이메일</label>
          <input id="email" name="email" type="email" required placeholder="user@test.com" />
          <label for="name">이름</label>
          <input id="name" name="name" type="text" required placeholder="홍길동" />
          <button type="submit">로그인</button>
        </form>
        ${state.error ? `<p class="error">${escapeHtml(state.error)}</p>` : ""}
      </div>
    </section>
  `;
}

function renderMemoCard(memo) {
  const isEditing = state.editingMemoId === memo.memoId;
  const content = escapeHtml(memo.content || "");
  return `
    <article
      class="${memoClassName(memo.memoTypeId)}"
      data-memo-id="${memo.memoId}"
      style="left:${Number(memo.posX || 0)}px; top:${Number(memo.posY || 0)}px; width:${Number(memo.width || MEMO_DEFAULT_WIDTH)}px; height:${Number(memo.height || MEMO_DEFAULT_HEIGHT)}px; z-index:${Number(memo.zIndex || 0)};"
    >
      <div class="memo-head" data-action="drag-memo" data-memo-id="${memo.memoId}">
        <strong>${escapeHtml(memo.memoId)}</strong>
        <div class="memo-head-buttons">
          <button type="button" class="secondary" data-action="edit-memo" data-memo-id="${memo.memoId}">Edit</button>
          <button type="button" class="danger" data-action="delete-memo" data-memo-id="${memo.memoId}">X</button>
        </div>
      </div>
      <div class="memo-body">
        ${isEditing
          ? `
            <textarea data-action="memo-input" data-memo-id="${memo.memoId}">${content}</textarea>
            <div class="editor-toolbar">
              <label>글자색</label>
              <input type="color" value="${escapeHtml(memo.textColor || "#222222")}" data-action="memo-style" data-style-key="textColor" data-memo-id="${memo.memoId}" />
              <label>폰트</label>
              <select data-action="memo-style" data-style-key="fontFamily" data-memo-id="${memo.memoId}">
                <option value="Pretendard" ${memo.fontFamily === "Pretendard" ? "selected" : ""}>Pretendard</option>
                <option value="Malgun Gothic" ${memo.fontFamily === "Malgun Gothic" ? "selected" : ""}>Malgun Gothic</option>
                <option value="Noto Sans KR" ${memo.fontFamily === "Noto Sans KR" ? "selected" : ""}>Noto Sans KR</option>
              </select>
              <label>폰트 크기</label>
              <input type="number" min="10" max="40" value="${Number(memo.fontSize || 16)}" data-action="memo-style" data-style-key="fontSize" data-memo-id="${memo.memoId}" />
            </div>
          `
          : `
            <div
              class="memo-content"
              data-action="open-editor"
              data-memo-id="${memo.memoId}"
              style="color:${escapeHtml(memo.textColor || "#222222")}; font-family:${escapeHtml(memo.fontFamily || "Pretendard")}; font-size:${Number(memo.fontSize || 16)}px;"
            >${content || "(비어 있는 메모)"}</div>
          `}
      </div>
      <button type="button" class="resize-handle" data-action="resize-memo" data-memo-id="${memo.memoId}" aria-label="resize memo"></button>
    </article>
  `;
}

function renderMain() {
  const boardList = state.boards
    .map((board) => `
      <li class="board-item ${state.selectedBoardId === board.boardId ? "active" : ""}">
        <button type="button" class="board-name" data-action="select-board" data-board-id="${board.boardId}">${escapeHtml(board.name)}</button>
        <button type="button" class="secondary" data-action="rename-board" data-board-id="${board.boardId}">수정</button>
        <button type="button" class="danger" data-action="delete-board" data-board-id="${board.boardId}">삭제</button>
      </li>
    `)
    .join("");
  const memoCards = state.memos.map((memo) => renderMemoCard(memo)).join("");
  const selectedBoard = getSelectedBoard();
  const memoToolbar = MEMO_TYPES.map((type) => `<button type="button" data-action="create-memo" data-memo-type="${type.id}">${type.label}</button>`).join("");

  return `
    <section class="screen app-shell ${state.isBusy ? "is-busy" : ""}">
      <header class="topbar">
        <div><strong>${escapeHtml(state.userName)}</strong> (${escapeHtml(state.userEmail)})</div>
        <div class="topbar-actions">
          <span>Zoom ${Math.round(state.zoom * 100)}%</span>
          <button type="button" class="secondary" data-action="reload">새로고침</button>
          <button type="button" class="danger" data-action="logout">로그아웃</button>
        </div>
      </header>
      <div class="content">
        <aside class="sidebar">
          <h3>Boards</h3>
          <button type="button" data-action="add-board">+ 보드 추가</button>
          <ul>${boardList || "<li>보드가 없습니다.</li>"}</ul>
        </aside>
        <main class="workspace">
          <div class="workspace-head">
            <h2>${escapeHtml(selectedBoard?.name || "보드를 선택하세요.")}</h2>
          </div>
          <section class="board-viewport" id="board-viewport">
            <div class="board-canvas" style="transform: scale(${state.zoom});">
              ${memoCards || "<p class='empty-text'>메모가 없습니다. 하단 툴바로 메모를 추가하세요.</p>"}
            </div>
          </section>
          <div class="memo-toolbar fixed-toolbar">${memoToolbar}</div>
          ${state.status ? `<p class="status">${escapeHtml(state.status)}</p>` : ""}
          ${state.error ? `<p class="error">${escapeHtml(state.error)}</p>` : ""}
          ${state.error && state.lastFailedAction ? `<button type="button" class="secondary retry-button" data-action="retry-last-failed">${escapeHtml(state.lastFailedLabel || "실패 작업")} 재시도</button>` : ""}
        </main>
      </div>
    </section>
  `;
}

function render() {
  const app = document.querySelector("#app");
  const authed = Boolean(state.sessionToken && state.userEmail);
  app.innerHTML = authed ? renderMain() : renderAuth();
  wireEvents();
}

function scheduleMemoSave(memoId, patch, previousMemo) {
  const previousTimer = memoTimers.get(memoId);
  if (previousTimer) {
    clearTimeout(previousTimer);
  }
  setStatus("자동 저장 대기 중...");
  const timer = setTimeout(async () => {
    try {
      await api.updateMemo(memoId, patch, state.sessionToken);
      setStatus("자동 저장 완료");
    } catch (error) {
      state.memos = rollbackMemo(state.memos, previousMemo);
      state.editingMemoId = null;
      setError(`자동 저장 실패: ${formatErrorMessage(error)}`);
    } finally {
      memoTimers.delete(memoId);
      render();
    }
  }, 1000);
  memoTimers.set(memoId, timer);
}

async function saveMemoImmediately(memoId, patch, previousMemo, successMessage) {
  try {
    await api.updateMemo(memoId, patch, state.sessionToken);
    setStatus(successMessage);
  } catch (error) {
    state.memos = rollbackMemo(state.memos, previousMemo);
    setError(
      `메모 저장 실패: ${formatErrorMessage(error)}`,
      () => saveMemoImmediately(memoId, patch, previousMemo, successMessage),
      "메모 저장"
    );
  } finally {
    render();
  }
}

async function onLoginSubmit(event) {
  event.preventDefault();
  clearMessages();
  const formData = new FormData(event.currentTarget);
  const userEmail = String(formData.get("email") || "").trim();
  const userName = String(formData.get("name") || "").trim();
  if (!userEmail || !userName) {
    setError("이메일과 이름을 입력하세요.");
    return;
  }
  await loginWithCredentials(userEmail, userName);
}

async function loginWithCredentials(userEmail, userName) {
  await runBusyAction(
    async () => {
      const result = await api.login(userEmail, userName);
      state.sessionToken = result.sessionToken;
      state.userEmail = result.userEmail;
      state.userName = result.userName;
      state.expiresAt = result.expiresAt;
      localStorage.setItem(STORAGE_KEY, result.sessionToken);
      await refreshBoardAndMemo();
    },
    {
      successMessage: "로그인되었습니다.",
      onErrorPrefix: "로그인 실패",
      retryAction: () => loginWithCredentials(userEmail, userName),
      retryLabel: "로그인"
    }
  );
}

async function onLogout() {
  if (!confirm("로그아웃을 하시겠습니까?")) {
    return;
  }
  try {
    await api.logout(state.sessionToken);
  } catch (error) {
    setStatus(`로그아웃 API 응답 실패: ${error.message}`);
  }
  state.sessionToken = "";
  state.userEmail = "";
  state.userName = "";
  state.expiresAt = "";
  state.boards = [];
  state.selectedBoardId = null;
  state.memos = [];
  state.editingMemoId = null;
  localStorage.removeItem(STORAGE_KEY);
  clearMessages();
  render();
}

async function onAddBoard() {
  const name = prompt("보드명을 입력하세요.");
  if (name === null) {
    return;
  }
  const validationMessage = validateBoardName(name.trim());
  if (validationMessage) {
    setError(validationMessage);
    return;
  }
  clearMessages();
  await runBusyAction(
    async () => {
      await api.createBoard(
        {
          boardId: makeBoardId(state.userEmail),
          userEmail: state.userEmail,
          name: name.trim(),
          parentBoardId: null,
          sortOrder: state.boards.length
        },
        state.sessionToken
      );
      await refreshBoardAndMemo();
    },
    {
      successMessage: "보드가 생성되었습니다.",
      onErrorPrefix: "보드 생성 실패",
      retryAction: () => onAddBoard(),
      retryLabel: "보드 생성"
    }
  );
}

async function onRenameBoard(boardId) {
  const board = state.boards.find((item) => item.boardId === boardId);
  if (!board) {
    return;
  }
  const name = prompt("새 보드명을 입력하세요.", board.name);
  if (name === null) {
    return;
  }
  const validationMessage = validateBoardName(name.trim());
  if (validationMessage) {
    setError(validationMessage);
    return;
  }
  clearMessages();
  await runBusyAction(
    async () => {
      await api.renameBoard(boardId, name.trim(), state.sessionToken);
      await refreshBoardAndMemo();
    },
    {
      successMessage: "보드명이 수정되었습니다.",
      onErrorPrefix: "보드 수정 실패",
      retryAction: () => onRenameBoard(boardId),
      retryLabel: "보드 수정"
    }
  );
}

async function onDeleteBoard(boardId) {
  if (!confirm("삭제하시겠습니까?")) {
    return;
  }
  clearMessages();
  await runBusyAction(
    async () => {
      await api.deleteBoard(boardId, state.sessionToken);
      await refreshBoardAndMemo();
    },
    {
      successMessage: "보드가 삭제되었습니다.",
      onErrorPrefix: "보드 삭제 실패",
      retryAction: () => onDeleteBoard(boardId),
      retryLabel: "보드 삭제"
    }
  );
}

async function onCreateMemo(memoTypeId) {
  if (!state.selectedBoardId) {
    setError("먼저 보드를 선택하세요.");
    return;
  }
  const viewport = document.querySelector("#board-viewport");
  if (!viewport) {
    return;
  }

  const centerPosition = centerMemoPosition({
    scrollLeft: viewport.scrollLeft,
    scrollTop: viewport.scrollTop,
    clientWidth: viewport.clientWidth,
    clientHeight: viewport.clientHeight,
    zoom: state.zoom,
    width: MEMO_DEFAULT_WIDTH,
    height: MEMO_DEFAULT_HEIGHT
  });

  const memoId = makeMemoId(state.selectedBoardId);
  const maxZIndex = getMaxZIndex();

  clearMessages();
  await runBusyAction(
    async () => {
      await api.createMemo(
        {
          memoId,
          boardId: state.selectedBoardId,
          memoTypeId,
          content: "",
          posX: centerPosition.posX,
          posY: centerPosition.posY,
          width: MEMO_DEFAULT_WIDTH,
          height: MEMO_DEFAULT_HEIGHT,
          zIndex: maxZIndex + 1,
          textColor: "#222222",
          fontFamily: "Pretendard",
          fontSize: 16
        },
        state.sessionToken
      );
      await loadMemos();
      state.editingMemoId = memoId;
    },
    {
      successMessage: "메모가 생성되었습니다.",
      onErrorPrefix: "메모 생성 실패",
      retryAction: () => onCreateMemo(memoTypeId),
      retryLabel: "메모 생성"
    }
  );
}

async function onDeleteMemo(memoId) {
  if (!confirm("메모를 삭제하시겠습니까?")) {
    return;
  }
  clearMessages();
  await runBusyAction(
    async () => {
      await api.deleteMemo(memoId, state.sessionToken);
      await loadMemos();
      state.editingMemoId = null;
    },
    {
      successMessage: "메모가 삭제되었습니다.",
      onErrorPrefix: "메모 삭제 실패",
      retryAction: () => onDeleteMemo(memoId),
      retryLabel: "메모 삭제"
    }
  );
}

function onMemoBlur(target) {
  const memoId = target.dataset.memoId;
  const memo = state.memos.find((item) => item.memoId === memoId);
  if (!memo) {
    return;
  }
  const previousMemo = { ...memo };
  const patch = { content: target.value };
  patchMemoLocal(memoId, patch);
  state.editingMemoId = null;
  scheduleMemoSave(memoId, patch, previousMemo);
}

function onMemoStyleChange(target) {
  const memoId = target.dataset.memoId;
  const styleKey = target.dataset.styleKey;
  const memo = state.memos.find((item) => item.memoId === memoId);
  if (!memo) {
    return;
  }
  const previousMemo = { ...memo };
  const nextValue = styleKey === "fontSize" ? Number(target.value) : target.value;
  const patch = { [styleKey]: nextValue };
  patchMemoLocal(memoId, patch);
  scheduleMemoSave(memoId, patch, previousMemo);
}

async function focusMemoToFront(memoId) {
  const memo = state.memos.find((item) => item.memoId === memoId);
  if (!memo) {
    return;
  }
  const nextZIndex = getMaxZIndex() + 1;
  if (Number(memo.zIndex || 0) === nextZIndex) {
    return;
  }
  const previousMemo = { ...memo };
  patchMemoLocal(memoId, { zIndex: nextZIndex });
  await saveMemoImmediately(memoId, { zIndex: nextZIndex }, previousMemo, "메모 순서가 갱신되었습니다.");
}

function bindDragHandlers() {
  document.querySelectorAll("[data-action='drag-memo']").forEach((dragHandle) => {
    dragHandle.addEventListener("mousedown", async (event) => {
      if (event.button !== 0) {
        return;
      }
      const memoId = dragHandle.dataset.memoId;
      const memoElement = dragHandle.closest("[data-memo-id]");
      const memo = state.memos.find((item) => item.memoId === memoId);
      if (!memo || !memoElement) {
        return;
      }
      await focusMemoToFront(memoId);
      event.preventDefault();

      const initialMouseX = event.clientX;
      const initialMouseY = event.clientY;
      const initialPosX = Number(memo.posX || 0);
      const initialPosY = Number(memo.posY || 0);
      let nextPosX = initialPosX;
      let nextPosY = initialPosY;

      const handleMouseMove = (moveEvent) => {
        const deltaX = (moveEvent.clientX - initialMouseX) / state.zoom;
        const deltaY = (moveEvent.clientY - initialMouseY) / state.zoom;
        nextPosX = Math.max(0, Math.round(initialPosX + deltaX));
        nextPosY = Math.max(0, Math.round(initialPosY + deltaY));
        memoElement.style.left = `${nextPosX}px`;
        memoElement.style.top = `${nextPosY}px`;
      };

      const handleMouseUp = async () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);

        if (nextPosX === initialPosX && nextPosY === initialPosY) {
          return;
        }
        const previousMemo = { ...memo };
        const patch = { posX: nextPosX, posY: nextPosY };
        patchMemoLocal(memoId, patch);
        await saveMemoImmediately(memoId, patch, previousMemo, "메모 위치가 저장되었습니다.");
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    });
  });
}

function bindResizeHandlers() {
  document.querySelectorAll("[data-action='resize-memo']").forEach((resizeHandle) => {
    resizeHandle.addEventListener("mousedown", async (event) => {
      if (event.button !== 0) {
        return;
      }
      const memoId = resizeHandle.dataset.memoId;
      const memoElement = resizeHandle.closest("[data-memo-id]");
      const memo = state.memos.find((item) => item.memoId === memoId);
      if (!memo || !memoElement) {
        return;
      }
      await focusMemoToFront(memoId);
      event.preventDefault();

      const initialMouseX = event.clientX;
      const initialMouseY = event.clientY;
      const initialWidth = Number(memo.width || MEMO_DEFAULT_WIDTH);
      const initialHeight = Number(memo.height || MEMO_DEFAULT_HEIGHT);
      let nextWidth = initialWidth;
      let nextHeight = initialHeight;

      const handleMouseMove = (moveEvent) => {
        const deltaX = (moveEvent.clientX - initialMouseX) / state.zoom;
        const deltaY = (moveEvent.clientY - initialMouseY) / state.zoom;
        nextWidth = Math.max(MIN_MEMO_WIDTH, Math.round(initialWidth + deltaX));
        nextHeight = Math.max(MIN_MEMO_HEIGHT, Math.round(initialHeight + deltaY));
        memoElement.style.width = `${nextWidth}px`;
        memoElement.style.height = `${nextHeight}px`;
      };

      const handleMouseUp = async () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        if (nextWidth === initialWidth && nextHeight === initialHeight) {
          return;
        }
        const previousMemo = { ...memo };
        const patch = { width: nextWidth, height: nextHeight };
        patchMemoLocal(memoId, patch);
        await saveMemoImmediately(memoId, patch, previousMemo, "메모 크기가 저장되었습니다.");
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    });
  });
}

function bindZoomHandler() {
  const viewport = document.querySelector("#board-viewport");
  if (!viewport) {
    return;
  }
  viewport.addEventListener(
    "wheel",
    (event) => {
      if (!event.ctrlKey) {
        return;
      }
      event.preventDefault();
      state.zoom = nextZoom(state.zoom, event.deltaY);
      render();
    },
    { passive: false }
  );
}

function wireEvents() {
  const loginForm = document.querySelector("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", onLoginSubmit);
  }

  document.querySelectorAll("[data-action='select-board']").forEach((element) => {
    element.addEventListener("click", async () => {
      state.selectedBoardId = element.dataset.boardId;
      state.editingMemoId = null;
      await loadMemos();
      render();
    });
  });

  document.querySelectorAll("[data-action='rename-board']").forEach((element) => {
    element.addEventListener("click", () => onRenameBoard(element.dataset.boardId));
  });

  document.querySelectorAll("[data-action='delete-board']").forEach((element) => {
    element.addEventListener("click", () => onDeleteBoard(element.dataset.boardId));
  });

  document.querySelectorAll("[data-action='add-board']").forEach((element) => {
    element.addEventListener("click", onAddBoard);
  });

  document.querySelectorAll("[data-action='reload']").forEach((element) => {
    element.addEventListener("click", async () => {
      clearMessages();
      await runBusyAction(
        async () => {
          await refreshBoardAndMemo();
        },
        {
          successMessage: "데이터를 다시 불러왔습니다.",
          onErrorPrefix: "새로고침 실패",
          retryAction: () => refreshBoardAndMemo(),
          retryLabel: "새로고침"
        }
      );
    });
  });

  document.querySelectorAll("[data-action='logout']").forEach((element) => {
    element.addEventListener("click", onLogout);
  });

  document.querySelectorAll("[data-action='create-memo']").forEach((element) => {
    element.addEventListener("click", () => onCreateMemo(element.dataset.memoType));
  });

  document.querySelectorAll("[data-action='delete-memo']").forEach((element) => {
    element.addEventListener("click", () => onDeleteMemo(element.dataset.memoId));
  });

  document.querySelectorAll("[data-action='edit-memo']").forEach((element) => {
    element.addEventListener("click", () => {
      state.editingMemoId = element.dataset.memoId;
      render();
    });
  });

  document.querySelectorAll("[data-action='open-editor']").forEach((element) => {
    element.addEventListener("dblclick", () => {
      state.editingMemoId = element.dataset.memoId;
      render();
    });
  });

  document.querySelectorAll("[data-action='memo-input']").forEach((element) => {
    element.addEventListener("blur", () => onMemoBlur(element));
  });

  document.querySelectorAll("[data-action='memo-style']").forEach((element) => {
    element.addEventListener("change", () => onMemoStyleChange(element));
  });

  document.querySelectorAll("[data-action='retry-last-failed']").forEach((element) => {
    element.addEventListener("click", async () => {
      if (typeof state.lastFailedAction === "function") {
        clearMessages();
        await state.lastFailedAction();
      }
    });
  });

  bindDragHandlers();
  bindResizeHandlers();
  bindZoomHandler();
}

init();
