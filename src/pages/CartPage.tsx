import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, PlusCircle, MinusCircle } from 'lucide-react'; // Icons
import { CartItem as CartItemType, Product, AddonType, AddonOption } from '../types';

// Type guard to check if product has addons
interface ProductWithAddons extends Product {
  addons: AddonType[]; // Ensures addons is not undefined and is an array
}

function productHasAddons(product: Product | undefined): product is ProductWithAddons {
  return !!product && !!product.addons && Array.isArray(product.addons) && product.addons.length > 0;
}

const CartPage: React.FC = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    tax,
    deliveryFee,
    total,
    totalQuantity
  } = useCart();
  const { getProductById } = useProducts();
  const navigate = useNavigate();

  const getAddonDetails = (productId: string, selectedAddons: Record<string, string | string[]>): string => {
    const product = getProductById(productId);

    if (!product) {
        return Object.keys(selectedAddons).length > 0 ? 'Product details unavailable' : '';
    }
    
    if (!productHasAddons(product)) {
        return Object.keys(selectedAddons).length > 0 ? 'Addon definitions missing for this product' : '';
    }

    // Now we're sure product has addons
    const addonDetails = Object.entries(selectedAddons)
      .map(([addonTypeId, optionIdOrIds]) => {
        // Find the addon type by its ID
        const addonType = product.addons.find(addon => addon.id === addonTypeId);
        if (!addonType) return null;

        // Format based on whether it's a single selection or multiple selection
        if (Array.isArray(optionIdOrIds)) {
          // Multiple selected options
          const selectedOptions = optionIdOrIds
            .map(optionId => {
              const option = addonType.options.find(opt => opt.id === optionId);
              return option ? 
                `${option.name}${option.additionalPrice > 0 ? ` (+$${option.additionalPrice.toFixed(2)})` : ''}` : 
                null;
            })
            .filter(Boolean);
          
          return selectedOptions.length > 0 ? 
            `${addonType.name}: ${selectedOptions.join(', ')}` : 
            null;
        } else {
          // Single selected option
          const option = addonType.options.find(opt => opt.id === optionIdOrIds);
          return option ? 
            `${addonType.name}: ${option.name}${option.additionalPrice > 0 ? ` (+$${option.additionalPrice.toFixed(2)})` : ''}` : 
            null;
        }
      })
      .filter(Boolean)
      .join('; ');
    
    return addonDetails || '';
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button onClick={() => navigate('/menu')}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item: CartItemType) => (
            <Card key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4">
              <img 
                src={item.imageUrl || '/placeholder.svg'} 
                alt={item.name} 
                className="w-full sm:w-24 h-24 object-cover rounded-md aspect-square"
              />
              <div className="flex-grow">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                {Object.keys(item.selectedAddons).length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Addons: {getAddonDetails(item.productId, item.selectedAddons)}
                  </p>
                )}
                <p className="text-sm">Unit Price: ${item.unitPrice.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}><MinusCircle className="h-4 w-4" /></Button>
                <span className="font-medium w-8 text-center">{item.quantity}</span>
                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}><PlusCircle className="h-4 w-4" /></Button>
              </div>
              <div className="text-right sm:min-w-[100px] mt-2 sm:mt-0">
                <p className="font-semibold text-lg">${item.totalPrice.toFixed(2)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-destructive hover:text-destructive/80 ml-auto sm:ml-2">
                <Trash2 className="h-5 w-5" />
              </Button>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal ({totalQuantity} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (${(TAX_RATE * 100).toFixed(0)}%)</span> 
                {/* Assuming TAX_RATE is accessible or hardcode again for display */}
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" onClick={() => navigate('/checkout')} disabled={items.length === 0}>
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="w-full" onClick={clearCart} disabled={items.length === 0}>
                Clear Cart
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Added for clarity in CartPage if CartContext itself does not export these constants.
// However, these are defined in CartContext.tsx. This might be redundant or could be imported.
const TAX_RATE = 0.07; 
// const DELIVERY_FEE = 5.00; // Already handled by useCart() values

export default CartPage; 