import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useCart } from '../../context/CartContext';
import { cn } from '../../lib/utils';

const CartButton = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { totalQuantity } = cart;
  
  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleCartClick}
      className="relative"
      aria-label="Shopping cart"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart">
        <circle cx="8" cy="21" r="1"/>
        <circle cx="19" cy="21" r="1"/>
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
      </svg>
      
      {totalQuantity > 0 && (
        <span className={cn(
          "absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none transform translate-x-1/2 -translate-y-1/2 rounded-full",
          totalQuantity > 9 ? "min-w-[1.5rem] bg-destructive text-white" : "min-w-[1.25rem] bg-primary text-primary-foreground"
        )}>
          {totalQuantity > 99 ? '99+' : totalQuantity}
        </span>
      )}
    </Button>
  );
};

export default CartButton;