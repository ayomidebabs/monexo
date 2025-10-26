import { apiSlice } from '../../app/apiSlice';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  imagePublicIds: string[];
  reviews: {
    _id: string;
    user: { _id: string; name: string };
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  averageRating: number;
  reviewCount: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductsQuery {
  page: number;
  limit: number;
  category: string;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, Partial<ProductsQuery>>({
      query: ({ page, limit, category, search, sortBy, sortOrder }) => ({
        url: '/products',
        params: { page, limit, category, search, sortBy, sortOrder },
      }),
      providesTags: ['Products'],
    }),
    getProduct: builder.query<Product, string>({
      query: (pId) => `products/${pId}`,
      providesTags: (result, error, pId) => [{ type: 'Product', id: pId }],
    }),
    createProduct: builder.mutation<Product, FormData>({
      query: (formData) => ({
        url: '/admin/products',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: builder.mutation<
      Product,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/admin/products/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Products'],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (pId) => ({
        url: `/admin/products/${pId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useLazyGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
