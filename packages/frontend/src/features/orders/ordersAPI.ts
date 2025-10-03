import { apiSlice } from '../../app/apiSlice';

export interface Order {
  _id: string;
  user: string;
  email: string;
  products: {
    pId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: string;
  paymentDetails: {
    method: string;
    transactionId?: string;
  };
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ordersQuery {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserOrders: builder.query<OrdersResponse, Partial<ordersQuery>>({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/orders/myorders',
        params: { page, limit },
      }),
      providesTags: ['Orders'],
    }),
    getAllOrders: builder.query<
      OrdersResponse,
      { page?: number; limit?: number; status?: string }
    >({
      query: ({ page = 1, limit = 10, status }) => ({
        url: '/admin/orders',
        params: { page, limit, status },
      }),
      providesTags: ['Orders'],
    }),
    updateOrderStatus: builder.mutation<Order, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetUserOrdersQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} = ordersApi;
