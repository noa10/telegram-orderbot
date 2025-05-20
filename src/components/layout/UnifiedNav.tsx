import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useIsMobile } from '../../hooks/use-mobile';
import { cn } from '../../lib/utils';
import { Home, ListOrdered, History, UserCog, ShoppingCart, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming Button component is available

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  exact?: boolean;
}

const UnifiedNav: React.FC = () => {
  const { user, isAuthenticated, isTelegramWebApp } = useAuth();
  const { totalQuantity } = useCart();
  const isMobile = useIsMobile();

  // Placeholder for admin logic, adapt as needed
  const isAdmin = user?.id === 12345678; // Replace with actual admin check logic from your app

  const navLinks: NavItem[] = [
    { to: '/', label: 'Home', icon: Home, exact: true },
    { to: '/menu', label: 'Menu', icon: ListOrdered },
    { to: '/order-history', label: 'Orders', icon: History },
    { to: '/admin', label: 'Admin', icon: UserCog, adminOnly: true },
  ];

  const filteredNavLinks = navLinks.filter(link => !link.adminOnly || (link.adminOnly && isAdmin));

  const navLinkClass = (isActive: boolean, isMobileView: boolean) =>
    cn(
      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
      isMobileView && 'flex-col h-16 justify-center text-xs',
      isMobileView && isActive && 'text-primary', // Ensure mobile active text color
      isMobileView && !isActive && 'text-muted-foreground'
    );
  
  const mobileNavLinkClass = (isActive: boolean) =>
    cn(
      "flex flex-col items-center justify-center flex-1 pt-1 pb-1 text-xs",
      isActive ? "text-primary" : "text-muted-foreground hover:text-primary/80"
    );


  if (isMobile) {
    // Mobile Bottom Navigation
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t p-2 flex justify-around supports-[backdrop-filter]:bg-background/60 backdrop-blur">
        {filteredNavLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            className={({ isActive }) => mobileNavLinkClass(isActive)}
          >
            <link.icon className="h-5 w-5 mx-auto" />
            <span className="mt-1">{link.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/cart"
          className={({ isActive }) => mobileNavLinkClass(isActive) + ' relative'}
        >
          <ShoppingCart className="h-5 w-5 mx-auto" />
          <span className="mt-1">Cart</span>
          {totalQuantity > 0 && (
            <span className="absolute top-0 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {totalQuantity}
            </span>
          )}
        </NavLink>
      </nav>
    );
  }

  // Desktop Navigation Bar
  return (
    <nav className="bg-card border-b shadow-sm sticky top-0 z-50 hidden md:block">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            FoodOrder
          </Link>

          <div className="flex items-center space-x-2 lg:space-x-4">
            {filteredNavLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exact}
                className={({ isActive }) => navLinkClass(isActive, false)}
              >
                <link.icon className="h-4 w-4" /> {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/cart"
              className={({ isActive }) => `${navLinkClass(isActive, false)} relative`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Cart</span>
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  {totalQuantity}
                </span>
              )}
            </NavLink>

            {isTelegramWebApp && user ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {user.photo_url && <img src={user.photo_url} alt="User" className="h-7 w-7 rounded-full"/>}
                <span>{user.first_name}</span>
              </div>
            ) : !isTelegramWebApp && isAuthenticated ? (
               // Example: Show a profile link if authenticated but not in Telegram
              <NavLink to="/profile" className={({ isActive }) => navLinkClass(isActive, false)}>
                <UserCircle className="h-5 w-5" /> Profile
              </NavLink>
            ) : !isTelegramWebApp && !isAuthenticated ? (
              // Example: Show a login button if not in Telegram and not authenticated
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Login</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UnifiedNav;
