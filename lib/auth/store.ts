"use client";

import { create } from "zustand";

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  email?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticating: boolean;
  setUser: (user: AuthUser | null) => void;
  setAuthenticating: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticating: false,
  setUser: (user) => set({ user }),
  setAuthenticating: (state) => set({ isAuthenticating: state }),
}));


