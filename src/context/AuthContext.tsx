import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { TelegramUser } from '../types'; // Assuming TelegramUser is defined in types

// Define the shape of the context data
interface AuthContextType {
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
  isTelegramWebApp: boolean; // To know if running inside Telegram
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

  useEffect(() => {
    const initTelegram = () => {
      try {
        if (window.Telegram && window.Telegram.WebApp) {
          setIsTelegramWebApp(true);
          window.Telegram.WebApp.ready(); // Inform Telegram the app is ready

          const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;

          if (tgUser) {
            setUser({
              id: tgUser.id,
              first_name: tgUser.first_name,
              last_name: tgUser.last_name,
              username: tgUser.username,
              language_code: tgUser.language_code,
              photo_url: tgUser.photo_url, // Now should align with declared global type
            });
          } else {
            console.warn('Telegram user data not available. App may not be running inside Telegram environment or initDataUnsafe.user is missing.');
            // For local development outside Telegram, set a mock user
            if (process.env.NODE_ENV === 'development') {
              setUser({ id: 123456789, first_name: 'Test', username: 'testuser', language_code: 'en' });
            }
          }
        } else {
          console.warn('Telegram WebApp SDK not found. App is likely not running inside Telegram environment.');
        }
      } catch (e: any) {
        console.error('Error initializing Telegram WebApp SDK:', e);
        setError(`Failed to initialize Telegram SDK: ${e.message}`);
      }
      setIsLoading(false);
    };

    initTelegram();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, isTelegramWebApp }}>
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