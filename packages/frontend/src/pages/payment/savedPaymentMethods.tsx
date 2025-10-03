import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard,
  faTrash,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../hooks/useAppSelector';
import {
  useGetStripePaymentMethodsQuery,
  useSetStripeDefaultPaymentMethodMutation,
  useDeleteStripePaymentMethodMutation,
} from '../../features/Payment/Stripe/stripeAPI';
import {
  useGetPaystackPaymentMethodsQuery,
  useSetPaystackDefaultPaymentMethodMutation,
  useDeletePaystackPaymentMethodMutation,
} from '../../features/Payment/Paystack/paystackAPI';
import type { ApiError } from '../../app/apiSlice';
import styles from '../../styles/pages/SavedPaymentMethods.module.scss';

interface PaymentMethod {
  id: string;
  provider: 'stripe' | 'paystack';
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
}

const SavedPaymentMethods: React.FC = () => {
  console.log("mount")
  const user = useAppSelector((state) => state.auth.user);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    data: stripePaymentMethods = [],
    isLoading: isLoadingStripeMethods,
    error: fetchStripeMethodsError,
  } = useGetStripePaymentMethodsQuery(undefined, { skip: !user });
  const [
    setStripeDefaultPaymentMethod,
    { isLoading: isSettingDefaultForStripe, error: stripeDefaultError },
  ] = useSetStripeDefaultPaymentMethodMutation();
  const [
    deleteStripePaymentMethod,
    { isLoading: isDeletingForStripe, error: stripeDeleteError },
  ] = useDeleteStripePaymentMethodMutation();

  const {
    data: paystackPaymentMethods = [],
    isLoading: isLoadingPaystackMethods,
    error: fetchPaystackMethodsError,
  } = useGetPaystackPaymentMethodsQuery(undefined, { skip: !user });
  const [
    setPaystackDefaultPaymentMethod,
    { isLoading: isSettingDefaultForPaystack, error: paystackDefaultError },
  ] = useSetPaystackDefaultPaymentMethodMutation();
  const [
    deletePaystackPaymentMethod,
    { isLoading: isDeletingForPaystack, error: paystackDeleteError },
  ] = useDeletePaystackPaymentMethodMutation();

  const paymentMethods: PaymentMethod[] = [
    ...stripePaymentMethods.map((method) => ({
      id: method.id,
      provider: 'stripe' as const,
      brand: method.brand,
      last4: method.last4,
      expMonth: method.expMonth.toString(),
      expYear: method.expYear.toString(),
      isDefault: method.isDefault,
    })),
    ...paystackPaymentMethods.map((method) => ({
      id: method._id,
      provider: 'paystack' as const,
      brand: method.cardType,
      last4: method.last4,
      expMonth: method.expMonth,
      expYear: method.expYear,
      isDefault: method.isDefault,
    })),
  ];

  const isLoading = isLoadingStripeMethods || isLoadingPaystackMethods;
  const hasMethods = paymentMethods.length > 0;

  const handleSetDefault = async (method: PaymentMethod) => {
    try {
      if (method.provider === 'stripe') {
        await setStripeDefaultPaymentMethod({
          paymentMethodId: method.id,
        }).unwrap();
      } else {
        await setPaystackDefaultPaymentMethod({
          paymentMethodId: method.id,
        }).unwrap();
      }
      setSuccessMessage('Default card updated successfully');
    } catch (err) {
      setErrorMessage('Failed to set default card');
      console.error('Set default error:', err);
    }
  };

  const handleDelete = async (method: PaymentMethod) => {
    if (!user) return;
    try {
      if (method.provider === 'stripe') {
        await deleteStripePaymentMethod({
          paymentMethodId: method.id,
        }).unwrap();
      } else {
        await deletePaystackPaymentMethod({
          paymentMethodId: method.id,
        }).unwrap();
      }
      setSuccessMessage('Card deleted successfully');
    } catch (err) {
      setErrorMessage('Failed to delete card');
      console.error('Delete error:', err);
    }
  };

  const renderCard = (method: PaymentMethod, index: number) => (
    <motion.div
      key={method.id}
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className={styles.cardDetails}>
        <FontAwesomeIcon icon={faCreditCard} className={styles.cardIcon} />
        <div className={styles.cardInfo}>
          <h3 className={styles.cardBrand}>
            {method.brand?.toUpperCase()} **** {method.last4}
          </h3>
          <p className={styles.cardExpiry}>
            Expires {method.expMonth}/{method.expYear}
          </p>
          {method.isDefault && (
            <span className={styles.defaultBadge}>
              <FontAwesomeIcon icon={faCheckCircle} /> Default
            </span>
          )}
        </div>
      </div>
      <div className={styles.cardActions}>
        {!method.isDefault && (
          <button
            className={styles.setDefault}
            onClick={() => handleSetDefault(method)}
            disabled={
              isSettingDefaultForStripe ||
              isSettingDefaultForPaystack ||
              isDeletingForStripe ||
              isDeletingForPaystack
            }
            aria-label={`Set ${method.brand} ending ${method.last4} as default`}
          >
            Set as Default
          </button>
        )}
        <button
          className={styles.delete}
          onClick={() => handleDelete(method)}
          disabled={
            isSettingDefaultForStripe ||
            isSettingDefaultForPaystack ||
            isDeletingForStripe ||
            isDeletingForPaystack
          }
          aria-label={`Delete ${method.brand} ending ${method.last4}`}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </motion.div>
  );

  useEffect(() => {
    if (
      stripeDefaultError ||
      stripeDeleteError ||
      paystackDefaultError ||
      paystackDeleteError
    ) {
      setErrorMessage(
        (
          (stripeDefaultError ||
            stripeDeleteError ||
            paystackDefaultError ||
            paystackDeleteError) as ApiError
        )?.data?.message || 'Failed to update card'
      );
    }
  }, [
    stripeDefaultError,
    stripeDeleteError,
    paystackDefaultError,
    paystackDeleteError,
  ]);

  useEffect(() => {
    if (fetchStripeMethodsError || fetchPaystackMethodsError) {
      setErrorMessage(
        ((fetchStripeMethodsError || fetchPaystackMethodsError) as ApiError)
          ?.data?.message || 'Failed to load cards'
      );
    }
  }, [fetchStripeMethodsError, fetchPaystackMethodsError]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className={styles.savedPaymentMethods}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={styles.title}>Saved Cards</h1>
        <p className={styles.subtitle}>Manage your saved cards securely</p>
      </motion.div>

      <AnimatePresence>
        {successMessage && (
          <motion.p
            className={styles.successMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            role='status'
          >
            {successMessage}
          </motion.p>
        )}
        {errorMessage && (
          <motion.p
            className={styles.errorText}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            role='alert'
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className={styles.loading}>Loading cards...</div>
      ) : (
        <div className={styles.paymentSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <FontAwesomeIcon
                icon={faCreditCard}
                className={styles.sectionIcon}
              />
              Cards
              <span className={styles.sectionCount}>
                ({paymentMethods.length})
              </span>
            </h2>
          </div>
          {hasMethods ? (
            <div className={styles.cardGrid}>
              {paymentMethods.map((method, index) => renderCard(method, index))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No cards saved</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedPaymentMethods;
