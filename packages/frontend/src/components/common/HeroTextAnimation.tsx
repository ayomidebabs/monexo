import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import styles from '../../styles/components/HeroTextAnimation.module.scss';

const phrases = [
  'Discover Amazing Products.',
  'Shop the Latest Trends.',
  'Unbeatable Deals Await.',
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const characterVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const HeroTextAnimation: React.FC = () => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.h1
        key={currentPhraseIndex}
        className={styles.heroText}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        aria-live="polite"
      >
        {phrases[currentPhraseIndex].split('').map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            variants={characterVariants}
            style={{ display: 'inline-block' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.h1>
    </AnimatePresence>
  );
};

export default HeroTextAnimation;