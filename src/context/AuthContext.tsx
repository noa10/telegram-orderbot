import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { TelegramUser } from '../types';
import { supabase } from '../lib/supabaseClient';
import { createTelegramSession } from '../lib/supabase'; // Import createTelegramSession
import { validateTelegramWebAppData } from '../lib/telegram';

// Define the shape of the context data
interface AuthContextType {
  user: TelegramUser | null;
  userRole: string | null;
  isLoading: boolean;
  error: string | null;
  isTelegramWebApp: boolean;
  isAdmin: boolean;
  isMerchant: boolean;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, userData: any) => Promise<boolean>;
  signInWithTelegram: (telegramUser: TelegramUser, initData: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Augment the Window interface to include Telegram WebApp types
// This helps TypeScript understand window.Telegram.WebApp structure.
// You might have this in a global .d.ts file as well.
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string; // Ensure this matches the actual SDK structure
          };
        };
        ready: () => void;
        // Add other Telegram WebApp methods if needed
      };
    };
  }
}

// Create the AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

  // Check if user is admin or merchant
  const isAdmin = userRole === 'admin';
  const isMerchant = userRole === 'merchant';

  // Define signInWithTelegram function with useCallback before it's used in useEffect
  const signInWithTelegram = useCallback(async (telegramUser: TelegramUser, initData: string) => {
    try {
      setError(null);
      const validationResponse = await validateTelegramWebAppData(initData);

      if (!validationResponse.validated) {
        throw new Error('Failed to validate Telegram data from server.');
      }

      // Use the existing createTelegramSession from lib/supabase.ts
      // This function handles signing up or signing in with generated credentials
      // and establishes a Supabase Auth session.
      const supabaseAuthUser = await createTelegramSession(telegramUser);

      if (!supabaseAuthUser) {
        throw new Error('Failed to establish Supabase session for Telegram user.');
      }

      // The onAuthStateChange listener will now pick up the new session
      // and update the user and userRole states.
      return true;
    } catch (e: any) {
      console.error('Error signing in with Telegram:', e);
      setError(e.message);
      return false;
    }
  }, []);

  // Helper to fetch user profile and role from public tables
  const fetchUserProfileAndRole = useCallback(async (supabaseUserId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUserId)
        .single();

      if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user data:', userError);
        return { userProfile: null, role: null };
      }

      let role = 'user'; // Default role
      if (userData) {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', supabaseUserId)
          .single();

        if (!roleError && roleData && roleData.roles) {
          role = roleData.roles.name;
        } else if (roleError && roleError.code !== 'PGRST116') {
          console.error('Error fetching user role:', roleError);
        }
      }

      return { userProfile: userData ? { id: userData.telegram_id || 0, first_name: userData.first_name, last_name: userData.last_name, username: userData.username, language_code: userData.language_code, photo_url: userData.photo_url } : null, role: role };
    } catch (e) {
      console.error('Error in fetchUserProfileAndRole:', e);
      return { userProfile: null, role: null };
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Keep track of whether the component is mounted
    let isMounted = true;

    const initAuth = async () => {
      // Helper function to handle auth state changes
      const handleAuthStateChange = async (session: any | null) => {
        if (!isMounted) return; // Don't update state if component is unmounted

        setIsLoading(true); // Start loading when auth state changes or initializes
        setError(null); // Clear any previous errors

        try {
          if (session) {
            const { userProfile, role } = await fetchUserProfileAndRole(session.user.id);
            if (isMounted) {
              setUser(userProfile);
              setUserRole(role);
            }
          } else {
            if (isMounted) {
              setUser(null);
              setUserRole(null);
            }
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          if (isMounted) {
            setError(error instanceof Error ? error.message : 'Error handling authentication');
          }
        }

        if (isMounted) {
          setIsLoading(false); // End loading after state is fully processed
        }
      };

      try {
        // Add a small delay to ensure Telegram WebApp is fully initialized
        setTimeout(async () => {
          try {
            // Check for Telegram WebApp with more detailed logging
            console.log('Auth initialization - Telegram WebApp check:', {
              hasTelegramObject: !!window.Telegram,
              hasWebAppObject: !!(window.Telegram && window.Telegram.WebApp),
              hasInitData: !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData),
              hasInitDataUnsafe: !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe),
              hasUser: !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user)
            });

            if (window.Telegram && window.Telegram.WebApp) {
              setIsTelegramWebApp(true);

              // Call ready() to notify Telegram that the Mini App is ready
              try {
                window.Telegram.WebApp.ready();
                console.log('Telegram WebApp ready() called successfully');
              } catch (readyError) {
                console.error('Error calling Telegram WebApp ready():', readyError);
              }

              // Safely access initDataUnsafe and user properties
              const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
              const initData = window.Telegram.WebApp.initData;

              console.log('Telegram user data available:', !!tgUser);

              if (tgUser && initData) {
                // Create Telegram user object
                const telegramUser: TelegramUser = {
                  id: tgUser.id,
                  first_name: tgUser.first_name,
                  last_name: tgUser.last_name,
                  username: tgUser.username,
                  language_code: tgUser.language_code,
                  photo_url: tgUser.photo_url,
                };

                // Sign in with Telegram
                // This will trigger onAuthStateChange via createTelegramSession
                await signInWithTelegram(telegramUser, initData);
              } else {
                console.warn('Telegram WebApp available but user data or initData is missing');
                // Fall back to checking for existing session
                const { data: { session } } = await supabase.auth.getSession();
                await handleAuthStateChange(session);
              }
            } else {
              console.log('Not running in Telegram WebApp environment, using normal authentication');
              // Check for existing session
              const { data: { session } } = await supabase.auth.getSession();
              await handleAuthStateChange(session);
            }
          } catch (innerError) {
            console.error('Error in Telegram initialization:', innerError);
            // Fall back to checking for existing session
            const { data: { session } } = await supabase.auth.getSession();
            await handleAuthStateChange(session);
          }
        }, 100); // Small delay to ensure Telegram WebApp is initialized
      } catch (e: any) {
        console.error('Error initializing auth:', e);
        setError(e.message);
        setIsLoading(false);
      }
    };

    initAuth();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        // This listener will call handleAuthStateChange to update state
        handleAuthStateChange(session);
      }
    );

    return () => {
      isMounted = false; // Mark component as unmounted
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfileAndRole, signInWithTelegram]); // Dependencies include both functions

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Verify we have a session
      if (!data.session) {
        throw new Error('No session created after login');
      }

      // The onAuthStateChange listener will now fire and update user/userRole
      return true;
    } catch (e: any) {
      console.error('Error signing in with email:', e);
      setError(e.message);
      return false;
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string, userData: any) => {
    try {
      setError(null);

      // Create user in Supabase Auth
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
          }
        }
      });

      if (error) throw error;

      // Create user profile in users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            username: userData.username,
          });

        if (profileError) throw profileError;

        // Assign default role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role_id: 1, // Default 'user' role
          });

        if (roleError) throw roleError;
      }

      return true;
    } catch (e: any) {
      console.error('Error signing up with email:', e);
      setError(e.message);
      return false;
    }
  };

  // Sign in with Telegram is now defined above with useCallback

  // Sign out
  const signOut = async () => {
    try {
      setError(null);

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setUser(null);
      setUserRole(null);

      return true;
    } catch (e: any) {
      console.error('Error signing out:', e);
      setError(e.message);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isLoading,
        error,
        isTelegramWebApp,
        isAdmin,
        isMerchant,
        signInWithEmail,
        signUpWithEmail,
        signInWithTelegram,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};