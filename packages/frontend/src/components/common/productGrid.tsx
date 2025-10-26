import React, { useState } from 'react';
import ProductCard from '../product/ProductCard';
import { useGetProductsQuery } from '../../features/products/productAPI';
import styles from '../../styles/components/ProductGrid.module.scss';

interface ProductGridProps {
  category?: string;
  search?: string;
  limit: number;
  page: number;
  handlePageChange: (newPage: number, totalPages: number) => void;
  setTotalProducts: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const ProductGrid: React.FC<Partial<ProductGridProps>> = ({
  category,
  limit,
  search,
  page,
  handlePageChange,
  setTotalProducts,
}) => {
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const {
    data,
    isLoading: isLoadingProducts,
    error: fetchProductsError,
  } = useGetProductsQuery({
    page,
    category,
    search,
    limit,
    sortBy,
    sortOrder,
  });

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;
  const hasNextPage = data?.hasNextPage || false;
  const hasPrevPage = data?.hasPrevPage || false;

  const handleSortBy = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    handlePageChange!(1, totalPages);
  };

  const handleSortOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'asc' | 'desc');
    handlePageChange!(1, totalPages);
  };

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

  setTotalProducts!(data.total);

  return (
    <>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor='sortBy'>Sort by:</label>
          <select
            className={styles.select}
            id='sortBy'
            onChange={handleSortBy}
            value={sortBy}
          >
            <option value='price'>Price</option>
            <option value='createdAt'>Newest in</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor='sortOrder'>Order:</label>
          <select
            className={styles.select}
            id='sortOrder'
            onChange={handleSortOrder}
            value={sortOrder}
          >
            <option value='desc'>Descending</option>
            <option value='asc'>Ascending</option>
          </select>
        </div>
      </div>
      <div className={styles.gridContainer}>
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      <div className={styles.pagination}>
        <p>
          Page {data.page} of {totalPages}
        </p>
        <button
          onClick={() => handlePageChange!(data.page - 1, totalPages)}
          disabled={!hasPrevPage}
          aria-label='Previous page'
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange!(data.page + 1, totalPages)}
          disabled={!hasNextPage}
          aria-label='Next page'
        >
          Next
        </button>
      </div>
    </>
  );
};

export default ProductGrid;
