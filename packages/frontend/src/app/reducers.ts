import { combineReducers } from '@reduxjs/toolkit';
import { apiReducer, apiReducerPath } from './apiSlice';
import { cartReducer, cartReducerPath } from '../features/cart/cartSlice';
import { authReducer, authReducerPath } from '../features/auth/authSlice';
import { themeReducer, themeReducerPath } from '../features/theme/themeSlice';
import {
  wishlistReducer,
  wishlistReducerPath,
} from '../features/wishlist/wishlistSlice';
import {
  CheckoutInfoReducer,
  checkoutInfoReducerPath,
} from '../features/Payment/checkout/checkOutSlice';
export const rootReducer = combineReducers({
  [authReducerPath]: authReducer,
  [apiReducerPath]: apiReducer,
  [cartReducerPath]: cartReducer,
  [themeReducerPath]: themeReducer,
  [wishlistReducerPath]: wishlistReducer,
  [checkoutInfoReducerPath]: CheckoutInfoReducer,
});
