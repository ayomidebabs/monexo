import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, Outlet, Link, ScrollRestoration } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faShoppingCart,
  faBars,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { useGetSearchSuggestionsQuery } from '../../features/search/searchApi';
import CreateAccountModal from '../../components/authModals/signUpModal';
import SignInModal from '../../components/authModals/SignInModal';
import SignInSuccessModal from '../../components/authModals/signInSuccessModal';
import { setTheme } from '../../features/theme/themeSlice';
import { modalContext } from '../../context/modalContext';
import type { RootState } from '../../app/store';
import Offcanvas from '../common/OffCanvas';
import { selectAllCartItems } from '../../features/cart/cartSlice';
import SignoutButton from '../Buttons/SignoutButton';
import AppModal from '../common/appModal';
import Footer from './Footer';
import BottomNav from './bottomNavMobile';
import CheckoutInfoModal from '../checkoutInfoModal';
import styles from '../../styles/components/Navbar.module.scss';

const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: '-0.625rem', scale: 0.95 },
  visible: {
    opacity: 1,
    y: '0rem',
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: '-0.625rem',
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: '-0.5rem' },
  visible: (i: number) => ({
    opacity: 1,
    x: '0rem',
    transition: {
      delay: i * 0.05,
      duration: 0.2,
      ease: 'easeOut',
    },
  }),
  exit: { opacity: 0, x: '-0.5rem', transition: { duration: 0.15 } },
};

