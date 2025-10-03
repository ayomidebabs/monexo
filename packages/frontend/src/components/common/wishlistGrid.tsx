import React from 'react';
import ProductCard from '../product/ProductCard';
import styles from '../../styles/components/ProductGrid.module.scss';
import type { Product } from '../../features/products/productAPI';

const WishlistGrid: React.FC<{ wishlist: Product[] }> = ({ wishlist }) => {
  return (
    <>
      <div className={styles.gridContainer}>
        {wishlist.map((item) => (
          <ProductCard key={item._id} product={item} forWishlist />
        ))}
      </div>
    </>
  );
};

export default WishlistGrid;
