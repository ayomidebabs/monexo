import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import styles from '../../styles/components/AuthModal.module.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';

const SignInSuccessModal: React.FC<{ onHide: () => void }> = ({ onHide }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const timer = setTimeout(() => {
      onHide();
      navigate(window.location.pathname);
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate, onHide, pathname]);

  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={styles.modalContent}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.successMessage}>
            <FontAwesomeIcon icon={faCheckCircle} />
            <p>Welcome {user?.name}, wait a second...</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignInSuccessModal;
