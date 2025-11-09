import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/components/SectionHeader.module.scss';

interface SectionHeaderProps {
  title?: string;
  subtitle?: string;
  link?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, link }) => {
  return (
    <div className={styles.sectionHeader}>
      <h2 className={styles.title}>{title}</h2>
      {link && (
        <Link to={link} className={styles.viewAll}>
          View All
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
