import type { SVGProps } from 'react';

type IconName =
  | 'plus'
  | 'edit'
  | 'trash'
  | 'logout'
  | 'user'
  | 'zoomIn'
  | 'zoomOut'
  | 'drag'
  | 'check'
  | 'close'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'link'
  | 'font'
  | 'size'
  | 'palette'
  | 'list'
  | 'checklist'
  | 'front'
  | 'back'
  | 'frontMost'
  | 'backMost';

const PATHS: Record<IconName, string> = {
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20h4l10.5-10.5-4-4L4 16v4zM13.5 6.5l4 4',
  trash: 'M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12',
  logout: 'M10 5H5v14h5M14 16l5-4-5-4M19 12H9',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0',
  zoomIn: 'M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M11 8v6M8 11h6M20 20l-4-4',
  zoomOut: 'M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M8 11h6M20 20l-4-4',
  drag: 'M4 9h16M4 15h16',
  check: 'M5 13l4 4L19 7',
  close: 'M6 6l12 12M18 6L6 18',
  bold: 'M7 5h6a4 4 0 0 1 0 8H7zM7 13h7a4 4 0 1 1 0 8H7z',
  italic: 'M13 4l-4 16M9 4h8M7 20h8',
  underline: 'M8 4v6a4 4 0 0 0 8 0V4M6 20h12',
  link: 'M10 14l4-4M8 17H6a4 4 0 0 1 0-8h2M16 17h2a4 4 0 0 0 0-8h-2',
  font: 'M4 19h3l1.8-5h6.4l1.8 5h3L13.6 5h-3.2L4 19zM9.8 11l2.2-6 2.2 6H9.8z',
  size: 'M5 6h14M12 6v14M8 20h8',
  palette: 'M12 4a8 8 0 0 0 0 16h1a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h1a4 4 0 1 0 0-8h-1z',
  list: 'M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01',
  checklist: 'M10 7h10M10 17h10M3 7l2 2 3-3M3 17l2 2 3-3',
  front: 'M6 8h10M8 16h10M14 12l4-4-4-4',
  back: 'M8 8h10M6 16h10M10 12l-4-4 4-4',
  frontMost: 'M6 7h8M6 17h8M14 12l6-5v10z',
  backMost: 'M10 7h8M10 17h8M10 7l-6 5 6 5z',
};

export const Icon = ({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d={PATHS[name]} />
  </svg>
);
