import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
// import { useCart } from '../../context/CartContext'; // Will be enabled later

const Header: React.FC = () => {
  // const { cart } = useCart(); // Will be enabled later
  // const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0); // Will be enabled later

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          Food App
        </Link>
        <nav className="flex items-center space-x-4">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/order-history" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            My Orders
          </Link>
          <Link to="/admin" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Admin
          </Link>
          <Link to="/cart" className="relative flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            <ShoppingCart className="h-5 w-5 mr-1" />
            Cart
            {/* {itemCount > 0 && ( // Will be enabled later
              <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {itemCount}
              </span>
            )} */}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;