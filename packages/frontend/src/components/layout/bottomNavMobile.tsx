import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-regular-svg-icons';
import { faTh, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { LuShoppingCart } from 'react-icons/lu';
import { RiHome9Line } from 'react-icons/ri';
import { NavLink } from 'react-router-dom';
import { BiCategory } from 'react-icons/bi';
import styles from '../../styles/components/bottomNavMobile.module.scss';

const BottomNav: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY) {
      setVisible(false);
    } else {
      setVisible(true);
    }
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, handleScroll]);

  return (
    <nav className={`${styles.bottomNav} ${visible ? styles.visible : ''}`}>
      <NavLink
        to={'/categories'}
        className={({ isActive }) =>
          isActive
            ? `${styles['active-link']} ${styles.section}`
            : styles.section
        }
        aria-label='View categories'
        end
      >
        <BiCategory />
        <div className={styles.sectionText}>Categories</div>
      </NavLink>

      <NavLink
        to={'/'}
        className={({ isActive }) =>
          isActive
            ? `${styles['active-link']} ${styles.section}`
            : styles.section
        }
        aria-label='Go to homepage'
        end
      >
        <RiHome9Line />
        <div className={styles.sectionText}>Home</div>
      </NavLink>

      <NavLink
        to={'/cart'}
        className={({ isActive }) =>
          isActive
            ? `${styles['active-link']} ${styles.section}`
            : styles.section
        }
        aria-label='View cart'
        end
      >
        <LuShoppingCart />
        <div className={styles.sectionText}>Cart</div>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
