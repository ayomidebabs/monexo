import { useGetCategoriesQuery } from '../features/categories/categoriesAPI';
import CategoriesSlider from '../components/common/categoriesSlider';
import SectionHeader from '../components/common/SectionHeader';
import styles from '../styles/pages/categories.module.scss';

const Categories = () => {
  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: fetchCategoriesError,
  } = useGetCategoriesQuery();

  if (isLoadingCategories) {
    return <div>Loading categories...</div>;
  }

  if (fetchCategoriesError) {
    return <div>Failed to load categories. Please try again.</div>;
  }

  return (
    <main className='main'>
      <header className={styles.header}>
        <h1 className={styles.title}>Explore categories</h1>
      </header>
      {categories?.map((category, i) => {
        if (i == 0) {
          return (
            <div
              className={`${styles['categoriesSlider-container']} ${styles['marginTop']}`}
              key={category._id}
            >
              <SectionHeader
                title={category.name}
                link={`/products?category=${category.name}`}
              />
              <CategoriesSlider category={category.name} />
            </div>
          );
        }
        return (
          <div
            className={styles['categoriesSlider-container']}
            key={category._id}
          >
            <SectionHeader
              title={category.name}
              link={`/products?category=${category.name}`}
            />
            <CategoriesSlider category={category.name} />
          </div>
        );
      })}
    </main>
  );
};

export default Categories;
