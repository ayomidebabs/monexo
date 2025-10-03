import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from '../../styles/components/SectionHeader.module.scss';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  link?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  link,
}) => {
  return (
    <motion.div
      className={styles.sectionHeader}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={styles.title}>{title}</h2>
      {link && (
        <Link to={link} className={styles.viewAll}>
          View All
        </Link>
      )}
    </motion.div>
  );
};

export default SectionHeader;
