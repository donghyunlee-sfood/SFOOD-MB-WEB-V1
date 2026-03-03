import { createPortal } from 'react-dom';

type Props = {
  x: number;
  y: number;
  onFrontMost: () => void;
  onFront: () => void;
  onBack: () => void;
  onBackMost: () => void;
};

export const MemoContextMenu = ({ x, y, onFrontMost, onFront, onBack, onBackMost }: Props) =>
  createPortal(
    <div
      className="memo-context-menu"
      style={{ left: x, top: y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button onClick={onFrontMost}>맨 앞으로</button>
      <button onClick={onFront}>앞으로</button>
      <button onClick={onBack}>뒤로</button>
      <button onClick={onBackMost}>맨 뒤로</button>
    </div>,
    document.body,
  );
