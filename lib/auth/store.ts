"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabaseClient";

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  email?: string;
}

interface SessionData {
  providerToken: string | null;
  expiresAt: number | null;
  refreshToken: string | null;
}

interface AuthState {
  user: AuthUser | null;
  session: SessionData | null;
  isAuthenticating: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setSession: (session: SessionData | null) => void;
  setAuthenticating: (state: boolean) => void;
  refreshSession: () => Promise<boolean>;
  validateSession: () => Promise<boolean>;
  clearAuth: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticating: false,
      isLoading: true,

      setUser: (user) => set({ user }),

      setSession: (session) => set({ session }),

      setAuthenticating: (state) => set({ isAuthenticating: state }),

      // Refresh session from Supabase
      refreshSession: async () => {
        try {
          set({ isLoading: true });
          
          // Get current session
          const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();
          
          if (error || !supabaseSession) {
            console.warn('No active session found');
            set({ session: null, user: null, isLoading: false });
            return false;
          }

          // Extract provider token
          const providerToken = supabaseSession.provider_token || null;
          const expiresAt = supabaseSession.expires_at 
            ? supabaseSession.expires_at * 1000 // Convert to milliseconds
            : null;
          const refreshToken = supabaseSession.refresh_token || null;

          // Check if token is expired
          if (expiresAt && Date.now() >= expiresAt) {
            console.log('Session expired, attempting refresh...');
            
            // Try to refresh the session
            const { data: { session: refreshedSession }, error: refreshError } = 
              await supabase.auth.refreshSession();
            
            if (refreshError || !refreshedSession) {
              console.error('Failed to refresh session:', refreshError);
              set({ session: null, user: null, isLoading: false });
              return false;
            }

            // Update with refreshed session
            const newProviderToken = refreshedSession.provider_token || null;
            const newExpiresAt = refreshedSession.expires_at 
              ? refreshedSession.expires_at * 1000
              : null;
            const newRefreshToken = refreshedSession.refresh_token || null;

            set({
              session: {
                providerToken: newProviderToken,
                expiresAt: newExpiresAt,
                refreshToken: newRefreshToken,
              },
              isLoading: false,
            });

            // Update user data from refreshed session
            if (refreshedSession.user) {
              const metadata = refreshedSession.user.user_metadata as Record<string, any>;
              get().setUser({
                id: refreshedSession.user.id,
                name: metadata?.name ?? refreshedSession.user.email ?? "Showra Maker",
                username: metadata?.user_name ?? metadata?.nickname ?? refreshedSession.user.email ?? "maker",
                avatarUrl:
                  metadata?.avatar_url ??
                  `https://api.dicebear.com/7.x/initials/svg?seed=${metadata?.user_name ?? "showra"}`,
                email: refreshedSession.user.email ?? undefined,
              });
            }

            return !!newProviderToken;
          }

          // Session is still valid
          set({
            session: {
              providerToken,
              expiresAt,
              refreshToken,
            },
            isLoading: false,
          });

          // Update user data
          if (supabaseSession.user) {
            const metadata = supabaseSession.user.user_metadata as Record<string, any>;
            get().setUser({
              id: supabaseSession.user.id,
              name: metadata?.name ?? supabaseSession.user.email ?? "Showra Maker",
              username: metadata?.user_name ?? metadata?.nickname ?? supabaseSession.user.email ?? "maker",
              avatarUrl:
                metadata?.avatar_url ??
                `https://api.dicebear.com/7.x/initials/svg?seed=${metadata?.user_name ?? "showra"}`,
              email: supabaseSession.user.email ?? undefined,
            });
          }

          return !!providerToken;
        } catch (error) {
          console.error('Error refreshing session:', error);
          set({ session: null, user: null, isLoading: false });
          return false;
        }
      },

      // Validate current session
      validateSession: async () => {
        const { session } = get();
        
        // If no session in store, try to refresh
        if (!session || !session.providerToken) {
          return await get().refreshSession();
        }

        // Check if token is expired
        if (session.expiresAt && Date.now() >= session.expiresAt) {
          console.log('Stored session expired, refreshing...');
          return await get().refreshSession();
        }

        // Session is valid
        return true;
      },

      // Clear all auth data
      clearAuth: () => {
        set({
          user: null,
          session: null,
          isAuthenticating: false,
          isLoading: false,
        });
      },

      // Logout user - signs out from Supabase and clears all state
      logout: async () => {
        try {
          console.log('🚪 Logging out...');
          
          // Sign out from Supabase
          await supabase.auth.signOut();
          
          // Clear all auth state
          set({
            user: null,
            session: null,
            isAuthenticating: false,
            isLoading: false,
          });
          
          // Clear persisted storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('showra-auth-storage');
          }
          
          console.log('✅ Logged out successfully');
          
          // Redirect to home page
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        } catch (error) {
          console.error('❌ Error during logout:', error);
          // Even if logout fails, clear local state
          set({
            user: null,
            session: null,
            isAuthenticating: false,
            isLoading: false,
          });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('showra-auth-storage');
            window.location.href = '/';
          }
        }
      },
    }),
    {
      name: "showra-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
        user: state.user,
        // Don't persist isLoading or isAuthenticating - they should reset on mount
      }),
    }
  )
);


