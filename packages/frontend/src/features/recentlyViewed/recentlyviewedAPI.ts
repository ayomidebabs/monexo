import { apiSlice } from '../../app/apiSlice';

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  imageAlt: string;
  link: string;
  viewedAt?: string;
}

export const recentlyviewedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRecentlyViewed: builder.query<RecentlyViewedProduct[], void>({
      query: () => '/user/recently-viewed',
      providesTags: ['RecentlyViewed'],
    }),
    addRecentlyViewed: builder.mutation<
      RecentlyViewedProduct[],
      RecentlyViewedProduct
    >({
      query: (product) => ({
        url: '/user/recently-viewed',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['RecentlyViewed'],
    }),
    updateRecentlyViewed: builder.mutation<
      RecentlyViewedProduct[],
      { products: RecentlyViewedProduct[] }
    >({
      query: ({ products }) => ({
        url: '/user/recently-viewed/merge',
        method: 'POST',
        body: { products },
      }),
      invalidatesTags: ['RecentlyViewed'],
    }),
  }),
});

export const {
  useGetRecentlyViewedQuery,
  useLazyGetRecentlyViewedQuery,
  useAddRecentlyViewedMutation,
  useUpdateRecentlyViewedMutation,
} = recentlyviewedApi;
