import { apiSlice } from '../../app/apiSlice';
import type { Product } from '../products/productAPI';

export interface WishlistProduct {
  pId: string;
}

export const wishlistApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<Product[], void>({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation<{ message: string }, WishlistProduct>({
      query: (product) => ({
        url: `/wishlist`,
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: builder.mutation<{ message: string }, string>({
      query: (pId) => ({
        url: `/${pId}/wishlist`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),
    clearWishlist: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: `/wishlist`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useLazyGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
} = wishlistApi;
