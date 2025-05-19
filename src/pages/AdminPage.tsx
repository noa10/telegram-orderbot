import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, Order, Category } from '../types'; // Assuming types are defined
import { toast } from 'sonner';

// Mock Admin Data - Replace with API calls
const mockAdminProducts: Product[] = [
  { id: '1', productId: 'BKS', name: 'Beef Krapow Set', price: 15.90, category: 'Main', isAvailable: true, description: 'Classic Thai dish.', addons: [] },
  { id: '2', productId: 'CKS', name: 'Chicken Krapow Set', price: 13.90, category: 'Main', isAvailable: true, description: 'Popular choice.', addons: [] },
  { id: '3', productId: 'KAP', name: 'Kickapoo', price: 2.50, category: 'Beverages', isAvailable: true, description: 'Fizzy drink.', addons: [] },
];

const mockAdminOrders: Order[] = [
  { id: 'ORDER-789012', status: 'preparing', total: 38.50, createdAt: new Date().toISOString(), items: [], subtotal: 0, tax: 0, deliveryFee: 0, deliveryAddress: '' , updatedAt: ''},
  { id: 'ORDER-123ABC', status: 'confirmed', total: 25.00, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), items: [], subtotal: 0, tax: 0, deliveryFee: 0, deliveryAddress: '' , updatedAt: ''},
];

const mockCategories: Category[] = [
    { id: 'main', name: 'Main Courses' },
    { id: 'side', name: 'Side Dishes' },
    { id: 'beverages', name: 'Beverages' },
    { id: 'paste', name: 'Paste' },
    { id: 'special-set', name: 'Special Sets' },
];

const AdminPage: React.FC = () => {
  // Auth check would go here in a real app
  // const { user, isAdmin } = useAuth();
  // if (!isAdmin) return <p>Access Denied</p>;

  const [products, setProducts] = useState<Product[]>(mockAdminProducts);
  const [orders, setOrders] = useState<Order[]>(mockAdminOrders);
  const [categories, setCategories] = useState<Category[]>(mockCategories);

  // Product Management States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Order Management States
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // --- Product Management Functions ---
  const handleEditProduct = (product: Product) => {
    setEditingProduct({...product});
    setIsProductModalOpen(true);
  };

  const handleAddNewProduct = () => {
    setEditingProduct({ id: '', name: '', price: 0, category: categories[0]?.id || '', isAvailable: true, addons: [] });
    setIsProductModalOpen(true);
  };

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingProduct) return;
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? parseFloat(value) : value;
    setEditingProduct({ ...editingProduct, [name]: val });
  };
  
  const handleProductCategoryChange = (categoryId: string) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, category: categoryId });
  };

  const handleSaveProduct = () => {
    if (!editingProduct) return;
    // Simulate API call
    if (editingProduct.id) { // Update existing
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      toast.success(`Product "${editingProduct.name}" updated.`);
    } else { // Add new
      const newProduct = { ...editingProduct, id: `prod-${Date.now()}` }; // Mock ID
      setProducts([...products, newProduct]);
      toast.success(`Product "${newProduct.name}" added.`);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // --- Order Management Functions ---
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    // Simulate API call
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.info(`Order ${orderId} status updated to ${newStatus}.`);
  };

  return (
    <div className="space-y-12">
      <h1 className="text-4xl font-bold text-center">Admin Panel</h1>

      {/* Product Management Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Manage Products</h2>
          <Button onClick={handleAddNewProduct}>Add New Product</Button>
        </div>
        <div className="bg-card border rounded-lg shadow-sm">
          <ul className="divide-y">
            {products.map(product => (
              <li key={product.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{product.name} (${product.price.toFixed(2)})</h3>
                  <p className="text-sm text-muted-foreground">Category: {product.category} - {product.isAvailable ? 'Available' : 'Unavailable'}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>Edit</Button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Order Management Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Manage Orders</h2>
        <div className="bg-card border rounded-lg shadow-sm">
          <ul className="divide-y">
            {orders.map(order => (
              <li key={order.id} className="p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-medium">Order #{order.id} - Total: ${order.total.toFixed(2)}</h3>
                        <p className="text-sm text-muted-foreground">Date: {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <Select
                        value={order.status}
                        onValueChange={(newStatus) => handleUpdateOrderStatus(order.id, newStatus as Order['status'])}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready for Pickup/Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Basic item display - could be expanded */}
                {/* <Button variant="link" size="sm" onClick={() => setViewingOrder(order)}>View Details</Button> */}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Modal for Editing/Adding Product - Simplified, use shadcn Dialog for real app */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold">{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input id="productName" name="name" value={editingProduct.name} onChange={handleProductFormChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="productPrice">Price</Label>
                    <Input id="productPrice" name="price" type="number" value={editingProduct.price} onChange={handleProductFormChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="productCategory">Category</Label>
                    <Select name="category" value={editingProduct.category} onValueChange={handleProductCategoryChange}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="productDescription">Description</Label>
              <Textarea id="productDescription" name="description" value={editingProduct.description || ''} onChange={handleProductFormChange} />
            </div>
             <div className="flex items-center space-x-2">
                <Input type="checkbox" id="isAvailable" name="isAvailable" checked={editingProduct.isAvailable} onChange={handleProductFormChange} className="h-4 w-4"/>
                <Label htmlFor="isAvailable">Is Available</Label>
            </div>
            {/* Addon management UI would go here */}

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); }}>Cancel</Button>
              <Button onClick={handleSaveProduct}>Save Product</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage; 