import React, { ReactNode } from 'react';
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
  
  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeader && (
        <Header 
          title={title} 
          showBackButton={showBackButton} 
          showCartButton={showCartButton} 
        />
      )}
      
      <main className="flex-1 container py-4">
        {children}
      </main>
      
      {!hideFooter && <Footer />}
      
      {!hideNavigation && !isAdminRoute && <Navigation />}
    </div>
  );
};

export default Layout;