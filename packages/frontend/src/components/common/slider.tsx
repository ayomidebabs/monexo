import React, { useState, useEffect, useRef } from 'react';
import styles from '../../styles/components/Slider.module.scss';

interface Slide {
  id: number;
  content: React.ReactNode;
}

const Slider: React.FC = () => {
  const slides: Slide[] = [
    {
      id: 1,
      content: (
        <div className={styles.slideContent}>
          <div className={styles.slideText}>
            <h2>FLASH SALE</h2>
            <p>Raymond, Arrow, Mufti...</p>
            <p className={styles.offer}>Min. 55% Off</p>
            <p>T-Shirts, Shirts, Jeans...</p>
            <div className={styles.bankOffers}>
              <p>Up to $5,000 Instant Discount</p>
            </div>
          </div>
          <div className={styles.slideImage1}></div>
        </div>
      ),
    },
    {
      id: 2,
      content: (
        <div className={styles.slideContent}>
          <div className={styles.slideText}>
            <h2>SPECIAL OFFER</h2>
            <p>
              VelvetDream 3-Seater, ZenRest Platform Bed, LuxeComfort
              Sectional...
            </p>
            <p className={styles.offer}>Up to 70% Off</p>
            <p>Sofas, Beds...</p>
          </div>
          <div className={styles.slideImage2}></div>
        </div>
      ),
    },
    {
      id: 3,
      content: (
        <div className={styles.slideContent}>
          <div className={styles.slideText}>
            <h2>SUMMER SALE</h2>
            <p>TechPro Ultrabook X1, NoteMate Pro, ChronoCraft Classic...</p>
            <p className={styles.offer}>Min. 60% Off</p>
            <p>Laptops, Smartphones, Wristwaches...</p>
          </div>
          <div className={styles.slideImage3}></div>
        </div>
      ),
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAutoAdvance = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const autoAdvance = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    scheduleAutoAdvance();
  };

  const scheduleAutoAdvance = () => {
    clearAutoAdvance();
    timeoutRef.current = setTimeout(autoAdvance, 3000);
  };

  useEffect(() => {
    scheduleAutoAdvance();
    return () => clearAutoAdvance();
  }, [slides.length]);

  const goToPrevious = () => {
    clearAutoAdvance();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
    scheduleAutoAdvance();
  };

  const goToNext = () => {
    clearAutoAdvance();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    scheduleAutoAdvance();
  };

  const goToSlide = (index: number) => {
    clearAutoAdvance();
    setCurrentIndex(index);
    scheduleAutoAdvance();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    clearAutoAdvance();
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      scheduleAutoAdvance();
      return;
    }
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    } else {
      scheduleAutoAdvance();
    }
  };

  return (
    <div
      className={styles.sliderContainer}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={styles.sliderWrapper}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className={styles.slide}>
            {slide.content}
          </div>
        ))}
      </div>

      <button
        className={styles.navArrow + ' ' + styles.prev}
        onClick={goToPrevious}
      >
        &lt;
      </button>
      <button
        className={styles.navArrow + ' ' + styles.next}
        onClick={goToNext}
      >
        &gt;
      </button>

      <div className={styles.navDots}>
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => goToSlide(index)}
            className={`${styles.dot} ${
              currentIndex === index ? styles.active : ''
            }`}
          >
            {currentIndex === index && <div className={styles.fillBar}></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
