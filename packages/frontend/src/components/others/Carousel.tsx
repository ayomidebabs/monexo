import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/components/Carousel.module.scss';

interface CarouselProps {
  images: { imageSrc: string; imageAlt: string; link?: string }[];
}

const Carousel: React.FC<CarouselProps> = ({ images }) => {
  const isMultiple = images.length > 1;
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isInteracting = useRef(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const startAutoSlide = useCallback(() => {
    if (!isMultiple) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextSlide, 3000);
  }, [isMultiple, nextSlide]);

  const pauseAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoSlide]);

  useEffect(() => {
    if (!trackRef.current) return;
    trackRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
  }, [currentIndex]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current || !isMultiple) return;
    isDragging.current = true;
    isInteracting.current = true;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeft.current = trackRef.current.scrollLeft;
    pauseAutoSlide();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    trackRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!trackRef.current || !isMultiple) return;
    isDragging.current = false;
    isInteracting.current = false;
    snapToSlide();
    startAutoSlide();
  };

  const handleTouchStart = () => {
    isInteracting.current = true;
    pauseAutoSlide();
  };

  const handleTouchEnd = () => {
    if (!isMultiple) return;
    isInteracting.current = false;
    snapToSlide();
    startAutoSlide();
  };

  const snapToSlide = () => {
    if (!trackRef.current || !isMultiple) return;
    const slideWidth = trackRef.current.offsetWidth;
    const scrollPosition = trackRef.current.scrollLeft;
    const newIndex = Math.round(scrollPosition / slideWidth);
    setCurrentIndex(newIndex % images.length);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isMultiple) return;
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    },
    [isMultiple, nextSlide, prevSlide]
  );

  useEffect(() => {
    const track = trackRef.current;
    track?.addEventListener('keydown', handleKeyDown);
    return () => track?.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    pauseAutoSlide();
    setTimeout(startAutoSlide, 5000);
  };

  return (
    <div
      className={styles.carouselWrapper}
      onMouseEnter={pauseAutoSlide}
      onMouseLeave={startAutoSlide}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.carouselContainer}>
        <div
          ref={trackRef}
          className={styles.carouselTrack}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          tabIndex={0}
          aria-label='Product carousel'
        >
          {images.map((image, index) => (
            <div key={index} className={styles.carouselItem}>
              {image.link ? (
                <Link to={image.link} className={styles.imageLink}>
                  <img
                    src={image.imageSrc}
                    alt={image.imageAlt}
                    className={styles.carouselImage}
                    loading='lazy'
                  />
                </Link>
              ) : (
                <img
                  src={image.imageSrc}
                  alt={image.imageAlt}
                  className={styles.carouselImage}
                  loading='lazy'
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.thumbnails}>
        {images.map((image, index) => (
          <button
            key={index}
            className={`${styles.thumbnailButton} ${
              index === currentIndex ? styles.active : ''
            }`}
            onClick={() => handleThumbnailClick(index)}
            aria-label={`Go to slide ${index + 1}`}
          >
            <img
              src={image.imageSrc}
              alt={`${image.imageAlt} thumbnail`}
              className={styles.thumbnailImage}
              loading='lazy'
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
