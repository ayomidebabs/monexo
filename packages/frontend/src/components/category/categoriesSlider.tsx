import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowCircleRight,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { useGetProductsQuery } from '../../features/products/productAPI';
import SectionHeader from '../others/SectionHeader';
import ProductSliderSkeleton from '../skeletons/ProductSliderSkeleton';
import styles from '../../styles/components/HorizontalSlider.module.scss';

interface CategoriesSliderProps {
  category: string;
  title?: string;
  link?: string;
  firstCategory?: boolean;
}

const CategoriesSlider: React.FC<CategoriesSliderProps> = ({
  category,
  title,
  link,
  firstCategory,
}) => {
  const {
    data,
    isLoading: isLoadingProducts,
    error: fetchProductsError,
  } = useGetProductsQuery({
    category,
  });
  const trackRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const scrollAmount = trackRef.current.offsetWidth * 0.8;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (isLoadingProducts) return <ProductSliderSkeleton />;
  if (fetchProductsError) throw fetchProductsError;

  if (!data?.products.length) return null;

  return (
    <>
      <SectionHeader title={title} link={link} />

      <div
        className={`${styles['categoriesSlider-container']} ${
          firstCategory ? styles['marginTop'] : ''
        }`}
      >
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
      </div>
    </>
  );
};

export default CategoriesSlider;
