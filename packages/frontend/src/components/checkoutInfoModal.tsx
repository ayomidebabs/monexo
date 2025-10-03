import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch } from 'react-redux';
import { type AppDispatch } from '../app/store';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { setCheckoutInfo } from '../features/Payment/checkout/checkOutSlice';
import type { ApiError } from '../app/apiSlice';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/components/AuthModal.module.scss';

const notificationVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const checkoutSchema = z.object({
  email: z
    .string()
    .email({ message: 'Enter a valid email address' })
    .nonempty({ message: 'Email is required' }),
  region: z.enum(['africa', 'europe', 'united states', 'britain'], {
    message: 'Region is required',
  }),
  currency: z
    .enum(['NGN', 'GHS', 'ZAR', 'GBP', 'EUR', 'USD'], {
      message: 'Select a valid currency',
    })
    .optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutInfoModalProps {
  onHide: () => void;
}

const CheckoutInfoModal: React.FC<CheckoutInfoModalProps> = ({ onHide }) => {
  const [formError, setFormError] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const region = watch('region');

  useEffect(() => {
    setTimeout(() => setFocus('email'), 1000);
  }, [setFocus]);

  useEffect(() => {
    if (formError) {
      const timer = setTimeout(() => {
        setFormError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formError]);

  useEffect(() => {
    setSelectedRegion(region || '');
  }, [region]);

  const onSubmit: SubmitHandler<CheckoutFormData> = async (data) => {
    try {
      if (data.region === 'britain') {
        data.currency = 'GBP';
      } else if (data.region === 'europe') {
        data.currency = 'EUR';
      } else if (data.region === 'united states') {
        data.currency = 'USD';
      }

      dispatch(setCheckoutInfo(data));
      navigate('/checkout');
      onHide();
    } catch (error) {
      setFormError(
        (error as ApiError).data.message || 'An error occurred, try again...'
      );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={`${styles.modalContent} ${styles.CheckoutInfoModal}`}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            className={styles.closeButton}
            onClick={onHide}
            aria-label='Close modal'
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>

          <AnimatePresence>
            {formError && (
              <motion.div
                className={`${styles.notification} ${styles.error}`}
                variants={notificationVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
                role='alert'
              >
                {formError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.inputGroup}>
              <input
                type='email'
                placeholder='Email'
                {...register('email')}
                className={`${styles.input} ${
                  errors.email ? styles.inputError : ''
                }`}
                aria-required='true'
              />
              {errors.email && (
                <p className={styles.errorMessage}>{errors.email.message}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <select
                {...register('region')}
                className={`${styles.select} ${
                  errors.region ? styles.inputError : ''
                }`}
                aria-required='true'
                defaultValue=''
              >
                <option value='' disabled>
                  Select Region
                </option>
                <option value='united states'>United States</option>
                <option value='africa'>Africa</option>
                <option value='europe'>Europe</option>
                <option value='britain'>Britain</option>
              </select>
              {errors.region && (
                <p className={styles.errorMessage}>{errors.region.message}</p>
              )}
            </div>

            <AnimatePresence>
              {selectedRegion === 'africa' && (
                <motion.div
                  className={styles.inputGroup}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <select
                    {...register('currency')}
                    className={`${styles.select} ${
                      errors.currency ? styles.inputError : ''
                    }`}
                    aria-required='true'
                    defaultValue=''
                  >
                    <option value='' disabled>
                      Select Currency
                    </option>
                    <option value='NGN'>NGN (Nigerian Naira)</option>
                    <option value='GHS'>GHS (Ghanaian Cedi)</option>
                    <option value='ZAR'>ZAR (South African Rand)</option>
                  </select>
                  {errors.currency && (
                    <p className={styles.errorMessage}>
                      {errors.currency.message}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button type='submit' className={styles.submitButton}>
              Proceed to checkout
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckoutInfoModal;
