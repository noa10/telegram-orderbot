import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Package, User, BarChart, Settings, Menu, X, Home, LayoutDashboard } from 'lucide-react';

const AdminMobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Helper for active link styling
  const navLinkClass = (isActive: boolean) => {
    return `flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-foreground hover:bg-muted'
    }`;
  };

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 p-0"
        onClick={toggleMenu}
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-0 top-0 z-50 h-full w-3/4 max-w-xs bg-background shadow-lg animate-in slide-in-from-left">
            <div className="flex h-16 items-center border-b px-6">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 p-0 absolute right-4"
                onClick={toggleMenu}
                aria-label="Close Menu"
              >
                <X className="h-5 w-5" />
              </Button>
              <span className="font-bold">Admin Panel</span>
            </div>

            <nav className="px-2 py-4 space-y-1">
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => navLinkClass(isActive)}
                onClick={toggleMenu}
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) => navLinkClass(isActive)}
                onClick={toggleMenu}
              >
                <ShoppingBag className="h-5 w-5" />
                Orders
              </NavLink>
              <NavLink
                to="/admin/products"
                className={({ isActive }) => navLinkClass(isActive)}
                onClick={toggleMenu}
              >
                <Package className="h-5 w-5" />
                Products
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => navLinkClass(isActive)}
                onClick={toggleMenu}
              >
                <User className="h-5 w-5" />
                Customers
              </NavLink>
              <NavLink
                to="/admin/analytics"
                className={({ isActive }) => navLinkClass(isActive)}
                onClick={toggleMenu}
              >
                <BarChart className="h-5 w-5" />
                Analytics
              </NavLink>
              <NavLink
                to="/admin/settings"
                className={({ isActive }) => navLinkClass(isActive)}
                onClick={toggleMenu}
              >
                <Settings className="h-5 w-5" />
                Settings
              </NavLink>
              <div className="mt-auto pt-4 border-t border-muted">
                 <NavLink
                    to="/home"
                    className={({ isActive }) => navLinkClass(isActive)}
                    onClick={toggleMenu}
                 >
                    <Home className="h-5 w-5" />
                    Back to App
                </NavLink>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMobileNav; 