import HorizontalSlider from '../others/HorizontalSlider';
import { useGetProductsQuery } from '../../features/products/productAPI';
import ProductSliderSkeleton from '../skeletons/ProductSliderSkeleton';
import styles from '../../styles/pages/home.module.scss';

const ProductSection = ({
  title,
  category,
  link,
  search = 'a',
}: {
  title: string;
  category: string;
  link: string;
  search?: string;
}) => {
  const { data, isLoading, error } = useGetProductsQuery({
    page: 1,
    limit: 10,
    category,
    search,
  });

  if (isLoading) return <ProductSliderSkeleton />;
  if (error) throw error;

  const products =
    data?.products.map((product) => ({
      id: product._id,
      imageSrc: product.images[0],
      imageAlt: product.description,
      link: `/product-detail/${product._id}`,
      title: product.name,
      price: product.price,
      stock: product.stock,
    })) ?? [];

  return (
    products.length > 0 && (
      <div className={styles['HorizontalSlider-container']}>
        <HorizontalSlider
          slides={products}
          viewMoreLink={link}
          title={title}
          link={link}
        />
      </div>
    )
  );
};

export default ProductSection;
