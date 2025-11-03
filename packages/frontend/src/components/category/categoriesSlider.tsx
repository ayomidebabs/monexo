import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowCircleRight,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../styles/components/HorizontalSlider.module.scss';
import { useGetProductsQuery } from '../../features/products/productAPI';

interface HorizontalSliderProps {
  category: string;
}

const CategoriesSlider: React.FC<HorizontalSliderProps> = ({ category }) => {
  const {
    data,
    isLoading: isLoadingProducts,
    error: fetchProductsError,
  } = useGetProductsQuery({
    category,
  });
  const trackRef = useRef<HTMLDivElement>(null);

  if (isLoadingProducts) {
    return <div className={styles.loading}>Loading products...</div>;
  }

  if (fetchProductsError) {
    return (
      <div className={styles.error}>
        Failed to load products. Please try again.
      </div>
    );
  }

  const handleScroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const scrollAmount = trackRef.current.offsetWidth * 0.8;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!data?.products.length) return null;

  return (
    <div className={styles.sliderWrapper}>
      <div className={styles.sliderContainer}>
        <button
          className={`${styles.sliderButton} ${styles.prevButton}`}
          onClick={() => handleScroll('left')}
          aria-label='Previous slide'
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div className={styles.sliderTrack} ref={trackRef}>
          {data.products.map((product) => (
            <div key={product._id} className={styles.slideItem}>
              <Link
                to={`/product-detail/${product._id}`}
                className={styles.slideLink}
              >
                <img
                  src={product.images[0]}
                  alt={product.description}
                  className={styles.slideImage}
                  loading='lazy'
                />
                <p className={styles['slide-title']}>{product.name}</p>
                <p className={styles['slide-price']}>
                  ${product.price.toFixed(2)}
                </p>
              </Link>
            </div>
          ))}
          <div className={styles.viewMoreItem}>
            <Link
              to={`/products?category=${category}`}
              className={styles.viewMoreLink}
            >
              <span>View More</span>
              <FontAwesomeIcon icon={faArrowCircleRight} />
            </Link>
          </div>
        </div>
        <button
          className={`${styles.sliderButton} ${styles.nextButton}`}
          onClick={() => handleScroll('right')}
          aria-label='Next slide'
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default CategoriesSlider;
