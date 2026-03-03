import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createBoard,
  deleteBoard,
  listBoards,
  moveBoard,
  renameBoard,
} from '../api/board.api';
import { logout } from '../api/auth.api';
import { listMemoTypes } from '../api/memo-type.api';
import {
  createMemo,
  deleteMemo,
  listMemos,
  updateMemoContent,
  updateMemoPosition,
  updateMemoSize,
  updateMemoZIndex,
} from '../api/memo.api';
import { BoardTree } from '../components/BoardTree';
import { MemoCard } from '../components/MemoCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MemoToolbar } from '../components/MemoToolbar';
import { Icon } from '../components/Icon';
import { useAuthStore } from '../store/authStore';
import { useBoardStore } from '../store/boardStore';
import { useMemoStore } from '../store/memoStore';
import { useUiStore } from '../store/uiStore';
import type { Board, Memo } from '../types/domain';
import { toUserMessage } from '../utils/errors';
import { newBoardId, newMemoId } from '../utils/id';

export const MainPage = () => {
  const MIN_ZOOM = 50;
  const MAX_ZOOM = 200;
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const saveTimers = useRef<Record<string, number>>({});
  const memosRef = useRef<Memo[]>([]);
  const [isPanning, setIsPanning] = useState(false);

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const boards = useBoardStore((s) => s.boards);
  const selectedBoardId = useBoardStore((s) => s.selectedBoardId);
  const setBoards = useBoardStore((s) => s.setBoards);
  const setSelectedBoardId = useBoardStore((s) => s.setSelectedBoardId);

  const memos = useMemoStore((s) => s.memos);
  const memoTypes = useMemoStore((s) => s.memoTypes);
  const selectedTypeId = useMemoStore((s) => s.selectedTypeId);
  const editingMemoId = useMemoStore((s) => s.editingMemoId);
  const setMemos = useMemoStore((s) => s.setMemos);
  const setMemoTypes = useMemoStore((s) => s.setMemoTypes);
  const setSelectedTypeId = useMemoStore((s) => s.setSelectedTypeId);
  const setEditingMemoId = useMemoStore((s) => s.setEditingMemoId);

  const zoom = useUiStore((s) => s.zoom);
  const lnbWidth = useUiStore((s) => s.lnbWidth);
  const toast = useUiStore((s) => s.toast);
  const setZoom = useUiStore((s) => s.setZoom);
  const setLnbWidth = useUiStore((s) => s.setLnbWidth);
  const setMessage = useUiStore((s) => s.setMessage);
  const clearMessage = useUiStore((s) => s.clearMessage);
  const [savingMemoIds, setSavingMemoIds] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  const typeMap = useMemo(() => Object.fromEntries(memoTypes.map((t) => [t.typeId, t])), [memoTypes]);
  const memoTypeVariantMap = useMemo(
    () =>
      Object.fromEntries(
        memoTypes.map((type, index) => [
          type.typeId,
          index % 3 === 0 ? 'basic' : index % 3 === 1 ? 'rounded' : 'shadow',
        ]),
      ) as Record<string, 'basic' | 'rounded' | 'shadow'>,
    [memoTypes],
  );

  const fetchBoards = async () => {
    try {
      const items = await listBoards();
      setBoards(items);
      if (!selectedBoardId && items[0]) setSelectedBoardId(items[0].boardId);
    } catch (error) {
      setMessage(toUserMessage(error));
    }
  };

  const fetchMemoTypes = async () => {
    try {
      const types = await listMemoTypes();
      setMemoTypes(types);
    } catch (error) {
      setMessage(toUserMessage(error));
    }
  };

  const fetchMemos = async (boardId: string) => {
    try {
      const items = await listMemos(boardId);
      setMemos(items);
    } catch (error) {
      setMessage(toUserMessage(error));
    }
  };

  useEffect(() => {
    void fetchBoards();
    void fetchMemoTypes();
  }, []);

  useEffect(() => {
    if (selectedBoardId) void fetchMemos(selectedBoardId);
    else setMemos([]);
  }, [selectedBoardId]);

  useEffect(() => {
    memosRef.current = memos;
  }, [memos]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom(zoom + (e.deltaY < 0 ? 10 : -10));
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [zoom]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => clearMessage(), 2500);
    return () => window.clearTimeout(timer);
  }, [toast, clearMessage]);

  const onResizeLnb = (e: { clientX: number }) => {
    const startX = e.clientX;
    const start = lnbWidth;
    const onMove = (event: MouseEvent) => setLnbWidth(start + event.clientX - startX);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const createBoardWithName = async (parentBoardId: string | null, boardName: string) => {
    if (!user?.userId) return;
    const nextName = boardName.trim();
    if (!nextName) return;
    if (nextName.length > 20) {
      setMessage('보드 이름은 20자까지 가능합니다.');
      return;
    }

    const siblings = boards
      .filter((it) => (it.parentBoardId ?? null) === (parentBoardId ?? null))
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const sortOrder = (siblings[siblings.length - 1]?.sortOrder ?? 0) + 1;

    const board: Board = {
      boardId: newBoardId(user.userId),
      parentBoardId,
      boardName: nextName,
      sortOrder,
    };

    const prev = boards;
    setBoards([...boards, board]);
    try {
      await createBoard(board);
    } catch (error) {
      setBoards(prev);
      setMessage(toUserMessage(error));
    }
  };

  const onRenameBoard = async (board: Board, boardName: string) => {
    const next = boardName.trim();
    if (!next || next === board.boardName) return;
    if (next.length > 20) {
      setMessage('보드 이름은 20자까지 가능합니다.');
      return;
    }

    const prev = boards;
    setBoards(boards.map((it) => (it.boardId === board.boardId ? { ...it, boardName: next } : it)));
    try {
      await renameBoard(board.boardId, next);
    } catch (error) {
      setBoards(prev);
      setMessage(toUserMessage(error));
    }
  };

  const isDescendant = (sourceId: string, maybeChildId: string): boolean => {
    let cursor = boards.find((it) => it.boardId === maybeChildId);
    while (cursor?.parentBoardId) {
      if (cursor.parentBoardId === sourceId) return true;
      cursor = boards.find((it) => it.boardId === cursor?.parentBoardId);
    }
    return false;
  };

  const onMoveBoard = async (board: Board, target: Board, position: 'before' | 'after') => {
    if (board.boardId === target.boardId) return;
    if (isDescendant(board.boardId, target.boardId)) {
      setMessage('하위 보드 아래로는 이동할 수 없습니다.');
      return;
    }

    const prev = boards;
    const nextParentId = target.parentBoardId ?? null;
    const siblings = boards
      .filter((it) => (it.parentBoardId ?? null) === nextParentId && it.boardId !== board.boardId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const targetIndex = siblings.findIndex((it) => it.boardId === target.boardId);
    const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
    const nextSiblings = [...siblings];
    const moving = { ...board, parentBoardId: nextParentId };
    nextSiblings.splice(Math.max(0, insertIndex), 0, moving);
    const moved = boards.map((it) => {
      const inGroup = nextSiblings.find((s) => s.boardId === it.boardId);
      if (inGroup) {
        return {
          ...it,
          parentBoardId: inGroup.parentBoardId,
          sortOrder: nextSiblings.findIndex((s) => s.boardId === it.boardId) + 1,
        };
      }
      return it.boardId === board.boardId
        ? { ...it, parentBoardId: nextParentId, sortOrder: insertIndex + 1 }
        : it;
    });

    const updated = moved.find((it) => it.boardId === board.boardId);
    const newSortOrder = updated?.sortOrder ?? board.sortOrder;
    setBoards(moved);
    try {
      await moveBoard(board.boardId, nextParentId, newSortOrder);
      setMessage('보드 이동 완료');
    } catch (error) {
      setBoards(prev);
      setMessage(toUserMessage(error));
    }
  };

  const runDeleteBoard = async (board: Board) => {
    const prev = boards;
    setBoards(boards.filter((it) => it.boardId !== board.boardId));
    if (selectedBoardId === board.boardId) setSelectedBoardId(null);
    try {
      await deleteBoard(board.boardId);
    } catch (error) {
      setBoards(prev);
      setMessage(toUserMessage(error));
    }
  };

  const onDeleteBoard = (board: Board) => {
    setConfirm({
      title: '보드 삭제',
      message: `"${board.boardName}" 보드를 삭제할까요?`,
      confirmText: '삭제',
      onConfirm: async () => {
        setConfirm(null);
        await runDeleteBoard(board);
      },
    });
  };

  const onCreateMemo = async (forcedTypeId?: string) => {
    if (!selectedBoardId) {
      setMessage('보드를 먼저 선택해 주세요.');
      return;
    }
    const typeId = forcedTypeId ?? selectedTypeId;
    if (!typeId) {
      setMessage('메모 타입을 선택해 주세요.');
      return;
    }
    const canvas = canvasRef.current;
    const baseWidth = 240;
    const baseHeight = 180;
    let posX = 60;
    let posY = 60;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const centerX = canvas.scrollLeft + rect.width / 2;
      const centerY = canvas.scrollTop + rect.height / 2;
      posX = Math.max(0, Math.round(centerX * (100 / zoom) - baseWidth / 2));
      posY = Math.max(0, Math.round(centerY * (100 / zoom) - baseHeight / 2));
    }
    const memo: Memo = {
      memoId: newMemoId(selectedBoardId),
      boardId: selectedBoardId,
      typeId,
      content: '',
      posX,
      posY,
      width: baseWidth,
      height: baseHeight,
      zIndex: memos.length + 1,
    };
    const prev = memos;
    setMemos([...memos, memo]);
    setEditingMemoId(memo.memoId);
    try {
      await createMemo(selectedBoardId, memo);
    } catch (error) {
      setMemos(prev);
      setEditingMemoId(null);
      setMessage(toUserMessage(error));
    }
  };

  const queueSaveContent = (memoId: string, content: string) => {
    const prev = memos;
    setMemos(memos.map((it) => (it.memoId === memoId ? { ...it, content } : it)));
    setSavingMemoIds((ids) => (ids.includes(memoId) ? ids : [...ids, memoId]));
    if (saveTimers.current[memoId]) {
      window.clearTimeout(saveTimers.current[memoId]);
    }
    saveTimers.current[memoId] = window.setTimeout(async () => {
      try {
        await updateMemoContent(memoId, content);
        setMessage('저장 완료');
      } catch (error) {
        setMemos(prev);
        setMessage(toUserMessage(error));
      } finally {
        setSavingMemoIds((ids) => ids.filter((id) => id !== memoId));
      }
    }, 1000);
    setEditingMemoId(null);
  };

  const onMoveMemo = async (memoId: string, clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const canvasRect = canvas?.getBoundingClientRect();
    if (!canvasRect || !canvas) return;
    const posX = Math.max(
      0,
      Math.round((clientX - canvasRect.left + canvas.scrollLeft) * (100 / zoom)),
    );
    const posY = Math.max(
      0,
      Math.round((clientY - canvasRect.top + canvas.scrollTop) * (100 / zoom)),
    );
    const next = memosRef.current.map((it) => (it.memoId === memoId ? { ...it, posX, posY } : it));
    memosRef.current = next;
    setMemos(next);
  };

  const onMoveMemoCommit = async (memoId: string) => {
    const target = memosRef.current.find((it) => it.memoId === memoId);
    if (!target) return;
    const prev = memosRef.current;
    try {
      await updateMemoPosition(memoId, target.posX, target.posY);
    } catch (error) {
      setMemos(prev);
      setMessage(toUserMessage(error));
    }
  };

  const onCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 2) return;
    const target = e.target as HTMLElement;
    if (target.closest('.memo-card') || target.closest('.memo-toolbar-wrap')) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    setIsPanning(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const baseLeft = canvas.scrollLeft;
    const baseTop = canvas.scrollTop;

    const onMove = (event: MouseEvent) => {
      canvas.scrollLeft = baseLeft - (event.clientX - startX);
      canvas.scrollTop = baseTop - (event.clientY - startY);
    };
    const onUp = () => {
      setIsPanning(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onResizeMemo = (memoId: string, width: number, height: number) => {
    const next = memosRef.current.map((it) => (it.memoId === memoId ? { ...it, width, height } : it));
    memosRef.current = next;
    setMemos(next);
  };

  const onResizeMemoCommit = async (memoId: string) => {
    const target = memosRef.current.find((it) => it.memoId === memoId);
    if (!target) return;
    const prev = memosRef.current;
    try {
      await updateMemoSize(memoId, target.width, target.height);
    } catch (error) {
      setMemos(prev);
      setMessage(toUserMessage(error));
    }
  };

  const runDeleteMemo = async (memoId: string) => {
    const prev = memos;
    setMemos(memos.filter((it) => it.memoId !== memoId));
    try {
      await deleteMemo(memoId);
    } catch (error) {
      setMemos(prev);
      setMessage(toUserMessage(error));
    }
  };

  const onDeleteMemo = (memoId: string) => {
    setConfirm({
      title: '메모 삭제',
      message: '선택한 메모를 삭제할까요?',
      confirmText: '삭제',
      onConfirm: async () => {
        setConfirm(null);
        await runDeleteMemo(memoId);
      },
    });
  };

  const onZIndex = async (memoId: string, type: 'front' | 'back' | 'front-most' | 'back-most') => {
    if (!selectedBoardId) return;
    const sorted = [...memosRef.current].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((m) => m.memoId === memoId);
    if (idx < 0) return;

    const arranged = [...sorted];
    const [target] = arranged.splice(idx, 1);
    if (type === 'front-most') arranged.push(target);
    if (type === 'back-most') arranged.unshift(target);
    if (type === 'front') arranged.splice(Math.min(idx + 1, arranged.length), 0, target);
    if (type === 'back') arranged.splice(Math.max(idx - 1, 0), 0, target);

    const remapped = arranged.map((memo, index) => ({ ...memo, zIndex: index + 1 }));
    const prev = memosRef.current;
    memosRef.current = remapped;
    setMemos(remapped);
    try {
      await updateMemoZIndex(
        selectedBoardId,
        remapped.map((m) => ({ memoId: m.memoId, zIndex: m.zIndex })),
      );
    } catch (error) {
      setMemos(prev);
      setMessage(toUserMessage(error));
    }
  };

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <main className="main-layout">
      <aside style={{ width: lnbWidth }} className="lnb">
        <BoardTree
          boards={boards}
          selectedBoardId={selectedBoardId}
          onSelect={setSelectedBoardId}
          onCreateTop={(boardName) => void createBoardWithName(null, boardName)}
          onCreateChild={(parentBoardId, boardName) => void createBoardWithName(parentBoardId, boardName)}
          onRename={(board, boardName) => void onRenameBoard(board, boardName)}
          onDelete={(board) => void onDeleteBoard(board)}
          onMove={(board, target, position) => void onMoveBoard(board, target, position)}
        />
        <div className="lnb-bottom">
          <div className="account">
            <Icon name="user" />
            <div className="account-text">
              <strong>{user?.name ?? '사용자'}</strong>
              <small>{user?.userId ?? 'unknown-user'}</small>
            </div>
          </div>
          <button aria-label="로그아웃" onClick={() => void onLogout()}>
            <Icon name="logout" />
          </button>
        </div>
        <div className="lnb-resizer" onMouseDown={onResizeLnb} />
      </aside>

      <section className="board-area">
        <header>
          <h2>Board Canvas</h2>
          <div className="zoom-controls">
            <button disabled={zoom <= MIN_ZOOM} onClick={() => setZoom(zoom - 10)}>
              <Icon name="zoomOut" />
            </button>
            <span>{zoom}%</span>
            <button disabled={zoom >= MAX_ZOOM} onClick={() => setZoom(zoom + 10)}>
              <Icon name="zoomIn" />
            </button>
            <small>{MIN_ZOOM}% - {MAX_ZOOM}%</small>
          </div>
        </header>

        <div
          ref={canvasRef}
          className={`board-canvas ${isPanning ? 'panning' : ''}`}
          onMouseDown={onCanvasMouseDown}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="canvas-inner" style={{ transform: `scale(${zoom / 100})` }}>
            {selectedBoardId ? (
              memos.map((memo) => (
                <MemoCard
                  key={memo.memoId}
                  memo={memo}
                  typeMap={typeMap}
                  typeVariant={memoTypeVariantMap[memo.typeId] ?? 'basic'}
                  editing={editingMemoId === memo.memoId}
                  onStartEdit={setEditingMemoId}
                  onCompleteEdit={queueSaveContent}
                  onMove={(memoId, x, y) => void onMoveMemo(memoId, x, y)}
                  onMoveCommit={(memoId) => void onMoveMemoCommit(memoId)}
                  onResize={(memoId, width, height) => void onResizeMemo(memoId, width, height)}
                  onResizeCommit={(memoId) => void onResizeMemoCommit(memoId)}
                  onDelete={(memoId) => void onDeleteMemo(memoId)}
                  onFront={(memoId) => void onZIndex(memoId, 'front')}
                  onBack={(memoId) => void onZIndex(memoId, 'back')}
                  onFrontMost={(memoId) => void onZIndex(memoId, 'front-most')}
                  onBackMost={(memoId) => void onZIndex(memoId, 'back-most')}
                />
              ))
            ) : (
              <div className="empty">보드를 선택하면 메모가 표시됩니다.</div>
            )}
          </div>
        </div>

        <MemoToolbar
          memoTypes={memoTypes}
          selectedTypeId={selectedTypeId}
          onSelect={setSelectedTypeId}
          onCreate={(typeId) => void onCreateMemo(typeId)}
        />
      </section>

      {toast && (
        <div key={toast.id} className="toast" onClick={() => clearMessage()}>
          {toast.text}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmText={confirm?.confirmText}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          void confirm?.onConfirm();
        }}
      />
    </main>
  );
};
