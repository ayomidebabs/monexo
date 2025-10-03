import React, { useEffect, useState } from 'react';
import HeroSection from '../../components/common/HeroSection';
// import Carousel from '../../components/common/Carousel';
import Slider from '../../components/common/slider';
import HorizontalSlider from '../../components/common/HorizontalSlider';
import { useGetProductsQuery } from '../../features/products/productAPI';
import SectionHeader from '../../components/common/SectionHeader';
import CategoryGrid from '../../components/common/CategoryGrid';
import SectionFooter from '../../components/common/SectionFooter';
import { useSelector } from 'react-redux';
import {
  useLazyGetRecentlyViewedQuery,
  type RecentlyViewedProduct,
} from '../../features/recentlyViewed/recentlyviewedAPI';
import type { RootState } from '../../app/store';
import { getLocalRecentlyViewedProducts } from '../../utils/recentlyViewed';
import styles from '../../styles/pages/home.module.scss';

const Home: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<
    RecentlyViewedProduct[]
  >([]);
  const [
    getServerRecentlyViewedProducts,
    { isLoading: loadingRecentlyViewed, error: recentlyViewedError },
  ] = useLazyGetRecentlyViewedQuery();

  const {
    data: fashionData,
    isLoading: isFashionDataLoading,
    error: fashionDataError,
  } = useGetProductsQuery({
    page: 1,
    limit: 10,
    category: 'Fashion',
    search: 'a',
  });

  const {
    data: electronicsData,
    isLoading: isElectronicsDataLoading,
    error: electronicsDataerror,
  } = useGetProductsQuery({
    page: 1,
    limit: 10,
    category: 'Electronics',
    search: 'a',
  });

  const fashionProducts = fashionData
    ? fashionData.products.map((product) => ({
        id: product._id,
        imageSrc: product.images[0],
        imageAlt: product.description,
        link: `/product-detail/${product._id}`,
        title: product.name,
        price: product.price,
        stock: product.stock,
      }))
    : [];

  const electronicsProducts = electronicsData
    ? electronicsData.products.map((product) => ({
        id: product._id,
        imageSrc: product.images[0],
        imageAlt: product.description,
        link: `/product-detail/${product._id}`,
        title: product.name,
        price: product.price,
        stock: product.stock,
      }))
    : [];

  useEffect(() => {
    if (user) {
      getServerRecentlyViewedProducts()
        .unwrap()
        .then(
          (data) => setRecentlyViewedProducts(data),
          (error) => console.error('Recently viewed error:', error)
        );
    } else {
      setRecentlyViewedProducts(getLocalRecentlyViewedProducts());
    }
  }, [getServerRecentlyViewedProducts, user]);

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
      <main className='main'>
        <HeroSection />
        {isFashionDataLoading && <p>Loading...</p>}
        {isElectronicsDataLoading && <p>Loading...</p>}

        {fashionDataError && (
          <div className='alert alert-danger'>Failed to load products</div>
        )}
        {electronicsDataerror && (
          <div className='alert alert-danger'>Failed to load products</div>
        )}
        <div className={styles['HorizontalSlider-container']}>
          <SectionHeader
            title='Explore Fashion Trends'
            link='/products?category=Fashion'
          />
          <HorizontalSlider
            slides={fashionProducts}
            viewMoreLink='/products?category=Fashion'
          />
        </div>
        <Slider />

        <div className={styles['category-grid-container']}>
          <CategoryGrid categories={categories} />
          <SectionFooter title='Explore categories' link='/categories' />
        </div>

        <div className={styles['HorizontalSlider-container']}>
          <SectionHeader
            title="Discover Top Pc's"
            link='/products?category=Electronics'
          />
          <HorizontalSlider
            slides={electronicsProducts}
            viewMoreLink='/products?category=Electronics'
          />
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

        {/* <Carousel images={fashionSlides} /> */}
      </main>
    </>
  );
};

export default Home;
