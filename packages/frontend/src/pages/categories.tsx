import { motion } from 'framer-motion';
import { useGetCategoriesQuery } from '../features/categories/categoriesAPI';
import CategoriesSlider from '../components/category/categoriesSlider';
import ErrorBoundary from '../components/others/ErrorBoundary';
import Seo from '../components/others/Seo';
import styles from '../styles/pages/categories.module.scss';
import Loader from '../components/others/Loader';

const Categories = () => {
  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: fetchCategoriesError,
  } = useGetCategoriesQuery();

  if (isLoadingCategories) {
    return (
      <>
        <Seo
          title='Loading categories | Monexo'
          description="We're fetching the available categories for you."
          keywords='monexo, categorires, loading, online shopping'
          robots='noindex, nofollow'
        />
        <motion.main
          className='main'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Loader text='Loading categories…' marginTop={10} />
        </motion.main>
      </>
    );
  }

  if (fetchCategoriesError) {
    throw fetchCategoriesError;
  }

  return (
    <>
      <Seo
        title={'Explore categories | Monexo'}
        description={'Browse the best products with exclusive deals at Monexo.'}
        keywords={'monexo, shop online, deals'}
      />
      <motion.main
        className='main'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <header className={styles.header}>
          <h1 className={styles.title}>Explore categories</h1>
        </header>
        {categories?.map((category, i) => {
          if (i == 0) {
            return (
              <ErrorBoundary
                message={`Unable to load ${category.name}. Please try again later`}
                key={category._id}
                fallback
              >
                <CategoriesSlider
                  category={category.name}
                  title={category.name}
                  link={`/products?category=${category.name}`}
                  firstCategory
                />
              </ErrorBoundary>
            );
          }
          return (
            <ErrorBoundary
              message={`Unable to load ${category.name}. Please try again later`}
              key={category._id}
              fallback
            >
              <CategoriesSlider
                category={category.name}
                title={category.name}
                link={`/products?category=${category.name}`}
              />
            </ErrorBoundary>
          );
        })}
      </motion.main>
    </>
  );
};

export default Categories;
