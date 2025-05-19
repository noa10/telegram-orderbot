import React from 'react';
import CartItem from '@/components/cart/CartItem';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart'; // Assuming a custom hook for cart management
import { Link } from 'react-router-dom'; // Assuming you are using react-router-dom for navigation
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const CartPage: React.FC = () => {
  const { cart, updateItemQuantity, removeItemFromCart, getCartTotal, clearCart } = useCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const subtotal = getCartTotal();
  // These would typically come from a configuration or backend API
  const deliveryFee = 5.00; 
  const taxRate = 0.07; // 7% GST
  const taxAmount = subtotal * taxRate;
  const total = subtotal + deliveryFee + taxAmount;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ScrollArea className="md:col-span-2 border rounded-lg">
          <div className="p-1">
            {cart.items.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onUpdateQuantity={updateItemQuantity}
                onRemoveItem={removeItemFromCart}
              />
            ))}
          </div>
        </ScrollArea>

        <div className="md:col-span-1 p-6 bg-secondary rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>SGD {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>SGD {deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
              <span>SGD {taxAmount.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>SGD {total.toFixed(2)}</span>
            </div>
          </div>
          <Link to="/checkout" className="w-full">
            <Button className="w-full mt-6">Proceed to Checkout</Button>
          </Link>
          <Button variant="outline" className="w-full mt-2" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 