(function initMemoApp() {
  const UI_KEY = "memo-board-ui-v2";
  const GOOGLE_CLIENT_ID = "720537531905-4srngg493kr4k2ql4d17e1pq3tvbiick.apps.googleusercontent.com";

  const refs = {
    toast: document.getElementById("toast"),
    confirmModal: document.getElementById("confirm-modal"),
    confirmMessage: document.getElementById("confirm-message"),
    confirmOkBtn: document.getElementById("confirm-ok-btn"),
    confirmCancelBtn: document.getElementById("confirm-cancel-btn"),
    loginScreen: document.getElementById("login-screen"),
    appScreen: document.getElementById("app-screen"),
    googleSignInSlot: document.getElementById("google-signin-slot"),
    logoutBtn: document.getElementById("logout-btn"),
    userName: document.getElementById("user-name"),
    userId: document.getElementById("user-id"),
    addBoardBtn: document.getElementById("add-board-btn"),
    boardList: document.getElementById("board-list"),
    boardTitle: document.getElementById("board-title"),
    sidebar: document.getElementById("sidebar"),
    lnbResizer: document.getElementById("lnb-resizer"),
    boardCanvas: document.getElementById("board-canvas"),
    boardLoading: document.getElementById("board-loading"),
    canvasStage: document.getElementById("canvas-stage"),
    zoomLabel: document.getElementById("zoom-label"),
    zoomOutBtn: document.getElementById("zoom-out-btn"),
    zoomInBtn: document.getElementById("zoom-in-btn"),
    memoTypeToolbar: document.getElementById("memo-type-toolbar"),
    memoToolbarHandle: document.getElementById("memo-toolbar-handle"),
    contextMenu: document.getElementById("memo-context-menu")
  };

  const templates = {
    board: document.getElementById("board-item-template"),
    memo: document.getElementById("memo-card-template")
  };

  const state = {
    service: new MemoApi.ApiClient("/api/v1"),
    authUser: null,
    boards: [],
    memosByBoard: {},
    selectedBoardId: null,
    memoTypes: [],
    selectedTypeId: "TYPE_BASIC",
    editingMemoId: null,
    boardRenameId: null,
    boardRenamePending: false,
    boardDraft: null,
    zoom: 1,
    lnbWidth: 300,
    saveTimers: new Map(),
    contextMemoId: null,
    dragBoardId: null,
    dropTargetBoardId: null,
    dropPosition: "after",
    toolbarDragging: false,
    toolbarOffsetX: 0,
    toolbarOffsetY: 0,
    isResizingLnb: false,
    quillConfigured: false,
    canvasPanning: false,
    canvasPanStartX: 0,
    canvasPanStartY: 0,
    canvasScrollLeft: 0,
    canvasScrollTop: 0
  };

  restoreUiState();
  bindGlobalEvents();
  window.__memoGoogleLoaded = function onGoogleLoaded() {
    initGoogleSignIn();
  };
  initGoogleSignIn();
  checkSession();

  function bindGlobalEvents() {
    refs.logoutBtn.addEventListener("click", onLogout);
    refs.addBoardBtn.addEventListener("click", function topBoard() {
      startBoardDraft(null);
    });
    refs.zoomOutBtn.addEventListener("click", function onZoomOut() {
      adjustZoom(-0.1);
    });
    refs.zoomInBtn.addEventListener("click", function onZoomIn() {
      adjustZoom(0.1);
    });
    refs.memoToolbarHandle.addEventListener("mousedown", function onToolbarDown(event) {
      event.preventDefault();
      const rect = refs.memoTypeToolbar.getBoundingClientRect();
      state.toolbarDragging = true;
      state.toolbarOffsetX = event.clientX - rect.left;
      state.toolbarOffsetY = event.clientY - rect.top;
      refs.memoToolbarHandle.style.cursor = "grabbing";
    });

    refs.lnbResizer.addEventListener("mousedown", function onDown() {
      state.isResizingLnb = true;
    });

    refs.boardCanvas.addEventListener("mousedown", function onCanvasDown(event) {
      if (event.button !== 2) {
        return;
      }
      if (event.target.closest(".memo-card")) {
        return;
      }
      state.canvasPanning = true;
      state.canvasPanStartX = event.clientX;
      state.canvasPanStartY = event.clientY;
      state.canvasScrollLeft = refs.boardCanvas.scrollLeft;
      state.canvasScrollTop = refs.boardCanvas.scrollTop;
      refs.boardCanvas.classList.add("pan-active");
      event.preventDefault();
    });

    refs.boardCanvas.addEventListener("contextmenu", function onCanvasContextMenu(event) {
      if (event.target.closest(".memo-card")) {
        return;
      }
      event.preventDefault();
    });

    document.addEventListener("mousemove", function onMove(event) {
      if (state.canvasPanning) {
        const dx = event.clientX - state.canvasPanStartX;
        const dy = event.clientY - state.canvasPanStartY;
        refs.boardCanvas.scrollLeft = state.canvasScrollLeft - dx;
        refs.boardCanvas.scrollTop = state.canvasScrollTop - dy;
      }
      if (!state.isResizingLnb) {
        if (state.toolbarDragging) {
          const x = Math.max(8, Math.min(window.innerWidth - refs.memoTypeToolbar.offsetWidth - 8, event.clientX - state.toolbarOffsetX));
          const y = Math.max(8, Math.min(window.innerHeight - refs.memoTypeToolbar.offsetHeight - 8, event.clientY - state.toolbarOffsetY));
          refs.memoTypeToolbar.style.left = `${x}px`;
          refs.memoTypeToolbar.style.top = `${y}px`;
          refs.memoTypeToolbar.style.bottom = "auto";
          refs.memoTypeToolbar.style.transform = "none";
        }
        return;
      }
      state.lnbWidth = Math.max(240, Math.min(520, event.clientX - 10));
      refs.sidebar.style.width = `${state.lnbWidth}px`;
    });

    document.addEventListener("mouseup", function onUp() {
      if (state.canvasPanning) {
        state.canvasPanning = false;
        refs.boardCanvas.classList.remove("pan-active");
      }
      if (state.isResizingLnb) {
        state.isResizingLnb = false;
        persistUiState();
      }
      if (state.toolbarDragging) {
        state.toolbarDragging = false;
        refs.memoToolbarHandle.style.cursor = "grab";
      }
    });

    refs.boardCanvas.addEventListener("wheel", function onWheel(event) {
      if (!event.ctrlKey) {
        return;
      }
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      state.zoom = MemoCore.clampZoom(state.zoom + delta);
      renderZoom();
      renderMemos();
      persistUiState();
    }, { passive: false });

    refs.contextMenu.addEventListener("click", onContextMenuAction);
    document.addEventListener("click", function closeContextMenu() {
      hideContextMenu();
      closeAllColorPalettes();
    });

    refs.boardList.addEventListener("dragover", function onOver(event) {
      event.preventDefault();
    });

    refs.boardList.addEventListener("drop", async function onDrop(event) {
      event.preventDefault();
      if (!state.dragBoardId) {
        return;
      }
      const targetRow = event.target.closest(".board-item");
      if (!targetRow) {
        const sourceId = state.dragBoardId;
        clearBoardDropIndicators();
        state.dropTargetBoardId = null;
        state.dragBoardId = null;
        state.dropPosition = "after";
        moveBoard(sourceId, null, "after");
      }
    });
  }

  function adjustZoom(delta) {
    state.zoom = MemoCore.clampZoom(state.zoom + delta);
    renderZoom();
    renderMemos();
    persistUiState();
  }

  function restoreUiState() {
    const raw = localStorage.getItem(UI_KEY);
    if (!raw) {
      refs.sidebar.style.width = `${state.lnbWidth}px`;
      return;
    }
    try {
      const ui = JSON.parse(raw);
      state.zoom = typeof ui.zoom === "number" ? MemoCore.clampZoom(ui.zoom) : state.zoom;
      state.lnbWidth = typeof ui.lnbWidth === "number" ? ui.lnbWidth : state.lnbWidth;
      refs.sidebar.style.width = `${state.lnbWidth}px`;
    } catch (error) {
      refs.sidebar.style.width = `${state.lnbWidth}px`;
    }
  }

  function persistUiState() {
    localStorage.setItem(UI_KEY, JSON.stringify({
      zoom: state.zoom,
      lnbWidth: state.lnbWidth
    }));
  }

  function showToast(message, type) {
    const variant = type || "info";
    refs.toast.textContent = message;
    refs.toast.classList.remove("type-info", "type-success", "type-error", "type-warn");
    refs.toast.classList.add(`type-${variant}`);
    refs.toast.classList.add("show");
    setTimeout(function hideToastLater() {
      refs.toast.classList.remove("show");
    }, 1800);
  }

  function showErrorFrom(error) {
    showToast(parseError(error), "error");
  }

  function askConfirm(message) {
    return new Promise(function confirmPromise(resolve) {
      refs.confirmMessage.textContent = message;
      refs.confirmModal.classList.remove("hidden");

      function cleanup(result) {
        refs.confirmModal.classList.add("hidden");
        refs.confirmOkBtn.removeEventListener("click", onOk);
        refs.confirmCancelBtn.removeEventListener("click", onCancel);
        refs.confirmModal.removeEventListener("click", onBackdrop);
        document.removeEventListener("keydown", onEsc);
        resolve(result);
      }

      function onOk() {
        cleanup(true);
      }
      function onCancel() {
        cleanup(false);
      }
      function onBackdrop(event) {
        if (event.target === refs.confirmModal) {
          cleanup(false);
        }
      }
      function onEsc(event) {
        if (event.key === "Escape") {
          cleanup(false);
        }
      }

      refs.confirmOkBtn.addEventListener("click", onOk);
      refs.confirmCancelBtn.addEventListener("click", onCancel);
      refs.confirmModal.addEventListener("click", onBackdrop);
      document.addEventListener("keydown", onEsc);
    });
  }

  function parseError(error) {
    if (error && error.payload && error.payload.message) {
      return error.payload.message;
    }
    return error && error.message ? error.message : "Unexpected error";
  }

  function setBoardLoading(isLoading) {
    if (isLoading) {
      refs.boardLoading.classList.remove("hidden");
    } else {
      refs.boardLoading.classList.add("hidden");
    }
  }

  function initGoogleSignIn() {
    refs.googleSignInSlot.innerHTML = "";

    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential
    });

    window.google.accounts.id.renderButton(refs.googleSignInSlot, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      width: 320
    });
  }

  function handleGoogleCredential(response) {
    const credential = response && response.credential;
    if (!credential) {
      showToast("Google 인증 정보를 받지 못했습니다.", "error");
      return;
    }

    const payload = parseJwtPayload(credential);
    if (!payload || !payload.email) {
      showToast("Google 토큰 파싱에 실패했습니다.", "error");
      return;
    }

    const token = `${payload.email}|${payload.name || "User"}|${payload.picture || ""}`;
    loginWithToken(token);
  }

  function parseJwtPayload(jwt) {
    try {
      const part = jwt.split(".")[1];
      const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(atob(base64).split("").map(function mapChar(c) {
        return `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`;
      }).join(""));
      return JSON.parse(json);
    } catch (error) {
      return null;
    }
  }

  async function checkSession() {
    try {
      const result = await state.service.me();
      state.authUser = result.data;
      showApp();
      await bootstrapData();
      showToast("Session restored", "success");
    } catch (error) {
      state.authUser = null;
      showLogin();
    }
  }

  async function loginWithToken(token) {
    try {
      const result = await state.service.login(token);
      state.authUser = result.data;
      showApp();
      await bootstrapData();
      showToast("Login success", "success");
    } catch (error) {
      showErrorFrom(error);
    }
  }

  async function onLogout() {
    if (!(await askConfirm("로그아웃 하시겠습니까?"))) {
      return;
    }
    try {
      await state.service.logout();
      state.authUser = null;
      state.boards = [];
      state.memosByBoard = {};
      state.selectedBoardId = null;
      showLogin();
      showToast("Logged out", "success");
    } catch (error) {
      showErrorFrom(error);
    }
  }

  function showLogin() {
    refs.loginScreen.classList.remove("hidden");
    refs.appScreen.classList.add("hidden");
  }

  function showApp() {
    refs.loginScreen.classList.add("hidden");
    refs.appScreen.classList.remove("hidden");
    refs.userName.textContent = state.authUser.name || "User";
    refs.userId.textContent = state.authUser.userId;
    renderZoom();
  }

  async function bootstrapData() {
    await loadMemoTypes();
    await refreshBoards();
  }

  async function loadMemoTypes() {
    try {
      const result = await state.service.getMemoTypes();
      const rows = extractMemoTypeRows(result.data);
      state.memoTypes = rows.length ? rows : defaultMemoTypes();
    } catch (error) {
      showErrorFrom(error);
      state.memoTypes = defaultMemoTypes();
    }
    renderMemoTypeToolbar();
  }

  function extractMemoTypeRows(payload) {
    const source = resolveArrayPayload(payload);

    return source
      .map(normalizeMemoTypeRow)
      .filter(function valid(row) {
        return !!row.typeId;
      });
  }

  function resolveArrayPayload(payload) {
    if (Array.isArray(payload)) {
      return payload;
    }
    if (!payload || typeof payload !== "object") {
      return [];
    }

    const candidates = [
      payload.memoTypes,
      payload.memoTypeList,
      payload.memo_type_list,
      payload.items,
      payload.list,
      payload.rows,
      payload.content,
      payload.data
    ];

    for (let i = 0; i < candidates.length; i += 1) {
      if (Array.isArray(candidates[i])) {
        return candidates[i];
      }
    }
    return [];
  }

  function pickValue(base, keys) {
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (base[key] !== undefined && base[key] !== null && base[key] !== "") {
        return base[key];
      }
    }
    return undefined;
  }

  function normalizeMemoTypeRow(row) {
    const base = row && typeof row === "object" ? row : {};

    const typeId = pickValue(base, [
      "typeId",
      "memoTypeId",
      "memo_type_id",
      "type_id",
      "id"
    ]) || "";

    const name = pickValue(base, [
      "name",
      "typeName",
      "memoTypeName",
      "memo_type_name",
      "type_name",
      "label",
      "title"
    ]) || typeId || "Basic";

    const color = pickValue(base, [
      "color",
      "defaultColor",
      "default_color",
      "bgColor",
      "backgroundColor",
      "memoColor",
      "memo_type_color",
      "memoTypeColor",
      "memoTypeColorCode",
      "colorCode",
      "hexColor",
      "hex"
    ]) || "#fff4a9";

    let normalizedColor = String(color || "#fff4a9").trim();
    normalizedColor = normalizedColor.replace(/['"]/g, "");
    if (/^[0-9A-Fa-f]{6}$/.test(normalizedColor)) {
      normalizedColor = `#${normalizedColor}`;
    } else if (/^[0-9A-Fa-f]{3}$/.test(normalizedColor)) {
      normalizedColor = `#${normalizedColor}`;
    }
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(normalizedColor)) {
      normalizedColor = "#fff4a9";
    }

    return {
      typeId: String(typeId || "TYPE_BASIC"),
      name: String(name || "Basic"),
      color: normalizedColor
    };
  }

  function getMemoTypeMeta(typeId) {
    const found = state.memoTypes.find(function findType(type) {
      return type.typeId === typeId;
    });
    if (found) {
      return found;
    }
    return { typeId: "TYPE_BASIC", name: "Basic", color: "#fff4a9" };
  }

  function defaultMemoTypes() {
    return [
      { typeId: "TYPE_BASIC", name: "Basic", color: "#fff4a9" },
      { typeId: "TYPE_PEACH", name: "Peach", color: "#ffddbe" },
      { typeId: "TYPE_MINT", name: "Mint", color: "#d8f5d6" },
      { typeId: "TYPE_SKY", name: "Sky", color: "#dce9ff" }
    ];
  }

  async function refreshBoards() {
    try {
      const result = await state.service.getBoards();
      state.boards = result.data.slice();
      if (!state.selectedBoardId || !state.boards.some(function has(board) {
        return board.boardId === state.selectedBoardId && !board.isHide;
      })) {
        state.selectedBoardId = state.boards.length ? state.boards[0].boardId : null;
      }
      renderBoards();
      await refreshMemos();
    } catch (error) {
      showErrorFrom(error);
    }
  }

  async function refreshMemos() {
    if (!state.selectedBoardId) {
      refs.boardTitle.textContent = "No board";
      refs.canvasStage.innerHTML = "";
      setBoardLoading(false);
      return;
    }

    const board = state.boards.find(function find(item) {
      return item.boardId === state.selectedBoardId;
    });
    refs.boardTitle.textContent = board ? board.boardName : "Board";
    refs.canvasStage.innerHTML = "";
    setBoardLoading(true);

    try {
      const result = await state.service.getMemos(state.selectedBoardId);
      const rows = Array.isArray(result.data) ? result.data : [];
      state.memosByBoard[state.selectedBoardId] = MemoCore.normalizeZIndex(rows.map(normalizeMemoRow));
      renderMemos();
    } catch (error) {
      showErrorFrom(error);
    } finally {
      setBoardLoading(false);
    }
  }

  function normalizeMemoRow(row) {
    const base = row && typeof row === "object" ? row : {};
    return {
      memoId: base.memoId || MemoCore.generateMemoId(state.selectedBoardId || "board"),
      boardId: base.boardId || state.selectedBoardId,
      typeId: base.typeId || "TYPE_BASIC",
      content: typeof base.content === "string" ? base.content : "",
      posX: Number.isFinite(base.posX) ? base.posX : 120,
      posY: Number.isFinite(base.posY) ? base.posY : 120,
      width: Number.isFinite(base.width) ? base.width : 300,
      height: Number.isFinite(base.height) ? base.height : 220,
      zIndex: Number.isFinite(base.zIndex) ? base.zIndex : 1,
      isHide: !!base.isHide,
      format: base.format || { textColor: "#2a2420", fontFamily: "Georgia, serif", fontSize: "16" }
    };
  }

  function renderZoom() {
    refs.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
    refs.canvasStage.style.transform = `scale(${state.zoom})`;
  }

  function renderMemoTypeToolbar() {
    const handleMarkup = `
      <li class="memo-toolbar-handle-wrap">
        <button id="memo-toolbar-handle" class="memo-toolbar-handle" type="button" aria-label="Move memo toolbar" title="Move toolbar">⠿</button>
      </li>
    `;
    refs.memoTypeToolbar.innerHTML = "";
    refs.memoTypeToolbar.insertAdjacentHTML("beforeend", handleMarkup);
    refs.memoToolbarHandle = document.getElementById("memo-toolbar-handle");
    refs.memoToolbarHandle.addEventListener("mousedown", function onToolbarDown(event) {
      event.preventDefault();
      const rect = refs.memoTypeToolbar.getBoundingClientRect();
      state.toolbarDragging = true;
      state.toolbarOffsetX = event.clientX - rect.left;
      state.toolbarOffsetY = event.clientY - rect.top;
      refs.memoToolbarHandle.style.cursor = "grabbing";
    });
    state.memoTypes.forEach(function eachType(type) {
      const li = document.createElement("li");
      const button = document.createElement("button");
      const safeTypeId = type && type.typeId ? type.typeId : "TYPE_BASIC";
      const safeName = type && type.name ? type.name : "Basic";
      const safeColor = type && type.color ? type.color : "#fff4a9";
      button.type = "button";
      button.innerHTML = `<span class="memo-type-dot" style="background:${safeColor};"></span><span>${safeName}</span>`;
      button.style.setProperty("background-color", safeColor, "important");
      button.addEventListener("click", function chooseType() {
        state.selectedTypeId = safeTypeId;
        createMemo(safeTypeId);
      });
      li.appendChild(button);
      refs.memoTypeToolbar.appendChild(li);
    });
  }

  function renderBoards() {
    refs.boardList.innerHTML = "";
    const tree = MemoCore.buildBoardTree(state.boards);
    const rows = injectBoardDraftRow(MemoCore.flattenBoardTree(tree));

    rows.forEach(function each(row) {
      const fragment = templates.board.content.cloneNode(true);
      const item = fragment.querySelector(".board-item");
      const selectButton = fragment.querySelector(".board-select");
      const inlineInput = fragment.querySelector(".board-inline-input");
      const addChildBtn = fragment.querySelector(".board-add-child");
      const renameBtn = fragment.querySelector(".board-rename");
      const deleteBtn = fragment.querySelector(".board-delete");

      item.dataset.boardId = row.board.boardId;
      item.style.marginLeft = `${row.depth * 14}px`;
      selectButton.textContent = row.board.boardName || "";
      addChildBtn.textContent = "+";
      renameBtn.textContent = "✎";
      renameBtn.title = "Rename";
      deleteBtn.textContent = "🗑";

      if (!row.isDraft && row.board.boardId === state.selectedBoardId) {
        item.classList.add("active");
      }

      if (row.isDraft) {
        item.classList.add("active");
        selectButton.classList.add("hidden");
        inlineInput.classList.remove("hidden");
        inlineInput.value = row.board.boardName || "";
        inlineInput.placeholder = row.board.parentBoardId ? "Child board name" : "Board name";
        addChildBtn.classList.add("hidden");
        renameBtn.textContent = row.pending ? "…" : "✓";
        renameBtn.title = row.pending ? "Saving" : "Save";
        renameBtn.disabled = !!row.pending;
        deleteBtn.textContent = "✕";
        deleteBtn.title = "Cancel";
        deleteBtn.disabled = !!row.pending;

        renameBtn.addEventListener("click", function saveDraft() {
          submitBoardDraft(inlineInput.value);
        });
        deleteBtn.addEventListener("click", function cancelDraft() {
          cancelBoardDraft();
        });
        inlineInput.addEventListener("keydown", function onDraftKey(event) {
          if (event.key === "Enter") {
            event.preventDefault();
            submitBoardDraft(inlineInput.value);
          } else if (event.key === "Escape") {
            event.preventDefault();
            cancelBoardDraft();
          }
        });

        setTimeout(function focusDraft() {
          inlineInput.focus();
          inlineInput.select();
        }, 0);

        refs.boardList.appendChild(fragment);
        return;
      }

      if (state.boardRenameId === row.board.boardId) {
        inlineInput.classList.remove("hidden");
        selectButton.classList.add("hidden");
        inlineInput.value = row.board.boardName;
        renameBtn.disabled = state.boardRenamePending;
        addChildBtn.disabled = state.boardRenamePending;
        deleteBtn.disabled = state.boardRenamePending;
        setTimeout(function focusLater() {
          inlineInput.focus();
          inlineInput.select();
        }, 0);
      }

      selectButton.addEventListener("click", async function selectBoard() {
        state.selectedBoardId = row.board.boardId;
        state.editingMemoId = null;
        state.contextMemoId = null;
        renderBoards();
        refreshMemos();
      });

      addChildBtn.addEventListener("click", function addChild() {
        startBoardDraft(row.board.boardId);
      });

      renameBtn.addEventListener("click", function rename() {
        state.boardRenameId = row.board.boardId;
        renderBoards();
      });

      inlineInput.addEventListener("keydown", function keydown(event) {
        if (event.key === "Enter") {
          event.preventDefault();
          commitRename(row.board.boardId, inlineInput.value);
        } else if (event.key === "Escape") {
          state.boardRenameId = null;
          state.boardRenamePending = false;
          renderBoards();
        }
      });

      inlineInput.addEventListener("blur", function blur() {
        commitRename(row.board.boardId, inlineInput.value);
      });

      deleteBtn.addEventListener("click", async function deleteBoard() {
        if (!(await askConfirm("이 보드를 삭제하시겠습니까?"))) {
          return;
        }
        const snapshot = {
          boards: state.boards.map(function clone(board) { return Object.assign({}, board); }),
          memosByBoard: JSON.parse(JSON.stringify(state.memosByBoard)),
          selectedBoardId: state.selectedBoardId
        };

        const target = state.boards.find(function findBoard(b) {
          return b.boardId === row.board.boardId;
        });
        if (target) {
          target.isHide = true;
        }
        if (state.memosByBoard[row.board.boardId]) {
          state.memosByBoard[row.board.boardId] = state.memosByBoard[row.board.boardId].map(function hideMemo(memo) {
            return Object.assign({}, memo, { isHide: true });
          });
        }
        if (state.selectedBoardId === row.board.boardId) {
          const next = state.boards.find(function findNext(b) {
            return !b.isHide && b.boardId !== row.board.boardId;
          });
          state.selectedBoardId = next ? next.boardId : null;
        }
        renderBoards();
        refreshMemos();

        try {
          await state.service.deleteBoard(row.board.boardId);
          showToast("Board deleted", "success");
          await refreshBoards();
        } catch (error) {
          state.boards = snapshot.boards;
          state.memosByBoard = snapshot.memosByBoard;
          state.selectedBoardId = snapshot.selectedBoardId;
          renderBoards();
          refreshMemos();
          showErrorFrom(error);
        }
      });

      item.addEventListener("dragstart", function dragStart() {
        if (state.boardDraft || state.boardRenamePending) {
          return;
        }
        state.dragBoardId = row.board.boardId;
        state.dropTargetBoardId = null;
        state.dropPosition = "after";
        clearBoardDropIndicators();
      });

      item.addEventListener("dragover", function dragOver(event) {
        event.preventDefault();
        const rect = item.getBoundingClientRect();
        const position = (event.clientY - rect.top) < (rect.height / 2) ? "before" : "after";
        if (state.dropTargetBoardId !== row.board.boardId) {
          state.dropTargetBoardId = row.board.boardId;
        }
        state.dropPosition = position;
        setBoardDropIndicator(item, position);
      });

      item.addEventListener("dragleave", function dragLeave(event) {
        if (!item.contains(event.relatedTarget) && state.dropTargetBoardId === row.board.boardId) {
          state.dropTargetBoardId = null;
          item.classList.remove("drop-target");
        }
      });

      item.addEventListener("dragend", function dragEnd() {
        state.dragBoardId = null;
        state.dropTargetBoardId = null;
        state.dropPosition = "after";
        clearBoardDropIndicators();
      });

      item.addEventListener("drop", async function drop(event) {
        event.preventDefault();
        if (!state.dragBoardId || state.dragBoardId === row.board.boardId) {
          return;
        }
        if (isDescendant(row.board.boardId, state.dragBoardId)) {
          showToast("Cannot move board into its descendant", "warn");
          return;
        }
        const sourceId = state.dragBoardId;
        const dropPosition = state.dropPosition || "after";
        clearBoardDropIndicators();
        state.dragBoardId = null;
        state.dropTargetBoardId = null;
        state.dropPosition = "after";
        moveBoard(sourceId, row.board.boardId, dropPosition);
      });

      refs.boardList.appendChild(fragment);
    });
  }

  function injectBoardDraftRow(rows) {
    if (!state.boardDraft) {
      return rows;
    }
    const draft = state.boardDraft;
    const copied = rows.slice();
    const draftDepth = draft.parentBoardId ? getBoardDepth(rows, draft.parentBoardId) + 1 : 0;
    const draftRow = {
      board: {
        boardId: "__draft__",
        parentBoardId: draft.parentBoardId,
        boardName: draft.name || "",
        sortOrder: 0,
        isHide: false
      },
      depth: draftDepth,
      isDraft: true,
      pending: !!draft.pending
    };

    if (!draft.parentBoardId) {
      copied.unshift(draftRow);
      return copied;
    }

    const parentIndex = copied.findIndex(function findParent(row) {
      return row.board.boardId === draft.parentBoardId;
    });
    if (parentIndex < 0) {
      copied.unshift(draftRow);
      return copied;
    }

    let insertIndex = parentIndex + 1;
    while (insertIndex < copied.length && copied[insertIndex].depth > copied[parentIndex].depth) {
      insertIndex += 1;
    }
    copied.splice(insertIndex, 0, draftRow);
    return copied;
  }

  function clearBoardDropIndicators() {
    refs.boardList.querySelectorAll(".drop-before, .drop-after").forEach(function clearClass(node) {
      node.classList.remove("drop-before", "drop-after");
    });
  }

  function setBoardDropIndicator(item, position) {
    clearBoardDropIndicators();
    if (position === "before") {
      item.classList.add("drop-before");
    } else {
      item.classList.add("drop-after");
    }
  }

  function getBoardDepth(rows, boardId) {
    const found = rows.find(function findRow(row) {
      return row.board.boardId === boardId;
    });
    return found ? found.depth : 0;
  }

  function startBoardDraft(parentBoardId) {
    if (state.boardRenamePending) {
      return;
    }
    state.boardRenameId = null;
    state.boardDraft = {
      parentBoardId: parentBoardId || null,
      name: "",
      pending: false
    };
    renderBoards();
  }

  function cancelBoardDraft() {
    state.boardDraft = null;
    renderBoards();
  }

  function isDescendant(targetBoardId, sourceBoardId) {
    let current = state.boards.find(function byId(board) {
      return board.boardId === targetBoardId;
    });

    while (current && current.parentBoardId) {
      if (current.parentBoardId === sourceBoardId) {
        return true;
      }
      current = state.boards.find(function byParent(board) {
        return board.boardId === current.parentBoardId;
      });
    }
    return false;
  }

  async function commitRename(boardId, nextName) {
    if (state.boardRenameId !== boardId || state.boardRenamePending) {
      return;
    }
    const board = state.boards.find(function findBoard(item) {
      return item.boardId === boardId;
    });
    if (!board) {
      state.boardRenameId = null;
      renderBoards();
      return;
    }

    const sanitized = MemoCore.sanitizeBoardName(nextName);
    if (sanitized === board.boardName) {
      state.boardRenameId = null;
      state.boardRenamePending = false;
      renderBoards();
      return;
    }

    const validation = MemoCore.validateBoardName(nextName);
    if (!validation.valid) {
      showToast(validation.message, "warn");
      return;
    }

    state.boardRenamePending = true;
    renderBoards();
    try {
      await state.service.renameBoard(boardId, sanitized);
      state.boardRenameId = null;
      await refreshBoards();
      showToast("Board updated", "success");
    } catch (error) {
      showErrorFrom(error);
    } finally {
      state.boardRenamePending = false;
      renderBoards();
    }
  }

  async function submitBoardDraft(name) {
    if (!state.boardDraft || state.boardDraft.pending) {
      return;
    }

    const validation = MemoCore.validateBoardName(name);
    if (!validation.valid) {
      showToast(validation.message, "warn");
      return;
    }

    const snapshotDraft = Object.assign({}, state.boardDraft);
    state.boardDraft.pending = true;
    state.boardDraft.name = MemoCore.sanitizeBoardName(name);
    renderBoards();

    const parentBoardId = state.boardDraft.parentBoardId;
    const boardId = MemoCore.generateBoardId(state.authUser.userId);
    const sortOrder = MemoCore.getNextSortOrder(state.boards, parentBoardId);

    try {
      await state.service.createBoard({
        boardId,
        parentBoardId: parentBoardId || null,
        boardName: MemoCore.sanitizeBoardName(name),
        sortOrder
      });
      state.boardDraft = null;
      showToast("Board created", "success");
      await refreshBoards();
      state.selectedBoardId = boardId;
      await refreshMemos();
    } catch (error) {
      state.boardDraft = null;
      showErrorFrom(error);
      state.boardDraft = snapshotDraft;
      state.boardDraft.pending = false;
      renderBoards();
    }
  }

  function moveBoard(boardId, targetBoardId, dropPosition) {
    const snapshot = state.boards.map(function clone(board) {
      return Object.assign({}, board);
    });

    const localResult = applyLocalBoardMove(state.boards, boardId, targetBoardId, dropPosition || "after");
    if (!localResult) {
      state.dragBoardId = null;
      state.dropTargetBoardId = null;
      state.dropPosition = "after";
      renderBoards();
      return;
    }

    state.dragBoardId = null;
    state.dropTargetBoardId = null;
    state.dropPosition = "after";
    renderBoards();

    state.service.moveBoard(boardId, localResult.parentBoardId, localResult.sortOrder).then(function onMoved() {
      showToast("Board moved", "success");
    }).catch(function onMoveFailed(error) {
      state.boards = snapshot;
      renderBoards();
      showErrorFrom(error);
    });
  }

  function applyLocalBoardMove(boards, sourceBoardId, targetBoardId, dropPosition) {
    const source = boards.find(function findSource(board) {
      return board.boardId === sourceBoardId;
    });
    const target = targetBoardId ? boards.find(function findTarget(board) {
      return board.boardId === targetBoardId;
    }) : null;
    if (!source) {
      return null;
    }

    const oldParentId = source.parentBoardId || null;
    const newParentId = target ? (target.parentBoardId || null) : null;

    const newSiblings = boards
      .filter(function sameParent(board) {
        return !board.isHide && board.parentBoardId === newParentId && board.boardId !== sourceBoardId;
      })
      .sort(function bySort(a, b) {
        return a.sortOrder - b.sortOrder;
      });

    let insertIndex = newSiblings.length;
    if (target) {
      const targetIndex = newSiblings.findIndex(function atTarget(board) {
        return board.boardId === targetBoardId;
      });
      if (targetIndex >= 0) {
        insertIndex = dropPosition === "before" ? targetIndex : targetIndex + 1;
      }
    }

    source.parentBoardId = newParentId;
    newSiblings.splice(insertIndex, 0, source);
    newSiblings.forEach(function reorder(board, index) {
      board.sortOrder = index + 1;
    });

    if (oldParentId !== newParentId) {
      const oldSiblings = boards
        .filter(function oldParent(board) {
          return !board.isHide && board.parentBoardId === oldParentId && board.boardId !== sourceBoardId;
        })
        .sort(function bySort(a, b) {
          return a.sortOrder - b.sortOrder;
        });
      oldSiblings.forEach(function reorder(board, index) {
        board.sortOrder = index + 1;
      });
    }

    return {
      parentBoardId: source.parentBoardId,
      sortOrder: source.sortOrder
    };
  }

  async function createMemo(typeId) {
    if (!state.selectedBoardId) {
      showToast("Select board first", "warn");
      return;
    }

    const currentMemos = state.memosByBoard[state.selectedBoardId] || [];
    const nextZ = currentMemos.length
      ? Math.max.apply(null, currentMemos.map(function maxZ(memo) { return memo.zIndex || 1; })) + 1
      : 1;
    const memo = MemoCore.createDefaultMemo(state.selectedBoardId, nextZ, typeId || state.selectedTypeId);

    const cx = refs.boardCanvas.scrollLeft + (refs.boardCanvas.clientWidth / 2);
    const cy = refs.boardCanvas.scrollTop + (refs.boardCanvas.clientHeight / 2);
    memo.posX = Math.max(20, (cx / state.zoom) - (memo.width / 2));
    memo.posY = Math.max(20, (cy / state.zoom) - (memo.height / 2));

    const snapshot = currentMemos.slice();
    currentMemos.push(memo);
    state.memosByBoard[state.selectedBoardId] = MemoCore.normalizeZIndex(currentMemos);
    state.editingMemoId = memo.memoId;
    renderMemos();

    state.service.createMemo(state.selectedBoardId, memo).then(function onCreated() {
      showToast("Memo created", "success");
    }).catch(function onCreateFailed(error) {
      state.memosByBoard[state.selectedBoardId] = snapshot;
      if (state.editingMemoId === memo.memoId) {
        state.editingMemoId = null;
      }
      renderMemos();
      showErrorFrom(error);
    });
  }

  function renderMemos() {
    refs.canvasStage.innerHTML = "";
    hideContextMenu();

    const memos = (state.memosByBoard[state.selectedBoardId] || []).slice().sort(function byZ(a, b) {
      return a.zIndex - b.zIndex;
    });

    memos.forEach(function eachMemo(memo) {
      const fragment = templates.memo.content.cloneNode(true);
      const card = fragment.querySelector(".memo-card");
      const deleteButton = fragment.querySelector(".memo-delete");
      const colorToggle = fragment.querySelector(".memo-color-toggle");
      const colorPalette = fragment.querySelector(".memo-color-palette");
      const viewEl = fragment.querySelector(".memo-content-view");
      const editEl = fragment.querySelector(".memo-content-edit");
      const toolbar = fragment.querySelector(".editor-toolbar");
      const boldBtn = fragment.querySelector(".toolbar-bold");
      const italicBtn = fragment.querySelector(".toolbar-italic");
      const underlineBtn = fragment.querySelector(".toolbar-underline");
      const strikeBtn = fragment.querySelector(".toolbar-strike");
      const olistBtn = fragment.querySelector(".toolbar-olist");
      const colorInput = fragment.querySelector(".toolbar-color");
      const fontSelect = fragment.querySelector(".toolbar-font");
      const sizeSelect = fragment.querySelector(".toolbar-size");
      const checkBtn = fragment.querySelector(".toolbar-check");
      const listBtn = fragment.querySelector(".toolbar-list");
      const clearBtn = fragment.querySelector(".toolbar-clear");
      const doneBtn = fragment.querySelector(".toolbar-done");
      const resizeHandle = fragment.querySelector(".resize-handle");
      const memoTypeId = memo.typeId || "TYPE_BASIC";
      const memoTypeMeta = getMemoTypeMeta(memoTypeId);
      const memoVariant = getMemoVariantClass(memoTypeId);
      const memoBgColor = getMemoBackgroundColor(memo, memoTypeMeta);

      card.classList.add(memoVariant);
      card.style.backgroundColor = memoBgColor;
      card.style.left = `${memo.posX}px`;
      card.style.top = `${memo.posY}px`;
      card.style.width = `${memo.width}px`;
      card.style.height = `${memo.height}px`;
      card.style.zIndex = String(memo.zIndex || 1);
      card.dataset.memoId = memo.memoId;

      const format = memo.format || { textColor: "#2a2420", fontFamily: "Georgia, serif", fontSize: "16" };
      viewEl.classList.add("ql-editor");
      applyMemoStyle(viewEl, format);
      applyMemoStyle(editEl, format);
      viewEl.innerHTML = memo.content || "<p></p>";
      editEl.innerHTML = memo.content || "<p></p>";
      colorInput.value = format.textColor || "#2a2420";
      fontSelect.value = format.fontFamily || "Georgia, serif";
      sizeSelect.value = String(format.fontSize || "16");

      const editing = state.editingMemoId === memo.memoId;
      let editor = null;
      if (editing) {
        card.classList.add("is-editing");
        viewEl.classList.add("hidden");
        editEl.classList.remove("hidden");
        editEl.classList.add("memo-edit-active");
        editor = createEditorAdapter(editEl, memo, format);
      }

      card.addEventListener("dblclick", function enterEdit(event) {
        if (event.target.closest(".memo-delete") || event.target.closest(".resize-handle")) {
          return;
        }
        if (!isQuillAvailable()) {
          showToast("Editor load failed: Quill unavailable", "error");
          return;
        }
        event.preventDefault();
        state.editingMemoId = memo.memoId;
        renderMemos();
      });

      colorToggle.addEventListener("click", function togglePalette(event) {
        event.stopPropagation();
        closeAllColorPalettes();
        colorPalette.classList.toggle("hidden");
      });

      colorPalette.querySelectorAll(".memo-color-option").forEach(function eachColor(btn) {
        btn.addEventListener("click", function chooseColor(event) {
          event.stopPropagation();
          const picked = btn.dataset.color || memoBgColor;
          const prevFormat = Object.assign({}, memo.format || {});
          memo.format = Object.assign({}, memo.format || {}, { memoBgColor: picked });
          card.style.backgroundColor = picked;
          colorPalette.classList.add("hidden");
          state.service.updateMemoContent(memo.memoId, memo.content, memo.format).catch(function onColorSaveFailed(error) {
            memo.format = prevFormat;
            card.style.backgroundColor = getMemoBackgroundColor(memo, memoTypeMeta);
            showErrorFrom(error);
            renderMemos();
          });
        });
      });

      let finishedEditing = false;
      let outsideClickBound = false;
      function onOutsideClick(event) {
        const target = event.target;
        if (
          card.contains(target) ||
          toolbar.contains(target) ||
          (target && typeof target.closest === "function" && target.closest(".memo-card"))
        ) {
          return;
        }
        completeEditingOnce();
      }
      function completeEditingOnce() {
        if (finishedEditing || state.editingMemoId !== memo.memoId) {
          return;
        }
        finishedEditing = true;
        if (outsideClickBound) {
          document.removeEventListener("mousedown", onOutsideClick, true);
          outsideClickBound = false;
        }
        finishMemoEditing(memo, editor, colorInput, fontSelect, sizeSelect);
      }

      function runEditorCommand(command, value) {
        if (!editor) {
          return;
        }
        editor.exec(command, value);
      }

      doneBtn.addEventListener("click", completeEditingOnce);
      const keyTarget = editor ? editor.root : editEl;
      keyTarget.addEventListener("keydown", function onEditorKey(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          if (outsideClickBound) {
            document.removeEventListener("mousedown", onOutsideClick, true);
            outsideClickBound = false;
          }
          state.editingMemoId = null;
          renderMemos();
          return;
        }
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          completeEditingOnce();
        }
      });
      colorInput.addEventListener("change", function onColor() {
        memo.format = memo.format || {};
        memo.format.textColor = colorInput.value;
        if (editor) {
          editor.applyStyle(memo.format);
        }
      });
      fontSelect.addEventListener("change", function onFont() {
        memo.format = memo.format || {};
        memo.format.fontFamily = fontSelect.value;
        if (editor) {
          editor.applyStyle(memo.format);
        }
      });
      sizeSelect.addEventListener("change", function onSize() {
        memo.format = memo.format || {};
        memo.format.fontSize = sizeSelect.value;
        if (editor) {
          editor.applyStyle(memo.format);
        }
      });
      checkBtn.addEventListener("click", function addCheck() {
        runEditorCommand("insertChecklist");
      });
      listBtn.addEventListener("click", function addList() {
        runEditorCommand("insertUnorderedList");
      });
      olistBtn.addEventListener("click", function addOrderedList() {
        runEditorCommand("insertOrderedList");
      });
      boldBtn.addEventListener("click", function makeBold() {
        runEditorCommand("bold");
      });
      italicBtn.addEventListener("click", function makeItalic() {
        runEditorCommand("italic");
      });
      underlineBtn.addEventListener("click", function makeUnderline() {
        runEditorCommand("underline");
      });
      strikeBtn.addEventListener("click", function makeStrike() {
        runEditorCommand("strikeThrough");
      });
      clearBtn.addEventListener("click", function clearStyle() {
        runEditorCommand("removeFormat");
      });

      deleteButton.addEventListener("click", async function deleteMemo() {
        if (!(await askConfirm("이 메모를 삭제하시겠습니까?"))) {
          return;
        }
        try {
          await state.service.deleteMemo(memo.memoId);
          showToast("Memo deleted", "success");
          await refreshMemos();
        } catch (error) {
          showErrorFrom(error);
        }
      });

      card.addEventListener("mousedown", function onCardDragStart(event) {
        if (event.button !== 0) {
          return;
        }
        if (state.editingMemoId === memo.memoId) {
          return;
        }
        if (shouldBlockMemoDrag(event.target)) {
          return;
        }
        startMemoDrag(event, memo, card);
      });

      resizeHandle.addEventListener("mousedown", function onResizeStart(event) {
        if (state.editingMemoId === memo.memoId) {
          return;
        }
        event.preventDefault();
        startMemoResize(event, memo, card);
      });

      card.addEventListener("contextmenu", function onContextMenu(event) {
        event.preventDefault();
        openContextMenu(memo.memoId, event.clientX, event.clientY);
      });

      refs.canvasStage.appendChild(fragment);
      if (editing) {
        toolbar.classList.remove("hidden");
        toolbar.classList.add("memo-floating-toolbar");
        toolbar.style.left = `${memo.posX}px`;
        toolbar.style.top = `${memo.posY + memo.height + 8}px`;
        toolbar.style.width = `${Math.max(440, Math.min(680, memo.width + 80))}px`;
        toolbar.style.zIndex = String((memo.zIndex || 1) + 1);
        toolbar.style.background = "#ffffff";
        refs.canvasStage.appendChild(toolbar);
        setTimeout(function bindOutsideClick() {
          if (state.editingMemoId !== memo.memoId || finishedEditing) {
            return;
          }
          document.addEventListener("mousedown", onOutsideClick, true);
          outsideClickBound = true;
        }, 0);
        setTimeout(function focusLater() {
          if (editor) {
            editor.focus();
          } else {
            editEl.focus();
          }
        }, 0);
      }
    });
  }

  function closeAllColorPalettes() {
    refs.canvasStage.querySelectorAll(".memo-color-palette").forEach(function hidePalette(node) {
      node.classList.add("hidden");
    });
  }

  function getMemoVariantClass(typeId) {
    const visibleTypes = state.memoTypes.length ? state.memoTypes : defaultMemoTypes();
    const index = Math.max(0, visibleTypes.findIndex(function byType(type) {
      return type.typeId === typeId;
    }));
    const variant = index % 3;
    if (variant === 0) {
      return "memo-variant-plain";
    }
    if (variant === 1) {
      return "memo-variant-sticky";
    }
    return "memo-variant-lined";
  }

  function getMemoBackgroundColor(memo, memoTypeMeta) {
    const fromFormat = memo && memo.format && memo.format.memoBgColor ? String(memo.format.memoBgColor) : "";
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(fromFormat)) {
      return fromFormat;
    }
    return memoTypeMeta.color || "#fff4a9";
  }

  function ensureQuillConfiguration() {
    if (state.quillConfigured || typeof window.Quill !== "function") {
      return;
    }
    const SizeStyle = window.Quill.import("attributors/style/size");
    SizeStyle.whitelist = ["14px", "16px", "18px", "22px"];
    window.Quill.register(SizeStyle, true);
    state.quillConfigured = true;
  }

  function isQuillAvailable() {
    return typeof window.Quill === "function";
  }

  function createEditorAdapter(editEl, memo, format) {
    if (!isQuillAvailable()) {
      throw new Error("Quill editor is required but unavailable.");
    }
    ensureQuillConfiguration();
    const quill = new window.Quill(editEl, {
      theme: "snow",
      modules: { toolbar: false }
    });
    const loadedHtml = prepareHtmlForEditor(
      typeof memo.content === "string" && memo.content.trim() ? memo.content : "<p><br></p>"
    );
    quill.setText("", "silent");
    quill.root.innerHTML = loadedHtml;
    quill.update("silent");
    quill.history.clear();
    applyMemoStyle(quill.root, format);
    return {
      root: quill.root,
      focus: function focus() {
        quill.focus();
      },
      applyStyle: function applyStyle(nextFormat) {
        applyMemoStyle(quill.root, nextFormat);
      },
      getHtml: function getHtml() {
        return quill.root.innerHTML;
      },
        exec: function exec(command, value) {
          const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
          if (command === "insertChecklist") {
            quill.insertText(range.index, "☐ ");
            quill.setSelection(range.index + 2, 0, "silent");
            return;
          }
        if (command === "insertText") {
          quill.insertText(range.index, value || "");
          quill.setSelection(range.index + String(value || "").length, 0);
          return;
        }
        if (command === "insertUnorderedList") {
          quill.format("list", "bullet");
          return;
        }
        if (command === "insertOrderedList") {
          quill.format("list", "ordered");
          return;
        }
        if (command === "removeFormat") {
          quill.removeFormat(range.index, range.length || 0);
          return;
        }
        const mapped = command === "strikeThrough" ? "strike" : command;
        quill.format(mapped, true);
      }
    };
  }

  function prepareHtmlForEditor(html) {
    const source = typeof html === "string" && html.trim() ? html : "<p><br></p>";
    const decoded = decodeEscapedHtml(source).trim();
    return decoded || "<p><br></p>";
  }

  function decodeEscapedHtml(value) {
    if (!value || !value.includes("&lt;")) {
      return value;
    }
    const textArea = document.createElement("textarea");
    textArea.innerHTML = value;
    return textArea.value;
  }

  function applyMemoStyle(element, format) {
    element.style.color = format.textColor || "#2a2420";
    element.style.fontFamily = format.fontFamily || "Georgia, serif";
    element.style.fontSize = `${format.fontSize || "16"}px`;
  }

  function finishMemoEditing(memo, editor, colorInput, fontSelect, sizeSelect) {
    const before = {
      content: memo.content,
      format: Object.assign({}, memo.format || {})
    };

    const rawHtml = editor ? editor.getHtml() : memo.content;
    memo.content = normalizeHtmlForSave(rawHtml);
    memo.format = {
      textColor: colorInput.value,
      fontFamily: fontSelect.value,
      fontSize: sizeSelect.value
    };
    state.editingMemoId = null;
    renderMemos();

    scheduleMemoSave(memo, before);
  }

  function normalizeHtmlForSave(html) {
    const source = typeof html === "string" && html.trim() ? html : "<p><br></p>";
    const wrap = document.createElement("div");
    wrap.innerHTML = source;

    wrap.querySelectorAll("*").forEach(function eachNode(node) {
      if (node.childNodes.length === 0) {
        return;
      }
      Array.from(node.childNodes).forEach(function eachChild(child) {
        if (child.nodeType !== Node.TEXT_NODE) {
          return;
        }
        const original = child.nodeValue || "";
        const noZw = original.replace(/[\u200B\uFEFF]/g, "");
        const escapedSpaces = noZw
          .replace(/^ /, "&nbsp;")
          .replace(/ $/, "&nbsp;")
          .replace(/ {2,}/g, function manySpaces(match) {
            return "&nbsp;".repeat(match.length - 1) + " ";
          });
        if (escapedSpaces !== original) {
          const holder = document.createElement("span");
          holder.innerHTML = escapedSpaces;
          child.replaceWith(holder);
          while (holder.firstChild) {
            holder.parentNode.insertBefore(holder.firstChild, holder);
          }
          holder.remove();
        }
      });
    });

    wrap.querySelectorAll("p, div, li").forEach(function normalizeBlock(block) {
      if (!block.innerHTML.trim()) {
        block.innerHTML = "<br>";
      }
    });

    const normalized = wrap.innerHTML.trim();
    return normalized || "<p><br></p>";
  }

  function scheduleMemoSave(memo, before) {
    if (state.saveTimers.has(memo.memoId)) {
      clearTimeout(state.saveTimers.get(memo.memoId));
    }

    const timer = setTimeout(function saveMemo() {
      state.service.updateMemoContent(memo.memoId, memo.content, memo.format).then(function onSaved() {
        showToast("Memo saved", "success");
      }).catch(function onSaveFailed(error) {
        memo.content = before.content;
        memo.format = before.format;
        renderMemos();
        showToast(`Save failed: ${parseError(error)}`, "error");
      }).finally(function onComplete() {
        state.saveTimers.delete(memo.memoId);
      });
    }, 1000);

    state.saveTimers.set(memo.memoId, timer);
  }

  function startMemoDrag(event, memo, card) {
    const startX = event.clientX;
    const startY = event.clientY;
    const initX = memo.posX;
    const initY = memo.posY;
    const threshold = 4;
    let moved = false;

    function onMove(moveEvent) {
      const rawDx = moveEvent.clientX - startX;
      const rawDy = moveEvent.clientY - startY;
      if (!moved && Math.abs(rawDx) + Math.abs(rawDy) < threshold) {
        return;
      }
      if (!moved) {
        moved = true;
        card.classList.add("is-dragging");
      }
      const dx = rawDx / state.zoom;
      const dy = rawDy / state.zoom;
      memo.posX = Math.max(0, Math.round(initX + dx));
      memo.posY = Math.max(0, Math.round(initY + dy));
      card.style.left = `${memo.posX}px`;
      card.style.top = `${memo.posY}px`;
    }

    async function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (!moved) {
        return;
      }
      card.classList.remove("is-dragging");
      try {
        await state.service.updateMemoPosition(memo.memoId, memo.posX, memo.posY);
      } catch (error) {
        showErrorFrom(error);
      }
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function shouldBlockMemoDrag(target) {
    if (!target || typeof target.closest !== "function") {
      return false;
    }
    return Boolean(
      target.closest(".memo-delete") ||
      target.closest(".resize-handle") ||
      target.closest(".editor-toolbar") ||
      target.closest(".memo-content-edit")
    );
  }

  function startMemoResize(event, memo, card) {
    const startX = event.clientX;
    const startY = event.clientY;
    const initW = memo.width;
    const initH = memo.height;

    function onMove(moveEvent) {
      const dw = (moveEvent.clientX - startX) / state.zoom;
      const dh = (moveEvent.clientY - startY) / state.zoom;
      memo.width = Math.max(180, Math.round(initW + dw));
      memo.height = Math.max(140, Math.round(initH + dh));
      card.style.width = `${memo.width}px`;
      card.style.height = `${memo.height}px`;
    }

    async function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      try {
        await state.service.updateMemoSize(memo.memoId, memo.width, memo.height);
      } catch (error) {
        showErrorFrom(error);
      }
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function openContextMenu(memoId, x, y) {
    state.contextMemoId = memoId;
    refs.contextMenu.style.left = `${x}px`;
    refs.contextMenu.style.top = `${y}px`;
    refs.contextMenu.classList.remove("hidden");
  }

  function hideContextMenu() {
    refs.contextMenu.classList.add("hidden");
    state.contextMemoId = null;
  }

  async function onContextMenuAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button || !state.contextMemoId || !state.selectedBoardId) {
      return;
    }

    const action = button.dataset.action;
    const memos = state.memosByBoard[state.selectedBoardId] || [];
    MemoCore.applyZOrder(memos, state.contextMemoId, action);
    renderMemos();
    hideContextMenu();

    try {
      await state.service.updateMemoZIndex(
        state.selectedBoardId,
        memos.map(function item(memo) {
          return { memoId: memo.memoId, zIndex: memo.zIndex };
        })
      );
      showToast("Layer order updated", "success");
    } catch (error) {
      showErrorFrom(error);
      await refreshMemos();
    }
  }
})();
