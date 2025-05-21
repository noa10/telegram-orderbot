import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '../lib/supabase';
import { ArrowUpRight, ArrowDownRight, ShoppingBag, Clock, Check, X } from 'lucide-react';
import { formatPrice } from '../lib/utils';

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get total orders
        const { count: totalOrders, error: totalError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        if (totalError) throw totalError;

        // Get pending orders
        const { count: pendingOrders, error: pendingError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'confirmed', 'preparing', 'ready']);

        if (pendingError) throw pendingError;

        // Get completed orders
        const { count: completedOrders, error: completedError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'delivered');

        if (completedError) throw completedError;

        // Get cancelled orders
        const { count: cancelledOrders, error: cancelledError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'cancelled');

        if (cancelledError) throw cancelledError;

        // Get total revenue
        const { data: revenueData, error: revenueError } = await supabase
          .from('orders')
          .select('total')
          .eq('status', 'delivered');

        if (revenueError) throw revenueError;

        const totalRevenue = revenueData.reduce(
          (sum, order) => sum + (Number(order.total) || 0),
          0
        );

        setStats({
          totalOrders: totalOrders || 0,
          pendingOrders: pendingOrders || 0,
          completedOrders: completedOrders || 0,
          cancelledOrders: cancelledOrders || 0,
          totalRevenue,
        });
      } catch (err: any) {
        console.error('Error fetching order stats:', err);
        setError(`Failed to load order statistics: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderStats();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading statistics...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  All orders placed in the system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Orders being processed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedOrders}</div>
                <div className="flex items-center text-xs text-green-500">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  {stats.totalOrders > 0
                    ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
                    : 0}% completion rate
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  From completed orders
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visit the orders page to manage recent orders.
                </p>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Order Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-700 rounded-full p-1.5">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Active Orders</div>
                      <div className="text-xs text-muted-foreground">{stats.pendingOrders} orders</div>
                    </div>
                    <div className="text-sm font-medium">
                      {stats.totalOrders > 0
                        ? Math.round((stats.pendingOrders / stats.totalOrders) * 100)
                        : 0}%
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 text-green-700 rounded-full p-1.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Completed Orders</div>
                      <div className="text-xs text-muted-foreground">{stats.completedOrders} orders</div>
                    </div>
                    <div className="text-sm font-medium">
                      {stats.totalOrders > 0
                        ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
                        : 0}%
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-red-100 text-red-700 rounded-full p-1.5">
                      <X className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Cancelled Orders</div>
                      <div className="text-xs text-muted-foreground">{stats.cancelledOrders} orders</div>
                    </div>
                    <div className="text-sm font-medium">
                      {stats.totalOrders > 0
                        ? Math.round((stats.cancelledOrders / stats.totalOrders) * 100)
                        : 0}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;