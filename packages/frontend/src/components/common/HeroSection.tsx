// src/components/HeroSection.tsx
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import HeroTextAnimation from './HeroTextAnimation';
import { useGetProductQuery } from '../../features/products/productAPI';
import styles from '../../styles/components/HeroSection.module.scss';

const HeroSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ target: ref });
  const y = useTransform(scrollY, [0, 300], [0, -100]);
  const {
    data: airgripSneaker,
    isLoading: isLoadingAirgripSneaker,
    error: fetchAirgripSneakerError,
  } = useGetProductQuery('6892e87abdbad5f6fd0c97e7');

  const {
    data: zenBookSlim,
    isLoading: isLoadingZenBookSlim,
    error: fetchZenBookSlimError,
  } = useGetProductQuery('6892f8c14c29732837ec1a56');

  const products = [
    { ...airgripSneaker, position: { top: '30%', left: '20%' } },
    { ...zenBookSlim, position: { top: '60%', left: '60%' } },
  ];

  return (
    <div className={styles.heroSection} ref={ref}>
      <motion.div
        className={styles.background}
        style={{ y }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {isLoadingAirgripSneaker ||
        isLoadingZenBookSlim ||
        fetchAirgripSneakerError ||
        fetchZenBookSlimError
          ? null
          : products.map((product) => (
              <motion.div
                key={product._id}
                className={styles.hotspot}
                style={{
                  top: product.position?.left,
                  left: product.position?.left,
                }}
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
                  <Link
                    to={`/product-detail/${product._id}`}
                    className={styles.previewLink}
                  >
                    <img
                      src={product.images?.[0]}
                      alt={product.description}
                      className={styles.previewImage}
                      loading='lazy'
                    />
                    <div className={styles.previewDetails}>
                      <h3>{product.name}</h3>
                      <p>
                        {product.price!.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </p>
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
