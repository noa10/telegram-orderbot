import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { TelegramUser } from '../types';
import { supabase } from '../lib/supabaseClient';
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

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);

        // Check for Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
          setIsTelegramWebApp(true);
          window.Telegram.WebApp.ready();

          const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
          const initData = window.Telegram.WebApp.initData;

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
            await signInWithTelegram(telegramUser, initData);
          }
        } else {
          // Check for existing session
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            // Get user data from Supabase
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userError) {
              console.error('Error fetching user data:', userError);
            } else if (userData) {
              // Set user from database
              setUser({
                id: userData.telegram_id || 0,
                first_name: userData.first_name,
                last_name: userData.last_name,
                username: userData.username,
                language_code: userData.language_code,
                photo_url: userData.photo_url,
              });

              // Get user role
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('roles(name)')
                .eq('user_id', session.user.id)
                .single();

              if (roleData && roleData.roles) {
                setUserRole(roleData.roles.name);
              } else {
                setUserRole('user'); // Default role
              }
            }
          } else if (process.env.NODE_ENV === 'development') {
            // For local development, set a mock user
            setUser({ id: 123456789, first_name: 'Test', username: 'testuser', language_code: 'en' });
            setUserRole('user');
          }
        }
      } catch (e: any) {
        console.error('Error initializing auth:', e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // Fetch user data and role when session changes
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!userError && userData) {
            setUser({
              id: userData.telegram_id || 0,
              first_name: userData.first_name,
              last_name: userData.last_name,
              username: userData.username,
              language_code: userData.language_code,
              photo_url: userData.photo_url,
            });

            // Get user role
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('roles(name)')
              .eq('user_id', session.user.id)
              .single();

            if (roleData && roleData.roles) {
              setUserRole(roleData.roles.name);
            } else {
              setUserRole('user'); // Default role
            }
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return true;
    } catch (e: any) {
      console.error('Error signing in with email:', e);
      setError(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string, userData: any) => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Telegram
  const signInWithTelegram = async (telegramUser: TelegramUser, initData: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate Telegram data on server
      const response = await validateTelegramWebAppData(initData);

      if (!response.validated) {
        throw new Error('Failed to validate Telegram data');
      }

      // Check if user exists in Supabase
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

      if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw userError;
      }

      // Set user
      setUser(telegramUser);

      if (existingUser) {
        // Get user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', existingUser.id)
          .single();

        if (roleData && roleData.roles) {
          setUserRole(roleData.roles.name);
        } else {
          setUserRole('user');
        }
      } else {
        setUserRole('user');
      }

      return true;
    } catch (e: any) {
      console.error('Error signing in with Telegram:', e);
      setError(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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