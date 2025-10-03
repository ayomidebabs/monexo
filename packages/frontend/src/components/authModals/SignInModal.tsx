import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faEye, faEyeSlash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser, signIn } from '../../features/auth/authSlice';
import type { AppDispatch } from '../../app/store';
import { useUpdateCartMutation } from '../../features/cart/cartAPI';
import { clearLocalCart, getLocalCart } from '../../utils/localCartManager';
import { useUpdateRecentlyViewedMutation } from '../../features/recentlyViewed/recentlyviewedAPI';
import {
  getLocalRecentlyViewedProducts,
  clearLocalRecentlyViewedProducts,
} from '../../utils/recentlyViewed';
import getCsrfToken from '../../utils/getCsrfToken';
import styles from '../../styles/components/AuthModal.module.scss';

interface ApiError {
  status: number;
  data: { message: string };
}

const notificationVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const signInSchema = z.object({
  email: z
    .string()
    .email({ message: 'Enter a valid email address' })
    .nonempty({ message: 'Email is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInModalProps {
  onHide: () => void;
  onSignInSuccess: () => void;
  onSignUpIntent: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({
  onHide,
  onSignInSuccess,
  onSignUpIntent,
}) => {
  const [formError, setFormError] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();
  const [showPassword, setShowPassword] = useState(false);
  const [updateServerCart] = useUpdateCartMutation();
  const [updateServerRecentlyViewed] = useUpdateRecentlyViewedMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

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

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  const onSubmit: SubmitHandler<SignInFormData> = async (data) => {
    try {
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        throw new Error('Failed to fetch CSRF token');
      }
      await dispatch(signIn({ ...data, csrfToken })).unwrap();
      await updateServerCart(getLocalCart()).unwrap();
      clearLocalCart();
      updateServerRecentlyViewed({
        products: getLocalRecentlyViewedProducts(),
      }).unwrap();
      await dispatch(fetchCurrentUser()).unwrap();
      clearLocalRecentlyViewedProducts();
      onSignInSuccess();
    } catch (error) {
      setFormError(
        (error as ApiError).data.message || 'An error occurred, try again...'
      );
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const handleFacebookSignIn = () => {
    window.location.href = 'http://localhost:5000/auth/facebook';
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
          className={styles.modalContent}
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
          <h2 className={styles.h2}>Sign In</h2>

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

            <div className={`${styles.inputGroup} ${styles.passwordGroup}`}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='Password'
                {...register('password')}
                className={`${styles.input} ${
                  errors.password ? styles.inputError : ''
                }`}
                aria-required='true'
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className={styles.passwordToggle}
                onClick={togglePasswordVisibility}
                role='button'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === 'Enter' && togglePasswordVisibility()
                }
              />
              {errors.password && (
                <p className={styles.errorMessage}>{errors.password.message}</p>
              )}
            </div>
            <button type='submit' className={styles.submitButton}>
              Sign In
            </button>
          </form>
          <div className={styles.separator}>OR</div>
          <div className={styles.socialSignIn}>
            <button
              onClick={handleGoogleSignIn}
              className={styles.socialButton}
              aria-label='Sign in with Google'
            >
              <FontAwesomeIcon icon={faGoogle} /> Sign in with Google
            </button>

            <button
              onClick={handleFacebookSignIn}
              className={styles.socialButton}
              aria-label='Sign in with Facebook'
            >
              <FontAwesomeIcon icon={faFacebook} /> Sign in with Facebook
            </button>
          </div>
          <div className={styles['signup-prompt']}>
            <span>Don't have an account?</span>
            <button
              onClick={() => {
                onSignUpIntent();
              }}
            >
              Sign up
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignInModal;
