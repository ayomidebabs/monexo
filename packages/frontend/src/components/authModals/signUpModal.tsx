import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from '../../styles/components/AuthModal.module.scss';
import type { AppDispatch } from '../../app/store';
import { useDispatch } from 'react-redux';
import { signUp } from '../../features/auth/authSlice';

const notificationVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .refine((val) => /[a-z]/.test(val), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((val) => /[0-9]/.test(val), {
    message: 'Password must contain at least one digit',
  })
  .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
    message: 'Password must contain at least one symbol',
  });

const signUpSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters' })
    .max(32, { message: 'Name must not exceed 32 characters' })
    .transform((value) => value.trim())
    .refine((value) => !/[!@#$%^&*(),.?":{}|<>]/.test(value), {
      message: 'Name must not contain special characters',
    }),
  email: z
    .string()
    .email({ message: 'Enter a valid email address' })
    .nonempty({ message: 'Email is required' }),
  password: passwordSchema,
  confirmPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

type signUpFormData = z.infer<typeof signUpSchema>;

interface signInModalProps {
  onHide: () => void;
  onSignUpSuccess: () => void;
  onSignInIntent: () => void;
}

const SignInModal: React.FC<signInModalProps> = ({
  onHide,
  onSignUpSuccess,
  onSignInIntent,
}) => {
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<signUpFormData>({
    resolver: zodResolver(signUpSchema),
    delayError: 500,
  });

  useEffect(() => {
    setTimeout(() => setFocus('name'), 1000);
  }, [setFocus]);

  useEffect(() => {
    if (formSuccess || formError) {
      const timer = setTimeout(() => {
        setFormSuccess('');
        setFormError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [formSuccess, formError]);

  const togglePasswordVisibility = () => setShowPassword((v) => !v);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((v) => !v);

  const onSubmit: SubmitHandler<signUpFormData> = async (data) => {
    console.log('Signing up with:', data);

    try {
      await dispatch(signUp(data)).unwrap();
      setFormSuccess('Signed up successfully!');
      setTimeout(() => {
        onSignUpSuccess();
      }, 1000);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'An error occurred, try again...'
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
          <h2 className={styles.h2}>Create Account</h2>

          <AnimatePresence>
            {(formError || formSuccess) && (
              <motion.div
                className={`${styles.notification} ${
                  formError ? styles.error : styles.success
                }`}
                variants={notificationVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
                role='alert'
              >
                {formError || formSuccess}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.inputGroup}>
              <input
                type='text'
                placeholder='Name'
                {...register('name')}
                className={`${styles.input} ${
                  errors.name ? styles.inputError : ''
                }`}
                aria-required='true'
              />
              {errors.name && (
                <p className={styles.errorMessage}>{errors.name.message}</p>
              )}
            </div>

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

            <div className={`${styles.inputGroup} ${styles.passwordGroup}`}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Confirm Password'
                {...register('confirmPassword')}
                className={`${styles.input} ${
                  errors.password ? styles.inputError : ''
                }`}
                aria-required='true'
              />
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEyeSlash : faEye}
                className={styles.passwordToggle}
                onClick={toggleConfirmPasswordVisibility}
                role='button'
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === 'Enter' && toggleConfirmPasswordVisibility()
                }
              />
              {errors.password && (
                <p className={styles.errorMessage}>{errors.password.message}</p>
              )}
            </div>
            <button type='submit' className={styles.submitButton}>
              Create Account
            </button>
          </form>
          <div className={styles['signin-prompt']}>
            <span>Have an account?</span>
            <button
              onClick={() => {
                onSignInIntent();
              }}
            >
              Sign in
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignInModal;