const NavBar: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignInSuccessModal, setShowSignInSuccessModal] = useState(false);
  const [showAppmodal, setShowAppModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [appModalMessage, setAppModalMessage] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.theme);
  const effectiveTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;
  const user = useSelector((state: RootState) => state.auth.user);
  const accountDropdownMobileRef = useRef<HTMLDivElement>(null);
  const accountDropdownDesktopRef = useRef<HTMLDivElement>(null);
  const accountDropdownOverlayMobileRef = useRef<HTMLDivElement>(null);
  const accountDropdownOverlayDesktopRef = useRef<HTMLDivElement>(null);
  const offcanvasToggleOverlayRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const cartItemCount = useSelector((state: RootState) =>
    selectAllCartItems(state).reduce((sum, item) => sum + item.quantity, 0)
  );
  const { data: suggestions = [], isFetching: isFetchingSuggestions } =
    useGetSearchSuggestionsQuery(
      { search },
      {
        skip: !search,
      }
    );

  const toggleOffcanvas = useCallback(() => {
    setIsOffcanvasOpen((prev) => !prev);
  }, []);

  const toggleAccount = useCallback(() => {
    setIsAccountOpen((prev) => !prev);
  }, []);

  const handleToggleTheme = useCallback(() => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  }, [dispatch, effectiveTheme]);

  const closeSearchDropdown = useCallback(() => {
    setIsSearchDropdownOpen(false);
  }, []);

  const handleSearchFocus = () => {
    if (!search) return;
    setIsSearchDropdownOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setIsSearchDropdownOpen(!!e.target.value);
  };

  const accountMenu = useMemo(
    () => (
      <AnimatePresence mode='wait'>
        {isAccountOpen && (
          <motion.div
            className={styles.accountMenu}
            initial='hidden'
            animate='visible'
            exit='exit'
            variants={dropdownVariants}
          >
            {user ? (
              <>
                <motion.div
                  variants={itemVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  className={styles.accountItem}
                >
                  <Link to='/wishlist'>Wishlist</Link>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  className={styles.accountItem}
                >
                  <Link to='/orders'>Order History</Link>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  className={styles.accountItem}
                >
                  <Link to='/payment-methods'>Payment Methods</Link>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  className={styles.accountItem}
                >
                  <SignoutButton
                    setShowAppModal={setShowAppModal}
                    setAppModalMessage={setAppModalMessage}
                  />
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  variants={itemVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  className={styles.accountItem}
                >
                  <button
                    onClick={() => {
                      setShowCreateAccountModal(true);
                    }}
                  >
                    Create Account
                  </button>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  className={styles.accountItem}
                >
                  <button
                    onClick={() => {
                      setShowSignInModal(true);
                    }}
                  >
                    Sign In
                  </button>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  className={styles.accountItem}
                >
                  <Link to='/why-create-account'>Why Create an Account?</Link>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    ),
    [isAccountOpen, user]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
      if (
        accountDropdownMobileRef.current &&
        !accountDropdownMobileRef.current.contains(event.target as Node) &&
        event.target !== accountDropdownOverlayMobileRef.current &&
        event.target !== accountDropdownOverlayDesktopRef.current
      ) {
        setIsAccountOpen(false);
      }
      if (
        accountDropdownDesktopRef.current &&
        !accountDropdownDesktopRef.current.contains(event.target as Node) &&
        event.target !== accountDropdownOverlayDesktopRef.current
      ) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <ScrollRestoration />
      <motion.header
        className={`${styles.mobileHeader} header`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <nav className={styles.nav}>
          <div className={styles['logo-div']}>
            <button
              className={styles.navbarToggle}
              aria-controls='navbar-nav'
              aria-label='Toggle categories menu'
            >
              <div
                className={styles.overlay}
                ref={offcanvasToggleOverlayRef}
                onClick={toggleOffcanvas}
              ></div>
              <FontAwesomeIcon icon={faBars} />
            </button>

            <NavLink
              to='/'
              className={({ isActive }) =>
                `${styles.logoLink} ${isActive ? styles.active : ''}`
              }
              aria-label='Go to homepage'
              end
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 6250 3125'
                className={styles.logo}
              >
                <defs>
                  <clipPath id='id0'>
                    <path d='M1593.75 1089.03l1181.8 0 0 1181.8 -1181.8 -0 0 -1181.8z' />
                  </clipPath>
                </defs>
                <g id='Layer_x0020_1'>
                  <metadata id='CorelCorpID_0Corel-Layer' />
                  <g id='_2527114405968'>
                    <g></g>
                    <g clip-path='url(#id0)'>
                      <g id='_2527114407920'>
                        <g>
                          <path
                            id='path34'
                            fill='#f68b1e'
                            fill-rule='nonzero'
                            d='M1850.17 1735.63c0,-18.6 22.48,-27.91 35.62,-14.76l13.09 13.07 88.48 88.49c7.83,7.84 8.13,20.37 0.88,28.57 -0.28,0.32 -0.57,0.63 -0.88,0.94l-101.58 101.57c-13.14,13.14 -35.62,3.83 -35.62,-14.76l0 -203.13 0 0zm80.8 535.16l549.93 -549.92c13.14,-13.15 35.63,-3.84 35.63,14.76l0 535.16 256.27 0 0 -1153.91c0,-18.59 -22.48,-27.89 -35.62,-14.74l-539.08 539.08c-0.26,0.25 -0.51,0.5 -0.77,0.74l-0.02 0.03c-8.2,7.36 -20.83,7.11 -28.71,-0.77l-88.48 -88.49 -450.59 -450.59c-13.16,-13.15 -35.62,-3.84 -35.62,14.74l0 1153.91 337.07 0z'
                          />
                        </g>
                        <g>
                          <path
                            id='path36'
                            fill='#EAEAEA'
                            fill-rule='nonzero'
                            d='M1991.85 1829.11c-1.01,-2.42 -2.51,-4.7 -4.48,-6.67l-88.48 -88.49 88.48 88.49c1.97,1.97 3.47,4.25 4.48,6.67l0 0zm191.49 -181.78c0.04,0 0.07,0 0.12,0 -0.05,0 -0.09,0 -0.12,0l0 0zm-0.08 0c-5.32,-0.02 -10.63,-2.06 -14.68,-6.11 4.05,4.04 9.36,6.08 14.68,6.11l0 0zm12.11 -3.82c0.66,-0.47 1.3,-0.98 1.92,-1.52 -0.62,0.54 -1.26,1.05 -1.92,1.52z'
                          />
                        </g>
                        <path
                          id='path38'
                          fill='#f68b1e'
                          fill-rule='nonzero'
                          d='M1988.25 1851.01c5.43,-6.13 6.62,-14.69 3.6,-21.89 -1.01,-2.42 -2.51,-4.7 -4.48,-6.67l-88.48 -88.49 181.22 -181.22 88.48 88.49c4.05,4.04 9.36,6.08 14.68,6.11 0.03,0 0.05,0 0.08,0 0.04,0 0.07,0 0.12,0 4.18,-0.02 8.35,-1.3 11.91,-3.82 0.66,-0.47 1.3,-0.98 1.92,-1.52l-209.05 209.01z'
                        />
                      </g>
                    </g>
                    <polygon
                      fill='none'
                      points='1593.75,1089.03 2775.55,1089.03 2775.55,2270.83 1593.75,2270.83 '
                    />
                    <g transform='matrix(1.0867 0 0 1 -1973.84 975.363)'>
                      <text
                        x='3125'
                        y='1562.5'
                        fill='#f68b1e'
                        font-weight='bold'
                        font-size='316.93px'
                        font-family='inter'
                      >
                        MONEXO
                      </text>
                    </g>
                  </g>
                </g>
              </svg>
            </NavLink>

            <div className={styles.navLinks}>
              <motion.button
                className={styles.themeToggle}
                onClick={handleToggleTheme}
                aria-label={`Switch to ${
                  effectiveTheme === 'light' ? 'dark' : 'light'
                } mode`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <motion.svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  className={styles.themeIcon}
                  animate={{ rotate: effectiveTheme === 'light' ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {effectiveTheme === 'light' ? (
                    <path
                      d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    />
                  ) : (
                    <path
                      d='M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    />
                  )}
                </motion.svg>
              </motion.button>

              <div
                className={`${styles.accountDropdown} accountDropdown`}
                ref={accountDropdownMobileRef}
              >
                <motion.button
                  type='button'
                  className={styles.navLink}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  aria-label='Open account menu'
                >
                  <div
                    className={styles.overlay}
                    ref={accountDropdownOverlayMobileRef}
                    onClick={toggleAccount}
                  ></div>
                  <FontAwesomeIcon icon={faUser} />
                </motion.button>
                {accountMenu}
              </div>

              <NavLink
                to='/cart'
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                aria-label='View cart'
                end
              >
                <motion.div
                  className={styles.cartIcon}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  {cartItemCount > 0 && (
                    <span className={styles.cartBadge}>{cartItemCount}</span>
                  )}
                </motion.div>
              </NavLink>
            </div>
          </div>

          <form className={styles.searchForm}>
            <div className={styles.searchInputWrapper} ref={searchRef}>
              <input
                type='text'
                placeholder='Search for products and brands...'
                className={styles.searchInput}
                value={search}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                aria-label='Search products'
              />
              <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
              <AnimatePresence>
                {isSearchDropdownOpen && (
                  <motion.div
                    className={styles.searchDropdown}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                    variants={dropdownVariants}
                    onMouseLeave={closeSearchDropdown}
                  >
                    {isFetchingSuggestions ? (
                      <div className={styles.loading}>Loading...</div>
                    ) : suggestions.length > 0 ? (
                      <ul className={styles.suggestionsList}>
                        {suggestions.map((suggestion, i) => (
                          <motion.li
                            key={`${suggestion.name}-${suggestion.category}`}
                            className={styles.suggestionItem}
                            variants={itemVariants}
                            custom={i}
                            initial='hidden'
                            animate='visible'
                            exit='exit'
                          >
                            <Link
                              to={`/products?category=${suggestion.category}&search=${suggestion.name}`}
                              className={styles.suggestionLink}
                              onClick={closeSearchDropdown}
                            >
                              {suggestion.name}
                              <span className={styles.category}>
                                (in {suggestion.category})
                              </span>
                            </Link>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <div className={styles.noResults}>No results found</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={styles['category-navLinks']}></div>
          </form>
        </nav>
      </motion.header>

      <motion.header
        className={`${styles.desktopHeader} header`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <nav className={`${styles.nav} nav`}>
          <NavLink
            to='/'
            className={({ isActive }) =>
              `${styles.logoLink} ${isActive ? styles.active : ''}`
            }
            aria-label='Go to homepage'
            end
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 6250 3125'
              className={styles.logo}
            >
              <defs>
                <clipPath id='id0'>
                  <path d='M1593.75 1089.03l1181.8 0 0 1181.8 -1181.8 -0 0 -1181.8z' />
                </clipPath>
              </defs>
              <g id='Layer_x0020_1'>
                <metadata id='CorelCorpID_0Corel-Layer' />
                <g id='_2527114405968'>
                  <g></g>
                  <g clip-path='url(#id0)'>
                    <g id='_2527114407920'>
                      <g>
                        <path
                          id='path34'
                          fill='#f68b1e'
                          fill-rule='nonzero'
                          d='M1850.17 1735.63c0,-18.6 22.48,-27.91 35.62,-14.76l13.09 13.07 88.48 88.49c7.83,7.84 8.13,20.37 0.88,28.57 -0.28,0.32 -0.57,0.63 -0.88,0.94l-101.58 101.57c-13.14,13.14 -35.62,3.83 -35.62,-14.76l0 -203.13 0 0zm80.8 535.16l549.93 -549.92c13.14,-13.15 35.63,-3.84 35.63,14.76l0 535.16 256.27 0 0 -1153.91c0,-18.59 -22.48,-27.89 -35.62,-14.74l-539.08 539.08c-0.26,0.25 -0.51,0.5 -0.77,0.74l-0.02 0.03c-8.2,7.36 -20.83,7.11 -28.71,-0.77l-88.48 -88.49 -450.59 -450.59c-13.16,-13.15 -35.62,-3.84 -35.62,14.74l0 1153.91 337.07 0z'
                        />
                      </g>
                      <g>
                        <path
                          id='path36'
                          fill='#EAEAEA'
                          fill-rule='nonzero'
                          d='M1991.85 1829.11c-1.01,-2.42 -2.51,-4.7 -4.48,-6.67l-88.48 -88.49 88.48 88.49c1.97,1.97 3.47,4.25 4.48,6.67l0 0zm191.49 -181.78c0.04,0 0.07,0 0.12,0 -0.05,0 -0.09,0 -0.12,0l0 0zm-0.08 0c-5.32,-0.02 -10.63,-2.06 -14.68,-6.11 4.05,4.04 9.36,6.08 14.68,6.11l0 0zm12.11 -3.82c0.66,-0.47 1.3,-0.98 1.92,-1.52 -0.62,0.54 -1.26,1.05 -1.92,1.52z'
                        />
                      </g>
                      <path
                        id='path38'
                        fill='#f68b1e'
                        fill-rule='nonzero'
                        d='M1988.25 1851.01c5.43,-6.13 6.62,-14.69 3.6,-21.89 -1.01,-2.42 -2.51,-4.7 -4.48,-6.67l-88.48 -88.49 181.22 -181.22 88.48 88.49c4.05,4.04 9.36,6.08 14.68,6.11 0.03,0 0.05,0 0.08,0 0.04,0 0.07,0 0.12,0 4.18,-0.02 8.35,-1.3 11.91,-3.82 0.66,-0.47 1.3,-0.98 1.92,-1.52l-209.05 209.01z'
                      />
                    </g>
                  </g>
                  <polygon
                    fill='none'
                    points='1593.75,1089.03 2775.55,1089.03 2775.55,2270.83 1593.75,2270.83 '
                  />
                  <g transform='matrix(1.0867 0 0 1 -1973.84 975.363)'>
                    <text
                      x='3125'
                      y='1562.5'
                      fill='#f68b1e'
                      font-weight='bold'
                      font-size='316.93px'
                      font-family='inter'
                    >
                      MONEXO
                    </text>
                  </g>
                </g>
              </g>
            </svg>
          </NavLink>

          <form className={styles.searchForm}>
            <div className={styles.searchInputWrapper} ref={searchRef}>
              <input
                type='text'
                placeholder='Search for products and brands...'
                className={styles.searchInput}
                value={search}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                aria-label='Search products'
              />
              <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
              <AnimatePresence>
                {isSearchDropdownOpen && (
                  <motion.div
                    className={styles.searchDropdown}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                    variants={dropdownVariants}
                    onMouseLeave={closeSearchDropdown}
                  >
                    {isFetchingSuggestions ? (
                      <div className={styles.loading}>Loading...</div>
                    ) : suggestions.length > 0 ? (
                      <ul className={styles.suggestionsList}>
                        {suggestions.map((suggestion, i) => (
                          <motion.li
                            key={`${suggestion.name}-${suggestion.category}`}
                            className={styles.suggestionItem}
                            variants={itemVariants}
                            custom={i}
                            initial='hidden'
                            animate='visible'
                            exit='exit'
                          >
                            <Link
                              to={`/products?category=${suggestion.category}&search=${suggestion.name}`}
                              className={styles.suggestionLink}
                              onClick={closeSearchDropdown}
                            >
                              {suggestion.name}{' '}
                              <span className={styles.category}>
                                (in {suggestion.category})
                              </span>
                            </Link>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <div className={styles.noResults}>No results found</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>

          <div className={styles.navLinks}>
            <div
              className={`${styles.accountDropdown} accountDropdown`}
              ref={accountDropdownDesktopRef}
            >
              <motion.button
                type='button'
                className={styles.navLink}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                aria-label='Open account menu'
              >
                <div
                  className={styles.overlay}
                  ref={accountDropdownOverlayDesktopRef}
                  onClick={toggleAccount}
                ></div>
                <FontAwesomeIcon icon={faUser} />
              </motion.button>
              {accountMenu}
            </div>
            <NavLink
              to='/cart'
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              aria-label='View cart'
              end
            >
              <motion.div
                className={styles.cartIcon}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <FontAwesomeIcon icon={faShoppingCart} />
                {cartItemCount > 0 && (
                  <span className={styles.cartBadge}>{cartItemCount}</span>
                )}
              </motion.div>
            </NavLink>
            <motion.button
              className={styles.themeToggle}
              onClick={handleToggleTheme}
              aria-label={`Switch to ${
                effectiveTheme === 'light' ? 'dark' : 'light'
              } mode`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <motion.svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                className={styles.themeIcon}
                animate={{ rotate: effectiveTheme === 'light' ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                {effectiveTheme === 'light' ? (
                  <path
                    d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  />
                ) : (
                  <path
                    d='M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  />
                )}
              </motion.svg>
            </motion.button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {showCreateAccountModal && (
          <CreateAccountModal
            onHide={() => setShowCreateAccountModal(false)}
            onSignUpSuccess={() => {
              setShowCreateAccountModal(false);
              setShowSignInModal(true);
            }}
            onSignInIntent={() => {
              setShowCreateAccountModal(false);
              setShowSignInModal(true);
            }}
          />
        )}
        {showSignInModal && (
          <SignInModal
            onHide={() => setShowSignInModal(false)}
            onSignInSuccess={() => {
              setShowSignInModal(false);
              setShowSignInSuccessModal(true);
            }}
            onSignUpIntent={() => {
              setShowSignInModal(false);
              setShowCreateAccountModal(true);
            }}
          />
        )}
        {showSignInSuccessModal && (
          <SignInSuccessModal onHide={() => setShowSignInSuccessModal(false)} />
        )}
        {showAppmodal && <AppModal message={appModalMessage} />}
        {showCheckoutModal && (
          <CheckoutInfoModal
            onHide={() => {
              setShowCheckoutModal(false);
            }}
          />
        )}
      </AnimatePresence>

      <modalContext.Provider
        value={{
          setShowSignInModal,
          setShowCreateAccountModal,
          setShowCheckoutModal,
          setShowAppModal,
          setAppModalMessage,
        }}
      >
        <Outlet />
      </modalContext.Provider>
      <Offcanvas
        isOffcanvasOpen={isOffcanvasOpen}
        setIsOffcanvasOpen={setIsOffcanvasOpen}
        offcanvasToggleOverlayRef={offcanvasToggleOverlayRef}
      />
      <Footer />
      <BottomNav />
    </>
  );
};

export default NavBar;
