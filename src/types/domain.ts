export type User = {
  userId: string;
  email?: string;
  name?: string;
};

export type LoginRequest = {
  googleAccount: string;
  token: string;
  name: string;
  profileImage?: string;
};

export type Board = {
  boardId: string;
  parentBoardId: string | null;
  boardName: string;
  sortOrder: number;
};

export type MemoType = {
  typeId: string;
  typeName?: string;
  name?: string;
  shape?: string;
  shapeCss?: string;
  defaultColor?: string;
};

export type Memo = {
  memoId: string;
  boardId: string;
  typeId: string;
  content: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  zIndex: number;
};
