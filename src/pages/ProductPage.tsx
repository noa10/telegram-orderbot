import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
// import { useCart } from '../context/CartContext'; // Will be enabled later
import { Product } from '../types'; // Corrected path if types/index.ts is at src/types/index.ts
import { toast } from 'sonner'; // Use sonner toast directly

// Mock Product Data - Replace with API call
const mockProducts: Product[] = [
  {
    id: '1',
    productId: 'BKS', // From Menu.txt
    name: 'Beef Krapow Set',
    price: 15.90,
    category: 'Main',
    imageUrl: 'https://via.placeholder.com/400x300',
    description: 'Stir-fried minced beef with holy basil, served with rice and a fried egg. Comes with a choice of drink.',
    isAvailable: true,
    addons: [
      {
        id: 'addon_spice',
        name: 'Spicy Level',
        description: 'Choose your preferred spice level',
        isRequired: true,
        multipleSelection: false,
        options: [
          { id: 'spice_none', name: 'Non Spicy', additionalPrice: 0, isDefault: false },
          { id: 'spice_less', name: 'Less Spicy', additionalPrice: 0, isDefault: true },
          { id: 'spice_normal', name: 'Normal Spicy', additionalPrice: 0, isDefault: false },
          { id: 'spice_extra', name: 'Extra Spicy', additionalPrice: 0.50, isDefault: false },
        ],
      },
      {
        id: 'addon_basil',
        name: 'Basil Type',
        description: 'Select your type of basil',
        isRequired: false,
        multipleSelection: false,
        options: [
          { id: 'basil_holy', name: 'Thai Holy Basil', additionalPrice: 0, isDefault: true },
          { id: 'basil_thai', name: 'Thai Basil', additionalPrice: 0, isDefault: false },
          { id: 'basil_none', name: 'No Basil', additionalPrice: 0, isDefault: false },
        ],
      },
      {
        id: 'addon_drink',
        name: 'Choose Drink',
        description: 'Select one drink for your set',
        isRequired: true,
        multipleSelection: false,
        options: [
          { id: 'drink_kickapoo', name: 'Kickapoo', additionalPrice: 0, isDefault: true },
          { id: 'drink_wintermelon', name: 'Winter Melon', additionalPrice: 0, isDefault: false },
          { id: 'drink_soya', name: 'Soya Bean', additionalPrice: 0, isDefault: false },
          { id: 'drink_lemontea', name: 'Ice Lemon Tea', additionalPrice: 0, isDefault: false },
        ]
      }
    ]
  },
  // Add more mock products as needed based on Menu.txt
];

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  // const { addToCart } = useCart(); // Will be enabled later
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, string | string[]>>({});
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // Simulate API call
    const foundProduct = mockProducts.find(p => p.id === productId);
    if (foundProduct) {
      setProduct(foundProduct);
      // Initialize selected addons with default values
      const initialAddons: Record<string, string | string[]> = {};
      foundProduct.addons?.forEach(addon => {
        if (addon.isRequired || addon.options.some(opt => opt.isDefault)) {
          const defaultOption = addon.options.find(opt => opt.isDefault);
          if (addon.multipleSelection) {
            initialAddons[addon.id] = defaultOption ? [defaultOption.id] : [];
          } else {
            initialAddons[addon.id] = defaultOption ? defaultOption.id : addon.options[0]?.id || '';
          }
        }
      });
      setSelectedAddons(initialAddons);
    } else {
      // Handle product not found, e.g., redirect or show error
      console.error('Product not found');
      toast.error("Product not found", {
        description: "The product you are looking for does not exist.",
      });
    }
  }, [productId]);

  useEffect(() => {
    if (product) {
      let currentPrice = product.price;
      product.addons?.forEach(addon => {
        const selection = selectedAddons[addon.id];
        if (selection) {
          if (Array.isArray(selection)) {
            selection.forEach(selId => {
              const option = addon.options.find(opt => opt.id === selId);
              if (option) currentPrice += option.additionalPrice;
            });
          } else {
            const option = addon.options.find(opt => opt.id === selection);
            if (option) currentPrice += option.additionalPrice;
          }
        }
      });
      setTotalPrice(currentPrice * quantity);
    }
  }, [product, selectedAddons, quantity]);

  const handleAddonSelection = (addonId: string, optionId: string, isMultiple: boolean) => {
    setSelectedAddons(prev => {
      const newAddons = { ...prev };
      if (isMultiple) {
        const currentSelection = (newAddons[addonId] as string[] | undefined) || [];
        if (currentSelection.includes(optionId)) {
          newAddons[addonId] = currentSelection.filter(id => id !== optionId);
        } else {
          newAddons[addonId] = [...currentSelection, optionId];
        }
      } else {
        newAddons[addonId] = optionId;
      }
      return newAddons;
    });
  };

  const handleAddToCart = () => {
    if (product) {
      // Validation for required addons
      for (const addon of product.addons || []) {
        if (addon.isRequired && (!selectedAddons[addon.id] || (Array.isArray(selectedAddons[addon.id]) && (selectedAddons[addon.id] as string[]).length === 0))) {
          toast.error(`Missing selection for ${addon.name}`, {
            description: `Please select an option for ${addon.name}.`,
          });
          return;
        }
      }
      // const cartItem = { ...product, quantity, selectedAddons, unitPrice: totalPrice / quantity }; // Adapt to CartItem structure
      // addToCart(cartItem); // Will be enabled later
      toast.success(`Added ${product.name} to cart!`, {
        description: `${product.name} (x${quantity}) has been added to your cart.`,
      });
      console.log('Added to cart:', { name: product.name, quantity, selectedAddons, totalPrice });
    }
  };

  if (!product) {
    return (
      <div className="text-center py-10">
        <p className="mb-4">Loading product details or product not found.</p>
        <Button asChild>
          <Link to="/">Go Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-x-8 gap-y-12">
      <div>
        <img src={product.imageUrl || 'https://via.placeholder.com/400x300'} alt={product.name} className="w-full h-auto rounded-lg shadow-lg object-cover aspect-[4/3]" />
      </div>
      <div className="space-y-6">
        <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
        {product.description && <p className="text-muted-foreground text-lg">{product.description}</p>}
        <p className="text-3xl font-semibold text-primary">${totalPrice.toFixed(2)}</p>

        {product.addons?.map(addon => (
          <div key={addon.id} className="border-t pt-6 mt-6">
            <h3 className="text-xl font-semibold mb-3">{addon.name} {addon.isRequired && <span className="text-destructive text-sm">*Required</span>}</h3>
            {addon.description && <p className="text-sm text-muted-foreground mb-3">{addon.description}</p>}
            {addon.multipleSelection ? (
              <div className="space-y-3">
                {addon.options.map(option => (
                  <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Checkbox 
                      id={`${addon.id}-${option.id}`}
                      checked={(selectedAddons[addon.id] as string[] | undefined)?.includes(option.id)}
                      onCheckedChange={() => handleAddonSelection(addon.id, option.id, true)}
                      className="h-5 w-5"
                    />
                    <Label htmlFor={`${addon.id}-${option.id}`} className="flex-grow text-base cursor-pointer">
                      {option.name}
                      {option.additionalPrice > 0 && 
                        <span className="text-sm text-muted-foreground ml-2">(+${option.additionalPrice.toFixed(2)})</span>}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup 
                value={selectedAddons[addon.id] as string | undefined}
                onValueChange={(value) => handleAddonSelection(addon.id, value, false)}
                required={addon.isRequired}
                className="space-y-3"
              >
                {addon.options.map(option => (
                  <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                    <RadioGroupItem value={option.id} id={`${addon.id}-${option.id}`} className="h-5 w-5"/>
                    <Label htmlFor={`${addon.id}-${option.id}`} className="flex-grow text-base cursor-pointer">
                      {option.name}
                      {option.additionalPrice > 0 && 
                        <span className="text-sm text-muted-foreground ml-2">(+${option.additionalPrice.toFixed(2)})</span>}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        ))}

        <div className="flex items-center space-x-4 pt-6 mt-6 border-t">
          <Label htmlFor="quantity" className="text-lg font-semibold">Quantity:</Label>
          <Input 
            type="number" 
            id="quantity" 
            value={quantity} 
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))} 
            min="1" 
            className="w-24 h-10 text-center text-lg"
          />
        </div>

        <Button size="lg" className="w-full text-lg py-6 mt-4" onClick={handleAddToCart}>
          Add to Cart - ${totalPrice.toFixed(2)}
        </Button>
      </div>
    </div>
  );
};

export default ProductPage; 