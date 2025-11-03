import React, { useEffect } from 'react';
import {
  useLazyGetRecentlyViewedQuery,
  type RecentlyViewedProduct,
} from '../../features/recentlyViewed/recentlyviewedAPI';
import { getLocalRecentlyViewedProducts } from '../../utils/recentlyViewed';
import HorizontalSlider from './HorizontalSlider';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import RecentlyViewedSkeleton from '../skeletons/RecentlyViewedSkeleton';
import styles from '../../styles/pages/home.module.scss';

const RecentlyViewedSection: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = React.useState<
    RecentlyViewedProduct[]
  >([]);
  const [getServerRecentlyViewed, { isLoading, error }] =
    useLazyGetRecentlyViewedQuery();

  useEffect(() => {
    if (user) {
      getServerRecentlyViewed()
        .unwrap()
        .then(setRecentlyViewedProducts)
        .catch(() => setRecentlyViewedProducts([]));
    } else {
      setRecentlyViewedProducts(getLocalRecentlyViewedProducts());
    }
  }, [user, getServerRecentlyViewed]);

  if (isLoading) return <RecentlyViewedSkeleton />;
  if (error) throw error;
  console.log(recentlyViewedProducts);
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
