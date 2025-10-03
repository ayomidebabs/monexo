import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { selectAllCartItems } from '../../features/cart/cartSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard,
  faPlus,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import PaystackPop from '@paystack/inline-js';
import {
  useCreatePaymentIntentForRegisteredUserMutation,
  useCreatePaymentIntentForGuestMutation,
  useChargeStripeSavedPaymentMethodMutation,
} from '../../features/Payment/Stripe/stripeAPI';
import {
  useInitializePaystackTransactionMutation,
  useChargePaystackSavedPaymentMethodMutation,
  useGetPaystackPaymentMethodsQuery as paystackPaymentMethodsQuery,
} from '../../features/Payment/Paystack/paystackAPI';
import { useGetStripePaymentMethodsQuery as stripePaymentMethodsQuery } from '../../features/Payment/Stripe/stripeAPI';
import { useAppSelector } from '../../hooks/useAppSelector';
import { apiClient } from '../../config/apiConfig';
import { modalContext } from '../../context/modalContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import type { ApiError } from '../../app/apiSlice';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import styles from '../../styles/pages/checkout.module.scss';

type Currency = 'USD' | 'EUR' | 'GBP' | 'NGN' | 'ZAR' | 'GHS';
type PaymentProvider = 'stripe' | 'paystack';

interface StripePaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface PaystackPaymentMethod {
  _id: string;
  authorizationCode: string;
  customerCode: string;
  email: string;
  cardType: string;
  last4: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
}

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  ZAR: 'R',
  GHS: '₵',
};

const currencyDecimals: Record<Currency, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  NGN: 2,
  ZAR: 2,
  GHS: 2,
};

const multipliers: { [key: string]: number } = {
  NGN: 100,
  GHS: 100,
  ZAR: 100,
};

function formatTotal(total: number, currency: string) {
  const multiplier = multipliers[currency] || 1;
  return total * multiplier;
}

const notificationVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  provider: PaymentProvider;
  email: string;
  usdTotalOrEquivalent: number;
  currency: Currency;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  provider,
  email,
  usdTotalOrEquivalent,
  currency,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const user = useAppSelector((state) => state.auth.user);
  const cart = useAppSelector(selectAllCartItems);
  const [createPaymentIntentForRegisteredUser] =
    useCreatePaymentIntentForRegisteredUserMutation();
  const [createPaymentIntentForGuest] =
    useCreatePaymentIntentForGuestMutation();
  const [initializePaystackTransaction] =
    useInitializePaystackTransactionMutation();
  const [chargeStripeSavedPaymentMethod] =
    useChargeStripeSavedPaymentMethodMutation();
  const [chargePaystackSavedPaymentMethod] =
    useChargePaystackSavedPaymentMethodMutation();
  const {
    data: stripePaymentMethods = [],
    isLoading: isLoadingStripeMethods,
    error: fetchStripeMethodsError,
  } = stripePaymentMethodsQuery(undefined, { skip: !user });
  const {
    data: paystackPaymentMethods = [],
    isLoading: isLoadingPaystackMethods,
    error: fetchPaystackMethodsError,
  } = paystackPaymentMethodsQuery(undefined, { skip: !user });
  const { setShowAppModal, setAppModalMessage } = useContext(modalContext);
  const [savePayment, setSavePayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCardInput, setShowCardInput] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!email || !currency) {
      setErrorMessage('Email and currency are required');
      return;
    }

    setIsProcessing(true);

    try {
      if (selectedMethod && !showCardInput) {
        if (provider === 'stripe') {
          const {
            success,
            data: { paymentIntentStatus, paymentIntentClientSecret },
          } = await chargeStripeSavedPaymentMethod({
            products: cart.map((item) => ({
              pId: item.pId,
              quantity: item.quantity,
            })),
            email,
            paymentMethodId: selectedMethod,
          }).unwrap();

          if (paymentIntentStatus === 'requires_action') {
            if (!stripe) {
              setErrorMessage('Payment provider not initialized');
              setIsProcessing(false);
              return;
            }

            const { error, paymentIntent } = await stripe.confirmCardPayment(
              paymentIntentClientSecret as string,
              { return_url: `${import.meta.env.VITE_API_URL}/stripe/callback` }
            );

            if (error) {
              throw new Error(error.message || 'Payment confirmation failed');
            }

            if (paymentIntent?.status === 'succeeded') {
              setAppModalMessage('Payment successful, redirecting...');
              setShowAppModal(true);
              setTimeout(() => {
                setShowAppModal(false);
                navigate('/order-confirmation');
              }, 3000);
            } else if (paymentIntent?.status === 'processing') {
              setAppModalMessage(
                'Payment pending ⏳. Check your order status.'
              );
              setShowAppModal(true);
              setTimeout(() => {
                setShowAppModal(false);
                navigate('/order-status');
              }, 3000);
            } else {
              throw new Error('Payment failed');
            }
          } else if (success) {
            setAppModalMessage('Payment successful, redirecting...');
            setShowAppModal(true);
            setTimeout(() => {
              setShowAppModal(false);
              navigate('/order-confirmation');
            }, 3000);
          } else {
            throw new Error('Payment failed');
          }
        } else if (provider === 'paystack') {
          const { success, paused, reference, total } =
            await chargePaystackSavedPaymentMethod({
              products: cart.map((item) => ({
                pId: item.pId,
                quantity: item.quantity,
              })),
              currency,
              paymentMethodId: selectedMethod,
            }).unwrap();

          if (success) {
            setAppModalMessage('Payment successful, redirecting...');
            setShowAppModal(true);
            setTimeout(() => {
              setShowAppModal(false);
              navigate('/order-confirmation');
            }, 3000);
          } else if (paused) {
            const popup = new PaystackPop();
            popup.newTransaction({
              key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
              email,
              amount: Math.round(formatTotal(total, currency)),
              currency,
              reference,
              onSuccess: async (response) => {
                try {
                  const {
                    data: {
                      transaction: { status },
                    },
                  } = await apiClient.get(
                    `/paystack/verify-payment/${response.reference}`
                  );
                  if (status === 'success') {
                    setAppModalMessage('Payment successful, redirecting...');
                    setShowAppModal(true);
                    setTimeout(() => {
                      setShowAppModal(false);
                      navigate('/order-confirmation');
                    }, 3000);
                  } else if (status === 'pending') {
                    setAppModalMessage(
                      'Payment pending ⏳. Check your order status.'
                    );
                    setShowAppModal(true);
                    setTimeout(() => {
                      setShowAppModal(false);
                      navigate('/order-status');
                    }, 3000);
                  } else {
                    throw new Error('Payment verification failed');
                  }
                } catch (error) {
                  throw new Error(
                    (error as ApiError)?.data?.message ||
                      'Payment verification failed'
                  );
                }
              },
              onCancel: () => {
                setErrorMessage('Payment cancelled');
                setIsProcessing(false);
              },
            });
          } else {
            throw new Error('Payment failed');
          }
        }
      } else {
        if (provider === 'stripe') {
          if (!stripe || !elements) {
            setErrorMessage('Payment provider not initialized');
            setIsProcessing(false);
            return;
          }

          const { clientSecret } = user
            ? await createPaymentIntentForRegisteredUser({
                products: cart.map((item) => ({
                  pId: item.pId,
                  quantity: item.quantity,
                })),
                email,
                savePayment,
              }).unwrap()
            : await createPaymentIntentForGuest({
                products: cart.map((item) => ({
                  pId: item.pId,
                  quantity: item.quantity,
                })),
                email,
              }).unwrap();

          const cardElement = elements.getElement(CardElement);
          if (!cardElement) {
            throw new Error('Card element not found');
          }

          const { error, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            {
              payment_method: {
                card: cardElement,
                billing_details: { email },
              },
              return_url: `${import.meta.env.VITE_API_URL}/stripe/callback`,
            }
          );

          if (error) {
            throw new Error(error.message || 'Payment confirmation failed');
          }

          if (paymentIntent?.status === 'succeeded') {
            setAppModalMessage(
              savePayment
                ? 'Payment successful, payment method saved, redirecting...'
                : 'Payment successful, redirecting...'
            );
            setShowAppModal(true);
            setTimeout(() => {
              setShowAppModal(false);
              navigate('/order-confirmation');
            }, 3000);
          } else if (paymentIntent?.status === 'processing') {
            setAppModalMessage('Payment pending ⏳. Check your order status.');
            setShowAppModal(true);
            setTimeout(() => {
              setShowAppModal(false);
              navigate('/order-status');
            }, 3000);
          } else {
            throw new Error('Payment failed');
          }
        } else if (provider === 'paystack') {
          const { reference, total } = await initializePaystackTransaction({
            products: cart.map((item) => ({
              pId: item.pId,
              quantity: item.quantity,
            })),
            email,
            currency,
          }).unwrap();

          const popup = new PaystackPop();
          popup.newTransaction({
            key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
            email,
            amount: Math.round(formatTotal(total, currency)),
            currency,
            reference,
            onSuccess: async (response) => {
              try {
                const {
                  data: {
                    transaction: { status, authorization, customer },
                  },
                } = await apiClient.get(
                  `/paystack/verify-payment/${response.reference}`
                );

                if (status === 'success') {
                  if (savePayment && authorization?.reusable) {
                    await apiClient.post('/paystack/save-payment-method', {
                      authorizationCode: authorization.authorization_code,
                      customerCode: customer.customer_code,
                      email: customer.email,
                      cardType: authorization.card_type,
                      last4: authorization.last4,
                      expMonth: authorization.exp_month,
                      expYear: authorization.exp_year,
                    });
                    setAppModalMessage(
                      'Payment successful, payment method saved, redirecting...'
                    );
                  } else if (savePayment && !authorization?.reusable) {
                    setAppModalMessage(
                      'Payment successful, but your chosen method is not reusable. Redirecting...'
                    );
                  } else {
                    setAppModalMessage('Payment successful, redirecting...');
                  }
                  setShowAppModal(true);
                  setTimeout(() => {
                    setShowAppModal(false);
                    navigate('/order-confirmation');
                  }, 3000);
                } else if (status === 'pending') {
                  setAppModalMessage(
                    'Payment pending ⏳. Check your order status.'
                  );
                  setShowAppModal(true);
                  setTimeout(() => {
                    setShowAppModal(false);
                    navigate('/order-status');
                  }, 3000);
                } else {
                  throw new Error('Payment verification failed');
                }
              } catch (error) {
                setErrorMessage(
                  (error as ApiError)?.data?.message ||
                    'Payment verification failed'
                );
                console.error('Paystack verification error:', error);
              } finally {
                setIsProcessing(false);
              }
            },
            onCancel: () => {
              setErrorMessage('Payment cancelled');
              setIsProcessing(false);
            },
          });
        }
      }
    } catch (error) {
      setErrorMessage(
        (error as ApiError)?.data?.message ||
          (error as Error).message ||
          'An unexpected error occurred'
      );
      console.error('Payment error:', error);
      setIsProcessing(false);
    }
  };

  const handleMethodSelection = (methodId: string) => {
    setSelectedMethod(methodId);
    setShowCardInput(false);
  };

  const handleNewCardClick = () => {
    setSelectedMethod(null);
    setShowCardInput(true);
  };

  const renderPaymentMethod = (
    method: StripePaymentMethod | PaystackPaymentMethod,
    isStripe: boolean,
    index: number
  ) => {
    const isDefault = 'isDefault' in method ? method.isDefault : false;
    const brand = isStripe
      ? (method as StripePaymentMethod).brand
      : (method as PaystackPaymentMethod).cardType;
    const last4 = isStripe
      ? (method as StripePaymentMethod).last4
      : (method as PaystackPaymentMethod).last4;
    const expMonth = isStripe
      ? (method as StripePaymentMethod).expMonth
      : (method as PaystackPaymentMethod).expMonth;
    const expYear = isStripe
      ? (method as StripePaymentMethod).expYear
      : (method as PaystackPaymentMethod).expYear;
    const id = isStripe
      ? (method as StripePaymentMethod).id
      : (method as PaystackPaymentMethod)._id;

    return (
      <motion.div
        key={id}
        className={`${styles.methodItem} ${
          selectedMethod === id ? styles.selected : ''
        }`}
        onClick={() => handleMethodSelection(id)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        role='button'
        tabIndex={0}
        aria-label={`Select ${brand} ending ${last4}`}
      >
        <div className={styles.methodInfo}>
          <span className={styles.methodType}>{brand.toUpperCase()}</span>
          <span className={styles.methodNumber}>**** {last4}</span>
          <span className={styles.methodExpiry}>
            Expires {expMonth.toString().padStart(2, '0')}/{expYear}
          </span>
          {isDefault && (
            <span className={styles.defaultBadge}>
              <FontAwesomeIcon icon={faCheckCircle} /> Default
            </span>
          )}
        </div>
        {selectedMethod === id && (
          <IoIosCheckmarkCircle className={styles.selectionIndicator} />
        )}
      </motion.div>
    );
  };

  const availableMethods =
    provider === 'stripe' ? stripePaymentMethods : paystackPaymentMethods;

  useEffect(() => {
    if (!selectedMethod && !showCardInput) {
      const defaultMethod =
        provider === 'stripe'
          ? stripePaymentMethods.find((m) => m.isDefault)?.id
          : paystackPaymentMethods.find((m) => m.isDefault)?._id;
      if (defaultMethod) setSelectedMethod(defaultMethod);
    }
  }, [
    stripePaymentMethods,
    paystackPaymentMethods,
    provider,
    selectedMethod,
    showCardInput,
  ]);

  useEffect(() => {
    if (fetchStripeMethodsError || fetchPaystackMethodsError) {
      const error = (fetchStripeMethodsError ||
        fetchPaystackMethodsError) as ApiError;
      setErrorMessage(error?.data?.message || 'Failed to load payment methods');
    }
  }, [fetchStripeMethodsError, fetchPaystackMethodsError]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  console.log(showCardInput);

  return (
    <div className={styles.paymentForm}>
      <AnimatePresence>
        {errorMessage && (
          <motion.p
            className={styles.errorText}
            variants={notificationVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            role='alert'
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>

      {user &&
        (stripePaymentMethods.length > 0 ||
          paystackPaymentMethods.length > 0) &&
        !showCardInput && (
          <div className={styles.savedMethodsSection}>
            <h3 className={styles.sectionTitle}>
              <FontAwesomeIcon
                icon={faCreditCard}
                className={styles.sectionIcon}
              />
              Saved Payment Methods
              <span className={styles.sectionCount}>
                ({availableMethods.length})
              </span>
            </h3>

            <div className={styles.methodsList}>
              {availableMethods.map((method, index) =>
                renderPaymentMethod(method, provider === 'stripe', index)
              )}
            </div>

            <motion.button
              className={styles.newCardButton}
              onClick={handleNewCardClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label='Add new payment method'
            >
              <FontAwesomeIcon icon={faPlus} /> Use A New Card
            </motion.button>
          </div>
        )}

      {showCardInput && !availableMethods.length && (
        <motion.div
          className={styles.newCardSection}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className={styles.sectionTitle}>
            <FontAwesomeIcon
              icon={faCreditCard}
              className={styles.sectionIcon}
            />
            {provider === 'paystack'
              ? 'New Payment Method'
              : 'Enter Card Details'}
          </h3>
          {provider === 'stripe' && (
            <div className={styles.cardInput}>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '14px',
                      fontFamily: '"Inter", sans-serif',
                      color: '#333',
                      '::placeholder': { color: '#666' },
                    },
                  },
                }}
              />
            </div>
          )}
          {provider === 'paystack' && (
            <p className={styles.paystackInfo}>
              You will be prompted to enter your payment details When you click
              the pay button.
            </p>
          )}
        </motion.div>
      )}

      {showCardInput && !availableMethods.length && user && (
        <label className={styles.savePayment}>
          <input
            type='checkbox'
            checked={savePayment}
            onChange={() => setSavePayment(!savePayment)}
            disabled={isProcessing}
            aria-label='Save payment method for future use'
          />
          Save payment method for future use
        </label>
      )}

      <motion.button
        className={styles.payButton}
        onClick={handlePayment}
        disabled={
          isProcessing ||
          isLoadingStripeMethods ||
          isLoadingPaystackMethods ||
          (!showCardInput && !selectedMethod && availableMethods.length > 0) ||
          (provider === 'stripe' && !stripe)
        }
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Pay ${
          currencySymbols[currency]
        } ${usdTotalOrEquivalent.toLocaleString(undefined, {
          maximumFractionDigits: currencyDecimals[currency],
        })}`}
      >
        <FontAwesomeIcon icon={faCreditCard} />
        {isProcessing
          ? 'Processing...'
          : `Pay ${
              currencySymbols[currency]
            } ${usdTotalOrEquivalent.toLocaleString(undefined, {
              maximumFractionDigits: currencyDecimals[currency],
            })}`}
      </motion.button>
    </div>
  );
};

const Checkout: React.FC = () => {
  const [paymentProvider, setPaymentProvider] =
    useState<PaymentProvider | null>(null);
  const [rates, setRates] = useState<Partial<Record<Currency, number>>>({});
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [ratesError, setRatesError] = useState('');
  const cartTotal = useSelector((state: RootState) => state.cart.total);
  const { email, region, currency } = useAppSelector(
    (state) => state.checkoutInfo
  );
  const [usdTotalOrEquivalent, setUsdTotalOrEquivalent] = useState(cartTotal);

  useEffect(() => {
    if (['britain', 'europe', 'united states'].includes(region!)) {
      setPaymentProvider('stripe');
    } else if (region === 'africa') {
      setPaymentProvider('paystack');
    }
  }, [region]);

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoadingRates(true);
      try {
        const response = await apiClient.get('/rates');
        setRates(response.data);
        setRatesError('');
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        setRatesError('Unable to fetch exchange rates. Please try again.');
      } finally {
        setIsLoadingRates(false);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    if (currency && currency !== 'USD' && rates[currency]) {
      setUsdTotalOrEquivalent(cartTotal * rates[currency]);
    } else {
      setUsdTotalOrEquivalent(cartTotal);
    }
  }, [cartTotal, currency, rates]);

  if (!email || !region || !currency || !paymentProvider) {
    return (
      <main className={styles.main}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Please provide your email, region, and currency to proceed.
        </motion.p>
      </main>
    );
  }

  if (isLoadingRates) {
    return (
      <main className={styles.main}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading payment details...
        </motion.p>
      </main>
    );
  }

  if (ratesError) {
    return (
      <main className={styles.main}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {ratesError}
        </motion.p>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.checkout}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.title}>Checkout</h1>
        </motion.div>

        <div className={styles.checkoutContent}>
          <div className={styles.paymentSection}>
            <Elements stripe={stripePromise}>
              <CheckoutForm
                provider={paymentProvider}
                email={email}
                usdTotalOrEquivalent={usdTotalOrEquivalent}
                currency={currency as Currency}
              />
            </Elements>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
