import React, { useState } from 'react';
import { motion } from 'framer-motion';
import WishlistGrid from '../components/others/WishlistGrid';
import {
  useGetWishlistQuery,
  useClearWishlistMutation,
} from '../features/wishlist/wishlistAPI';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import Loader from '../components/others/Loader';
import Seo from '../components/others/Seo';
import styles from '../styles/pages/Wishlist.module.scss';

const Wishlist: React.FC = () => {
  const [clearWishlist, { isLoading: isClearing }] = useClearWishlistMutation();
  const [errorMessage, setErrorMessage] = useState('');
  const {
    data,
    isLoading: isLoadingWishlist,
    error: fetchWishlistError,
  } = useGetWishlistQuery();

  const wishlist = data || [];

  const handleClearWishlist = async () => {
    try {
      await clearWishlist().unwrap();
    } catch (error) {
      setErrorMessage('Failed to clear wishlist');
      console.error('Clear wishlist error:', error);
    }
  };

  if (isLoadingWishlist) {
    return (
      <>
        <Seo
          title='Your Wishlist | Monexo'
          description="Explore and manage your saved items in Monexo's wishlist."
          keywords='monexo, wishlist, saved items, online shopping'
          robots='noindex, nofollow'
        />
        <motion.main
          className={`main ${styles.wishlist}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Loader text='Loading your wishlist…' marginTop={10} />
        </motion.main>
      </>
    );
  }

  if (fetchWishlistError) {
    throw fetchWishlistError;
  }

  return (
    <>
      <Seo
        title='Your Wishlist | Monexo'
        description="Explore and manage your saved items in Monexo's wishlist."
        keywords='monexo, wishlist, saved items, online shopping'
      />
      <motion.main
        className={`main ${styles.wishlist}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {wishlist.length > 0 ? (
          <>
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
          </>
        ) : (
          <div className={styles['emptyWishlist-wrapper']}>
            <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
            <Link to='/' className={styles['continue-shopping']}>
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        )}
      </motion.main>
    </>
  );
};

export default Wishlist;
