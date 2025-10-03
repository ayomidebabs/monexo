import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar as faStarSolid,
  faStarHalfAlt,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { type Product } from '../../features/products/productAPI';
import { useDispatch, useSelector } from 'react-redux';
import { store, type AppDispatch, type RootState } from '../../app/store';
import { addToCart, selectAllCartItems } from '../../features/cart/cartSlice';
import { useUpdateCartMutation } from '../../features/cart/cartAPI';
import { updateLocalCart } from '../../utils/localCartManager';
import styles from '../../styles/components/ProductCard.module.scss';
import { useRemoveFromWishlistMutation } from '../../features/wishlist/wishlistAPI';

interface ProductCardProps {
  product: Product;
  forWishlist?: boolean;
}
const ProductCard: React.FC<ProductCardProps> = ({ product, forWishlist }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const cart = useSelector(selectAllCartItems);
  const [updateServerCart, { isLoading: isUpdatingCart }] =
    useUpdateCartMutation();
  const [removeFromWishlist, { isLoading: isRemovingWishlist }] =
    useRemoveFromWishlistMutation();
  const [StockLimitReached, setStockLimitReached] = useState<boolean>(false);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className={styles.rating}>
        {[...Array(fullStars)].map((_, i) => (
          <FontAwesomeIcon
            key={`full-${i}`}
            icon={faStarSolid}
            className={styles.star}
          />
        ))}
        {hasHalfStar && (
          <FontAwesomeIcon icon={faStarHalfAlt} className={styles.star} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FontAwesomeIcon
            key={`empty-${i}`}
            icon={faStarRegular}
            className={styles.star}
          />
        ))}
      </div>
    );
  };

  const handleAddToCart = useCallback(async () => {
    dispatch(
      addToCart({
        pId: product._id,
        name: product.name,
        price: product.price,
        imageSrc: product.images[0] || '',
        imageAlt: product.description,
        quantity: 1,
        stock: product.stock,
      })
    );

    if (user) {
      try {
        await updateServerCart(selectAllCartItems(store.getState())).unwrap();
      } catch (error) {
        console.error('Cart sync error:', error);
      }
    } else {
      updateLocalCart(selectAllCartItems(store.getState()));
    }
  }, [dispatch, product, user, updateServerCart]);

  const handleRemoveFromWishlist = useCallback(async () => {
    try {
      await removeFromWishlist(product._id).unwrap();
    } catch (error) {
      console.error('Remove from wishlist error:', error);
    }
  }, [removeFromWishlist, product._id]);

  useEffect(() => {
    const cartItem = cart.find((item) => item.pId === product?._id);
    if (!product || !cartItem) return;
    setStockLimitReached(cartItem.quantity >= product.stock);
  }, [product._id, cart, product.stock, product]);

  return (
    <motion.div
      className={styles.productCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link
        to={`/product-detail/${product._id}`}
        className={styles.imageLink}
        aria-label={`View ${product.name}`}
      >
        <img
          src={product.images[0]}
          alt={product.description}
          className={styles.productImage}
          loading='lazy'
        />
      </Link>
      <div className={styles.cardDetails}>
        <h3 className={styles.productName}>
          <Link
            to={`/product-detail/${product._id}`}
            className={styles.nameLink}
          >
            {product.name}
          </Link>
        </h3>
        <div>
          <div className={styles['price-container']}>
            <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
            {forWishlist && (
              <button
                className={styles['removeFromWishlist']}
                onClick={handleRemoveFromWishlist}
                disabled={isRemovingWishlist}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
          <div className={styles['rating-container']}>
            {renderStars(product.averageRating)}
            <span className={styles.reviewCount}>({product.reviewCount})</span>
          </div>

          <button
            className={styles.addToCart}
            onClick={() => {
              handleAddToCart();
            }}
            disabled={isUpdatingCart || StockLimitReached}
            aria-label={`Add ${product.name} to cart`}
          >
            {StockLimitReached ? 'All stock added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
