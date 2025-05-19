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
  return window.Telegram?.WebApp !== undefined;
};

// Function to get Telegram WebApp instance
export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (isTelegramWebApp()) {
    return window.Telegram?.WebApp || null;
  }
  return null;
};

// Function to validate init data on the server
export const validateTelegramWebAppData = async (initData: string) => {
  try {
    // Call the backend API to validate the initData
    const response = await fetch('/api/auth/telegram/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to validate Telegram WebApp data');
    }

    const data = await response.json();

    if (!data.validated || !data.user) {
      throw new Error('Invalid Telegram authentication data');
    }

    return data;
  } catch (error) {
    console.error('Error validating Telegram WebApp data:', error);
    throw error;
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