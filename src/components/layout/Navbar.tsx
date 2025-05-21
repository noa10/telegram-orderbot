import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext'; // Adjusted path
import { useAuth } from '../../context/AuthContext'; // Adjusted path
import { Button } from '@/components/ui/button';
import { ShoppingCart, UserCircle, LogOut, History, Home, ListOrdered, UserCog } from 'lucide-react';

const Navbar: React.FC = () => {
  const { totalQuantity } = useCart();
  const { user, isTelegramWebApp } = useAuth();

  // In a real Telegram Mini App, you might control header visibility/buttons via Telegram SDK
  // For now, this is a standard web app navbar.

  const navLinkClass = (isActive: boolean) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? 'bg-primary text-primary-foreground' 
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    }`;

  return (
    <nav className="bg-card border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            <img src="@/assets/madkrapow-logo-minimal.png" alt="Mad Krapow" className="h-10" />
          </Link>

          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <NavLink to="/" end className={({ isActive }) => navLinkClass(isActive)}>
              <Home className="h-4 w-4" /> Home
            </NavLink>
            <NavLink to="/menu" className={({ isActive }) => navLinkClass(isActive)}>
              <ListOrdered className="h-4 w-4" /> Menu
            </NavLink>
            <NavLink to="/order-history" className={({ isActive }) => navLinkClass(isActive)}>
              <History className="h-4 w-4" /> Orders
            </NavLink>
            <NavLink to="/admin/orders" className={({ isActive }) => navLinkClass(isActive)}>
              <UserCog className="h-4 w-4" /> Admin
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/cart" className={`${navLinkClass(false)} relative`}>
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Cart</span>
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  {totalQuantity}
                </span>
              )}
            </Link>
            
            {isTelegramWebApp && user ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {user.photo_url && <img src={user.photo_url} alt="User" className="h-7 w-7 rounded-full"/>}
                <span>{user.first_name}</span>
              </div>
            ) : !isTelegramWebApp ? (
              // Example: Show a login button if not in Telegram and no user (if you implement non-TG auth)
              // <Button variant="outline" size="sm">Login</Button>
              <></> // Empty for now if not in TG webapp
            ) : null}
          </div>
        </div>
      </div>
      {/* Mobile Bottom Nav (Optional - good for Telegram Mini Apps) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t p-2 flex justify-around">
          <NavLink to="/" end className={({ isActive }) => navLinkClass(isActive) + ' flex-col h-16 justify-center'}>
            <Home className="h-5 w-5 mx-auto" /> <span className="text-xs">Home</span>
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => navLinkClass(isActive) + ' flex-col h-16 justify-center'}>
            <ListOrdered className="h-5 w-5 mx-auto" /> <span className="text-xs">Menu</span>
          </NavLink>
          <NavLink to="/order-history" className={({ isActive }) => navLinkClass(isActive) + ' flex-col h-16 justify-center'}>
            <History className="h-5 w-5 mx-auto" /> <span className="text-xs">Orders</span>
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => navLinkClass(isActive) + ' flex-col h-16 justify-center'}>
            <UserCog className="h-5 w-5 mx-auto" /> <span className="text-xs">Admin</span>
          </NavLink>
           {/* Example of a user profile link if needed 
           <NavLink to="/profile" className={({ isActive }) => navLinkClass(isActive) + ' flex-col h-16 justify-center'}>
            <UserCircle className="h-5 w-5 mx-auto" /> <span className="text-xs">Profile</span>
          </NavLink> 
          */}
      </div>
    </nav>
  );
};

export default Navbar; 