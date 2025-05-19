import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
      <AlertTriangle className="w-24 h-24 text-destructive mb-6" />
      <h1 className="text-4xl font-bold mb-3">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Oops! The page you are looking for does not exist or may have been moved.
      </p>
      <Button asChild size="lg">
        <Link to="/">Go Back to Homepage</Link>
      </Button>
    </div>
  );
};

export default NotFoundPage; 