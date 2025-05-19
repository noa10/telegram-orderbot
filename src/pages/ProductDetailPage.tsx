import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from '@/components/ui/separator';
import { AddonOption, AddonType, Product } from '../types'; // Make sure Product is imported
import { toast } from 'sonner'; // Import toast

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { getProductById, isLoading: isLoadingProducts } = useProducts();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | undefined>(undefined); // Explicitly type product state
  const [selectedAddons, setSelectedAddons] = useState<Record<string, string | string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [itemAdded, setItemAdded] = useState(false); // New state for post-add-to-cart UI

  useEffect(() => {
    if (productId) {
      const foundProduct = getProductById(productId);
      if (foundProduct) {
        setProduct(foundProduct);
        // Initialize default selected addons
        const defaults: Record<string, string | string[]> = {};
        foundProduct.addons?.forEach(addonType => {
          if (addonType.isRequired) {
            if (addonType.multipleSelection) {
              // For multiple selection, find all default options
              const defaultOptions = addonType.options.filter(opt => opt.isDefault).map(opt => opt.id);
              if (defaultOptions.length > 0) defaults[addonType.id] = defaultOptions;
              // else, it starts empty or with first if explicitly needed
            } else {
              // For single selection, find the first default option
              const defaultOption = addonType.options.find(opt => opt.isDefault) || addonType.options[0];
              if (defaultOption) defaults[addonType.id] = defaultOption.id;
            }
          }
        });
        setSelectedAddons(defaults);
      } else if (!isLoadingProducts) {
        // If product not found and products have loaded, maybe navigate to a 404 page or back
        // For now, just log and show not found
        console.warn(`Product with ID ${productId} not found.`);
      }
    }
  }, [productId, getProductById, isLoadingProducts]);

  const handleAddonSelection = (addonTypeId: string, optionId: string, isMultiSelect: boolean) => {
    setSelectedAddons(prev => {
      const newSelections = { ...prev };
      if (isMultiSelect) {
        const currentSelection = (newSelections[addonTypeId] as string[] | undefined) || [];
        if (currentSelection.includes(optionId)) {
          newSelections[addonTypeId] = currentSelection.filter(id => id !== optionId);
        } else {
          newSelections[addonTypeId] = [...currentSelection, optionId];
        }
        // if the array is empty, remove the key
        if ((newSelections[addonTypeId] as string[]).length === 0) {
          delete newSelections[addonTypeId];
        }
      } else {
        newSelections[addonTypeId] = optionId;
      }
      return newSelections;
    });
  };

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    let price = product.price;
    product.addons?.forEach(addonType => {
      const selection = selectedAddons[addonType.id];
      if (selection) {
        if (Array.isArray(selection)) {
          selection.forEach(optionId => {
            const option = addonType.options.find(opt => opt.id === optionId);
            if (option) price += option.additionalPrice;
          });
        } else {
          const option = addonType.options.find(opt => opt.id === selection);
          if (option) price += option.additionalPrice;
        }
      }
    });
    return price * quantity;
  }, [product, selectedAddons, quantity]);

  const handleAddToCart = () => {
    if (product) {
      // Basic validation for required addons (can be enhanced)
      let allRequiredSelected = true;
      product.addons?.forEach(addonType => {
        if (addonType.isRequired) {
          const selection = selectedAddons[addonType.id];
          if (!selection || (Array.isArray(selection) && selection.length === 0)) {
            allRequiredSelected = false;
            toast.error(`Missing selection for ${addonType.name}`, {
              description: `Please select an option for ${addonType.name}.`
            });
          }
        }
      });

      if (!allRequiredSelected) return;

      addToCart(product, quantity, selectedAddons);
      toast.success(`${product.name} added to cart!`, {
        description: `Quantity: ${quantity}`,
      });
      setItemAdded(true); // Show post-add-to-cart UI
      // navigate('/menu'); // Or to cart page: navigate('/cart'); // Removed immediate navigation
    }
  };

  if (isLoadingProducts) {
    return <div className="text-center py-10">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center py-10">Product not found. <Button onClick={() => navigate('/menu')} variant="link">Go to Menu</Button></div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <img src={product.imageUrl || '/placeholder.svg'} alt={product.name} className="w-full rounded-lg shadow-lg object-cover aspect-square" />
        </div>
        <div className="space-y-6">
          <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground text-lg">{product.description}</p>
          <p className="text-2xl font-semibold">Base Price: ${product.price.toFixed(2)}</p>
          
          <Separator />

          {product.addons && product.addons.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Customize Your Order</h2>
              {product.addons.map((addonType: AddonType) => (
                <div key={addonType.id} className="p-4 border rounded-md bg-background/50">
                  <h3 className="text-lg font-medium mb-2">{addonType.name} {addonType.isRequired && <span className="text-destructive text-sm">*</span>}</h3>
                  {addonType.multipleSelection ? (
                    <div className="space-y-2">
                      {addonType.options.map((option: AddonOption) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`${addonType.id}-${option.id}`}
                            checked={((selectedAddons[addonType.id] as string[]) || []).includes(option.id)}
                            onCheckedChange={() => handleAddonSelection(addonType.id, option.id, true)}
                          />
                          <Label htmlFor={`${addonType.id}-${option.id}`} className="flex-grow">
                            {option.name}
                          </Label>
                          {option.additionalPrice > 0 && (
                            <span className="text-sm text-muted-foreground">+${option.additionalPrice.toFixed(2)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <RadioGroup 
                      value={selectedAddons[addonType.id] as string || ''} 
                      onValueChange={(value) => handleAddonSelection(addonType.id, value, false)}
                    >
                      {addonType.options.map((option: AddonOption) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={`${addonType.id}-${option.id}`} />
                          <Label htmlFor={`${addonType.id}-${option.id}`} className="flex-grow">
                            {option.name}
                          </Label>
                           {option.additionalPrice > 0 && (
                            <span className="text-sm text-muted-foreground">+${option.additionalPrice.toFixed(2)}</span>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              ))}
            </div>
          )}

          <Separator />

          <div className="flex items-center gap-4">
            <Label htmlFor="quantity" className="text-lg">Quantity:</Label>
            <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
            <span className="text-xl font-semibold w-10 text-center">{quantity}</span>
            <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}>+</Button>
          </div>

          <div className="mt-6">
            {itemAdded ? (
              <div className="space-y-4 text-center">
                <p className="text-xl font-semibold text-green-600">Successfully added to cart!</p>
                <Button onClick={() => navigate('/cart')} size="lg" className="w-full">
                  View Cart / Checkout
                </Button>
                <Button onClick={() => { navigate('/menu'); setItemAdded(false); }} variant="outline" size="lg" className="w-full">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <>
            <p className="text-3xl font-bold mb-4">Total: ${currentPrice.toFixed(2)}</p>
                <Button onClick={handleAddToCart} size="lg" className="w-full" disabled={!product || !product.isAvailable}>
                  {product && product.isAvailable ? 'Add to Cart' : 'Currently Unavailable'}
            </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 