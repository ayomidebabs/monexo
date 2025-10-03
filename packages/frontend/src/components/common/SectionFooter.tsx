import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import styles from '../../styles/components/SectionFooter.module.scss';

interface SectionFooterProps {
  title: string;
  link: string;
}

const SectionFooter: React.FC<SectionFooterProps> = ({ title, link }) => {
  return (
    <Link to={link}>
      <motion.div
        className={styles.sectionFooter}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className={styles.title}>{title}</h2>
        <FontAwesomeIcon icon={faArrowCircleRight} />
      </motion.div>
    </Link>
  );
};

export default SectionFooter;
