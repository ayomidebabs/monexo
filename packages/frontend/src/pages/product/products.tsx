import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../../components/common/productGrid';
import styles from '../../styles/pages/ProductsPage.module.scss';

interface QueryParams {
  category?: string;
  search?: string;
  limit: number;
  page: number;
}

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParams = useMemo<QueryParams>(() => {
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');

    return {
      category: categoryParam || undefined,
      search: searchParam || undefined,
      limit: limitParam ? Math.max(1, parseInt(limitParam)) : 10,
      page: pageParam ? Math.max(1, parseInt(pageParam)) : 1,
    };
  }, [searchParams]);

  const effectiveCategory = queryParams.category;
  const effectiveSearch = queryParams.search;

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: newPage.toString(),
    });
  };

  return (
    <main className='main'>
      <h4 className={styles.h2}>
        {effectiveSearch
          ? `Search Results for "${effectiveSearch}"`
          : `${effectiveCategory}`}
      </h4>
      <ProductGrid
        category={effectiveCategory}
        search={effectiveSearch}
        limit={queryParams.limit}
        page={queryParams.page}
        onPageChange={handlePageChange}
      />
    </main>
  );
};

export default ProductsPage;
