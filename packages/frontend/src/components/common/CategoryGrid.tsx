import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/components/CategoryGrid.module.scss';

interface Category {
  imageSrc: string;
  imageAlt: string;
  category: string;
  link: string;
}

interface categoryGridProps {
  categories: Category[];
}

const CategoryGrid: React.FC<categoryGridProps> = ({ categories }) => {
  return (
    <div className={styles.categoryGrid}>
      {categories.map((category) => (
        <div key={category.imageSrc} className={styles.gridItem}>
          <Link to={category.link} className={styles.productLink}>
            <img
              src={category.imageSrc}
              alt={category.imageAlt}
              className={styles.productImage}
            />
          </Link>
        </div>
      ))}
    </div>
  );
};

export default CategoryGrid;
