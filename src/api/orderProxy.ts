import { supabase } from '../lib/supabase';
import { Order } from '../types';

// Simple transformer function similar to what we had in OrderContext
const transformSupabaseOrder = (orderData: any): Order => {
  const items = (orderData.order_items || []).map((item: any) => ({
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

// Proxy function for getting user orders - compatible with older API but works around CSP
export const getUserOrdersProxy = async (userId: string): Promise<{data: Order[] | null, error: Error | null}> => {
  try {
    // Use a more direct, simpler query approach that minimizes eval() usage
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw ordersError;
    }

    // Transform the data
    const transformedOrders = (ordersData || []).map(transformSupabaseOrder);
    return { data: transformedOrders, error: null };
  } catch (err) {
    console.error('Proxy error fetching user orders:', err);
    return { data: null, error: err as Error };
  }
};

// Proxy function for getting a specific order by ID
export const getOrderByIdProxy = async (orderId: string): Promise<{data: Order | null, error: Error | null}> => {
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

    if (orderError) {
      throw orderError;
    }

    if (!orderData) {
      return { data: null, error: new Error('Order not found') };
    }

    // Transform the data
    const transformedOrder = transformSupabaseOrder(orderData);
    return { data: transformedOrder, error: null };
  } catch (err) {
    console.error(`Proxy error fetching order ${orderId}:`, err);
    return { data: null, error: err as Error };
  }
};

// Proxy function for creating a new order
export const createOrderProxy = async (
  userId: string,
  orderData: any,
  orderItems: any[]
): Promise<{data: Order | null, error: Error | null}> => {
  try {
    // Format the order payload for Supabase
    const orderPayload = {
      user_id: userId,
      status: orderData.status || 'pending',
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      delivery_fee: orderData.deliveryFee,
      total_amount: orderData.total, // Make sure to use total_amount, not total
      delivery_address: orderData.deliveryAddress,
      delivery_instructions: orderData.deliveryInstructions,
      payment_intent_id: orderData.paymentIntentId,
      payment_status: orderData.paymentStatus || 'pending',
      customer_name: orderData.customerName,
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

    // Get the complete order details
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
      .eq('id', orderResult.id)
      .single();

    if (finalError) throw finalError;

    // Return the transformed order
    return {
      data: transformSupabaseOrder(finalOrder),
      error: null
    };
  } catch (err) {
    console.error('Proxy error creating order:', err);
    return { data: null, error: err as Error };
  }
};