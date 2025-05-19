import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient';
import { formatPrice } from '../lib/utils';
import { Order } from '../types';
import { useOrders } from '../context/OrderContext';

const AdminOrdersPage: React.FC = () => {
  const { orders, isLoading, error, getUserOrders, updateOrderStatus } = useOrders();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);

  // Set up real-time subscription for all orders (not just user's orders)
  useEffect(() => {
    const fetchAllOrders = async () => {
      setAdminLoading(true);
      try {
        // Get all orders
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
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // Transform the data
        const transformedOrders = (ordersData || []).map(orderData => {
          const items = (orderData.order_items || []).map(item => ({
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
        });

        setAllOrders(transformedOrders);
        applyStatusFilter(transformedOrders, statusFilter);
      } catch (err: any) {
        console.error('Error fetching all orders:', err);
        toast.error(`Failed to load orders: ${err.message}`);
      } finally {
        setAdminLoading(false);
      }
    };

    fetchAllOrders();

    // Set up real-time subscription for all orders
    const subscription = supabase
      .channel('admin-orders-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          // Refresh all orders when any order changes
          fetchAllOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Apply status filter
  const applyStatusFilter = (orders: Order[], filter: string) => {
    if (filter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === filter));
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    applyStatusFilter(allOrders, value);
  };

  // Handle order status update
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      // Update the local orders list
      const updatedOrders = allOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } 
          : order
      );
      setAllOrders(updatedOrders);
      applyStatusFilter(updatedOrders, statusFilter);
      toast.success(`Order #${orderId.substring(0, 8)} updated to ${newStatus}`);
    } else {
      toast.error('Failed to update order status');
    }
  };

  // Status badge component with color coding
  const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
    let color = "";
    
    switch (status) {
      case 'pending':
        color = "bg-yellow-100 text-yellow-800";
        break;
      case 'confirmed':
        color = "bg-blue-100 text-blue-800";
        break;
      case 'preparing':
        color = "bg-purple-100 text-purple-800";
        break;
      case 'ready':
        color = "bg-green-100 text-green-800";
        break;
      case 'delivered':
        color = "bg-gray-100 text-gray-800";
        break;
      case 'cancelled':
        color = "bg-red-100 text-red-800";
        break;
      default:
        color = "bg-gray-100 text-gray-800";
    }
    
    return (
      <Badge className={`${color} rounded-full px-3 py-1`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Loading state
  if (adminLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading orders...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="mb-4">{error}</p>
        <Button onClick={() => getUserOrders()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <div className="w-full md:w-64">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-muted-foreground">No orders found with the selected filter.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      Order #{order.id.substring(0, 8)}
                      <OrderStatusBadge status={order.status} />
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
                      <p>Customer: {order.customerName || 'Anonymous'}</p>
                      {order.customerPhone && <p>Phone: {order.customerPhone}</p>}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <p className="font-bold text-lg">{formatPrice(order.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Order Items:</h3>
                  <ul className="space-y-1 text-sm">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>
                          {item.quantity}x {item.name}
                          {Object.keys(item.selectedAddons || {}).length > 0 && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (with addons)
                            </span>
                          )}
                        </span>
                        <span>{formatPrice(item.totalPrice)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Update Status:</h3>
                  <div className="flex flex-wrap gap-2">
                    {order.status !== 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(order.id, 'pending')}
                      >
                        Pending
                      </Button>
                    )}
                    {order.status !== 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                      >
                        Confirm
                      </Button>
                    )}
                    {order.status !== 'preparing' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(order.id, 'preparing')}
                      >
                        Preparing
                      </Button>
                    )}
                    {order.status !== 'ready' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                      >
                        Ready
                      </Button>
                    )}
                    {order.status !== 'delivered' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                      >
                        Delivered
                      </Button>
                    )}
                    {order.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 hover:bg-red-100 hover:text-red-800"
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage; 