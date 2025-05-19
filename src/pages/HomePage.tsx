import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Welcome to FoodOrder!</h1>
      <p className="text-xl text-muted-foreground">
        Your favorite meals, delivered fast.
      </p>
      <div className="space-x-4">
        <Button asChild size="lg">
          <Link to="/menu">View Menu</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/order-history">Your Orders</Link>
        </Button>
      </div>
       {/* You can add featured items or promotions here */}
    </div>
  );
};

export default HomePage; 