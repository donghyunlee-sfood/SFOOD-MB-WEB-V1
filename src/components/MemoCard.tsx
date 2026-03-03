import { useEffect, useMemo, useRef, useState } from 'react';
import type { Memo, MemoType } from '../types/domain';
import { MemoEditorToolbar } from './MemoEditorToolbar';
import { MemoContextMenu } from './MemoContextMenu';
import { Icon } from './Icon';
import ReactQuill from 'react-quill';

type Props = {
  memo: Memo;
  typeMap: Record<string, MemoType>;
  editing: boolean;
  onStartEdit: (memoId: string) => void;
  onCompleteEdit: (memoId: string, content: string) => void;
  onMove: (memoId: string, clientX: number, clientY: number) => void;
  onMoveCommit: (memoId: string) => void;
  onResize: (memoId: string, width: number, height: number) => void;
  onResizeCommit: (memoId: string) => void;
  onDelete: (memoId: string) => void;
  onFront: (memoId: string) => void;
  onBack: (memoId: string) => void;
  onFrontMost: (memoId: string) => void;
  onBackMost: (memoId: string) => void;
  typeVariant: 'basic' | 'rounded' | 'shadow';
};

export const MemoCard = ({
  memo,
  typeMap,
  editing,
  onStartEdit,
  onCompleteEdit,
  onMove,
  onMoveCommit,
  onResize,
  onResizeCommit,
  onDelete,
  onFront,
  onBack,
  onFrontMost,
  onBackMost,
  typeVariant,
}: Props) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<ReactQuill | null>(null);
  const [draft, setDraft] = useState(memo.content);
  const [fontFamily, setFontFamily] = useState('Pretendard');
  const [fontSize, setFontSize] = useState(15);
  const [fontColor, setFontColor] = useState('#1f2937');
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; width: number; height: number } | null>(null);
  const parseStoredContent = (value: string) => {
    const fallback = {
      html: value || '',
      font: 'Pretendard',
      size: 15,
      color: '#1f2937',
    };
    if (!value) return fallback;
    const root = document.createElement('div');
    root.innerHTML = value;
    const first = root.firstElementChild as HTMLElement | null;
    if (!first || first.tagName !== 'DIV') return fallback;
    const styleText = first.getAttribute('style') ?? '';
    const font = /font-family:\s*([^;]+)/i.exec(styleText)?.[1]?.trim() || fallback.font;
    const sizeRaw = /font-size:\s*([^;]+)/i.exec(styleText)?.[1]?.trim() || `${fallback.size}px`;
    const size = Number.parseInt(sizeRaw.replace('px', ''), 10) || fallback.size;
    const color = /color:\s*([^;]+)/i.exec(styleText)?.[1]?.trim() || fallback.color;
    return {
      html: first.innerHTML || fallback.html,
      font,
      size,
      color,
    };
  };

  const style = useMemo(() => {
    const type = typeMap[memo.typeId];
    const color = type?.defaultColor ?? '#ffe082';

    return {
      left: memo.posX,
      top: memo.posY,
      width: memo.width,
      height: memo.height,
      zIndex: memo.zIndex,
      backgroundColor: color,
      borderRadius: typeVariant === 'rounded' ? '22px' : '0px',
      boxShadow:
        typeVariant === 'shadow'
          ? '0 16px 28px rgba(45, 35, 24, 0.28)'
          : '0 10px 20px rgba(63, 43, 25, 0.16)',
      fontFamily,
      fontSize: `${fontSize}px`,
      color: fontColor,
    };
  }, [memo, typeMap, typeVariant, fontFamily, fontSize, fontColor]);

  useEffect(() => {
    if (editing) {
      const parsed = parseStoredContent(memo.content ?? '');
      setDraft(parsed.html);
      setFontFamily(parsed.font);
      setFontSize(parsed.size);
      setFontColor(parsed.color);
      if (editorRef.current) editorRef.current.focus();
    }
  }, [editing, memo.content]);

  useEffect(() => {
    if (!editing) return;
    const quill = editorRef.current?.getEditor();
    if (!quill) return;
    quill.root.style.fontFamily = fontFamily;
    quill.root.style.fontSize = `${fontSize}px`;
    quill.root.style.color = fontColor;
  }, [editing, fontFamily, fontSize, fontColor]);

  useEffect(() => {
    if (!editing) return;
    const onDown = (e: MouseEvent) => {
      if (cardRef.current?.contains(e.target as Node)) return;
      complete();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [editing, draft, fontFamily, fontSize, fontColor]);

  useEffect(() => {
    if (!menu) return;
    const close = (e: Event) => {
      const target = e.target as Node;
      if ((target as HTMLElement | null)?.closest('.memo-context-menu')) return;
      if (cardRef.current?.contains(target)) return;
      setMenu(null);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('scroll', close, true);
    };
  }, [menu]);

  const exec = (command: string) => {
    const quill = editorRef.current?.getEditor();
    if (!quill) return;
    quill.focus();
    if (command === 'insertUnorderedList') {
      const current = quill.getFormat();
      quill.format('list', current.list ? false : 'bullet');
    }
  };

  const insertChecklist = () => {
    const quill = editorRef.current?.getEditor();
    if (!quill) return;
    const range = quill.getSelection(true);
    quill.insertText(range?.index ?? quill.getLength(), '\n☐ 체크 항목');
  };

  const complete = () => {
    const html = draft ?? '';
    const wrapped = `<div style=\"font-family:${fontFamily};font-size:${fontSize}px;color:${fontColor}\">${html}</div>`;
    onCompleteEdit(memo.memoId, wrapped);
  };

  const onCardMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (editing) return;
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('.memo-context-menu') ||
      target.closest('.memo-editor-toolbar') ||
      target.closest('.memo-resize-handle')
    ) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };

    const onMovePointer = (event: MouseEvent) => {
      if (!dragRef.current) return;
      onMove(
        memo.memoId,
        event.clientX - dragRef.current.offsetX,
        event.clientY - dragRef.current.offsetY,
      );
    };

    const onUpPointer = () => {
      dragRef.current = null;
      onMoveCommit(memo.memoId);
      window.removeEventListener('mousemove', onMovePointer);
      window.removeEventListener('mouseup', onUpPointer);
    };

    window.addEventListener('mousemove', onMovePointer);
    window.addEventListener('mouseup', onUpPointer);
  };

  const onCardMouseUp = () => {};

  const onResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { startX: e.clientX, startY: e.clientY, width: memo.width, height: memo.height };
    const onResizeMove = (event: MouseEvent) => {
      if (!resizeRef.current) return;
      const width = Math.max(180, resizeRef.current.width + (event.clientX - resizeRef.current.startX));
      const height = Math.max(140, resizeRef.current.height + (event.clientY - resizeRef.current.startY));
      onResize(memo.memoId, width, height);
    };
    const onResizeUp = () => {
      resizeRef.current = null;
      onResizeCommit(memo.memoId);
      window.removeEventListener('mousemove', onResizeMove);
      window.removeEventListener('mouseup', onResizeUp);
    };
    window.addEventListener('mousemove', onResizeMove);
    window.addEventListener('mouseup', onResizeUp);
  };

  return (
    <>
      <div
      ref={cardRef}
      className="memo-card"
      style={style}
      onMouseDown={onCardMouseDown}
      onMouseUp={onCardMouseUp}
      onDoubleClick={() => onStartEdit(memo.memoId)}
      onContextMenu={(e) => {
        e.preventDefault();
        if (editing) return;
        e.stopPropagation();
        setMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      <button className="memo-delete" onClick={() => onDelete(memo.memoId)}>
        <Icon name="close" />
      </button>
      {editing ? (
        <>
          <ReactQuill
            ref={editorRef}
            className="memo-editor"
            theme="bubble"
            value={draft}
            onChange={setDraft}
            modules={{ toolbar: false }}
          />
          <MemoEditorToolbar
            visible={editing}
            fontFamily={fontFamily}
            fontSize={fontSize}
            color={fontColor}
            onBold={() => editorRef.current?.getEditor().format('bold', true)}
            onItalic={() => editorRef.current?.getEditor().format('italic', true)}
            onUnderline={() => editorRef.current?.getEditor().format('underline', true)}
            onLink={() => {
              const value = window.prompt('링크 URL을 입력하세요');
              if (!value) return;
              editorRef.current?.getEditor().format('link', value);
            }}
            onFontFamily={(font) => {
              setFontFamily(font);
              const quill = editorRef.current?.getEditor();
              if (quill) quill.root.style.fontFamily = font;
            }}
            onFontSize={(size) => {
              setFontSize(size);
              const quill = editorRef.current?.getEditor();
              if (quill) quill.root.style.fontSize = `${size}px`;
            }}
            onColor={(color) => {
              setFontColor(color);
              const quill = editorRef.current?.getEditor();
              if (quill) quill.root.style.color = color;
            }}
            onList={() => exec('insertUnorderedList')}
            onOrderedList={() => editorRef.current?.getEditor().format('list', 'ordered')}
            onChecklist={insertChecklist}
          />
        </>
      ) : (
        <div className="memo-content" dangerouslySetInnerHTML={{ __html: memo.content || '내용 없음' }} />
      )}
        {!editing && <div className="memo-resize-handle" onMouseDown={onResizeMouseDown} />}
      </div>
      {menu && (
        <MemoContextMenu
          x={menu.x}
          y={menu.y}
          onFrontMost={() => {
            onFrontMost(memo.memoId);
            setMenu(null);
          }}
          onFront={() => {
            onFront(memo.memoId);
            setMenu(null);
          }}
          onBack={() => {
            onBack(memo.memoId);
            setMenu(null);
          }}
          onBackMost={() => {
            onBackMost(memo.memoId);
            setMenu(null);
          }}
        />
      )}
    </>
  );
};
