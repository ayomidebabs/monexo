import React, { useEffect } from 'react';
import {
  useAddRecentlyViewedMutation,
  useLazyGetRecentlyViewedQuery,
  type RecentlyViewedProduct,
} from '../../features/recentlyViewed/recentlyviewedAPI';
import {
  addLocalRecentlyViewedProduct,
  getLocalRecentlyViewedProducts,
} from '../../utils/recentlyViewed';
import HorizontalSlider from './HorizontalSlider';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import RecentlyViewedSkeleton from '../skeletons/RecentlyViewedSkeleton';
import type { Product } from '../../features/products/productAPI';
import styles from '../../styles/pages/home.module.scss';

const RecentlyViewedSection: React.FC<{
  productDetailPage?: boolean;
  product?: Product;
}> = ({ productDetailPage, product }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = React.useState<
    RecentlyViewedProduct[]
  >([]);
  const [addRecentlyViewedProductServer] = useAddRecentlyViewedMutation();
  const [
    getServerRecentlyViewedProducts,
    { isLoading: isLoadingRecentlyViewed, error: fetchRecentlyViewedError },
  ] = useLazyGetRecentlyViewedQuery();

  useEffect(() => {
    if (productDetailPage) {
      if (product) {
        const productData = {
          id: product._id,
          name: product.name,
          price: product.price,
          imageSrc: product.images[0] || '',
          imageAlt: product.description,
          link: `/product-detail/${product._id}`,
        };

        if (user) {
          (async () => {
            try {
              await addRecentlyViewedProductServer(productData).unwrap();
              setRecentlyViewedProducts(
                await getServerRecentlyViewedProducts().unwrap()
              );
            } catch (error) {
              void error;
            }
          })();
        } else {
          addLocalRecentlyViewedProduct(productData);
          setRecentlyViewedProducts(getLocalRecentlyViewedProducts());
        }
      }
    } else if (user) {
      getServerRecentlyViewedProducts()
        .unwrap()
        .then(setRecentlyViewedProducts)
        .catch((error) => void error);
    } else {
      setRecentlyViewedProducts(getLocalRecentlyViewedProducts());
    }
  }, [
    user,
    addRecentlyViewedProductServer,
    productDetailPage,
    product,
    getServerRecentlyViewedProducts,
  ]);

  if (isLoadingRecentlyViewed) return <RecentlyViewedSkeleton />;
  if (fetchRecentlyViewedError) throw fetchRecentlyViewedError;

  return (
    recentlyViewedProducts.length > 0 && (
      <div className={styles['HorizontalSlider-container']}>
        <HorizontalSlider
          slides={recentlyViewedProducts}
          title='Recently Viewed'
        />
      </div>
    )
  );
};

export default RecentlyViewedSection;
