import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ApiError {
  status: number;
  data: { message: string };
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: 'include',
  }),
  tagTypes: [
    'Products',
    'Product',
    'Categories',
    'Orders',
    'Users',
    'Reviews',
    'Theme',
    'RecentlyViewed',
    'Cart',
    'Wishlist',
    'StripeSavedPaymentMethods',
    'PaystackSavedPaymentMethods',
  ],
  endpoints: () => ({}),
});

export const {
  reducerPath: apiReducerPath,
  reducer: apiReducer,
  middleware: apiMiddleware,
} = apiSlice;
