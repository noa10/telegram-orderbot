import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home } from 'lucide-react';
import Layout from '../components/layout/Layout';

const AccessDeniedPage: React.FC = () => {
  return (
    <Layout title="Access Denied" hideNavigation={false}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-red-100 p-3 rounded-full mb-6">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        
        <p className="text-muted-foreground mb-6 max-w-md">
          You don't have permission to access this page. If you believe this is an error, please contact support.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild variant="default">
            <Link to="/home">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AccessDeniedPage;
