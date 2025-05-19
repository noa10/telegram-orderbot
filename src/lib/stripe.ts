import { loadStripe } from '@stripe/stripe-js';

// Stripe configuration
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

if (!stripePublishableKey) {
  console.error('Missing Stripe publishable key');
}

// Create Stripe Promise for use with Elements
export const stripePromise = loadStripe(stripePublishableKey);

// Function to create a payment intent
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Function to handle payment confirmation
export const confirmPayment = async (
  stripe: any,
  elements: any,
  clientSecret: string,
  paymentMethodData?: any
) => {
  try {
    const result = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location.origin + '/payment-completed',
        payment_method_data: paymentMethodData,
      },
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};