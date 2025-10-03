// src/components/HeroSection.tsx
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import HeroTextAnimation from './HeroTextAnimation';
import styles from '../../styles/components/HeroSection.module.scss';

interface ProductPreview {
  id: string;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  link: string;
  position: { top: string; left: string };
}

const products: ProductPreview[] = [
  {
    id: '1',
    name: 'Premium Headphones',
    price: '$199.99',
    imageSrc:
      'https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/ecommerce/products/headphones.jpg',
    imageAlt: 'Premium Headphones',
    link: '/products/1',
    position: { top: '30%', left: '20%' },
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: '$249.99',
    imageSrc:
      'https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/ecommerce/products/watch.jpg',
    imageAlt: 'Smart Watch',
    link: '/products/2',
    position: { top: '60%', left: '60%' },
  },
];

const HeroSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ target: ref });
  const y = useTransform(scrollY, [0, 300], [0, -100]);

  return (
    <div className={styles.heroSection} ref={ref}>
      <motion.div
        className={styles.background}
        style={{ y }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            className={styles.hotspot}
            style={{ top: product.position.top, left: product.position.left }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 1.2 }}
          >
            <motion.div
              className={styles.preview}
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              whileTap={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Link to={product.link} className={styles.previewLink}>
                <img
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  className={styles.previewImage}
                  loading='lazy'
                />
                <div className={styles.previewDetails}>
                  <h3>{product.name}</h3>
                  <p>{product.price}</p>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
      <div className={styles.textContainer}>
        <HeroTextAnimation />
      </div>
    </div>
  );
};

export default HeroSection;
