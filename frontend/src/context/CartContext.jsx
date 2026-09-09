import { createContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [canteenId, setCanteenId] = useState(null);

  const addToCart = useCallback((item, itemCanteenId, canteenName = '') => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1, canteenId: itemCanteenId || item.canteen, canteenName: canteenName || item.canteenName || 'Canteen' }];
    });
    toast.success(`${item.name} added to multi-shop cart`);
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCartItems((prev) => {
      const updated = prev.filter((i) => i._id !== itemId);
      if (updated.length === 0) setCanteenId(null);
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity < 1) { removeFromCart(itemId); return; }
    setCartItems((prev) =>
      prev.map((i) => (i._id === itemId ? { ...i, quantity } : i))
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCanteenId(null);
  }, []);

  const totalAmount = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, canteenId, totalAmount, totalItems,
      addToCart, removeFromCart, updateQuantity, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};
