import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../../components/common/productGrid';
import styles from '../../styles/pages/ProductsPage.module.scss';

interface QueryParams {
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
}

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalProducts, setTotalProducts] = useState<number>();

  const queryParams = useMemo<QueryParams>(() => {
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');

    return {
      category: categoryParam || undefined,
      search: searchParam || undefined,
      limit: limitParam ? parseInt(limitParam) : undefined,
      page: pageParam ? parseInt(pageParam) : undefined,
    };
  }, [searchParams]);

  const effectiveCategory = queryParams.category;
  const effectiveSearch = queryParams.search;

  const handlePageChange = (newPage: number, totalPages: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({
        ...Object.fromEntries(searchParams),
        page: newPage.toString(),
      });
    }
  };

  return (
    <main className='main'>
      <header className={styles.header}>
        {(() => {
          if (effectiveSearch && effectiveCategory) {
            if (totalProducts)
              return (
                <h1 className={styles.title2}>
                  Search {totalProducts > 1 ? 'Results' : 'Result'} for{' '}
                  {`"${effectiveSearch}"`}
                </h1>
              );
          } else if (effectiveCategory) {
            return <h1 className={styles.title1}>{effectiveCategory}</h1>;
          }
        })()}
      </header>

      <ProductGrid
        category={effectiveCategory}
        search={effectiveSearch}
        limit={queryParams.limit}
        page={queryParams.page}
        handlePageChange={handlePageChange}
        setTotalProducts={setTotalProducts}
      />
    </main>
  );
};

export default ProductsPage;
