import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
} from 'react-router-dom';
import Homepage from './pages/home/Home';
import CartPage from './pages/cart/CartPage';
import NotFound from './pages/not-found/NotFound';
import NavBar from './components/layout/Navbar';
import ProductDetailPage from './pages/product/ProductDetail';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from './app/store';
import { setCart } from './features/cart/cartSlice';
import { useLazyGetCartQuery } from './features/cart/cartAPI';
import { useEffect } from 'react';
import { getLocalCart } from './utils/localCartManager';
import ProductsPage from './pages/product/products';
import CategoriesPage from './pages/categories';
import CheckoutPage from './pages/payment/checkout';
import WishlistPage from './pages/wishlist';
import SavedPaymentMethods from './pages/payment/savedPaymentMethods';
import OrderHistory from './pages/orderHistory';
import ScrollToTop from './components/others/ScrollToTop';
import ErrorBoundary from './components/others/ErrorBoundary';

const AppRoutes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [getServercart] = useLazyGetCartQuery();

  useEffect(() => {
    if (user) {
      (async function () {
        try {
          dispatch(setCart(await getServercart().unwrap()));
        } catch (error) {
          console.error((error as Error).message);
        }
      })();
    } else {
      dispatch(setCart(getLocalCart()));
    }
  }, [dispatch, getServercart, user]);

  const router = createBrowserRouter([
    {
      element: (
        <ScrollToTop>
          <ScrollRestoration />
          <NavBar />
        </ScrollToTop>
      ),
      children: [
        {
          path: '/',
          element: <Homepage />,
        },
        {
          path: '/product-detail/:pId',
          element: (
            <ErrorBoundary>
              <ProductDetailPage />
            </ErrorBoundary>
          ),
        },
        {
          path: '/products',
          element: <ProductsPage />,
        },
        {
          path: '/categories',
          element: (
            <ErrorBoundary>
              <CategoriesPage />,
            </ErrorBoundary>
          ),
        },
        {
          path: '/cart',
          element: (
            <ErrorBoundary>
              <CartPage />
            </ErrorBoundary>
          ),
        },
        {
          path: '/orders',
          element: (
            <ErrorBoundary>
              <OrderHistory />
            </ErrorBoundary>
          ),
        },
        {
          path: '/checkout',
          element: (
            <ErrorBoundary>
              <CheckoutPage />
            </ErrorBoundary>
          ),
        },
        {
          path: '/wishlist',
          element: (
            <ErrorBoundary>
              <WishlistPage />
            </ErrorBoundary>
          ),
        },
        {
          path: '/payment-methods',
          element: (
            <ErrorBoundary>
              <SavedPaymentMethods />
            </ErrorBoundary>
          ),
        },
        {
          path: '/*',
          element: <NotFound />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default AppRoutes;
