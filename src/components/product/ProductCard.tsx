import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/button';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  
  const handleProductClick = () => {
    navigate(`/product/${product.Id}`);
  };
  
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to detail page
    
    // For products without addons, we can add directly
    // For products with addons, navigate to product detail page
    if (product.Addons && Object.keys(product.Addons).length > 0) {
      navigate(`/product/${product.Id}`);
    } else {
      addToCart(product, 1, {});
    }
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" 
      onClick={handleProductClick}
    >
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={product.ImageURL} 
          alt={product.ProductName} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-food.jpg';
          }}
        />
        <div className="absolute top-2 right-2">
          <span className="bg-background/90 text-foreground px-2 py-1 rounded-full text-xs font-medium shadow">
            {product.Category}
          </span>
        </div>
      </div>
      
      <CardContent className="p-3">
        <div>
          <h3 className="font-medium text-sm line-clamp-2">{product.ProductName}</h3>
          <div className="flex justify-between items-center mt-2">
            <p className="font-semibold">{formatPrice(product.Price)}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleQuickAdd}
              className="h-8 px-2"
            >
              {product.Addons && Object.keys(product.Addons).length > 0 ? 'Options' : 'Add'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;