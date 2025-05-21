// Helper functions for Telegram Mini App
// Assuming window.Telegram.WebApp is available when the app is loaded in Telegram

// Type for Telegram WebApp
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
    auth_date: number;
    hash: string;
    query_id?: string;
    start_param?: string;
  };
  ready(): void;
  expand(): void;
  close(): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback: (confirmed: boolean) => void): void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    setText(text: string): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    showProgress(leaveActive: boolean): void;
    hideProgress(): void;
  };
  BackButton: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
  // Add more methods and properties as needed
}

// Declare global window interface to include Telegram property
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Function to check if the app is running inside Telegram
export const isTelegramWebApp = (): boolean => {
  try {
    // Add more detailed logging to help diagnose issues
    console.log('Checking for Telegram WebApp:', {
      hasTelegramObject: !!window.Telegram,
      hasWebAppObject: !!(window.Telegram && window.Telegram.WebApp),
      webAppInitialized: !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData)
    });

    return window.Telegram?.WebApp !== undefined;
  } catch (error) {
    console.error('Error checking for Telegram WebApp:', error);
    return false;
  }
};

// Function to get Telegram WebApp instance
export const getTelegramWebApp = (): TelegramWebApp | null => {
  try {
    if (isTelegramWebApp()) {
      return window.Telegram?.WebApp || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting Telegram WebApp instance:', error);
    return null;
  }
};

// Function to validate init data on the server
export const validateTelegramWebAppData = async (initData: string) => {
  try {
    // Get the base URL from environment or use the current origin
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const apiUrl = `${baseUrl}/api/auth/telegram/validate`;

    console.log('Validating Telegram data with API URL:', apiUrl);

    // Call the backend API to validate the initData
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initData }),
    });

    console.log('Validation response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Validation error response:', errorData);
      throw new Error(errorData.error || `Failed to validate Telegram WebApp data: ${response.status}`);
    }

    const data = await response.json();
    console.log('Validation successful:', data);

    if (!data.validated || !data.user) {
      throw new Error('Invalid Telegram authentication data');
    }

    return data;
  } catch (error) {
    console.error('Error validating Telegram WebApp data:', error);
    return {
      validated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      user: null
    };
  }
};

// Function to check if initData is recent (less than 24 hours old)
export const isInitDataRecent = (authDate: number): boolean => {
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime - authDate < 86400; // 24 hours in seconds
};

// Function to get Telegram user data
export const getTelegramUser = () => {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe.user || null;
};

// Function to show alert using Telegram UI
export const showTelegramAlert = (message: string, callback?: () => void) => {
  const webApp = getTelegramWebApp();
  webApp?.showAlert(message, callback);
};

// Function to show confirmation using Telegram UI
export const showTelegramConfirm = (
  message: string,
  callback: (confirmed: boolean) => void
) => {
  const webApp = getTelegramWebApp();
  webApp?.showConfirm(message, callback);
};

// Function to control the main button
export const setMainButton = (
  text: string,
  onClick: () => void,
  options: {
    color?: string;
    textColor?: string;
    isActive?: boolean;
    showProgress?: boolean;
  } = {}
) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    const mainButton = webApp.MainButton;
    mainButton.setText(text);

    if (options.color) {
      mainButton.color = options.color;
    }

    if (options.textColor) {
      mainButton.textColor = options.textColor;
    }

    mainButton.onClick(onClick);

    if (options.isActive === false) {
      mainButton.disable();
    } else {
      mainButton.enable();
    }

    if (options.showProgress) {
      mainButton.showProgress(true);
    } else {
      mainButton.hideProgress();
    }

    mainButton.show();
  }
};

// Function to show back button
export const showBackButton = (onClick: () => void) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.BackButton.onClick(onClick);
    webApp.BackButton.show();
  }
};

// Function to hide back button
export const hideBackButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.BackButton.hide();
  }
};