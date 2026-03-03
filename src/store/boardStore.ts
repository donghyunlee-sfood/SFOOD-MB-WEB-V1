import { create } from 'zustand';
import type { Board } from '../types/domain';

type BoardState = {
  boards: Board[];
  selectedBoardId: string | null;
  setBoards: (boards: Board[]) => void;
  setSelectedBoardId: (boardId: string | null) => void;
};

export const useBoardStore = create<BoardState>((set) => ({
  boards: [],
  selectedBoardId: null,
  setBoards: (boards) => set({ boards }),
  setSelectedBoardId: (selectedBoardId) => set({ selectedBoardId }),
}));
