import React, { lazy } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../../components/hero/HeroSection';
import Slider from '../../components/others/Slider';
import CategoryGrid from '../../components/category/CategoryGrid';
import SectionFooter from '../../components/others/SectionFooter';
import ProductSection from '../../components/product/ProductSection';
import ErrorBoundary from '../../components/others/ErrorBoundary';
import Seo from '../../components/others/Seo';
import styles from '../../styles/pages/home.module.scss';

const RecentlyViewedSection = lazy(
  () => import('../../components/others/RecentlyViewedSection')
);

const Home: React.FC = () => {
  const categories = [
    {
      imageSrc:
        'https://res.cloudinary.com/ddmupiyzm/image/upload/v1754466779/ecommerce/products/ab08sjeqp7yt6lvjb77x.webp',
      imageAlt:
        'Timeless button-down oxford shirt made from premium cotton. Ideal for both work and casual wear.',
      link: '/products?category=Fashion',
      category: 'Fashion',
    },

    {
      imageSrc:
        'https://res.cloudinary.com/ddmupiyzm/image/upload/v1754462294/ecommerce/products/atyzhsjrnf8vbvzmdcwt.webp',
      imageAlt: 'High-performance gaming laptop with RTX graphics.',
      link: '/products?category=Electronics',
      category: 'Electronics',
    },

    {
      imageSrc:
        'https://res.cloudinary.com/ddmupiyzm/image/upload/v1754465805/ecommerce/products/k3scapvglpsrwlps7thg.webp',
      imageAlt:
        'Elegant velvet-upholstered sofa with button tufting and brass legs.',
      link: '/products?category=Furniture',
      category: 'Furniture',
    },

    {
      imageSrc:
        'https://res.cloudinary.com/ddmupiyzm/image/upload/v1754458839/ecommerce/products/r5qidohpx494zq4wjexg.webp',
      imageAlt: 'Boosted sole for extra energy return and comfort.',
      link: '/products?category=Fashion',
      category: 'Fashion',
    },
    {
      imageSrc:
        'https://res.cloudinary.com/ddmupiyzm/image/upload/v1754466573/ecommerce/products/wcz9lojmzq09huhtocrd.webp',
      imageAlt: 'Elegant dining table with 6 chairs made from oak wood.',
      link: '/products?category=Furniture',
      category: 'Furniture',
    },

    {
      imageSrc:
        'https://res.cloudinary.com/ddmupiyzm/image/upload/v1754466286/ecommerce/products/cnoznz5p9qrvoxcq7kae.jpg',
      imageAlt:
        'A spacious queen-sized bed with a cushioned headboard and solid wooden frame.',
      link: '/products?category=Furniture',
      category: 'Furniture',
    },
    {
      imageSrc:
        'https://res.cloudinary.com/ddmupiyzm/image/upload/v1754464410/ecommerce/products/fsnk4qfxh9n1qea6wegk.webp',
      imageAlt:
        'A spacious queen-sized bed with a cushioned headboard and solid wooden frame.',
      link: '/products?category=Furniture',
      category: 'Furniture',
    },
    {
      imageSrc:
        'https://res.cloudinary.com/ddmupiyzm/image/upload/v1754459968/ecommerce/products/env4varhocay4pxpp1f0.webp',
      imageAlt: 'Touchscreen watch with health tracking and notifications.',
      link: '/products?category=Fashion',
      category: 'Fashion',
    },
  ];

  return (
    <>
      <Seo
        title='Monexo: Shop Premium Products & Deals Online'
        description='Discover premium products and exclusive deals at Monexo, your trusted online store.'
        keywords='monexo, shopping, online store, deals, premium products'
      />
      <motion.main
        className='main'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <HeroSection />
        <ErrorBoundary message='Unable to load Fashion.' fallback>
          <ProductSection
            title='Explore Fashion Trends'
            category='Fashion'
            link='/products?category=Fashion'
          />
        </ErrorBoundary>

        <Slider />

        <div className={styles['category-grid-container']}>
          <CategoryGrid categories={categories} />
          <SectionFooter title='Explore categories' link='/categories' />
        </div>

        <ErrorBoundary message='Unable to load Electronics.' fallback>
          <ProductSection
            title="Discover Top Pc's"
            category='Electronics'
            link='/products?category=Electronics'
          />
        </ErrorBoundary>

        <ErrorBoundary
          message='Unable to load recently viewed products.'
          fallback
        >
          <RecentlyViewedSection />
        </ErrorBoundary>
      </motion.main>
    </>
  );
};

export default Home;
