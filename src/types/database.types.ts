// This is a placeholder for the actual database types
// In a real application, you would generate this from Supabase
// using their CLI or type generation tools

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          telegram_id: number
          first_name: string
          last_name: string | null
          username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          telegram_id: number
          first_name: string
          last_name?: string | null
          username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          telegram_id?: number
          first_name?: string
          last_name?: string | null
          username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: string
          image_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category: string
          image_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string
          image_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      addon_types: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      addon_options: {
        Row: {
          id: string
          addon_type_id: string
          name: string
          price: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          addon_type_id: string
          name: string
          price?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          addon_type_id?: string
          name?: string
          price?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      product_addons: {
        Row: {
          id: string
          product_id: string
          addon_type_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          addon_type_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          addon_type_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: string
          subtotal: number
          tax: number
          delivery_fee: number
          total: number
          payment_intent_id: string | null
          payment_method: string | null
          customer_name: string
          customer_phone: string | null
          delivery_address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          subtotal: number
          tax: number
          delivery_fee: number
          total: number
          payment_intent_id?: string | null
          payment_method?: string | null
          customer_name: string
          customer_phone?: string | null
          delivery_address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          subtotal?: number
          tax?: number
          delivery_fee?: number
          total?: number
          payment_intent_id?: string | null
          payment_method?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          name: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          name: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          name?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      order_item_addons: {
        Row: {
          id: string
          order_item_id: string
          addon_type: string
          addon_option: string
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_item_id: string
          addon_type: string
          addon_option: string
          price?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_item_id?: string
          addon_type?: string
          addon_option?: string
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}