import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowCircleRight,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../styles/components/HorizontalSlider.module.scss';

interface Slide {
  id: string;
  name?: string;
  imageSrc: string;
  imageAlt: string;
  link: string;
  title?: string;
  price?: number;
  stock?: number;
}

interface HorizontalSliderProps {
  slides: Slide[] | [];
  viewMoreLink?: string;
}

const HorizontalSlider: React.FC<HorizontalSliderProps> = ({
  slides,
  viewMoreLink,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const scrollAmount = trackRef.current.offsetWidth * 0.8;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!slides.length) return null;

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
          {slides.map((slide) => (
            <div key={slide.id} className={styles.slideItem}>
              <Link to={slide.link} className={styles.slideLink}>
                <img
                  src={slide.imageSrc}
                  alt={slide.imageAlt}
                  className={styles.slideImage}
                  loading='lazy'
                />
                {slide.title && (
                  <p className={styles['slide-title']}>{slide.title}</p>
                )}
                {slide.name && (
                  <p className={styles['slide-title']}>{slide.name}</p>
                )}
                {slide.price && (
                  <p className={styles['slide-price']}>
                    ${slide.price.toFixed(2)}
                  </p>
                )}
              </Link>
            </div>
          ))}
          {viewMoreLink && (
            <div className={styles.viewMoreItem}>
              <Link to={viewMoreLink} className={styles.viewMoreLink}>
                <span>View More</span>
                <FontAwesomeIcon icon={faArrowCircleRight} />
              </Link>
            </div>
          )}
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

export default HorizontalSlider;
