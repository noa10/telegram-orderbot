import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { CartItem, Product, AddonType, AddonOption } from '../types'; // Assuming CartItem and Product types are defined
import { toast } from 'sonner';

// Define the shape of the cart context data
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, selectedAddons?: Record<string, string | string[]>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  getItemById: (itemId: string) => CartItem | undefined;
  totalItems: number; // Total number of unique items in the cart
  totalQuantity: number; // Total number of all pieces in the cart
  subtotal: number;
  tax: number; // Calculated tax amount
  deliveryFee: number; // Fixed or calculated delivery fee
  total: number; // Grand total: subtotal + tax + deliveryFee
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.07; // Example: 7% tax rate
const DELIVERY_FEE = 5.00; // Example: $5 fixed delivery fee

// Helper to generate a unique ID for a cart item based on product ID and addons
const generateCartItemId = (productId: string, addons?: Record<string, string | string[]>): string => {
  if (!addons || Object.keys(addons).length === 0) return productId;
  // Simple string representation for addons for ID generation
  const addonString = Object.entries(addons)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${Array.isArray(value) ? value.join(',') : value}`)
    .join('|');
  return `${productId}-${addonString}`;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const localData = localStorage.getItem('cartItems');
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items));
  }, [items]);

  const calculateUnitPriceWithAddons = (product: Product, selectedAddons: Record<string, string | string[]> = {}): number => {
    let currentPrice = product.price;
    if (product.addons && Object.keys(selectedAddons).length > 0) {
      for (const addonTypeId in selectedAddons) {
        const productAddonType = product.addons.find(at => at.id === addonTypeId);
        if (productAddonType) {
          const selectedOptionIdOrIds = selectedAddons[addonTypeId];
          if (Array.isArray(selectedOptionIdOrIds)) {
            // Handle multiple selections for an addon type (e.g., extra toppings)
            selectedOptionIdOrIds.forEach(optionId => {
              const option = productAddonType.options.find(opt => opt.id === optionId);
              if (option && option.additionalPrice) {
                currentPrice += option.additionalPrice;
              }
            });
          } else {
            // Handle single selection
            const option = productAddonType.options.find(opt => opt.id === selectedOptionIdOrIds);
            if (option && option.additionalPrice) {
              currentPrice += option.additionalPrice;
            }
          }
        }
      }
    }
    return currentPrice;
  };

  const addToCart = (product: Product, quantity: number, selectedAddons: Record<string, string | string[]> = {}) => {
    const unitPrice = calculateUnitPriceWithAddons(product, selectedAddons);
    const cartItemId = generateCartItemId(product.id, selectedAddons);

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === cartItemId);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity, totalPrice: (item.quantity + quantity) * unitPrice }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
          imageUrl: product.imageUrl,
          selectedAddons,
        };
        return [...prevItems, newItem];
      }
    });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast.info("Item removed from cart.");
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
          : item
      ).filter(item => item.quantity > 0) // Remove item if quantity becomes 0 or less
    );
    toast.info("Cart updated.");
  };

  const clearCart = () => {
    setItems([]);
    toast.info("Cart cleared.");
  };

  const getItemById = (itemId: string): CartItem | undefined => {
    return items.find(item => item.id === itemId);
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [items]);

  const tax = useMemo(() => {
    return subtotal * TAX_RATE;
  }, [subtotal]);

  const deliveryFee = useMemo(() => {
    // Delivery fee could be conditional (e.g., free over certain subtotal)
    return items.length > 0 ? DELIVERY_FEE : 0;
  }, [items, subtotal]); // Added subtotal in case logic changes based on it

  const total = useMemo(() => {
    return subtotal + tax + deliveryFee;
  }, [subtotal, tax, deliveryFee]);

  const totalItems = useMemo(() => items.length, [items]);
  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemById,
        totalItems,
        totalQuantity,
        subtotal,
        tax,
        deliveryFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};