import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Product, AddonSelection } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';
import { useTelegram } from '../hooks/useTelegram';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setMainButton } = useTelegram();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAddons, setSelectedAddons] = useState<AddonSelection>({});
  
  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // In production, this would be an API call to your backend
        // const response = await axios.get(`/api/products/${id}`);
        
        // For now, we'll fetch from our local data file and filter
        const response = await axios.get('/data/menu.json');
        const products = response.data as Product[];
        const foundProduct = products.find(p => p.Id === id);
        
        if (foundProduct) {
          setProduct(foundProduct);
          
          // Initialize default addon selections
          if (foundProduct.Addons) {
            const initialAddons: AddonSelection = {};
            Object.entries(foundProduct.Addons).forEach(([key, options]) => {
              // Set default value as the first option that contains "Default"
              const defaultOption = options.find(opt => opt.includes('Default'));
              initialAddons[key] = defaultOption || options[0];
            });
            setSelectedAddons(initialAddons);
          }
        } else {
          setError('Product not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id]);
  
  // Setup Telegram main button
  useEffect(() => {
    if (product) {
      setMainButton('Add to Cart', handleAddToCart, {
        color: '#4CAF50',
        textColor: '#FFFFFF',
      });
    }
    
    return () => {
      // Clean up main button when component unmounts
      setMainButton('', () => {}, { isActive: false });
    };
  }, [product, quantity, selectedAddons]);
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, selectedAddons);
      toast.success('Added to cart', {
        description: `${quantity} x ${product.ProductName}`,
      });
      
      // Navigate back to product listing
      navigate('/');
    }
  };
  
  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };
  
  const handleAddonChange = (addonType: string, value: string) => {
    setSelectedAddons(prev => ({
      ...prev,
      [addonType]: value
    }));
  };
  
  // Render loading state
  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  // Render error state
  if (error || !product) {
    return (
      <Layout title="Error">
        <div className="p-4 bg-destructive/10 rounded-md">
          <h2 className="font-semibold text-lg text-destructive">Error Loading Product</h2>
          <p className="mt-2">{error || 'Product not found'}</p>
          <Button 
            onClick={() => navigate('/')} 
            className="mt-4"
          >
            Go Back to Menu
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={product.ProductName}>
      <div className="space-y-6">
        {/* Product Image */}
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <img 
            src={product.ImageURL} 
            alt={product.ProductName} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-food.jpg';
            }}
          />
        </div>
        
        {/* Product Info */}
        <div>
          <h1 className="text-2xl font-bold">{product.ProductName}</h1>
          <p className="text-xl mt-1 font-semibold">{formatPrice(product.Price)}</p>
          <p className="text-sm text-muted-foreground mt-1">Category: {product.Category}</p>
        </div>
        
        {/* Quantity Selector */}
        <div className="flex items-center space-x-4 py-2">
          <span className="font-medium">Quantity:</span>
          <div className="flex items-center border rounded-md">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-none" 
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span className="px-4">{quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-none" 
              onClick={() => handleQuantityChange(1)}
            >
              +
            </Button>
          </div>
        </div>
        
        {/* Addons */}
        {product.Addons && Object.keys(product.Addons).length > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold border-b pb-2">Customize Your Order</h2>
            
            {Object.entries(product.Addons).map(([addonType, options]) => (
              <div key={addonType} className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">{addonType}</h3>
                <RadioGroup 
                  value={selectedAddons[addonType] || options[0]} 
                  onValueChange={(value) => handleAddonChange(addonType, value)}
                  className="space-y-2"
                >
                  {options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${addonType}-${option}`} />
                      <Label htmlFor={`${addonType}-${option}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        )}
        
        {/* Add to Cart Button */}
        <div className="pt-4">
          <Button 
            className="w-full py-6 text-lg"
            onClick={handleAddToCart}
          >
            Add to Cart - {formatPrice(product.Price * quantity)}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;