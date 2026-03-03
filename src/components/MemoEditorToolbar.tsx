import { Icon } from './Icon';

type Props = {
  visible: boolean;
  fontFamily: string;
  fontSize: number;
  color: string;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onLink: () => void;
  onFontFamily: (font: string) => void;
  onFontSize: (size: number) => void;
  onColor: (color: string) => void;
  onList: () => void;
  onOrderedList: () => void;
  onChecklist: () => void;
};

export const MemoEditorToolbar = ({
  visible,
  fontFamily,
  fontSize,
  color,
  onBold,
  onItalic,
  onUnderline,
  onLink,
  onFontFamily,
  onFontSize,
  onColor,
  onList,
  onOrderedList,
  onChecklist,
}: Props) => {
  if (!visible) return null;

  return (
    <div className="memo-editor-toolbar">
      <label className="toolbar-field" title="폰트">
        <Icon name="font" />
        <select value={fontFamily} onChange={(e) => onFontFamily(e.target.value)}>
          <option value="Pretendard">Pretendard</option>
          <option value="SUIT">SUIT</option>
          <option value="Noto Sans KR">Noto Sans KR</option>
          <option value="Nanum Gothic">Nanum Gothic</option>
        </select>
      </label>
      <label className="toolbar-field" title="크기">
        <Icon name="size" />
        <input
          type="number"
          min={12}
          max={40}
          value={fontSize}
          onChange={(e) => onFontSize(Number(e.target.value) || 16)}
        />
      </label>
      <label className="toolbar-field" title="색상">
        <Icon name="palette" />
        <input type="color" value={color} onChange={(e) => onColor(e.target.value)} />
      </label>
      <button title="굵게" onClick={onBold}>
        <Icon name="bold" />
      </button>
      <button title="기울임" onClick={onItalic}>
        <Icon name="italic" />
      </button>
      <button title="밑줄" onClick={onUnderline}>
        <Icon name="underline" />
      </button>
      <button title="링크" onClick={onLink}>
        <Icon name="link" />
      </button>
      <button title="리스트" onClick={onList}>
        <Icon name="list" />
      </button>
      <button title="번호 리스트" onClick={onOrderedList}>
        <Icon name="list" />
      </button>
      <button title="체크박스" onClick={onChecklist}>
        <Icon name="checklist" />
      </button>
    </div>
  );
};
