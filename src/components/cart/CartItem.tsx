import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types/cart'; // Assuming you have a type definition for CartItem

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      onUpdateQuantity(item.product.id, newQuantity);
    }
  };

  const incrementQuantity = () => {
    onUpdateQuantity(item.product.id, item.quantity + 1);
  };

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.product.id, item.quantity - 1);
    } else if (item.quantity === 1) {
      // Optionally, you might want to confirm before removing or just set to 0
      onRemoveItem(item.product.id);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        <img src={item.product.imageUrl || '/placeholder.svg'} alt={item.product.name} className="w-16 h-16 object-cover rounded-md mr-4" />
        <div>
          <h3 className="font-semibold">{item.product.name}</h3>
          <p className="text-sm text-muted-foreground">
            {/* Display selected addons if any */}
            {item.addons && item.addons.length > 0 && (
              item.addons.map(addon => `${addon.addonTypeName}: ${addon.addonOptionName}`).join(', ')
            )}
          </p>
          <p className="text-sm font-medium">SGD {item.unitPrice.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center">
        <Button variant="outline" size="icon" onClick={decrementQuantity} className="h-8 w-8">
          -
        </Button>
        <Input
          type="number"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="w-12 h-8 text-center mx-2"
          min="0"
        />
        <Button variant="outline" size="icon" onClick={incrementQuantity} className="h-8 w-8">
          +
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.product.id)} className="ml-4 text-red-500 hover:text-red-700">
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
      <div>
        <p className="font-semibold">SGD {(item.unitPrice * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default CartItem; 