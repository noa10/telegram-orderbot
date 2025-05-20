import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UnifiedNav from './UnifiedNav';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useIsMobile } from '../../hooks/use-mobile';

// Mock the custom hooks
jest.mock('../../context/AuthContext');
jest.mock('../../context/CartContext');
jest.mock('../../hooks/use-mobile');

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  const originalModule = jest.requireActual('lucide-react');
  return {
    ...originalModule,
    Home: () => <svg data-testid="home-icon" />,
    ListOrdered: () => <svg data-testid="list-ordered-icon" />,
    History: () => <svg data-testid="history-icon" />,
    UserCog: () => <svg data-testid="user-cog-icon" />,
    ShoppingCart: () => <svg data-testid="shopping-cart-icon" />,
    UserCircle: () => <svg data-testid="user-circle-icon" />,
  };
});


const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;
const mockUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>;

describe('UnifiedNav Component', () => {
  const defaultAuthProps = {
    user: null,
    isAuthenticated: false,
    isTelegramWebApp: false,
    isLoading: false,
    error: null,
  };

  const defaultCartProps = {
    totalQuantity: 0,
    // Add other cart context properties if UnifiedNav uses them directly
  };

  beforeEach(() => {
    // Reset mocks before each test
    mockUseAuth.mockReturnValue(defaultAuthProps);
    mockUseCart.mockReturnValue(defaultCartProps);
    mockUseIsMobile.mockReturnValue(false); // Default to desktop
  });

  const renderComponent = (initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <UnifiedNav />
      </MemoryRouter>
    );
  };

  test('renders without crashing', () => {
    renderComponent();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  describe('Responsive Views', () => {
    test('renders desktop navigation on non-mobile view', () => {
      mockUseIsMobile.mockReturnValue(false);
      renderComponent();
      // Assuming desktop nav has a distinct class or structure, e.g., 'hidden md:block' for the main nav container
      // and specific links are present.
      expect(screen.getByRole('navigation')).toHaveClass('hidden md:block');
      expect(screen.getByText('FoodOrder')).toBeInTheDocument(); // Brand
    });

    test('renders mobile bottom navigation on mobile view', () => {
      mockUseIsMobile.mockReturnValue(true);
      renderComponent();
      // Assuming mobile nav has a distinct class or structure, e.g., 'md:hidden fixed bottom-0'
      expect(screen.getByRole('navigation')).toHaveClass('md:hidden fixed bottom-0');
    });
  });

  describe('Navigation Links Presence', () => {
    const testCases = [
      { view: 'desktop', isMobile: false },
      { view: 'mobile', isMobile: true },
    ];

    testCases.forEach(({ view, isMobile }) => {
      describe(`${view} view`, () => {
        beforeEach(() => {
          mockUseIsMobile.mockReturnValue(isMobile);
        });

        test('renders standard links (Home, Menu, Orders, Cart)', () => {
          renderComponent();
          expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
          expect(screen.getByRole('link', { name: /Menu/i })).toBeInTheDocument();
          expect(screen.getByRole('link', { name: /Orders/i })).toBeInTheDocument();
          expect(screen.getByRole('link', { name: /Cart/i })).toBeInTheDocument();
        });

        test('renders Admin link for admin user', () => {
          mockUseAuth.mockReturnValue({
            ...defaultAuthProps,
            user: { id: 12345678, first_name: 'Admin' }, // Admin ID
            isAuthenticated: true,
          });
          renderComponent();
          expect(screen.getByRole('link', { name: /Admin/i })).toBeInTheDocument();
        });

        test('does NOT render Admin link for non-admin user', () => {
          mockUseAuth.mockReturnValue({
            ...defaultAuthProps,
            user: { id: 1, first_name: 'User' }, // Non-admin ID
            isAuthenticated: true,
          });
          renderComponent();
          expect(screen.queryByRole('link', { name: /Admin/i })).not.toBeInTheDocument();
        });
         test('does NOT render Admin link for guest user', () => {
          mockUseAuth.mockReturnValue({ // Guest user
            ...defaultAuthProps,
            user: null,
            isAuthenticated: false,
          });
          renderComponent();
          expect(screen.queryByRole('link', { name: /Admin/i })).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('Authentication State Display (Desktop View)', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(false); // Ensure desktop view
    });

    test('displays user info for Telegram user', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthProps,
        user: { id: 1, first_name: 'Tele', last_name: 'Gram', photo_url: 'test.jpg' },
        isAuthenticated: true,
        isTelegramWebApp: true,
      });
      renderComponent();
      expect(screen.getByText('Tele')).toBeInTheDocument(); // First name
      expect(screen.getByRole('img', { name: /User/i })).toBeInTheDocument();
    });

    test('displays Login button for non-Telegram logged-out user', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthProps,
        isTelegramWebApp: false,
        user: null,
        isAuthenticated: false,
      });
      renderComponent();
      expect(screen.getByRole('link', { name: /Login/i })).toBeInTheDocument();
    });

    test('displays Profile link for non-Telegram logged-in user', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthProps,
        user: { id: 1, first_name: 'Test User' },
        isAuthenticated: true,
        isTelegramWebApp: false,
      });
      renderComponent();
      expect(screen.getByRole('link', { name: /Profile/i })).toBeInTheDocument();
    });
  });

  describe('Cart Item Count', () => {
    const testCases = [
      { view: 'desktop', isMobile: false },
      { view: 'mobile', isMobile: true },
    ];
    testCases.forEach(({ view, isMobile }) => {
      describe(`${view} view`, () => {
        beforeEach(() => {
          mockUseIsMobile.mockReturnValue(isMobile);
        });

        test('displays cart count when totalQuantity > 0', () => {
          mockUseCart.mockReturnValue({ ...defaultCartProps, totalQuantity: 5 });
          renderComponent();
          expect(screen.getByText('5')).toBeInTheDocument();
        });

        test('does NOT display cart count when totalQuantity is 0', () => {
          mockUseCart.mockReturnValue({ ...defaultCartProps, totalQuantity: 0 });
          renderComponent();
          // In the component, the span for count is not rendered if totalQuantity is 0
          expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument(); // Check for any number as text
        });
      });
    });
  });

  describe('Active Link Styling', () => {
    const testCases = [
      { view: 'desktop', isMobile: false, path: '/menu', linkName: /Menu/i },
      { view: 'mobile', isMobile: true, path: '/order-history', linkName: /Orders/i },
    ];

    testCases.forEach(({ view, isMobile, path, linkName }) => {
      test(`highlights active link for ${path} on ${view} view`, () => {
        mockUseIsMobile.mockReturnValue(isMobile);
        renderComponent([path]);
        const activeLink = screen.getByRole('link', { name: linkName });
        
        // Desktop active class: 'bg-primary text-primary-foreground'
        // Mobile active class: 'text-primary'
        // The `navLinkClass` and `mobileNavLinkClass` use these.
        // We check for one of the core active classes.
        // Note: This is a simplified check. A more robust check might involve `toHaveClass` with a regex 
        // or checking computed styles if the class names are complex or dynamically generated by `cn`.
        if (isMobile) {
          expect(activeLink).toHaveClass('text-primary');
          expect(activeLink).not.toHaveClass('text-muted-foreground');
        } else {
          expect(activeLink).toHaveClass('bg-primary'); // More specific to desktop active style
          expect(activeLink).toHaveClass('text-primary-foreground');
        }
      });
    });
  });
});
