const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';

const random10 = (): string =>
  Array.from({ length: 10 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');

export const newBoardId = (account: string): string => `${account}_${random10()}`;

export const newMemoId = (boardId: string): string => `${boardId}_${random10()}`;
