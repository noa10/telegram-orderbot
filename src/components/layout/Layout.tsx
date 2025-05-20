import React, { ReactNode } from 'react';
import Footer from './Footer';
import UnifiedNav from './UnifiedNav'; // Import UnifiedNav
// Removed Header and Navigation imports
// Removed useLocation as isAdminRoute logic tied to Navigation is removed

interface LayoutProps {
  children: ReactNode;
  title?: string; // title might be used by UnifiedNav or passed differently if needed
  hideHeader?: boolean; // This can now conceptually mean "hide UnifiedNav"
  hideFooter?: boolean;
  // hideNavigation is no longer needed as UnifiedNav handles both
  showBackButton?: boolean; // These props were for Header, UnifiedNav might need them
  showCartButton?: boolean; // These props were for Header, UnifiedNav might need them
}

const Layout = ({
  children,
  title, // Pass title to UnifiedNav if it's designed to use it
  hideHeader = false, // If true, UnifiedNav won't be shown
  hideFooter = false,
  // showBackButton and showCartButton props are not directly used by UnifiedNav yet
  // but could be passed if UnifiedNav is adapted to use them.
  // For now, UnifiedNav handles its own buttons.
}: LayoutProps) => {
  // const location = useLocation();
  // const isAdminRoute = location.pathname.startsWith('/admin'); // No longer needed here

  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeader && <UnifiedNav />} {/* Render UnifiedNav if not hidden */}
      
      <main className="flex-1 container py-4 pb-20 md:pb-4"> {/* Adjusted padding for potential bottom nav */}
        {children}
      </main>
      
      {!hideFooter && <Footer />}
      
      {/* Navigation is now part of UnifiedNav, so no separate component here */}
      {/* {!hideNavigation && !isAdminRoute && <Navigation />} */}
    </div>
  );
};

export default Layout;