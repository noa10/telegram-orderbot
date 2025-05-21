import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';

// Placeholder Admin Pages
const AdminProductsPage: React.FC = () => <div className="p-4"><h1 className="text-2xl font-bold">Products Management</h1><p>Products page coming soon!</p></div>;
const AdminUsersPage: React.FC = () => <div className="p-4"><h1 className="text-2xl font-bold">Customer Management</h1><p>Customers page coming soon!</p></div>;
const AdminAnalyticsPage: React.FC = () => <div className="p-4"><h1 className="text-2xl font-bold">Analytics</h1><p>Analytics page coming soon!</p></div>;
const AdminSettingsPage: React.FC = () => <div className="p-4"><h1 className="text-2xl font-bold">Settings</h1><p>Settings page coming soon!</p></div>;

function App() {
  return (
    <Routes>
      {/* Authentication Routes - Outside AppLayout to avoid duplicate navigation */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      {/* Public Routes */}
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/menu" element={<ProductListPage />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
      </Route>

      {/* Protected User Routes */}
      <Route element={<ProtectedRoute requiredRole="user" />}>
        <Route element={<AppLayout />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-history" element={<OrderHistoryPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;