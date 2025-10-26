import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CartItem from '../../components/cart/CartItem';
import { type RootState } from '../../app/store';
import { selectAllCartItems } from '../../features/cart/cartSlice';
import masterCardIcon from '../../assets/images/mastercard-old-svgrepo-com.svg';
import verveCardIcon from '../../assets/images/verve-svgrepo-com.svg';
import visaCardIcon from '../../assets/images/visa-4-logo-svgrepo-com.svg';
import { modalContext } from '../../context/modalContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLock } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../hooks/useAppSelector';
import styles from '../../styles/pages/cart.module.scss';

const ShoppingCart: React.FC = () => {
  const { setShowSignInModal } = useContext(modalContext);
  const { setShowCheckoutModal } = useContext(modalContext);
  const { email, region } = useAppSelector((state) => state.checkoutInfo);
  const cart = useSelector(selectAllCartItems);
  const user = useAppSelector((state) => state.auth.user);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = useSelector((state: RootState) => state.cart.total);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      return setShowSignInModal(true);
    }
    if (email && region) {
      return navigate('/checkout');
    }
    setShowCheckoutModal(true);
  };

  if (!cart.length) {
    return (
      <main className='main'>
        <motion.div
          className={styles.emptyCart}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles['emptyCart-wrapper']}>
            <h2 className={styles.emptyTitle}>Your cart is empty</h2>
            <Link to='/' className={styles['continue-shopping']}>
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Continue Shopping</span>
            </Link>
            {!user && (
              <>
                <p>Sign in to see if you have saved some items in cart.</p>
                <button
                  className={styles.signin}
                  onClick={() => setShowSignInModal(true)}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className='main'>
      <motion.div
        className={styles['cart-content']}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className={styles['subtotal-wrapper']}>
          <h4 className={styles.title}>Shopping Cart</h4>
          <div className={styles.subtotal}>
            <span>Subtotal {`( ${cartItemCount} items )`}</span>
            <span className={styles.price}>
              $
              {cartTotal.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <hr />
        </div>
        <Link to={'/'} className={styles['continue-shopping']}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Continue Shopping</span>
        </Link>

        <motion.div
          className={styles.cartItems}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {cart.map((item) => {
            const totalPrice = (item.price * item.quantity).toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              }
            );
            const unitPrice = `${item.price.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })} ✖ ${item.quantity}`;
            return (
              <CartItem
                key={item.pId}
                {...item}
                totalPrice={totalPrice}
                unitPrice={unitPrice}
                badge={'Monexo'}
              />
            );
          })}
        </motion.div>

        <div className={styles['paymentMethods-secureNote-wrapper']}>
          <div className={styles['weAccept-paymentMethods-Wrapper']}>
            <div className={styles['we-accept']}>We accept</div>
            <div className={styles['payment-methods']}>
              <span className={styles['payment-icon']}>
                <img src={masterCardIcon} alt='Mastercard icon' />
              </span>
              <span className={styles['payment-icon']}>
                <img src={verveCardIcon} alt='Verve card icon'></img>
              </span>
              <span className={styles['payment-icon']}>
                <img src={visaCardIcon} alt='Visa card icon' />
              </span>
            </div>
          </div>

          <div className={styles['secure-note']}>
            <FontAwesomeIcon icon={faLock} />
            <div>100% Safe and Secure</div>
          </div>
        </div>

        <button className={styles['checkout-link']} onClick={handleCheckout}>
          Continue to Checkout
        </button>
      </motion.div>
    </main>
  );
};

export default ShoppingCart;
