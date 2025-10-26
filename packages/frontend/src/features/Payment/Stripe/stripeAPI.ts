import { apiSlice } from '../../../app/apiSlice';

interface chargeSavedPaymentMethodResponse {
  success: boolean;
  data: {
    paymentIntentId: string;
    paymentIntentStatus: string;
    paymentIntentClientSecret?: string | null;
  };
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  created: number;
  isDefault: boolean;
}

export const stripeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation<
      { clientSecret: string },
      {
        products: { pId: string; quantity: number }[];
        email: string;
        savePayment: boolean;
      }
    >({
      query: ({ products, email, savePayment }) => ({
        url: '/stripe/payment-intent',
        method: 'POST',
        body: { products, email, savePayment },
      }),
    }),
    chargeStripeSavedPaymentMethod: builder.mutation<
      chargeSavedPaymentMethodResponse,
      {
        products: { pId: string; quantity: number }[];
        email: string;
        paymentMethodId: string;
      }
    >({
      query: ({ products, email, paymentMethodId }) => ({
        url: '/stripe/pay',
        method: 'POST',
        body: { products, email, paymentMethodId },
      }),
    }),
    getStripePaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => `stripe/payment-methods`,
      providesTags: ['StripeSavedPaymentMethods'],
    }),
    setStripeDefaultPaymentMethod: builder.mutation<
      void,
      { paymentMethodId: string }
    >({
      query: ({ paymentMethodId }) => ({
        url: `stripe/payment-methods/set-default`,
        method: 'POST',
        body: { paymentMethodId },
      }),
      invalidatesTags: ['StripeSavedPaymentMethods'],
    }),
    deleteStripePaymentMethod: builder.mutation<
      void,
      { paymentMethodId: string }
    >({
      query: ({ paymentMethodId }) => ({
        url: `stripe/payment-methods/${paymentMethodId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StripeSavedPaymentMethods'],
    }),
  }),
});

export const {
  useGetStripePaymentMethodsQuery,
  useCreatePaymentIntentMutation,
  useChargeStripeSavedPaymentMethodMutation,
  useSetStripeDefaultPaymentMethodMutation,
  useDeleteStripePaymentMethodMutation,
} = stripeApi;
