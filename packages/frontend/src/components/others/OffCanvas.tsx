import React, { useEffect, useRef } from 'react';
import { faTimes, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../styles/components/Offcanvas.module.scss';

interface Props {
  isOffcanvasOpen: boolean;
  setIsOffcanvasOpen: React.Dispatch<React.SetStateAction<boolean>>;
  offcanvasToggleOverlayRef: React.RefObject<HTMLDivElement | null>;
}

const Offcanvas: React.FC<Props> = ({
  isOffcanvasOpen,
  setIsOffcanvasOpen,
  offcanvasToggleOverlayRef,
}) => {
  const offCanvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;

      if (target === offcanvasToggleOverlayRef.current) {
        return;
      } else if (
        offCanvasRef.current &&
        !offCanvasRef.current.contains(target)
      ) {
        setIsOffcanvasOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [offcanvasToggleOverlayRef, setIsOffcanvasOpen]);

  const variants = {
    hidden: { y: '100%' },
    visible: { y: 0 },
    exit: { y: '100%' },
  };

  return (
    <div className={styles.container} ref={offCanvasRef}>
      <AnimatePresence>
        {isOffcanvasOpen && (
          <motion.div
            className={styles.offcanvas}
            initial='hidden'
            animate='visible'
            exit='exit'
            variants={variants}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className={styles['offcanvas-header']}>
              <h2>
                Browse Categories
                <button
                  className={styles['close-btn']}
                  onClick={() => setIsOffcanvasOpen(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </h2>
            </div>
            <ul className={styles['categories-list']}>
              <li>
                <Link to={'/products?category=Fashion'}>
                  Fashion{' '}
                  <span className={styles.arrow}>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </span>
                </Link>
              </li>
              <li>
                <Link to={'/products?category=Electronics'}>
                  Electronics{' '}
                  <span className={styles.arrow}>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </span>
                </Link>
              </li>
              <li>
                <Link to={'/products?category=Furniture'}>
                  Furniture{' '}
                  <span className={styles.arrow}>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </span>
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Offcanvas;
