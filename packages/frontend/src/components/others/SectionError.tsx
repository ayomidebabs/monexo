import styles from '../../styles/components/Error.module.scss';

const SectionError = ({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) => (
  <div className={styles['sectionError-container']}>
    <p>{message || 'Unable to load this section'}</p>
    {onRetry && (
      <button onClick={onRetry} className={styles['retry-btn']}>
        Try Again
      </button>
    )}
  </div>
);

export default SectionError;
