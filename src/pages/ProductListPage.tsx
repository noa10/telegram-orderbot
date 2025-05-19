import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, AddonOption, AddonType } from '../types';

// Helper function to get default addon selections for a product
const getDefaultAddons = (product: Product): Record<string, string> => {
  const defaultSelections: Record<string, string> = {};
  if (product.addons) {
    product.addons.forEach((addonType: AddonType) => {
      if (addonType.isRequired && !addonType.multipleSelection) {
        const defaultOption = addonType.options.find((opt: AddonOption) => opt.isDefault);
        if (defaultOption) {
          defaultSelections[addonType.id] = defaultOption.id;
        } else if (addonType.options.length > 0) {
          // Fallback to the first option if no default is specified but isRequired
          defaultSelections[addonType.id] = addonType.options[0].id;
        }
      }
      // Note: This doesn't handle multipleSelection defaults or non-required addons proactively.
      // For multiple selection, the cart usually starts with none selected or specific defaults.
    });
  }
  return defaultSelections;
};

const ProductListPage: React.FC = () => {
  const { products, categories, isLoading, error, getProductsByCategory } = useProducts();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (isLoading) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">Error: {error}</div>;
  }

  const displayedProducts = selectedCategory === 'all' ? products : getProductsByCategory(selectedCategory);

  const handleAddToCart = (product: Product) => {
    if (product.addons && product.addons.length > 0) {
      // Product has addons. For this basic list page, we'll add with default selections.
      // Ideally, you'd navigate to a ProductDetailPage or open a modal to select addons.
      const defaultSelections = getDefaultAddons(product);
      addToCart(product, 1, defaultSelections);
      console.log(`Added ${product.name} with defaults:`, defaultSelections);
    } else {
      // Product has no addons
      addToCart(product, 1, {}); 
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Our Menu</h1>
        {categories.length > 0 && (
          <Select onValueChange={setSelectedCategory} defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {displayedProducts.length === 0 && selectedCategory !== 'all' && (
        <p className="text-center text-muted-foreground py-6">No products found in {selectedCategory}.</p>
      )}
       {displayedProducts.length === 0 && selectedCategory === 'all' && (
        <p className="text-center text-muted-foreground py-6">No products available at the moment.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedProducts.map(product => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader className="p-0">
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
            </CardHeader>
            <CardContent className="pt-4 flex-grow">
              <CardTitle className="text-lg mb-1">{product.name}</CardTitle>
              <p className="text-sm text-muted-foreground mb-2 min-h-[40px]">
                {product.description ? 
                  (product.description.length > 60 ? product.description.substring(0, 60) + '...' : product.description)
                  : 'No description available.'}
              </p>
              <Badge variant="secondary" className="mb-2">{product.category}</Badge>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <p className="text-xl font-semibold">
                ${product.price.toFixed(2)}
                {product.addons && product.addons.some(at => at.options.some(opt => opt.additionalPrice > 0)) && 
                  <span className="text-xs text-muted-foreground ml-1">+addons</span>
                }
              </p>
              {product.addons && product.addons.length > 0 ? (
                <Button asChild disabled={!product.isAvailable}>
                  <Link to={`/product/${product.id}`}>
                    {product.isAvailable ? 'View Options' : 'Unavailable'}
                  </Link>
                </Button> 
              ) : (
              <Button onClick={() => handleAddToCart(product)} disabled={!product.isAvailable}>
                  {product.isAvailable ? 'Add to Cart' : 'Unavailable'}
              </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductListPage; 