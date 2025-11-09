import React from 'react';
import styles from '../../styles/components/Loader.module.scss';

interface LoaderProps {
  size: number;
  marginTop: number;
  color: string;
  text: string;
}

const Loader: React.FC<Partial<LoaderProps>> = ({
  size = 3,
  color = '#f68b1e',
  text,
  marginTop,
}) => {
  return (
    <div
      className={styles.loader}
      style={
        {
          '--loader-size': `${size}rem`,
          '--loader-color': color,
          '--margin-top': `${marginTop}rem`,
        } as React.CSSProperties
      }
    >
      <div className={styles.spinner}></div>
      {text && <p className={styles.loaderText}>{text}</p>}
    </div>
  );
};

export default Loader;
