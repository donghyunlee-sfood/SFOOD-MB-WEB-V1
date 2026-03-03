import { create } from 'zustand';

type UiState = {
  zoom: number;
  lnbWidth: number;
  toast: { id: number; text: string } | null;
  setZoom: (zoom: number) => void;
  setLnbWidth: (width: number) => void;
  setMessage: (message: string) => void;
  clearMessage: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  zoom: 100,
  lnbWidth: 320,
  toast: null,
  setZoom: (zoom) => set({ zoom: Math.max(50, Math.min(200, Math.round(zoom))) }),
  setLnbWidth: (lnbWidth) => set({ lnbWidth: Math.max(220, Math.min(460, lnbWidth)) }),
  setMessage: (message) => set({ toast: { id: Date.now(), text: message } }),
  clearMessage: () => set({ toast: null }),
}));
