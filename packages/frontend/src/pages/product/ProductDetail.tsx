import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar as faStarSolid,
  faStarHalfAlt,
  faHeart,
} from '@fortawesome/free-solid-svg-icons';
import {
  faHeart as faHeartRegular,
  faStar as faStarRegular,
} from '@fortawesome/free-regular-svg-icons';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCart,
  selectAllCartItems,
  type CartItem,
} from '../../features/cart/cartSlice';
import { useGetProductQuery } from '../../features/products/productAPI';
import {
  useAddReviewMutation,
  useRemoveReviewMutation,
} from '../../features/Reviews/reviewApi';
import { store, type AppDispatch, type RootState } from '../../app/store';
import {
  useAddRecentlyViewedMutation,
  useLazyGetRecentlyViewedQuery,
  type RecentlyViewedProduct,
} from '../../features/recentlyViewed/recentlyviewedAPI';
import {
  addLocalRecentlyViewedProduct,
  getLocalRecentlyViewedProducts,
} from '../../utils/recentlyViewed';
import Carousel from '../../components/common/Carousel';
import { updateLocalCart } from '../../utils/localCartManager';
import { useUpdateCartMutation } from '../../features/cart/cartAPI';
import {
  useAddToWishlistMutation,
  useLazyGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from '../../features/wishlist/wishlistAPI';
import { modalContext } from '../../context/modalContext';
import { setGuestWishlistIntent } from '../../features/wishlist/wishlistSlice';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import DOMPurify from 'dompurify';
import SectionHeader from '../../components/common/SectionHeader';
import HorizontalSlider from '../../components/common/HorizontalSlider';
import type { ApiError } from '../../app/apiSlice';
import styles from '../../styles/pages/productDetail.module.scss';

const reviewSchema = z.object({
  rating: z
    .number({ required_error: 'Please select a rating' })
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  comment: z
    .string({ required_error: 'Please enter a comment' })
    .min(5, 'Comment must be at least 5 characters')
    .max(500, 'Comment cannot exceed 500 characters')
    .trim()
    .transform((val) => DOMPurify.sanitize(val)),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

const ProductDetailPage: React.FC = () => {
  const { pId } = useParams<{ pId: string }>();
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useGetProductQuery(pId!, { skip: !pId });
  const dispatch = useDispatch<AppDispatch>();
  const { setShowSignInModal } = useContext(modalContext);
  const guestWishlistIntent = useSelector(
    (state: RootState) => state.wishlist.wishlistIntent
  );
  const [getWishlist] = useLazyGetWishlistQuery();
  const user = useSelector((state: RootState) => state.auth.user);
  const [addReview, { isLoading: isAddingReview, error: addReviewError }] =
    useAddReviewMutation();
  const [removeReview, { isLoading: isRemovingReview }] =
    useRemoveReviewMutation();
  const [addRecentlyViewedProductServer] = useAddRecentlyViewedMutation();
  const [updateServerCart, { isLoading: isUpdatingCart }] =
    useUpdateCartMutation();
  const [addToWishlist, { isLoading: isAddingWishlist }] =
    useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingWishlist }] =
    useRemoveFromWishlistMutation();
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<
    RecentlyViewedProduct[]
  >([]);
  const [
    getServerRecentlyViewedProducts,
    { isLoading: loadingRecentlyViewed, error: recentlyViewedError },
  ] = useLazyGetRecentlyViewedQuery();
  const [wishlistIcon, setWishlistIcon] = useState(false);
  const cart = useSelector(selectAllCartItems);
  const [isCartItem, setIsCartItem] = useState<CartItem>();
  const [quantity, setQuantity] = useState(1);
  const [StockLimitReached, setStockLimitReached] = useState<boolean>(false);
  const [error, setError] = useState('');
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    dispatch(
      addToCart({
        pId: product._id,
        name: product.name,
        price: product.price,
        imageSrc: product.images[0] || '',
        imageAlt: product.description,
        quantity,
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
  }, [dispatch, product, quantity, user, updateServerCart]);

  const handleAddToWishlist = useCallback(async () => {
    if (!product) return;
    if (!user) {
      setShowSignInModal(true);
      dispatch(setGuestWishlistIntent({ status: true, product: product._id }));
      return;
    }

    try {
      await addToWishlist({
        pId: product._id,
      }).unwrap();
      setWishlistIcon(true);
    } catch (error) {
      if ((error as ApiError).data.message === 'Product already exists') {
        return setError('Item already exists in wishlist');
      }
      setError('Failed to add item to wishlist');
    }
  }, [addToWishlist, dispatch, product, setShowSignInModal, user]);

  const handleRemoveFromWishlist = useCallback(async () => {
    if (!product || !user) return;
    try {
      await removeFromWishlist(product._id).unwrap();
      setWishlistIcon(false);
    } catch (error) {
      setError('Failed to remove from wishlist');
      console.error('Remove from wishlist error:', error);
    }
  }, [product, removeFromWishlist, user]);

  const handleSubmitReview = useCallback(
    async (data: ReviewFormData) => {
      if (!user) {
        setShowSignInModal(true);
        return;
      }

      try {
        await addReview({
          pId: pId!,
          rating: data.rating,
          comment: data.comment,
        }).unwrap();
        reset();
      } catch (err) {
        console.error('Submit review error:', err);
      }
    },
    [addReview, pId, user, setShowSignInModal, reset]
  );

  const handleRemoveReview = useCallback(
    async (reviewId: string) => {
      if (!user) return;
      try {
        await removeReview(reviewId).unwrap();
      } catch (error) {
        console.error('Delete review error:', error);
      }
    },
    [removeReview, user]
  );

  const renderStars = useCallback((rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={
            rating >= i
              ? faStarSolid
              : rating >= i - 0.5
              ? faStarHalfAlt
              : faStarRegular
          }
          className={styles.star}
          aria-hidden='true'
        />
      );
    }
    return stars;
  }, []);

  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !product) return;
      try {
        const wishlist = await getWishlist().unwrap();
        const productExistsInWishlist = wishlist.find(
          (wishlistProduct) => wishlistProduct._id === product._id
        );
        setWishlistIcon(!!productExistsInWishlist);
      } catch (error) {
        console.error('Wishlist check error:', error);
      }
    };
    checkWishlist();
  }, [getWishlist, product, user]);

  useEffect(() => {
    if (
      user &&
      product &&
      guestWishlistIntent.status &&
      guestWishlistIntent.product === product._id
    ) {
      handleAddToWishlist();
      dispatch(
        setGuestWishlistIntent({
          status: false,
          product: null,
        })
      );
    }
  }, [dispatch, guestWishlistIntent, handleAddToWishlist, product, user]);

  useEffect(() => {
    if (product) {
      const productData = {
        id: product._id,
        name: product.name,
        price: product.price,
        imageSrc: product.images[0] || '',
        imageAlt: product.description,
        link: `/product-detail/${product._id}`,
      };
      if (user) {
        (async () => {
          try {
            await addRecentlyViewedProductServer(productData).unwrap();
            setRecentlyViewedProducts(
              await getServerRecentlyViewedProducts().unwrap()
            );
          } catch (error) {
            console.error('Recently viewed error:', error);
          }
        })();
      } else {
        addLocalRecentlyViewedProduct(productData);
        setRecentlyViewedProducts(getLocalRecentlyViewedProducts());
      }
    }
  }, [
    addRecentlyViewedProductServer,
    product,
    user,
    getServerRecentlyViewedProducts,
  ]);

  useEffect(() => {
    const cartItem = cart.find((item) => item.pId === product?._id);
    if (!product || !cartItem) return;
    setIsCartItem(cartItem);
    setStockLimitReached(cartItem.quantity >= product.stock);
  }, [product?._id, cart, product?.stock, product]);

  if (productLoading) return <p>Loading...</p>;
  if (productError || !product) return <p>Product not found</p>;

  return (
    <main className={`main ${styles.main}`}>
      <div className={styles.productDetails}>
        <div className={styles['carousel-detail-mobile']}>
          <Carousel
            images={product.images.map((image) => ({
              imageSrc: image,
              imageAlt: product.description,
            }))}
            aria-label={`Images of ${product.name}`}
          />
          <p className={styles.productTitle}>{product.name}</p>
          <div className={styles['rating-wishlist-container']}>
            <div
              className={styles.productRatingSummary}
              aria-label={`Average rating: ${product.averageRating} stars`}
            >
              {renderStars(product.averageRating)}
              <span className={styles.reviewCount}>
                ({product.reviewCount}{' '}
                {product.reviewCount < 2 ? 'rating' : 'ratings'})
              </span>
            </div>
            <button
              className={styles.wishlistButton}
              onClick={
                wishlistIcon ? handleRemoveFromWishlist : handleAddToWishlist
              }
              disabled={isAddingWishlist || isRemovingWishlist}
              aria-label={
                wishlistIcon
                  ? `Remove ${product.name} from wishlist`
                  : `Add ${product.name} to wishlist`
              }
            >
              <FontAwesomeIcon icon={wishlistIcon ? faHeart : faHeartRegular} />
            </button>
          </div>
          <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
          <p className={styles.productCategory}>Category: {product.category}</p>
          {product.stock < 30 && (
            <em className={styles.itemsLeft}>
              {product.stock} {product.stock > 1 ? 'items' : 'item'} left.
            </em>
          )}
          <p className={styles.productDescription}>{product.description}</p>
        </div>

        <div className={styles['carousel-detail-desktop']}>
          <Carousel
            images={product.images.map((image) => ({
              imageSrc: image,
              imageAlt: product.description,
            }))}
            aria-label={`Images of ${product.name}`}
          />
          <div className={styles['detail-desktop']}>
            <p className={styles.productTitle}>{product.name}</p>
            <div>
              <div className={styles['rating-wishlist-container']}>
                <div
                  className={styles.productRatingSummary}
                  aria-label={`Average rating: ${product.averageRating} stars`}
                >
                  {renderStars(product.averageRating)}
                  <span className={styles.reviewCount}>
                    ({product.reviewCount}{' '}
                    {product.reviewCount < 2 ? 'rating' : 'ratings'})
                  </span>
                </div>
                <button
                  className={styles.wishlistButton}
                  onClick={
                    wishlistIcon
                      ? handleRemoveFromWishlist
                      : handleAddToWishlist
                  }
                  disabled={isAddingWishlist || isRemovingWishlist}
                  aria-label={
                    wishlistIcon
                      ? `Remove ${product.name} from wishlist`
                      : `Add ${product.name} to wishlist`
                  }
                >
                  <FontAwesomeIcon
                    icon={wishlistIcon ? faHeart : faHeartRegular}
                  />
                </button>
              </div>
              <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
              <p className={styles.productCategory}>
                Category: {product.category}
              </p>
              {product.stock < 30 && (
                <em className={styles.itemsLeft}>
                  {product.stock} {product.stock > 1 ? 'items' : 'item'} left.
                </em>
              )}
              <p className={styles.productDescription}>{product.description}</p>
            </div>
          </div>
        </div>
        <div className={styles['addtocart-quantity']}>
          <div className={styles.quantitySelector}>
            <label htmlFor='quantity'>Quantity</label>
            <input
              type='number'
              id='quantity'
              onChange={(e) => {
                if (isCartItem) {
                  const difference = product.stock - isCartItem.quantity;
                  if (parseInt(e.target.value) > difference) {
                    return setQuantity(NaN);
                  }
                } else if (parseInt(e.target.value) > product.stock) {
                  return setQuantity(NaN);
                }
                console.log(parseInt(e.target.value), 'setting');
                setQuantity(parseInt(e.target.value));
              }}
              value={quantity ? quantity : ''}
              className={styles.quantityInput}
              readOnly={StockLimitReached}
              aria-label={`Quantity for ${product.name}`}
              aria-describedby='quantity-error'
            />
          </div>
          <button
            className={styles.addToCart}
            onClick={() => {
              handleAddToCart();
              setQuantity(1);
            }}
            disabled={
              quantity < 1 ||
              quantity > product.stock ||
              !Number(quantity) ||
              isUpdatingCart ||
              StockLimitReached
            }
            aria-label={`Add ${product.name} to cart`}
          >
            {StockLimitReached ? 'All stock added to cart' : 'Add to Cart'}
          </button>
        </div>
        {(quantity < 1 || quantity > product.stock || !Number(quantity)) && (
          <p className={styles.stockNotifier} id='quantity-error'>
            {product.stock === 1
              ? `You can only input a quantity of 1`
              : isCartItem
              ? `You can only input a quantity ${
                  product.stock - isCartItem.quantity === 1
                    ? 'of 1'
                    : `from 1 to ${product.stock - isCartItem.quantity}`
                } `
              : `You can only input a quantity ${
                  product.stock === 1 ? 'of 1' : `from 1 to ${product.stock}`
                } `}
          </p>
        )}
        {error &&
          (() => {
            setTimeout(() => {
              setError('');
            }, 4000);
            return <p className={styles.errorText}>{error}</p>;
          })()}
      </div>

      <div className={styles.reviewsSection}>
        <h2 className={styles.reviewsTitle}>Product Reviews</h2>
        {productLoading && <p>Loading reviews...</p>}
        {!productLoading &&
        (!product.reviews || product.reviews.length === 0) ? (
          <p>No reviews yet</p>
        ) : (
          product.reviews.map((review) => (
            <div key={review._id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <span>{review.user?.name}</span>
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div
                className={styles.reviewRating}
                aria-label={`Rating: ${review.rating} stars`}
              >
                {renderStars(review.rating)}
              </div>
              <p className={styles.cardText}>{review.comment}</p>
              {user?.id === review.user?._id && (
                <button
                  className={styles.deleteReview}
                  onClick={() => handleRemoveReview(review._id)}
                  disabled={isRemovingReview}
                  aria-label={`Delete review for ${product.name}`}
                >
                  {isRemovingReview ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          ))
        )}

        {user ? (
          <form
            className={styles.reviewForm}
            onSubmit={handleSubmit(handleSubmitReview)}
          >
            <h3>Add Your Review</h3>
            {addReviewError && (
              <p className={styles.errorText}>
                {(addReviewError as ApiError)?.data?.message ||
                  'Failed to submit review'}
              </p>
            )}

            <div className={styles.formGroup}>
              <label htmlFor='rating'>Rating:</label>
              <Controller
                name='rating'
                control={control}
                render={({ field }) => (
                  <select
                    id='rating'
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    className={styles.formControl}
                    aria-describedby='rating-error'
                  >
                    <option value={0}>Select rating</option>
                    <option value={1}>1 Star</option>
                    <option value={2}>2 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={5}>5 Stars</option>
                  </select>
                )}
              />
              {errors.rating && (
                <p className={styles.errorText} id='rating-error'>
                  {errors.rating.message}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor='comment'>Comment:</label>
              <Controller
                name='comment'
                control={control}
                render={({ field }) => (
                  <textarea
                    id='comment'
                    rows={4}
                    {...field}
                    placeholder='Write your review...'
                    className={styles.formControl}
                    aria-describedby='comment-error'
                  />
                )}
              />
              {errors.comment && (
                <p className={styles.errorText} id='comment-error'>
                  {errors.comment.message}
                </p>
              )}
            </div>

            <button
              type='submit'
              className={styles.submitReview}
              disabled={isSubmitting || isAddingReview}
              aria-label='Submit review'
            >
              {isSubmitting || isAddingReview
                ? 'Submitting...'
                : 'Submit Review'}
            </button>
          </form>
        ) : (
          <button
            className={styles.signInToReview}
            onClick={() => setShowSignInModal(true)}
            aria-label='Sign in to add a review'
          >
            Sign in to add a review
          </button>
        )}
      </div>
      {loadingRecentlyViewed ? (
        <div>"loading recently viewed products</div>
      ) : recentlyViewedProducts && recentlyViewedProducts.length ? (
        <div className={styles['HorizontalSlider-container']}>
          <SectionHeader title='Recently Viewed' />
          <HorizontalSlider slides={recentlyViewedProducts} />
        </div>
      ) : recentlyViewedError ? (
        <div>"An error occured while loading recently viewed products</div>
      ) : null}
    </main>
  );
};

export default ProductDetailPage;
