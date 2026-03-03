import type { MouseEvent as ReactMouseEvent } from 'react';
import { useEffect, useState } from 'react';
import type { MemoType } from '../types/domain';
import { Icon } from './Icon';

type Props = {
  memoTypes: MemoType[];
  selectedTypeId: string | null;
  onSelect: (typeId: string) => void;
  onCreate: (typeId: string) => void;
};

export const MemoToolbar = ({ memoTypes, selectedTypeId, onSelect, onCreate }: Props) => {
  const [pos, setPos] = useState({ x: 240, y: 520 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const width = 520;
    const x = Math.max(12, Math.round(window.innerWidth / 2 - width / 2));
    const y = Math.max(12, window.innerHeight - 120);
    setPos({ x, y });
    setReady(true);
  }, []);

  const onDragStart = (e: ReactMouseEvent<HTMLDivElement>) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const base = { ...pos };

    const onMove = (event: MouseEvent) => {
      setPos({
        x: Math.max(8, base.x + (event.clientX - startX)),
        y: Math.max(8, base.y + (event.clientY - startY)),
      });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  if (!ready) return null;

  return (
    <div className="memo-toolbar-wrap" style={{ left: pos.x, top: pos.y }}>
      <div className="memo-toolbar-handle" onMouseDown={onDragStart} title="툴바 이동">
        <Icon name="drag" />
      </div>
      <div className="memo-toolbar">
        {memoTypes.map((memoType, index) => {
          const variant = index % 3 === 0 ? 'basic' : index % 3 === 1 ? 'rounded' : 'shadow';
          return (
            <button
              key={memoType.typeId}
              title={memoType.name ?? memoType.typeName ?? memoType.typeId}
              className={selectedTypeId === memoType.typeId ? 'active' : ''}
              style={{
                backgroundColor: memoType.defaultColor ?? '#ffe082',
                borderRadius: variant === 'rounded' ? '14px' : '0px',
                boxShadow:
                  variant === 'shadow'
                    ? '0 8px 14px rgba(45, 35, 24, 0.25)'
                    : 'none',
              }}
              onClick={() => {
                onSelect(memoType.typeId);
                onCreate(memoType.typeId);
              }}
            >
              <Icon name="plus" />
              <span>{memoType.name ?? memoType.typeName ?? memoType.typeId}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
