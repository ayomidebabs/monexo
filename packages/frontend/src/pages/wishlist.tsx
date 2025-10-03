import React, { useState } from 'react';
import WishlistGrid from '../components/common/wishlistGrid';
import { motion } from 'framer-motion';
import {
  useGetWishlistQuery,
  useClearWishlistMutation,
} from '../features/wishlist/wishlistAPI';
import styles from '../styles/pages/Wishlist.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Wishlist: React.FC = () => {
  const [clearWishlist, { isLoading: isClearing }] = useClearWishlistMutation();
  const [errorMessage, setErrorMessage] = useState('');
  const { data: wishlist, isLoading, error } = useGetWishlistQuery();

  const handleClearWishlist = async () => {
    try {
      await clearWishlist().unwrap();
    } catch (error) {
      setErrorMessage('Failed to clear wishlist');
      console.error('Clear wishlist error:', error);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error loading wishlist</div>;
  }

  if (!wishlist?.length) {
    return (
      <main className='main'>
        <motion.div
          className={styles.emptyCart}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles['emptyWishlist-wrapper']}>
            <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
            <Link to='/' className={styles['continue-shopping']}>
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className={`main ${styles.wishlist}`}>
      <header className={styles.header}>
        <h2 className={styles.title}>Your Wishlist</h2>
        <p className={styles.subtitle}>Manage your favorite items</p>
      </header>
      <WishlistGrid wishlist={wishlist} />
      <button
        className={styles.clearWishlist}
        onClick={handleClearWishlist}
        disabled={isClearing}
        aria-label='Clear entire wishlist'
      >
        Clear Wishlist
      </button>
      {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
    </main>
  );
};

export default Wishlist;
