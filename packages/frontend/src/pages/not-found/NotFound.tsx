import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Seo from '../../components/others/Seo';
import styles from '../../styles/pages/notFound.module.scss';

function NotFound() {
  return (
    <>
      <Seo
        title='404 Not Found | Monexo - Online Shopping'
        description="The page you're looking for doesn't exist on Monexo. Browse our exclusive deals, categories, or search for products."
        keywords='monexo, 404 error, page not found, online shopping, deals'
        robots='noindex, nofollow'
      />

      <motion.main
        className='main'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className={styles['notFound-wrapper']}>
          <h2 className={styles.notFoundTitle}>Page not found</h2>
          <Link to='/' className={styles['go-home']}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Go to Home</span>
          </Link>
        </div>
      </motion.main>
    </>
  );
}

export default NotFound;
