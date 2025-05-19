import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Food App. All rights reserved.</p>
        <p className="text-sm mt-1">
          Powered by Telegram Mini Apps & Shadcn UI
        </p>
      </div>
    </footer>
  );
};

export default Footer;