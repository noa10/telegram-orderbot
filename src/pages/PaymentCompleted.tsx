import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const PaymentCompletedPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('orderId'); // Example: to display an order ID if passed

  return (
    <div className="container mx-auto p-4 text-center flex flex-col items-center justify-center min-h-[70vh]">
      <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-muted-foreground mb-2">
        Thank you for your order. Your food is being prepared.
      </p>
      {orderId && (
        <p className="text-muted-foreground mb-6">
          Your Order ID is: <span className="font-semibold">{orderId}</span>
        </p>
      )}
      {!orderId && (
         <p className="text-muted-foreground mb-6">
          You can track your order status in the 'Order History' section.
        </p>
      )}
      <div className="flex space-x-4 mt-6">
        <Link to="/">
          <Button>Continue Shopping</Button>
        </Link>
        <Link to="/order-history"> {/* Assuming an order history page route */}
          <Button variant="outline">View Order History</Button>
        </Link>
      </div>
    </div>
  );
};

export default PaymentCompletedPage; 