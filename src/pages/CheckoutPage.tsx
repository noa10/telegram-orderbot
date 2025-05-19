import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { formatPrice } from '../lib/utils';
import { createOrderProxy } from '../api/orderProxy';
import { toast } from 'sonner';

const CheckoutPage: React.FC = () => {
  const { items: cart, clearCart, subtotal, tax, deliveryFee, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!user || !user.id) {
      setError('User not authenticated. Please login.');
      return;
    }
    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare order data
      const orderData = {
        subtotal,
        tax,
        deliveryFee,
        total,
        status: 'pending' as const,
        customerName: `${user.first_name} ${user.last_name || ''}`.trim(),
      };

      // Prepare order items data
      const orderItems = cart.map(item => ({
        product_id: item.productId,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        item_total_price: item.totalPrice,
        image_url: item.imageUrl,
        selected_addons: item.selectedAddons,
      }));

      // Create order using proxy function instead of OrderContext
      const { data: newOrder, error: proxyError } = await createOrderProxy(
        String(user.id), 
        orderData, 
        orderItems
      );
      
      if (proxyError) {
        throw proxyError;
      }
      
      if (newOrder) {
        toast.success('Order placed successfully!');
        
        // Clear cart after successful order creation
        clearCart();
        
        // Navigate to order confirmation page
        navigate(`/order-confirmation/${newOrder.id}`);
      } else {
        throw new Error('Failed to create order.');
      }
    } catch (err: any) {
      console.error('Order placement failed:', err);
      toast.error('Order placement failed');
      setError(`Order placement failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center p-4">Loading user information or please login...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
      
      {cart.length === 0 && !isLoading ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Button onClick={() => navigate('/menu')}>Continue Shopping</Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2">
                  <div className="flex gap-2">
                    <span className="font-medium">{item.quantity}x</span>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {Object.keys(item.selectedAddons || {}).length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {Object.entries(item.selectedAddons || {})
                            .map(([key, value]) => {
                              if (Array.isArray(value)) {
                                return `${key}: ${value.join(', ')}`;
                              }
                              return `${key}: ${value}`;
                            })
                            .join(' | ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <p>{formatPrice(item.totalPrice)}</p>
                </div>
              ))}
            </div>
            <hr className="my-4" />
            <div className="space-y-1">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Subtotal</p>
                <p>{formatPrice(subtotal)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Tax</p>
                <p>{formatPrice(tax)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Delivery Fee</p>
                <p>{formatPrice(deliveryFee)}</p>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>{formatPrice(total)}</p>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-3">
            {/* Future: Add Delivery Address Form, Payment Options */}
            <p className="text-sm text-muted-foreground text-center">
              User: {user.first_name} (ID: {user.id})
            </p>
            <Button 
              onClick={handlePlaceOrder} 
              disabled={isLoading || cart.length === 0}
              size="lg"
            >
              {isLoading ? 'Placing Order...' : 'Place Order'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/cart')} disabled={isLoading}>
              Back to Cart
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CheckoutPage; 