import { apiSlice } from '../../app/apiSlice';

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: Date;
}

interface AddReview {
  pId: string;
  rating: number;
  comment: string;
}

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query<Review[], string>({
      query: (pId) => `/${pId}/reviews`,
      providesTags: ['Reviews'],
    }),
    addReview: builder.mutation<{ message: string }, AddReview>({
      query: ({ pId, rating, comment }) => ({
        url: `/${pId}/reviews`,
        method: 'POST',
        body: { rating, comment },
      }),
      invalidatesTags: (result, error, { pId }) => [
        { type: 'Product', id: pId },
        'Reviews',
      ],
    }),
    removeReview: builder.mutation<{ message: string }, string>({
      query: (pId) => ({
        url: `/${pId}/reviews`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, pId) => [
        { type: 'Product', id: pId },
        'Reviews',
      ],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useAddReviewMutation,
  useRemoveReviewMutation,
} = productsApi;
