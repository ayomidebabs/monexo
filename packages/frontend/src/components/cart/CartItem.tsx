import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { updateQuantity, removeFromCart } from '../../features/cart/cartSlice';
import { useUpdateCartMutation } from '../../features/cart/cartAPI';
import { store, type AppDispatch, type RootState } from '../../app/store';
import { selectAllCartItems } from '../../features/cart/cartSlice';
import type { CartItem as cartItem } from '../../features/cart/cartSlice';
import { updateLocalCart } from '../../utils/localCartManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinus,
  faPlus,
  faHeart,
  faPlaneArrival,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { modalContext } from '../../context/modalContext';
import {
  useAddToWishlistMutation,
  useLazyGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from '../../features/wishlist/wishlistAPI';
import { setGuestWishlistIntent } from '../../features/wishlist/wishlistSlice';
import type { ApiError } from '../../app/apiSlice';
import styles from '../../styles/components/CartItem.module.scss';

interface CartItemProps extends cartItem {
  totalPrice: string;
  unitPrice: string;
  badge: string;
}

const CartItem: React.FC<CartItemProps> = (cartItem) => {
  const dispatch = useDispatch<AppDispatch>();
  const { setShowSignInModal } = useContext(modalContext);
  const guestWishlistIntent = useSelector(
    (state: RootState) => state.wishlist.wishlistIntent
  );
  const [getWishlist] = useLazyGetWishlistQuery();
  const [wishlistIcon, setWishlistIcon] = useState(false);
  const [addToWishlist, { isLoading: isAddingWishlist }] =
    useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingWishlist }] =
    useRemoveFromWishlistMutation();
  const [updateCartServer] = useUpdateCartMutation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [quantity, setQuantity] = useState(cartItem.quantity);
  const [wishlistError, setWishlistError] = useState('');
  const [quantityError, setQuantityError] = useState('');

  const handleAddToWishlist = useCallback(async () => {
    if (!user) {
      setShowSignInModal(true);
      dispatch(
        setGuestWishlistIntent({
          status: true,
          product: cartItem.pId,
        })
      );
      return;
    }

    try {
      await addToWishlist({
        pId: cartItem.pId,
      }).unwrap();
      setWishlistIcon(true);
    } catch (error) {
      if ((error as ApiError).data.message === 'Product already exists') {
        return setWishlistError('Item already exists in wishlist');
      }
      setWishlistError('Failed to add item to wishlist');
    }
  }, [addToWishlist, dispatch, setShowSignInModal, user, cartItem.pId]);

  const handleRemoveFromWishlist = useCallback(async () => {
    if (!user) return;
    try {
      await removeFromWishlist(cartItem.pId).unwrap();
      setWishlistIcon(false);
    } catch (error) {
      setWishlistError('Failed to remove from wishlist');
      console.error('Remove from wishlist error:', error);
    }
  }, [removeFromWishlist, user, cartItem.pId]);

  useEffect(() => {
    let isMounted = true;
    const checkWishlist = async () => {
      if (!user) return;
      try {
        const wishlist = await getWishlist().unwrap();
        const productExistsInWishlist = wishlist.find(
          (wishlistProduct) => wishlistProduct._id === cartItem.pId
        );
        if (isMounted) {
          setWishlistIcon(!!productExistsInWishlist);
        }
      } catch (error) {
        console.error('Wishlist check error:', error);
      }
    };
    checkWishlist();
    return () => {
      isMounted = false;
    };
  }, [getWishlist, user, cartItem.pId]);

  useEffect(() => {
    if (
      user &&
      guestWishlistIntent.status &&
      guestWishlistIntent.product === cartItem.pId
    ) {
      handleAddToWishlist();
      dispatch(
        setGuestWishlistIntent({
          status: false,
          product: null,
        })
      );
      console.log('setting wishlist for guest');
    }
  }, [dispatch, guestWishlistIntent, handleAddToWishlist, user, cartItem.pId]);

  const handleIncreaseQuantity = () => {
    const newQuantity = quantity + 1;

    if (newQuantity > cartItem.stock) {
      setQuantityError(
        `You can only select a quantity between 1 and ${cartItem.stock}`
      );
      return;
    }
    setQuantity(newQuantity);
    setQuantityError('');
    dispatch(updateQuantity({ pId: cartItem.pId, quantity: newQuantity }));
    if (user) {
      updateCartServer(selectAllCartItems(store.getState()));
    } else {
      updateLocalCart(selectAllCartItems(store.getState()));
    }
  };

  const handleDecreaseQuantity = () => {
    const newQuantity = quantity - 1;
    console.log(newQuantity);

    if (newQuantity < 1) {
      setQuantityError(
        `Please select a quantity between 1 and ${cartItem.stock}`
      );
      return;
    }
    setQuantity(newQuantity);
    setQuantityError('');
    dispatch(updateQuantity({ pId: cartItem.pId, quantity: newQuantity }));
    if (user) {
      updateCartServer(selectAllCartItems(store.getState()));
    } else {
      updateLocalCart(selectAllCartItems(store.getState()));
    }
  };

  const handleRemove = () => {
    dispatch(removeFromCart(cartItem.pId));
    if (user) {
      updateCartServer(selectAllCartItems(store.getState()));
    } else {
      updateLocalCart(selectAllCartItems(store.getState()));
    }
  };

  return (
    <motion.div
      className={styles.cartItem}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles['main-wrapper']}>
        <div className={styles['img-quantity-wrapper']}>
          <Link
            to={`/product-detail/${cartItem.pId}`}
            className={styles.imageLink}
          >
            <img
              src={cartItem.imageSrc}
              alt={cartItem.imageAlt}
              className={styles.image}
              loading='lazy'
            />
          </Link>

          <div>
            <label htmlFor={`quantity-${cartItem.pId}`}>Quantity:</label>
            <div className={styles.quantity}>
              <button
                onClick={handleDecreaseQuantity}
                className={styles['reduce-quantity']}
                disabled={quantity <= 1}
                aria-label={`Decrease quantity of ${cartItem.name}`}
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <input
                type='text'
                id={`quantity-${cartItem.pId}`}
                value={quantity}
                className={styles.quantityInput}
                aria-label={`Quantity for ${cartItem.name}`}
                aria-describedby='quantity-error'
                readOnly
              />
              <button
                onClick={handleIncreaseQuantity}
                className={styles['increase-quantity']}
                disabled={Boolean(quantityError)}
                aria-label={`Increase quantity of ${cartItem.name}`}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          </div>
        </div>
        <div className={styles['productTitle-prices-wrapper']}>
          <h2 className={styles.productTitle}>
            <Link
              to={`/product-detail/${cartItem.pId}`}
              className={styles.titleLink}
            >
              {cartItem.name}
            </Link>
          </h2>
          <div className={styles.prices}>
            <div className={styles.totalPrice}>${cartItem.totalPrice}</div>
            <div className={styles.unitPrice}>${cartItem.unitPrice}</div>
            <div className={styles.badge}>
              {cartItem.badge} <FontAwesomeIcon icon={faPlaneArrival} />
            </div>
          </div>
        </div>
      </div>
      {quantityError && <p className={styles.errorText}>{quantityError}</p>}
      <hr />

      <div className={styles['actions-wrapper']}>
        <div className={styles.actions}>
          <button
            className={`${wishlistIcon ? styles['Remove-from-wishlist'] : ''}`}
            onClick={
              wishlistIcon ? handleRemoveFromWishlist : handleAddToWishlist
            }
            disabled={isAddingWishlist || isRemovingWishlist}
            aria-label={
              wishlistIcon
                ? `Remove ${cartItem.name} from wishlist`
                : `Add ${cartItem.name} to wishlist`
            }
          >
            <FontAwesomeIcon icon={wishlistIcon ? faHeart : faHeartRegular} />{' '}
            <div>
              {wishlistIcon ? 'Remove from wishlist' : 'Save for later'}
            </div>
          </button>

          <button
            className={styles.remove}
            onClick={handleRemove}
            aria-label={`Remove ${cartItem.name} from cart`}
          >
            <FontAwesomeIcon icon={faTrash} />
            <div>Remove Item</div>
          </button>
        </div>
        {wishlistError &&
          (() => {
            setTimeout(() => {
              setWishlistError('');
            }, 5000);
            return <p className={styles.errorText}>{wishlistError}</p>;
          })()}
      </div>
    </motion.div>
  );
};

export default CartItem;
