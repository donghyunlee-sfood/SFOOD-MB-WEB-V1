import { apiClient, unwrap } from './client';
import type { Board } from '../types/domain';

export const listBoards = async (): Promise<Board[]> => {
  const res = await apiClient.get('/boards');
  return unwrap<Board[]>(res);
};

export const createBoard = async (board: Board): Promise<Board> => {
  const res = await apiClient.post('/boards', board);
  return unwrap<Board>(res);
};

export const renameBoard = async (boardId: string, boardName: string): Promise<void> => {
  await apiClient.patch(`/boards/${encodeURIComponent(boardId)}/name`, { boardName });
};

export const moveBoard = async (
  boardId: string,
  parentBoardId: string | null,
  sortOrder: number,
): Promise<void> => {
  await apiClient.patch(`/boards/${encodeURIComponent(boardId)}/move`, {
    parentBoardId,
    sortOrder,
  });
};

export const deleteBoard = async (boardId: string): Promise<void> => {
  await apiClient.delete(`/boards/${encodeURIComponent(boardId)}`);
};
