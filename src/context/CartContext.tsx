import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const MAX_QUANTITY = 10;
const MIN_QUANTITY = 1;
const STORAGE_KEY = 'restaurant_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      return [];
    }
  });

  // Persist to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.id === item.id);
      
      if (existingItem) {
        // Item exists, increase quantity (up to max)
        const newQuantity = Math.min(
          existingItem.quantity + (item.quantity || 1),
          MAX_QUANTITY
        );
        
        if (newQuantity === existingItem.quantity) {
          // Already at max
          return currentItems;
        }
        
        return currentItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: newQuantity }
            : i
        );
      } else {
        // New item
        const quantity = Math.max(
          MIN_QUANTITY,
          Math.min(item.quantity || 1, MAX_QUANTITY)
        );
        
        return [
          ...currentItems,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity,
            image: item.image,
          }
        ];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < MIN_QUANTITY) {
      // Remove if quantity drops below 1
      removeItem(id);
      return;
    }
    
    const clampedQuantity = Math.min(quantity, MAX_QUANTITY);
    
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id
          ? { ...item, quantity: clampedQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalAmount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
