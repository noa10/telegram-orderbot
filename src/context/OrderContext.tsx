import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Order, CartItem } from '../types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  createOrder: (orderData: Partial<Order>, orderItems: any[]) => Promise<Order | null>;
  getOrderById: (orderId: string) => Promise<Order | null>;
  getUserOrders: () => Promise<Order[]>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Helper function to transform Supabase data to our Order type
const transformSupabaseOrder = (orderData: any): Order => {
  // Transform order items to CartItem format
  const items: CartItem[] = (orderData.order_items || []).map((item: any) => ({
    id: item.id,
    productId: item.product_id,
    name: item.name,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
    totalPrice: Number(item.item_total_price || (item.quantity * item.unit_price)),
    imageUrl: item.image_url,
    selectedAddons: item.selected_addons || {},
  }));

  return {
    id: orderData.id,
    userId: orderData.user_id,
    items,
    status: orderData.status as Order['status'],
    subtotal: Number(orderData.subtotal),
    tax: Number(orderData.tax),
    deliveryFee: Number(orderData.delivery_fee),
    total: Number(orderData.total || orderData.total_amount),
    deliveryAddress: orderData.delivery_address,
    deliveryInstructions: orderData.delivery_instructions,
    paymentIntentId: orderData.payment_intent_id,
    paymentStatus: orderData.payment_status as Order['paymentStatus'],
    customerName: orderData.customer_name,
    customerPhone: orderData.customer_phone,
    createdAt: orderData.created_at,
    updatedAt: orderData.updated_at,
  };
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch user orders when user changes
  useEffect(() => {
    if (user?.id) {
      getUserOrders();
    }
  }, [user?.id]);

  // Setup real-time subscriptions for order updates
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to changes on the orders table for this user
    const subscription = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${String(user.id)}`,
        },
        async (payload) => {
          console.log('Orders change received:', payload);

          // Handle different change types
          if (payload.eventType === 'INSERT') {
            // A new order was created
            const newOrder = transformSupabaseOrder(payload.new);
            setOrders(prev => [newOrder, ...prev]);
            toast.success('New order created!');
          } else if (payload.eventType === 'UPDATE') {
            // An order was updated
            const updatedOrder = transformSupabaseOrder(payload.new);
            setOrders(prev =>
              prev.map(order => order.id === updatedOrder.id ? updatedOrder : order)
            );

            // If it's the current order being viewed, update that too
            if (currentOrder?.id === updatedOrder.id) {
              setCurrentOrder(updatedOrder);
            }

            // Show a toast notification about the status change if it changed
            if (payload.old.status !== payload.new.status) {
              toast.info(`Order #${updatedOrder.id.substring(0, 8)} status updated to ${updatedOrder.status}`);
            }
          } else if (payload.eventType === 'DELETE') {
            // An order was deleted
            setOrders(prev => prev.filter(order => order.id !== payload.old.id));
          }

          // Refresh all orders to ensure consistency
          getUserOrders();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id, currentOrder?.id]);

  // Get all orders for the current user
  const getUserOrders = async (): Promise<Order[]> => {
    const currentUserId = user?.id;
    if (!currentUserId || String(currentUserId).trim() === '') {
      // console.warn('getUserOrders called without a valid user ID.'); // Optional: for debugging
      // setError('User ID is not available to fetch orders.'); // Optional: set an error
      return []; // Silently return if no valid user ID
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          status,
          subtotal,
          tax,
          delivery_fee,
          total,
          total_amount,
          delivery_address,
          delivery_instructions,
          payment_intent_id,
          payment_status,
          customer_name,
          customer_phone,
          created_at,
          updated_at,
          order_items (
            id,
            product_id,
            name,
            quantity,
            unit_price,
            item_total_price,
            image_url,
            selected_addons
          )
        `)
        .eq('user_id', String(currentUserId)) // Use the validated currentUserId
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const transformedOrders = (ordersData || []).map(transformSupabaseOrder);
      setOrders(transformedOrders);
      return transformedOrders;
    } catch (err: any) {
      console.error('Error fetching user orders:', err);
      setError(`Failed to load orders: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get a specific order by ID
  const getOrderById = async (orderId: string): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          status,
          subtotal,
          tax,
          delivery_fee,
          total,
          total_amount,
          delivery_address,
          delivery_instructions,
          payment_intent_id,
          payment_status,
          customer_name,
          customer_phone,
          created_at,
          updated_at,
          order_items (
            id,
            product_id,
            name,
            quantity,
            unit_price,
            item_total_price,
            image_url,
            selected_addons
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      if (!orderData) return null;

      const transformedOrder = transformSupabaseOrder(orderData);
      setCurrentOrder(transformedOrder);
      return transformedOrder;
    } catch (err: any) {
      console.error(`Error fetching order ${orderId}:`, err);
      setError(`Failed to load order: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new order
  const createOrder = async (orderData: Partial<Order>, orderItems: any[]): Promise<Order | null> => {
    if (!user?.id) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    // Start an optimistic update
    const optimisticOrderId = `temp-${Date.now()}`;
    const optimisticOrder: Order = {
      id: optimisticOrderId,
      userId: String(user.id),
      items: orderItems.map(item => ({
        id: `temp-item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        productId: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.item_total_price || (item.quantity * item.unit_price),
        imageUrl: item.image_url,
        selectedAddons: item.selected_addons || {},
      })),
      status: 'pending',
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      deliveryFee: orderData.deliveryFee || 0,
      total: orderData.total || 0,
      deliveryAddress: orderData.deliveryAddress || null,
      deliveryInstructions: orderData.deliveryInstructions || '',
      customerName: orderData.customerName || user.first_name || 'Customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add optimistic order to the list
    setOrders(prev => [optimisticOrder, ...prev]);
    setCurrentOrder(optimisticOrder);

    try {
      // Convert the order data to snake_case for Supabase
      const orderPayload = {
        user_id: String(user.id),
        status: orderData.status || 'pending',
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        delivery_fee: orderData.deliveryFee,
        total_amount: orderData.total,
        delivery_address: orderData.deliveryAddress,
        delivery_instructions: orderData.deliveryInstructions,
        payment_intent_id: orderData.paymentIntentId,
        payment_status: orderData.paymentStatus || 'pending',
        customer_name: orderData.customerName || user.first_name,
        customer_phone: orderData.customerPhone,
      };

      // Create the order in Supabase
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;
      if (!orderResult) throw new Error('Failed to create order');

      // Create order items
      const orderItemsPayload = orderItems.map(item => ({
        ...item,
        order_id: orderResult.id,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);

      if (itemsError) throw itemsError;

      // Replace the optimistic order with the real one
      const { data: finalOrder, error: finalError } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          status,
          subtotal,
          tax,
          delivery_fee,
          total,
          delivery_address,
          delivery_instructions,
          payment_intent_id,
          payment_status,
          customer_name,
          customer_phone,
          created_at,
          updated_at,
          order_items (*)
        `)
        .eq('id', orderResult.id)
        .single();

      if (finalError) throw finalError;

      const transformedOrder = transformSupabaseOrder(finalOrder);

      // Replace optimistic order with real order
      setOrders(prev =>
        prev.map(order => order.id === optimisticOrderId ? transformedOrder : order)
      );
      setCurrentOrder(transformedOrder);

      return transformedOrder;
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(`Failed to create order: ${err.message}`);

      // Remove the optimistic order on failure
      setOrders(prev => prev.filter(order => order.id !== optimisticOrderId));
      setCurrentOrder(null);

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an order's status
  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // Optimistic update
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
      )
    );

    if (currentOrder?.id === orderId) {
      setCurrentOrder(prev => prev ? { ...prev, status, updatedAt: new Date().toISOString() } : null);
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error(`Error updating order ${orderId} status:`, err);
      setError(`Failed to update order status: ${err.message}`);

      // Revert optimistic update on failure
      getUserOrders();

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        isLoading,
        error,
        createOrder,
        getOrderById,
        getUserOrders,
        updateOrderStatus
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};