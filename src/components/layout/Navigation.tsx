import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const Navigation = () => {
  const { user, isAdmin } = useAuth();

  return (
    <nav className="sticky bottom-0 z-10 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center flex-1 pt-1 pb-1",
              isActive ? "text-primary" : "text-muted-foreground"
            )
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span className="text-xs mt-1">Home</span>
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center flex-1 pt-1 pb-1",
              isActive ? "text-primary" : "text-muted-foreground"
            )
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart">
            <circle cx="8" cy="21" r="1"/>
            <circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
          <span className="text-xs mt-1">Cart</span>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center flex-1 pt-1 pb-1",
              isActive ? "text-primary" : "text-muted-foreground"
            )
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list">
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <path d="M12 11h4"/>
            <path d="M12 16h4"/>
            <path d="M8 11h.01"/>
            <path d="M8 16h.01"/>
          </svg>
          <span className="text-xs mt-1">Orders</span>
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center flex-1 pt-1 pb-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span className="text-xs mt-1">Admin</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navigation;