import { apiSlice } from '../../app/apiSlice';

interface Review {
  _id: string;
  user: string;
  rating: number;
  comment: string;
  createdAt?: Date;
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
      invalidatesTags: ['Reviews'],
    }),
    removeReview: builder.mutation<{ message: string }, string>({
      query: (pId) => ({
        url: `/${pId}/reviews`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews'],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useAddReviewMutation,
  useRemoveReviewMutation,
} = productsApi;
