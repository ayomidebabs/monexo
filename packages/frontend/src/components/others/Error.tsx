import styles from '../../styles/components/Error.module.scss';

const Error = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <div className={styles['error-container']}>
    <p>{message}</p>
    {onRetry && (
      <button onClick={onRetry} className={styles['retry-btn']}>
        Try Again
      </button>
    )}
  </div>
);

export default Error;
