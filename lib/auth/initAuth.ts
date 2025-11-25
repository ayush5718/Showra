"use client";

import { useAuthStore } from "./store";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useRef } from "react";

/**
 * Hook to initialize auth store on client-side mount
 * This ensures the session is loaded from Supabase after OAuth callback
 */
export function useInitAuth() {
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const setAuthenticating = useAuthStore((state) => state.setAuthenticating);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once on mount
    if (hasInitialized.current) return;
    
    hasInitialized.current = true;
    
    console.log('🔐 Initializing auth...');
    
    // Reset authenticating state in case it was stuck from OAuth redirect
    setAuthenticating(false);
    
    // Helper function to update store from session
    const updateStoreFromSession = async (session: any) => {
      if (!session) {
        useAuthStore.setState({
          session: null,
          user: null,
          isLoading: false,
        });
        return;
      }

      const providerToken = session.provider_token || null;
      const expiresAt = session.expires_at 
        ? session.expires_at * 1000
        : null;
      const refreshToken = session.refresh_token || null;

      const sessionData = {
        providerToken,
        expiresAt,
        refreshToken,
      };

      let userData = null;
      if (session.user) {
        const metadata = session.user.user_metadata as Record<string, any>;
        userData = {
          id: session.user.id,
          name: metadata?.name ?? session.user.email ?? "Showra Maker",
          username: metadata?.user_name ?? metadata?.nickname ?? session.user.email ?? "maker",
          avatarUrl:
            metadata?.avatar_url ??
            `https://api.dicebear.com/7.x/initials/svg?seed=${metadata?.user_name ?? "showra"}`,
          email: session.user.email ?? undefined,
        };
      }

      useAuthStore.setState({
        session: sessionData,
        user: userData,
        isLoading: false,
        isAuthenticating: false,
      });

      console.log('✅ Store updated from session:', userData ? `User: ${userData.username}` : 'No user');
    };
    
    // Set up auth state change listener to handle OAuth callbacks
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event, session ? `Session exists (User: ${session.user?.email})` : 'No session');
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        // Update store directly from the session provided by the event
        if (session) {
          await updateStoreFromSession(session);
        } else {
          // Fallback to refresh if session not provided
          await refreshSession();
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear the store when user signs out
        useAuthStore.setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticating: false,
        });
      }
    });
    
    // Initial session check with retry mechanism
    // After OAuth callback, Supabase might need a moment to sync the session
    const checkSession = async (retries = 5, delay = 300) => {
      // Check if we're coming from OAuth callback (might need more time)
      const isFromCallback = window.location.pathname === '/dashboard' && 
                             (document.referrer.includes('/auth/callback') || 
                              new URLSearchParams(window.location.search).has('code'));
      
      if (isFromCallback) {
        console.log('🔄 Detected OAuth callback, waiting for session sync...');
        // Wait a bit longer on first attempt if coming from callback
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      for (let i = 0; i < retries; i++) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Error getting session:', error);
          }
          
          if (session) {
            console.log('✅ Session found on attempt', i + 1, '- User:', session.user?.email);
            await updateStoreFromSession(session);
            return;
          }
          
          if (i < retries - 1) {
            console.log(`⏳ No session found, retrying in ${delay}ms... (${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } catch (error) {
          console.error('❌ Error checking session:', error);
        }
      }
      
      // No session found after retries
      console.log('⚠️ No session found after retries');
      useAuthStore.setState({ isLoading: false, isAuthenticating: false });
    };
    
    // Start checking for session
    checkSession();
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSession, setAuthenticating]);
}

