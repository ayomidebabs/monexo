// // src/components/Checkout.tsx
// import React, { useState } from 'react';
// import { Button, Form, Alert, Spinner } from 'react-bootstrap';
// import {
//   useCreatePaymentIntentMutation,
//   useGetUserOrdersQuery,
// } from '../features/orders/ordersAPI';
// import { useSelector } from 'react-redux';
// import { selectAllCartItems, clearCart } from '../features/cart/cartSlice';
// import { loadStripe } from '@stripe/stripe-js';
// import {
//   Elements,
//   CardElement,
//   useStripe,
//   useElements,
// } from '@stripe/react-stripe-js';
// import { useDispatch } from 'react-redux';

// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// const CheckoutForm: React.FC = () => {
//   const [error, setError] = useState<string | null>(null);
//   const [processing, setProcessing] = useState(false);
//   const cartItems = useSelector(selectAllCartItems);
//   const dispatch = useDispatch();
//   const stripe = useStripe();
//   const elements = useElements();
//   const [createPaymentIntent] = useCreatePaymentIntentMutation();
//   const { data: orders, refetch } = useGetUserOrdersQuery({
//     page: 1,
//     limit: 10,
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!stripe || !elements) return;

//     setProcessing(true);
//     setError(null);

//     try {
//       const { clientSecret } = await createPaymentIntent({
//         products: cartItems.map((item) => ({
//           pId: item.pId,
//           quantity: item.quantity,
//         })),
//       }).unwrap();

//       const result = await stripe.confirmCardPayment(clientSecret, {
//         payment_method: {
//           card: elements.getElement(CardElement)!,
//         },
//       });

//       if (result.error) {
//         setError(result.error.message || 'Payment failed');
//         setProcessing(false);
//         return;
//       }

//       // Poll for order confirmation
//       const pollInterval = setInterval(async () => {
//         await refetch();
//         const newOrder = orders?.orders.find(
//           (order) => order.status === 'processing'
//         );
//         if (newOrder) {
//           clearInterval(pollInterval);
//           dispatch(clearCart());
//           setProcessing(false);
//           alert('Order placed successfully!');
//         }
//       }, 1000);

//       setTimeout(() => clearInterval(pollInterval), 10000); // Stop polling after 10s
//     } catch (error) {
//       setError((error as Error).message);
//       setProcessing(false);
//     }
//   };

//   return (
//     <Form onSubmit={handleSubmit}>
//       <h2>Checkout</h2>
//       {error && <Alert variant='danger'>{error}</Alert>}
//       <CardElement />
//       <Button
//         variant='primary'
//         type='submit'
//         disabled={!stripe || processing}
//         className='mt-3'
//       >
//         {processing ? <Spinner animation='border' size='sm' /> : 'Pay Now'}
//       </Button>
//     </Form>
//   );
// };

// const Checkout: React.FC = () => (
//   <Elements stripe={stripePromise}>
//     <CheckoutForm />
//   </Elements>
// );

// export default Checkout;
