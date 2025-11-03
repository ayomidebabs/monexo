import styles from '../../styles/skeletons/ProductSliderSkeleton.module.scss';

const RecentlyViewedSkeleton = () => (
  <div className={styles['skeleton-slider']}>
    <div className={styles['skeleton-header']}>
      <div className={styles['skeleton-title']} style={{ width: '180px' }} />
    </div>
    <div className={styles['skeleton-cards']}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className={styles['skeleton-card']}>
          <div className={styles['skeleton-image']} />
          <div className={styles['skeleton-line']} />
        </div>
      ))}
    </div>
  </div>
);

export default RecentlyViewedSkeleton;
