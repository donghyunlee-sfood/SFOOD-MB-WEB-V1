import type { Board } from '../types/domain';
import { useMemo, useState } from 'react';
import { Icon } from './Icon';

type Props = {
  boards: Board[];
  selectedBoardId: string | null;
  onSelect: (boardId: string) => void;
  onCreateTop: (boardName: string) => void;
  onCreateChild: (parentBoardId: string, boardName: string) => void;
  onRename: (board: Board, boardName: string) => void;
  onDelete: (board: Board) => void;
  onMove: (board: Board, target: Board, position: 'before' | 'after') => void;
};

export const BoardTree = ({
  boards,
  selectedBoardId,
  onSelect,
  onCreateTop,
  onCreateChild,
  onRename,
  onDelete,
  onMove,
}: Props) => {
  const [topName, setTopName] = useState('');
  const [showTopForm, setShowTopForm] = useState(false);
  const [childTargetId, setChildTargetId] = useState<string | null>(null);
  const [childName, setChildName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');

  const childrenMap = useMemo(() => {
    const map = new Map<string | null, Board[]>();
    for (const board of boards) {
      const key = board.parentBoardId ?? null;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(board);
    }
    for (const [, arr] of map) arr.sort((a, b) => a.sortOrder - b.sortOrder);
    return map;
  }, [boards]);

  const submitTop = () => {
    const next = topName.trim();
    if (!next) return;
    onCreateTop(next);
    setTopName('');
    setShowTopForm(false);
  };

  const submitChild = (parentBoardId: string) => {
    const next = childName.trim();
    if (!next) return;
    onCreateChild(parentBoardId, next);
    setChildName('');
    setChildTargetId(null);
  };

  const startRename = (board: Board) => {
    setRenamingId(board.boardId);
    setRenameName(board.boardName);
  };

  const submitRename = (board: Board) => {
    const next = renameName.trim();
    if (!next) return;
    onRename(board, next);
    setRenamingId(null);
    setRenameName('');
  };

  const renderTree = (parentId: string | null, depth: number) => {
    const children = childrenMap.get(parentId) ?? [];
    return (
      <ul>
        {children.map((board) => (
          <li
            key={board.boardId}
            className={selectedBoardId === board.boardId ? 'selected' : ''}
          >
            <div
              className="board-row"
              style={{ paddingLeft: `${depth * 14}px` }}
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('text/plain', board.boardId);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const sourceId = e.dataTransfer.getData('text/plain');
                const source = boards.find((it) => it.boardId === sourceId);
                if (source && source.boardId !== board.boardId) {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const isUpper = e.clientY < rect.top + rect.height / 2;
                  onMove(source, board, isUpper ? 'before' : 'after');
                }
              }}
            >
              {renamingId === board.boardId ? (
                <input
                  className="board-inline-input"
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitRename(board);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  onBlur={() => submitRename(board)}
                  autoFocus
                />
              ) : (
                <button className="board-name" onClick={() => onSelect(board.boardId)}>
                  {board.boardName}
                </button>
              )}
              <div className="board-actions">
                <button aria-label="하위 보드 추가" onClick={() => setChildTargetId(board.boardId)}>
                  <Icon name="plus" />
                </button>
                <button aria-label="보드명 수정" onClick={() => startRename(board)}>
                  <Icon name="edit" />
                </button>
                <button aria-label="보드 삭제" onClick={() => onDelete(board)}>
                  <Icon name="trash" />
                </button>
              </div>
            </div>
            {childTargetId === board.boardId && (
              <div className="board-inline-form" style={{ marginLeft: `${depth * 14 + 12}px` }}>
                <input
                  className="board-inline-input"
                  value={childName}
                  placeholder="하위 보드명"
                  onChange={(e) => setChildName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitChild(board.boardId);
                    if (e.key === 'Escape') setChildTargetId(null);
                  }}
                  autoFocus
                />
                <button aria-label="추가" onClick={() => submitChild(board.boardId)}>
                  <Icon name="check" />
                </button>
              </div>
            )}
            {renderTree(board.boardId, depth + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="board-tree">
      <div className="board-tree-head">
        <h2>Boards</h2>
        <button aria-label="최상위 보드 추가" onClick={() => setShowTopForm((v) => !v)}>
          <Icon name="plus" />
        </button>
      </div>
      {showTopForm && (
        <div className="board-inline-form">
          <input
            className="board-inline-input"
            value={topName}
            placeholder="최상위 보드명"
            onChange={(e) => setTopName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitTop();
              if (e.key === 'Escape') setShowTopForm(false);
            }}
            autoFocus
          />
          <button aria-label="생성" onClick={submitTop}>
            <Icon name="check" />
          </button>
        </div>
      )}
      {renderTree(null, 0)}
    </div>
  );
};
