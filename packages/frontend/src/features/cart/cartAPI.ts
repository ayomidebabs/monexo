import { apiSlice } from '../../app/apiSlice';
import type { CartItem } from './cartSlice';

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<CartItem[], void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),

    updateCart: builder.mutation<{ message: string; }, CartItem[]>({
      query: (cart) => ({
        url: '/cart',
        method: 'POST',
        body: { cart },
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const { useGetCartQuery, useLazyGetCartQuery, useUpdateCartMutation } = cartApi;
