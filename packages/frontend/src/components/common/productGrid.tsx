import React from 'react';
import ProductCard from '../product/ProductCard';
import { useGetProductsQuery } from '../../features/products/productAPI';
import styles from '../../styles/components/ProductGrid.module.scss';

interface ProductGridProps {
  category?: string;
  search?: string;
  limit: number;
  page: number;
  onPageChange: (newPage: number) => void;
}

const ProductGrid: React.FC<Partial<ProductGridProps>> = ({
  category,
  limit,
  search,
  page,
  onPageChange,
}) => {
  const {
    data,
    isLoading: isLoadingProducts,
    error: fetchProductsError,
  } = useGetProductsQuery({
    category,
    search,
    limit,
    page,
  });

  if (isLoadingProducts) {
    return <div className={styles.loading}>Loading products...</div>;
  }

  if (fetchProductsError) {
    return (
      <div className={styles.error}>
        Failed to load products. Please try again.
      </div>
    );
  }

  if (!data || !data.products.length) {
    return (
      <div className={styles.empty}>
        No products found{search ? ` for "${search}"` : ''}.
      </div>
    );
  }

  return (
    <>
      <div className={styles.gridContainer}>
        {data.products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      <div className={styles.pagination}>
        <p>
          Page {data.page} of {data.totalPages}
        </p>
        <button
          onClick={() => onPageChange!(data.page - 1)}
          disabled={!data.hasPrevPage}
          aria-label='Previous page'
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange!(data.page + 1)}
          disabled={!data.hasNextPage}
          aria-label='Next page'
        >
          Next
        </button>
      </div>
    </>
  );
};

export default ProductGrid;
