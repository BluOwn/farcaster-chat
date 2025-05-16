import { useCallback, useEffect, useState } from 'react';
import { sdk } from '@farcaster/frame-sdk';

interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfp?: string;
}

interface UseAuthResult {
  user: FarcasterUser | null;
  isLoading: boolean;
  error: Error | null;
  signIn: () => Promise<void>;
}

export function useFarcasterAuth(): UseAuthResult {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      try {
        setIsLoading(true);
        
        // Check if running in a Farcaster Mini App
        const isMiniApp = await sdk.isInMiniApp();
        if (!isMiniApp) {
          console.warn("Not running in a Farcaster Mini App context");
          setIsLoading(false);
          return;
        }
        
        // Hide splash screen
        await sdk.actions.ready();
        
        // Get user context - adding await here
        const context = await sdk.context;
        
        // Check if user exists in context
        if (context.user) {
          setUser({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfp: context.user.pfpUrl
          });
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    }
    
    initAuth();
  }, []);
  
  // Sign in function
  const signIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Generate a random nonce
      const nonce = Math.random().toString(36).substring(2);
      
      // Request sign-in
      const signInResult = await sdk.actions.signIn({
        nonce,
        acceptAuthAddress: true
      });
      
      // In a real app, you'd verify this on your server
      console.log("Sign-in result:", signInResult);
      
      // Update user from context again - adding await here
      const context = await sdk.context;
      
      // Check if user exists after sign-in
      if (context.user) {
        setUser({
          fid: context.user.fid,
          username: context.user.username,
          displayName: context.user.displayName,
          pfp: context.user.pfpUrl
        });
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Sign-in error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    }
  }, []);
  
  return { user, isLoading, error, signIn };
}