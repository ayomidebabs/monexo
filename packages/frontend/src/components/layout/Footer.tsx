import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSubscribeNewsletterMutation } from '../../features/newsletter/newsletterAPI';
import styles from '../../styles/components/footer.module.scss';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subscribeNewsletter, { isLoading }] = useSubscribeNewsletterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await subscribeNewsletter({ email }).unwrap();
      setMessage('Subscribed successfully!');
      setEmail('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to subscribe. Try again.'
      );
    }
  };

  return (
    <footer className={`${styles.footer} footer`}>
      <div className={`${styles.footerContent} content`}>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Monexo</h3>
          <p className={styles.footerText}>
            Shop the best products with unbeatable deals.
          </p>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Quick Links</h3>
          <ul className={styles.footerLinks}>
            <li>
              <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <NavLink
                  to='/'
                  className={({ isActive }) =>
                    `${styles.footerLink} ${isActive ? styles.active : ''}`
                  }
                  aria-current='page'
                >
                  Home
                </NavLink>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <NavLink
                  to='/shop'
                  className={({ isActive }) =>
                    `${styles.footerLink} ${isActive ? styles.active : ''}`
                  }
                  aria-current='page'
                >
                  Shop
                </NavLink>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <NavLink
                  to='/about'
                  className={({ isActive }) =>
                    `${styles.footerLink} ${isActive ? styles.active : ''}`
                  }
                  aria-current='page'
                >
                  About
                </NavLink>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <NavLink
                  to='/contact'
                  className={({ isActive }) =>
                    `${styles.footerLink} ${isActive ? styles.active : ''}`
                  }
                  aria-current='page'
                >
                  Contact
                </NavLink>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <NavLink
                  to='/privacy'
                  className={({ isActive }) =>
                    `${styles.footerLink} ${isActive ? styles.active : ''}`
                  }
                  aria-current='page'
                >
                  Privacy Policy
                </NavLink>
              </motion.div>
            </li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Stay Connected</h3>
          <div className={styles.socialIcons}>
            <motion.a
              href='https://twitter.com'
              aria-label='Follow us on Twitter'
              whileHover={{ scale: 1.2, rotate: 360 }}
              transition={{ duration: 0.3 }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                className={styles.socialIcon}
              >
                <path
                  d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
                  fill='currentColor'
                />
              </svg>
            </motion.a>
            <motion.a
              href='https://instagram.com'
              aria-label='Follow us on Instagram'
              whileHover={{ scale: 1.2, rotate: 360 }}
              transition={{ duration: 0.3 }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                className={styles.socialIcon}
              >
                <path
                  d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.148 3.227-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.148-4.771-1.691-4.919-4.919-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.948-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'
                  fill='currentColor'
                />
              </svg>
            </motion.a>
            <motion.a
              href='https://facebook.com'
              aria-label='Follow us on Facebook'
              whileHover={{ scale: 1.2, rotate: 360 }}
              transition={{ duration: 0.3 }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                className={styles.socialIcon}
              >
                <path
                  d='M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z'
                  fill='currentColor'
                />
              </svg>
            </motion.a>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Newsletter</h3>
          <form className={styles.newsletterForm} onSubmit={handleSubmit}>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email'
              className={styles.newsletterInput}
              aria-label='Email for newsletter'
              required
            />
            <motion.button
              type='submit'
              className={styles.newsletterButton}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe
            </motion.button>
          </form>
          {message && <p className={styles.newsletterMessage}>{message}</p>}
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Contact Us</h3>
          <p className={styles.footerText}>
            Email:{' '}
            <a href='mailto:support@yourecommerce.com'>
              support@yourecommerce.com
            </a>
          </p>
          <p className={styles.footerText}>Phone: +1 (800) 123-4567</p>
        </div>
      </div>
      <div className={`${styles.footerBottom} container`}>
        <p>
          &copy; {new Date().getFullYear()} Your E-Commerce. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
