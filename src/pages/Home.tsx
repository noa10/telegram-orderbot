import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import CategoryFilter from '../components/product/CategoryFilter';
import ProductCard from '../components/product/ProductCard';
import { ProductCategory, ProductCategories, Product } from '../types';
import { useTelegram } from '../hooks/useTelegram';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const { expandApp } = useTelegram();
  
  // Fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // In production, this would be an API call to your backend
        // const response = await axios.get('/api/products');
        
        // For now, we'll fetch from our local data file
        const response = await axios.get('/data/menu.json');
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProducts();
    
    // Expand the mini app for better UX
    expandApp();
  }, [expandApp]);
  
  // Filter products by category
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.Category === selectedCategory);
  
  return (
    <Layout title="Food Order" showBackButton={false}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-center mb-6">Menu</h1>
        
        {/* Category Filter */}
        <CategoryFilter 
          categories={['All', ...ProductCategories]} 
          selectedCategory={selectedCategory}
          onSelectCategory={(category) => setSelectedCategory(category as ProductCategory | 'All')}
        />
        
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md text-center">
            {error}
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        
        {/* No Products Found */}
        {!loading && filteredProducts.length === 0 && (
          <p className="text-center py-12 text-muted-foreground">
            No items found in this category
          </p>
        )}
        
        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.Id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Home;