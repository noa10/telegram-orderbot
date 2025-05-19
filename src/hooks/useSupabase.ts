import { useState, useEffect } from 'react';
import { supabase, getUser, signOut, createTelegramSession } from '../lib/supabase';
import { TelegramUser } from '../types';

// Hook for Supabase functionality
export const useSupabase = () => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setIsLoading(false);
      }
    );

    // Initialize session
    const initSession = async () => {
      try {
        setIsLoading(true);
        const currentUser = await getUser();
        setUser(currentUser);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing session:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize session');
        setIsLoading(false);
      }
    };

    initSession();

    // Clean up listener
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Sign in with Telegram
  const signInWithTelegram = async (telegramUser: TelegramUser, initData: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This would be expanded with actual server validation
      // For now, we'll create a placeholder session
      const result = await createTelegramSession(telegramUser);
      
      if (!result) {
        throw new Error('Failed to create session with Telegram data');
      }
      
      setUser(result);
      setIsLoading(false);
      return result;
    } catch (error) {
      console.error('Error signing in with Telegram:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in with Telegram');
      setIsLoading(false);
      return null;
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await signOut();
      
      if (!success) {
        throw new Error('Failed to sign out');
      }
      
      setUser(null);
      setSession(null);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign out');
      setIsLoading(false);
      return false;
    }
  };

  return {
    session,
    user,
    isLoading,
    error,
    signInWithTelegram,
    signOut: handleSignOut,
    supabase,
  };
};