import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../../components/product/ProductGrid';
import ErrorBoundary from '../../components/others/ErrorBoundary';
import SectionError from '../../components/others/SectionError';
import Seo from '../../components/others/Seo';
import styles from '../../styles/pages/productsPage.module.scss';

interface QueryParams {
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
}

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalProducts, setTotalProducts] = useState<number>(0);

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
    <motion.main
      className='main'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <header className={styles.header}>
        {(() => {
          if (effectiveSearch && effectiveCategory) {
            if (totalProducts)
              return (
                <>
                  <Seo
                    title={`Shop ${effectiveSearch} in ${effectiveCategory} - Best Deals Online | Monexo`}
                    description={`Browse the best ${effectiveCategory} products with exclusive deals at Monexo.`}
                    keywords={`${effectiveSearch} ${effectiveCategory}, monexo, shop online, deals`}
                  />
                  <h1 className={styles.title2}>
                    Search {totalProducts > 1 ? 'Results' : 'Result'} for{' '}
                    {`"${effectiveSearch}"`}
                  </h1>
                </>
              );
            return (
              <Seo
                title={`Shop ${effectiveSearch} in ${effectiveCategory} - Best Deals Online | Monexo`}
                description={`Browse the best ${effectiveCategory} products with exclusive deals at Monexo.`}
                keywords={`${effectiveSearch} ${effectiveCategory}, monexo, shop online, deals`}
              />
            );
          } else if (effectiveCategory) {
            if (totalProducts)
              return (
                <>
                  <Seo
                    title={`Shop ${effectiveCategory} - Best Deals Online | Monexo`}
                    description={`Browse the best ${effectiveCategory} products with exclusive deals at Monexo.`}
                    keywords={`${effectiveCategory}, monexo, shop online, deals`}
                  />
                  <h1 className={styles.title1}>{effectiveCategory}</h1>
                </>
              );
            return (
              <Seo
                title={`Shop ${effectiveCategory} - Best Deals Online | Monexo`}
                description={`Browse the best ${effectiveCategory} products with exclusive deals at Monexo.`}
                keywords={`${effectiveCategory}, monexo, shop online, deals`}
              />
            );
          }
        })()}
      </header>

      <ErrorBoundary
        fallback={
          <SectionError
            message='Failed to load products'
            onRetry={() => window.location.reload()}
          />
        }
      >
        <ProductGrid
          category={effectiveCategory}
          search={effectiveSearch}
          limit={queryParams.limit}
          page={queryParams.page}
          handlePageChange={handlePageChange}
          setTotalProducts={setTotalProducts}
        />
      </ErrorBoundary>
    </motion.main>
  );
};

export default ProductsPage;
