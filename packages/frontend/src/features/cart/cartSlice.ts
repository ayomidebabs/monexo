import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

export interface CartItem {
  pId: string;
  name: string;
  price: number;
  quantity: number;
  imageSrc: string;
  imageAlt: string;
  stock: number;
}

const cartAdapter = createEntityAdapter({
  selectId: (item: CartItem) => item.pId,
});

const initialState = cartAdapter.getInitialState({
  total: 0,
});

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.entities[action.payload.pId];
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        cartAdapter.addOne(state, action.payload);
      }
      state.total = Object.values(state.entities).reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      if (!action.payload.length) return;
      const total = action.payload.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      cartAdapter.setAll(state, action.payload);
      state.total = total;
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ pId: string; quantity: number }>
    ) => {
      cartAdapter.updateOne(state, {
        id: action.payload.pId,
        changes: { quantity: action.payload.quantity },
      });
      state.total = Object.values(state.entities).reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      cartAdapter.removeOne(state, action.payload);
      state.total = Object.values(state.entities).reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
    clearCart: (state) => {
      cartAdapter.removeAll(state);
      state.total = 0;
    },
  },
});

export const {
  selectAll: selectAllCartItems,
  selectById: selectCartItemById,
  selectIds: selectAllCartItemsByIds,
} = cartAdapter.getSelectors((state: RootState) => state.cart);

export const { addToCart, setCart, updateQuantity, removeFromCart, clearCart } =
  cartSlice.actions;
export const { reducer: cartReducer, reducerPath: cartReducerPath } = cartSlice;
