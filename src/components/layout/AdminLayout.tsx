import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Settings, Package, User, BarChart, Home } from 'lucide-react';
import AdminMobileNav from '../admin/AdminMobileNav';

const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  // Helper for active link styling
  const navLinkClass = (isActive: boolean) => {
    return `flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
      isActive 
        ? 'bg-primary text-primary-foreground' 
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`;
  };

  return (
    <div className="flex min-h-screen">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:block">
        <div className="h-16 border-b flex items-center px-6">
          <Link to="/admin/dashboard" className="text-xl font-bold text-primary">
            Admin Panel
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          <NavLink to="/admin/dashboard" className={({ isActive }) => navLinkClass(isActive)}>
            <BarChart className="h-5 w-5" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => navLinkClass(isActive)}>
            <ShoppingBag className="h-5 w-5" />
            Orders
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => navLinkClass(isActive)}>
            <Package className="h-5 w-5" />
            Products
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => navLinkClass(isActive)}>
            <User className="h-5 w-5" />
            Customers
          </NavLink>
          <NavLink to="/admin/analytics" className={({ isActive }) => navLinkClass(isActive)}>
            <BarChart className="h-5 w-5" />
            Analytics
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => navLinkClass(isActive)}>
            <Settings className="h-5 w-5" />
            Settings
          </NavLink>
          <div className="mt-auto pt-4 border-t border-muted">
            <NavLink to="/home" className={({ isActive }) => navLinkClass(isActive)}>
              <Home className="h-5 w-5" />
              Back to App
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <AdminMobileNav />
            <div className="md:hidden text-xl font-bold text-primary">Admin Panel</div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm">
                Welcome, <span className="font-medium">{user.first_name}</span>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 