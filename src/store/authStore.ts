import { create } from 'zustand';
import type { User } from '../types/domain';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  sessionChecked: boolean;
  setUser: (user: User | null) => void;
  setSessionChecked: (checked: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  sessionChecked: false,
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  setSessionChecked: (sessionChecked) => set({ sessionChecked }),
}));
