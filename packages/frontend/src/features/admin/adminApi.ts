// src/api/adminApi.ts
import { apiSlice } from "../../app/apiSlice";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Analytics {
  totalSales: number;
  orderStatusCount: { _id: string; count: number }[];
  lowStockProducts: { name: string; stock: number }[];
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/admin/users',
        params: { page, limit },
      }),
      providesTags: ['Users'],
    }),
    updateUserRole: builder.mutation<User, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/admin/users/${id}`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    getAnalytics: builder.query<Analytics, void>({
      query: () => '/admin/analytics',
      providesTags: ['Orders', 'Products'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useGetAnalyticsQuery,
} = adminApi;