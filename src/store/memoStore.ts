import { create } from 'zustand';
import type { Memo, MemoType } from '../types/domain';

type MemoState = {
  memos: Memo[];
  memoTypes: MemoType[];
  selectedTypeId: string | null;
  editingMemoId: string | null;
  setMemos: (memos: Memo[]) => void;
  setMemoTypes: (memoTypes: MemoType[]) => void;
  setSelectedTypeId: (typeId: string | null) => void;
  setEditingMemoId: (memoId: string | null) => void;
};

export const useMemoStore = create<MemoState>((set) => ({
  memos: [],
  memoTypes: [],
  selectedTypeId: null,
  editingMemoId: null,
  setMemos: (memos) => set({ memos }),
  setMemoTypes: (memoTypes) =>
    set((state) => ({
      memoTypes,
      selectedTypeId: state.selectedTypeId ?? memoTypes[0]?.typeId ?? null,
    })),
  setSelectedTypeId: (selectedTypeId) => set({ selectedTypeId }),
  setEditingMemoId: (editingMemoId) => set({ editingMemoId }),
}));
