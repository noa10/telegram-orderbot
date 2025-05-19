import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';
// import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'; // Stripe components
import { Separator } from '@/components/ui/separator';

const CheckoutPage: React.FC = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  // const stripe = useStripe();
  // const elements = useElements();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!cart || cart.items.length === 0) {
    navigate('/'); // Redirect to home if cart is empty
    return null;
  }

  const subtotal = getCartTotal();
  const deliveryFee = 5.00; // Example fee
  const taxRate = 0.07; // Example tax rate
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + deliveryFee + taxAmount;

  const handleSubmitOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsProcessing(true);
    setError(null);

    // Basic validation
    if (!deliveryAddress || !name || !phone) {
        setError('Please fill in all required delivery fields.');
        setIsProcessing(false);
        return;
    }

    // Stripe payment processing would happen here
    // For now, we'll simulate a successful payment and navigation
    console.log('Order submitted:', {
      name,
      phone,
      deliveryAddress,
      deliveryInstructions,
      items: cart.items,
      total: totalAmount.toFixed(2),
    });

    // Simulate API call
    try {
        // const cardElement = elements?.getElement(CardElement);
        // if (!stripe || !cardElement) {
        //     setError("Stripe has not loaded yet. Please try again.");
        //     setIsProcessing(false);
        //     return;
        // }

        // const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        //     type: 'card',
        //     card: cardElement,
        //     billing_details: { name: name, phone: phone, address: { line1: deliveryAddress } }
        // });

        // if (stripeError) {
        //     setError(stripeError.message || 'An error occurred during payment.');
        //     setIsProcessing(false);
        //     return;
        // }

        // // Send paymentMethod.id and order details to your backend to create a PaymentIntent and confirm it
        // const response = await fetch('/api/orders/create', { // Replace with your actual API endpoint
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         paymentMethodId: paymentMethod.id,
        //         items: cart.items,
        //         amount: Math.round(totalAmount * 100), // Amount in cents
        //         currency: 'sgd',
        //         deliveryAddress,
        //         deliveryInstructions,
        //         customerName: name,
        //         customerPhone: phone,
        //     }),
        // });

        // const orderResult = await response.json();

        // if (!response.ok || orderResult.error) {
        //     setError(orderResult.error || 'Failed to process order.');
        //     setIsProcessing(false);
        //     return;
        // }

        // // If payment is successful and order created
        clearCart();
        // navigate(`/payment-completed?orderId=${orderResult.orderId}`); // Pass orderId or relevant info
        navigate('/payment-completed'); // Simplified for now

    } catch (err) {
        console.error('Checkout error:', err);
        setError('An unexpected error occurred. Please try again.');
        setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
      
      <form onSubmit={handleSubmitOrder} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Delivery Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Full Name" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your Phone Number" required />
            </div>
            <div>
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Input id="deliveryAddress" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Full Delivery Address" required />
            </div>
            <div>
              <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
              <Input id="deliveryInstructions" value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)} placeholder="e.g., Leave at door" />
            </div>
          </div>
        </div>

        <Separator />

        <div>
            <h2 className="text-xl font-semibold mb-3">Payment Details</h2>
            {/* Stripe CardElement would go here */}
            <div className="p-4 border rounded-md bg-gray-50">
                <p className="text-sm text-muted-foreground">Stripe payment form will be here.</p>
                {/* <CardElement options={{ style: { base: { fontSize: '16px' } } }} /> */}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <Separator />

        <div>
          <h2 className="text-xl font-semibold mb-3">Order Summary</h2>
          <div className="space-y-1 text-sm">
            {cart.items.map(item => (
              <div key={item.product.id} className="flex justify-between">
                <span>{item.product.name} x {item.quantity}</span>
                <span>SGD {(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <Separator className="my-2" />
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
              <span>Total Amount</span>
              <span>SGD {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full text-lg py-3" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : `Pay SGD ${totalAmount.toFixed(2)}`}
        </Button>
      </form>
    </div>
  );
};

export default CheckoutPage; 