import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ShoppingBag, Home, ArrowLeft } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { useProducts } from '../context/ProductContext';
import { useOrders } from '../context/OrderContext';
import { Order } from '../types';
import { getOrderByIdProxy } from '../api/orderProxy';

// Component to display the status badge
const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
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

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // We still need getProductById from the products context
  const { getProductById } = useProducts();
  
  // Function to fetch an order by ID
  const fetchOrderById = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: apiError } = await getOrderByIdProxy(id);
      
      if (apiError) {
        throw apiError;
      }
      
      if (data) {
        setOrder(data);
      } else {
        setError("Order not found");
      }
    } catch (err: any) {
      console.error(`Error fetching order ${id} via proxy:`, err);
      setError(err.message || "Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="mb-4">{error}</p>
        <Button asChild>
          <Link to="/order-history">Back to Order History</Link>
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="mb-4">We couldn't find the order you're looking for.</p>
        <Button asChild>
          <Link to="/order-history">Back to Order History</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-2">
          Your order has been received and is being processed.
        </p>
        <p className="text-sm text-muted-foreground">
          Order ID: {order.id}
        </p>
        <div className="mt-4">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b">
              <div className="flex items-center gap-2">
                <div className="font-medium">{item.quantity}x</div>
                <div>
                  <div className="font-medium">{item.name}</div>
                  {Object.keys(item.selectedAddons || {}).length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {Object.entries(item.selectedAddons || {}).map(([addonType, selection]) => {
                        const product = getProductById(item.productId);
                        if (!product || !product.addons) return null;
                        
                        const addonTypeObj = product.addons.find(a => a.id === addonType);
                        if (!addonTypeObj) return null;
                        
                        let selectionText = '';
                        if (Array.isArray(selection)) {
                          selectionText = selection.map(optId => {
                            const option = addonTypeObj.options.find(o => o.id === optId);
                            return option ? option.name : optId;
                          }).filter(Boolean).join(', ');
                        } else {
                          const option = addonTypeObj.options.find(o => o.id === selection);
                          selectionText = option ? option.name : String(selection);
                        }
                        
                        if (addonTypeObj.name && selectionText) {
                          return (
                            <span key={addonType}>
                              {addonTypeObj.name}: {selectionText}
                            </span>
                          );
                        }
                        return null;
                      }).filter(Boolean).join(' | ')}
                    </div>
                  )}
                </div>
              </div>
              <div className="font-medium">{formatPrice(item.totalPrice)}</div>
            </div>
          ))}
          
          <div className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>{formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to="/home">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to="/order-history">
            <ShoppingBag className="h-4 w-4 mr-2" />
            View Order History
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage; 