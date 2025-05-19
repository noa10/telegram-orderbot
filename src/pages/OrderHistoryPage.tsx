import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { getUserOrdersProxy } from '../api/orderProxy';
import { Order } from '../types';

// Status badge component
const OrderStatusBadge = ({ status }: { status: string }) => {
  let color = "";
  
  switch (status) {
    case 'pending':
      color = "bg-yellow-100 text-yellow-800";
      break;
    case 'confirmed':
      color = "bg-blue-100 text-blue-800";
      break;
    case 'preparing':
      color = "bg-purple-100 text-purple-800";
      break;
    case 'ready':
      color = "bg-green-100 text-green-800";
      break;
    case 'delivered':
      color = "bg-gray-100 text-gray-800";
      break;
    case 'cancelled':
      color = "bg-red-100 text-red-800";
      break;
    default:
      color = "bg-gray-100 text-gray-800";
  }
  
  return (
    <Badge className={`${color} rounded-full px-3 py-1`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const OrderHistoryPage: React.FC = () => {
  // Add local state for orders, loading, and error
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Still use the context for other functionality if needed
  const { getUserOrders } = useOrders();
  const { user, isLoading: isLoadingAuth } = useAuth();

  // Create a function to fetch orders using the proxy
  const fetchOrders = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: apiError } = await getUserOrdersProxy(String(user.id));
      
      if (apiError) {
        throw apiError;
      }
      
      if (data) {
        setOrders(data);
      }
    } catch (err: any) {
      console.error("Error fetching orders via proxy:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoadingAuth && user?.id) {
      fetchOrders();
    }
  }, [user?.id, isLoadingAuth]);

  if (isLoadingAuth) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading authentication information...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
        <p className="mb-4">Please log in to view your order history.</p>
        <Button asChild>
          <Link to="/home">Go to Home</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading your order history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="mb-4">{error}</p>
        <Button onClick={fetchOrders}>Try Again</Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>No Orders Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link to="/menu">Explore Menu</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-lg">
                    Order #{order.id.substring(0, 8)}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p>Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                  <p className="font-bold">{formatPrice(order.total)}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="text-muted-foreground">{item.quantity}x</span>
                      <span className="font-medium truncate flex-1">{item.name}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{order.items.length - 3} more items
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 p-4 flex justify-end">
              <Button asChild size="sm" variant="outline">
                <Link to={`/order-confirmation/${order.id}`}>
                  <span>View Details</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrderHistoryPage; 