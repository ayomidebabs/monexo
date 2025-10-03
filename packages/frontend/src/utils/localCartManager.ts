import type { CartItem } from '../features/cart/cartSlice';

export const getLocalCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving local cart:', error);
    return [];
  }
};

export const updateLocalCart = (cart: CartItem[]) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving local cart:', error);
  }
};

export const clearLocalCart = () => {
  try {
    localStorage.removeItem('cart');
  } catch (error) {
    console.error('Error removing local cart:', error);
  }
};
