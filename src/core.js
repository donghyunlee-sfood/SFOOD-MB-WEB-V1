(function initMemoCore(globalScope) {
  const RANDOM_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  function generateRandomToken(length, randomFn) {
    const size = Number.isInteger(length) && length > 0 ? length : 10;
    const rand = typeof randomFn === "function" ? randomFn : Math.random;
    let token = "";
    for (let i = 0; i < size; i += 1) {
      const index = Math.floor(rand() * RANDOM_CHARS.length);
      token += RANDOM_CHARS[index];
    }
    return token;
  }

  function generateBoardId(accountId, randomFn) {
    return `${accountId}_${generateRandomToken(10, randomFn)}`;
  }

  function generateMemoId(boardId, randomFn) {
    return `${boardId}_${generateRandomToken(10, randomFn)}`;
  }

  function sanitizeBoardName(name) {
    return typeof name === "string" ? name.trim() : "";
  }

  function validateBoardName(name) {
    const next = sanitizeBoardName(name);
    if (!next) {
      return { valid: false, message: "Board name is required." };
    }
    if (next.length > 20) {
      return { valid: false, message: "Board name must be 20 characters or less." };
    }
    return { valid: true, message: "" };
  }

  function createDefaultBoard(accountId, sortOrder, randomFn) {
    return {
      boardId: generateBoardId(accountId, randomFn),
      parentBoardId: null,
      boardName: "My Board",
      sortOrder: typeof sortOrder === "number" ? sortOrder : 1,
      isHide: false
    };
  }

  function createDefaultMemo(boardId, zIndex, typeId, randomFn) {
    return {
      memoId: generateMemoId(boardId, randomFn),
      boardId,
      typeId: typeId || "TYPE_BASIC",
      content: "",
      posX: 160,
      posY: 120,
      width: 300,
      height: 220,
      zIndex: typeof zIndex === "number" ? zIndex : 1,
      isHide: false,
      format: {
        textColor: "#2a2420",
        fontFamily: "Georgia, serif",
        fontSize: "16"
      }
    };
  }

  function buildBoardTree(boards) {
    const map = new Map();
    const roots = [];

    boards.forEach(function makeNode(board) {
      if (!board.isHide) {
        map.set(board.boardId, { board, children: [] });
      }
    });

    map.forEach(function link(node) {
      const parentId = node.board.parentBoardId;
      if (parentId && map.has(parentId)) {
        map.get(parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    function sortNodes(nodes) {
      nodes.sort(function byOrder(a, b) {
        return a.board.sortOrder - b.board.sortOrder;
      });
      nodes.forEach(function deepSort(item) {
        sortNodes(item.children);
      });
      return nodes;
    }

    return sortNodes(roots);
  }

  function flattenBoardTree(nodes, depth, list) {
    const nextDepth = typeof depth === "number" ? depth : 0;
    const out = Array.isArray(list) ? list : [];
    nodes.forEach(function each(node) {
      out.push({ board: node.board, depth: nextDepth });
      flattenBoardTree(node.children, nextDepth + 1, out);
    });
    return out;
  }

  function normalizeZIndex(memos) {
    const active = memos
      .filter(function visible(memo) {
        return !memo.isHide;
      })
      .slice()
      .sort(function byZ(a, b) {
        return a.zIndex - b.zIndex;
      });

    active.forEach(function assignZ(memo, index) {
      memo.zIndex = index + 1;
    });
    return memos;
  }

  function applyZOrder(memos, memoId, action) {
    const active = memos
      .filter(function visible(memo) {
        return !memo.isHide;
      })
      .slice()
      .sort(function byZ(a, b) {
        return a.zIndex - b.zIndex;
      });

    const index = active.findIndex(function match(memo) {
      return memo.memoId === memoId;
    });
    if (index < 0) {
      return memos;
    }

    const target = active[index];
    active.splice(index, 1);

    if (action === "front") {
      active.splice(Math.min(index + 1, active.length), 0, target);
    } else if (action === "back") {
      active.splice(Math.max(index - 1, 0), 0, target);
    } else if (action === "front-most") {
      active.push(target);
    } else if (action === "back-most") {
      active.unshift(target);
    } else {
      active.splice(index, 0, target);
    }

    active.forEach(function assignZ(memo, idx) {
      memo.zIndex = idx + 1;
    });
    return memos;
  }

  function clampZoom(value) {
    if (value < 0.5) {
      return 0.5;
    }
    if (value > 2) {
      return 2;
    }
    return Math.round(value * 100) / 100;
  }

  function getNextSortOrder(boards, parentBoardId) {
    const siblings = boards.filter(function sibling(board) {
      return !board.isHide && board.parentBoardId === (parentBoardId || null);
    });
    if (!siblings.length) {
      return 1;
    }
    return Math.max.apply(null, siblings.map(function order(b) {
      return b.sortOrder;
    })) + 1;
  }

  const core = {
    RANDOM_CHARS,
    generateRandomToken,
    generateBoardId,
    generateMemoId,
    sanitizeBoardName,
    validateBoardName,
    createDefaultBoard,
    createDefaultMemo,
    buildBoardTree,
    flattenBoardTree,
    normalizeZIndex,
    applyZOrder,
    clampZoom,
    getNextSortOrder
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = core;
  }
  globalScope.MemoCore = core;
})(typeof window !== "undefined" ? window : globalThis);
