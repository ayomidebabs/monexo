import { apiSlice } from '../../app/apiSlice';
import { type Product } from '../products/productAPI';

export const searchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSearchSuggestions: builder.query<Product[], { search?: string }>({
      query: ({ search }) => ({
        url: '/products/product-suggestion',
        params: { search },
      }),
      providesTags: ['Products'],
    }),
  }),
});

export const { useGetSearchSuggestionsQuery } = searchApi;
