import { useEffect, useState, useCallback } from 'react';
import {
  getTelegramWebApp,
  isTelegramWebApp,
  showTelegramAlert,
  showTelegramConfirm,
  setMainButton,
  showBackButton,
  hideBackButton,
  getTelegramUser,
  validateTelegramWebAppData
} from '../lib/telegram';
import { TelegramUser } from '../types';
import { useAuth } from '../context/AuthContext';

// Hook for Telegram Mini App functionality
export const useTelegram = () => {
  // Use the AuthContext for authentication
  const { signInWithTelegram } = useAuth();

  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [initData, setInitData] = useState<string>('');
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Telegram WebApp
  useEffect(() => {
    const initTelegram = async () => {
      try {
        if (isTelegramWebApp()) {
          const webApp = getTelegramWebApp();

          if (webApp) {
            // Set ready and get user
            webApp.ready();
            setIsReady(true);
            setInitData(webApp.initData);

            // Get user data from Telegram
            const userData = getTelegramUser();
            if (userData) {
              setUser(userData);

              // Validate with server
              try {
                const validationResult = await validateTelegramWebAppData(webApp.initData);
                if (validationResult.validated) {
                  setIsValidated(true);

                  // Use AuthContext to create a session in Supabase
                  await signInWithTelegram(userData, webApp.initData);
                }
              } catch (validationError) {
                console.error('Validation error:', validationError);
                setError(validationError instanceof Error ? validationError.message : 'Validation failed');
              }
            }

            // Check if expanded
            if (window.innerHeight > 500) {
              setIsExpanded(true);
            }
          }
        } else {
          // Development mode - mock Telegram user
          setUser({
            id: 12345678,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
          });
          setIsReady(true);
          setIsValidated(true); // Auto-validate in dev mode
        }
      } catch (err) {
        console.error('Error initializing Telegram:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      }
    };

    initTelegram();
  }, []);

  // Expand WebApp
  const expandApp = useCallback(() => {
    if (isTelegramWebApp()) {
      const webApp = getTelegramWebApp();
      if (webApp) {
        webApp.expand();
        setIsExpanded(true);
      }
    }
  }, []);

  // Close WebApp
  const closeApp = useCallback(() => {
    if (isTelegramWebApp()) {
      const webApp = getTelegramWebApp();
      if (webApp) {
        webApp.close();
      }
    }
  }, []);

  // Show alert
  const showAlert = useCallback((message: string, callback?: () => void) => {
    showTelegramAlert(message, callback);
  }, []);

  // Show confirmation dialog
  const showConfirm = useCallback((message: string, callback: (confirmed: boolean) => void) => {
    showTelegramConfirm(message, callback);
  }, []);

  // Set main button
  const setMainButtonState = useCallback((
    text: string,
    onClick: () => void,
    options?: {
      color?: string;
      textColor?: string;
      isActive?: boolean;
      showProgress?: boolean;
    }
  ) => {
    setMainButton(text, onClick, options || {});
  }, []);

  // Show back button
  const enableBackButton = useCallback((onClick: () => void) => {
    showBackButton(onClick);
  }, []);

  // Hide back button
  const disableBackButton = useCallback(() => {
    hideBackButton();
  }, []);

  return {
    user,
    isReady,
    initData,
    isExpanded,
    isValidated,
    error,
    expandApp,
    closeApp,
    showAlert,
    showConfirm,
    setMainButton: setMainButtonState,
    enableBackButton,
    disableBackButton,
    isInTelegram: isTelegramWebApp(),
  };
};