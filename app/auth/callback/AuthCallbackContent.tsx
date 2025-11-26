"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/lib/auth/store";

export function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const setAuthenticating = useAuthStore((state) => state.setAuthenticating);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("🔄 Client-side callback handler started");
        
        // Check for OAuth errors in URL
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        
        if (errorParam) {
          console.error("❌ OAuth error in callback:", errorParam, errorDescription);
          setError(errorDescription || errorParam);
          setAuthenticating(false);
          setTimeout(() => {
            router.push(`/?error=${encodeURIComponent(errorDescription || errorParam)}`);
          }, 2000);
          return;
        }

        // Check for code in URL
        const code = searchParams.get("code");
        if (!code) {
          console.log("⚠️ No code in URL, redirecting to home");
          router.push("/");
          return;
        }

        console.log("✅ Code found in URL, checking for session...");
        
        setAuthenticating(true);
        
        // With detectSessionInUrl: true, Supabase might have already auto-exchanged the code
        // Let's first check if a session already exists
        let session = null;
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn("⚠️ Error getting session (will try to exchange):", sessionError);
        } else if (sessionData?.session) {
          session = sessionData.session;
          console.log("✅ Session already exists (auto-exchanged by Supabase):", {
            userId: session.user?.id,
            email: session.user?.email,
          });
        }
        
        // If no session exists, manually exchange the code
        if (!session) {
          console.log("🔄 No existing session, exchanging code for session (PKCE flow)...");
          
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          // Handle exchange error gracefully
          if (exchangeError) {
            // If error is empty or code already used, check for session again
            const errorMessage = exchangeError.message || "";
            const isCodeAlreadyUsed = errorMessage.includes("already") || 
                                     errorMessage.includes("expired") ||
                                     errorMessage.includes("invalid");
            
            if (isCodeAlreadyUsed || !errorMessage) {
              console.log("⚠️ Code exchange returned error, checking for session again...");
              const { data: retrySessionData } = await supabase.auth.getSession();
              if (retrySessionData?.session) {
                session = retrySessionData.session;
                console.log("✅ Session found after retry:", {
                  userId: session.user?.id,
                  email: session.user?.email,
                });
              } else {
                // Only throw if we still don't have a session
                console.error("❌ Error exchanging code and no session found:", {
                  error: exchangeError,
                  message: exchangeError.message,
                  status: exchangeError.status,
                });
                throw exchangeError;
              }
            } else {
              console.error("❌ Error exchanging code for session:", {
                error: exchangeError,
                message: exchangeError.message,
                status: exchangeError.status,
              });
              throw exchangeError;
            }
          } else if (data?.session) {
            session = data.session;
            console.log("✅ Session exchanged successfully:", {
              userId: session.user?.id,
              email: session.user?.email,
              hasProviderToken: !!data.session.provider_token,
            });
          }
        }
        
        // Final check - ensure we have a session
        if (!session) {
          console.error("❌ No session available after all attempts");
          throw new Error("Authentication failed: No session received");
        }
        
        // Update auth store
        await refreshSession();
        
        // Get the next redirect URL
        const next = searchParams.get("next") || "/dashboard";
        console.log(`🔄 Redirecting to: ${next}`);
        
        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect to the target page
        router.push(next);
        
      } catch (err: any) {
        console.error("❌ Error in callback handler:", err);
        setError(err.message || "Authentication failed");
        setAuthenticating(false);
        setTimeout(() => {
          router.push(`/?error=${encodeURIComponent(err.message || "Authentication failed")}`);
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, router, refreshSession, setAuthenticating]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] text-[#00E5FF]"></div>
        <p className="mt-4 text-gray-400">Completing authentication...</p>
      </div>
    </div>
  );
}

