// Types for the Telegram Mini App Food Ordering application

// User from Telegram
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

// Product from the menu
export interface Product {
  id: string;
  productId?: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  description?: string;
  isAvailable: boolean;
  addons?: AddonType[];
}

// Categories in the menu
export const ProductCategories = [
  'Main',
  'Side',
  'Beverages',
  'Paste',
  'Special Set'
] as const;

export type ProductCategory = typeof ProductCategories[number];

// Addon selection for a cart item
export interface AddonSelection {
  [key: string]: string | string[];
}

// Cart item representing a product with selected addons
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
  selectedAddons: Record<string, string | string[]>;
}

// Shopping cart
export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

// Order status enum
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// Order item representing a cart item in a placed order
export interface OrderItem extends CartItem {
  orderId: string;
}

// Order representing a placed cart
export interface Order {
  id: string;
  userId?: string;
  items: CartItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: any;
  deliveryInstructions?: string;
  paymentIntentId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment intent response from the server
export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

// Authentication state
export interface AuthState {
  isAuthenticated: boolean;
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
}

// Application settings
export interface AppSettings {
  currency: string;
  taxRate: number;
  deliveryFee: number;
  isDeliveryEnabled: boolean;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessHours: string;
}

// Error response from API
export interface APIError {
  message: string;
  status: number;
  code?: string;
}

// Supabase database types (placeholder - would be expanded based on actual schema)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          telegram_id: number;
          first_name: string;
          last_name: string | null;
          username: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          telegram_id: number;
          first_name: string;
          last_name?: string | null;
          username?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          telegram_id?: number;
          first_name?: string;
          last_name?: string | null;
          username?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add other table definitions as needed
    };
  };
};

export interface AddonOption {
  id: string;
  name: string;
  additionalPrice: number;
  isDefault: boolean;
}

export interface AddonType {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  multipleSelection: boolean;
  options: AddonOption[];
}

export interface CartItemAddon {
  addonTypeId: string;
  addonOptionId: string;
  addonTypeName?: string;
  addonOptionName?: string;
  additionalPrice?: number;
}

export interface User {
  id: string;
  telegramId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  address?: any;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}