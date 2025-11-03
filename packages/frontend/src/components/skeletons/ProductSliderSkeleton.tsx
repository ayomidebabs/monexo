import styles from '../../styles/skeletons/ProductSliderSkeleton.module.scss';

const ProductSliderSkeleton = () => (
  <div className={styles['skeleton-slider']}>
    <div className={styles['skeleton-header']}>
      <div className={styles['skeleton-title']} />
      <div className={styles['skeleton-link']} />
    </div>
    <div className={styles['skeleton-cards']}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className={styles['skeleton-card']}>
          <div className={styles['skeleton-image']} />
          <div className={styles['skeleton-line']} />
          <div className={styles['skeleton-line-short']} />
        </div>
      ))}
    </div>
  </div>
);

export default ProductSliderSkeleton;
