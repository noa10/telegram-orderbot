import React, { ReactNode, useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Navigation from './Navigation';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideNavigation?: boolean;
  showBackButton?: boolean;
  showCartButton?: boolean;
}

const Layout = ({
  children,
  title,
  hideHeader = false,
  hideFooter = false,
  hideNavigation = false,
  showBackButton = true,
  showCartButton = true
}: LayoutProps) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Check if screen is mobile size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeader && (
        <Header
          title={title}
          showBackButton={showBackButton}
          showCartButton={showCartButton}
        />
      )}

      <main className={`flex-1 container py-4 ${(!hideNavigation || (hideNavigation && isMobile)) && !isAdminRoute ? 'pb-20' : ''}`}>
        {children}
      </main>

      {!hideFooter && <Footer />}

      {/* Show navigation on mobile even if hideNavigation is true */}
      {(!hideNavigation || (hideNavigation && isMobile)) && !isAdminRoute && <Navigation />}
    </div>
  );
};

export default Layout;