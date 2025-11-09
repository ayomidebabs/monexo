import React from 'react';
import ProductCard from '../product/ProductCard';
import type { Product } from '../../features/products/productAPI';
import styles from '../../styles/components/ProductGrid.module.scss';

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
