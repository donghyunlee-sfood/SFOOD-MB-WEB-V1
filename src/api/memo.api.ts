import { apiClient, unwrap } from './client';
import type { Memo } from '../types/domain';

export const listMemos = async (boardId: string): Promise<Memo[]> => {
  const res = await apiClient.get(`/boards/${encodeURIComponent(boardId)}/memos`);
  return unwrap<Memo[]>(res);
};

export const createMemo = async (boardId: string, memo: Memo): Promise<Memo> => {
  const res = await apiClient.post(`/boards/${encodeURIComponent(boardId)}/memos`, memo);
  return unwrap<Memo>(res);
};

export const updateMemoContent = async (memoId: string, content: string): Promise<void> => {
  await apiClient.patch(`/memos/${encodeURIComponent(memoId)}/content`, { content });
};

export const updateMemoPosition = async (memoId: string, posX: number, posY: number): Promise<void> => {
  await apiClient.patch(`/memos/${encodeURIComponent(memoId)}/position`, { posX, posY });
};

export const updateMemoSize = async (memoId: string, width: number, height: number): Promise<void> => {
  await apiClient.patch(`/memos/${encodeURIComponent(memoId)}/size`, { width, height });
};

export const updateMemoZIndex = async (
  boardId: string,
  memos: Array<{ memoId: string; zIndex: number }>,
): Promise<void> => {
  await apiClient.patch(`/boards/${encodeURIComponent(boardId)}/memos/zindex`, { memos });
};

export const deleteMemo = async (memoId: string): Promise<void> => {
  await apiClient.delete(`/memos/${encodeURIComponent(memoId)}`);
};
