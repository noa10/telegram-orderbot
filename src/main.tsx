import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';

// Error boundary for the entire application
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>The application encountered an error. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()} style={{
            padding: '8px 16px',
            background: '#0088cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Refresh Page
          </button>
          {this.state.error && (
            <pre style={{ marginTop: '20px', textAlign: 'left', background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Log environment variables (without sensitive values)
console.log('Environment:', {
  NODE_ENV: import.meta.env.MODE,
  BASE_URL: import.meta.env.BASE_URL,
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV,
  // Log if we have the required environment variables (without showing their values)
  HAS_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
  HAS_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  HAS_TELEGRAM_BOT_TOKEN: !!import.meta.env.VITE_TELEGRAM_BOT_TOKEN,
  HAS_APP_URL: !!import.meta.env.VITE_APP_URL
});

// Get the root element
const rootElement = document.getElementById('root');

// Ensure the root element exists
if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Application Error</h1><p>Could not find root element to mount the application.</p></div>';
} else {
  try {
    // Create root and render app
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
            <AuthProvider>
              <ProductProvider>
                <CartProvider>
                  <OrderProvider>
                    <App />
                  </OrderProvider>
                </CartProvider>
              </ProductProvider>
            </AuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </React.StrictMode>,
    );
    console.log('Application rendered successfully');
  } catch (error) {
    console.error('Failed to render application:', error);
    rootElement.innerHTML = `<div style="padding: 20px; text-align: center;"><h1>Application Error</h1><p>Failed to initialize the application. Please try refreshing the page.</p><p>${error instanceof Error ? error.message : String(error)}</p></div>`;
  }
}