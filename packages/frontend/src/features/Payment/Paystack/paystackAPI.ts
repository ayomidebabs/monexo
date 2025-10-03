import { apiSlice } from '../../../app/apiSlice';

interface ChargeSavedPaymentMethodResponse {
  success: boolean;
  paused: boolean;
  reference: string;
  authorizationUrl: string;
  total: number;
  message: string;
}

interface PaymentMethod {
  _id: string;
  userId: string;
  authorizationCode: string;
  customerCode: string;
  email: string;
  cardType: string;
  last4: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
}

export const paystackApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initializePaystackTransaction: builder.mutation<
      {
        reference: string;
        total: number;
      },
      {
        products: { pId: string; quantity: number }[];
        email: string;
        currency: string;
      }
    >({
      query: ({ products, email, currency }) => ({
        url: '/paystack/transaction/initialize',
        method: 'POST',
        body: { products, email, currency },
      }),
    }),
    chargePaystackSavedPaymentMethod: builder.mutation<
      ChargeSavedPaymentMethodResponse,
      {
        products: { pId: string; quantity: number }[];
        currency: string;
        paymentMethodId: string;
      }
    >({
      query: ({ products, currency, paymentMethodId }) => ({
        url: '/paystack/pay',
        method: 'POST',
        body: { products, currency, paymentMethodId },
      }),
    }),
    getPaystackPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => '/paystack/payment-methods',
      providesTags: ['PaystackSavedPaymentMethods'],
    }),
    setPaystackDefaultPaymentMethod: builder.mutation<
      void,
      { paymentMethodId: string }
    >({
      query: ({ paymentMethodId }) => ({
        url: `/paystack/payment-methods/set-default`,
        method: 'POST',
        body: { paymentMethodId },
      }),
      invalidatesTags: ['PaystackSavedPaymentMethods'],
    }),
    deletePaystackPaymentMethod: builder.mutation<void, { paymentMethodId: string }>({
      query: ({ paymentMethodId }) => ({
        url: `/paystack/payment-methods/${paymentMethodId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaystackSavedPaymentMethods'],
    }),
  }),
});

export const {
  useGetPaystackPaymentMethodsQuery,
  useInitializePaystackTransactionMutation,
  useChargePaystackSavedPaymentMethodMutation,
  useDeletePaystackPaymentMethodMutation,
  useSetPaystackDefaultPaymentMethodMutation,
} = paystackApi;
