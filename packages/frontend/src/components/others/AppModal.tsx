import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../styles/components/AuthModal.module.scss';

interface AppModalProps {
  message: string;
  onHide?: () => void;
}

const AppModal: React.FC<AppModalProps> = ({ message }) => {
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
          <p>{message}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppModal;
