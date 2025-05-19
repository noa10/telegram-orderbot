import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, AddonType, AddonOption as AddonOptionType } from '../types';
import { supabase } from '../lib/supabaseClient';

interface ProductContextType {
  products: Product[];
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Helper to transform Supabase data to local types
const transformSupabaseProducts = (supabaseProducts: any[]): Product[] => {
  return supabaseProducts.map((p) => {
    const categoryName = p.categories?.name || 'Uncategorized'; // categories is an object if select is done right

    const addons: AddonType[] = (p.addons || []).map((a: any) => {
      const options: AddonOptionType[] = (a.addon_options || []).map((o: any) => ({
        id: o.id,
        name: o.name,
        additionalPrice: o.additional_price,
        isDefault: o.is_default,
      }));
      return {
        id: a.id,
        name: a.name,
        description: a.description,
        isRequired: a.is_required,
        multipleSelection: a.multiple_selection,
        options,
      };
    });

    return {
      id: p.id, // Use Supabase UUID
      name: p.name,
      price: p.price,
      category: categoryName,
      imageUrl: p.image_url,
      description: p.description,
      isAvailable: p.is_available,
      addons,
    };
  });
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      setIsLoading(true);
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            price,
            image_url,
            is_available,
            category_id,
            categories ( id, name ), 
            addons (
              id,
              name,
              description,
              is_required,
              multiple_selection,
              addon_options (
                id,
                name,
                additional_price,
                is_default
              )
            )
          `);

        if (productsError) throw productsError;

        const transformedProducts = transformSupabaseProducts(productsData || []);
        setProducts(transformedProducts);

        // Extract unique categories from transformed products
        const uniqueCategories = Array.from(new Set(transformedProducts.map(p => p.category)));
        setCategories(uniqueCategories.sort()); // Sort categories alphabetically

        setError(null);
      } catch (e: any) {
        console.error("Failed to load products from Supabase:", e);
        setError(`Failed to load products: ${e.message}`);
        setProducts([]);
        setCategories([]);
      }
      setIsLoading(false);
    };

    fetchProductsAndCategories();
  }, []);

  const getProductById = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };

  const getProductsByCategory = (category: string): Product[] => {
    return products.filter(product => product.category === category);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        getProductById,
        getProductsByCategory,
        categories,
        isLoading,
        error,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}; 