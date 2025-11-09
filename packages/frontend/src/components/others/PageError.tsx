import { motion } from 'framer-motion';
import styles from '../../styles/components/Error.module.scss';
import Seo from './Seo';

const PageError = ({ onRetry }: { onRetry?: () => void }) => (
  <motion.main
    className='main'
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2, duration: 0.4 }}
  >
    <Seo
      title={'Error | Monexo - Online Shopping'}
      description={
        'Sorry, an error occurred. Try again or browse exclusive deals on Monexo.'
      }
      keywords={'monexo, online shopping, deals, error'}
      robots='noindex, nofollow'
    />
    <div className={styles['pageError-container']}>
      <p>Unable to load the requested page.</p>

      <button onClick={onRetry} className={styles['retry-btn']}>
        Try Again
      </button>
    </div>
  </motion.main>
);

export default PageError;
