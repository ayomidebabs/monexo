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

const AppRoutes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [getServercart] = useLazyGetCartQuery();

  useEffect(() => {
    if (user) {
      (async function () {
        try {
          console.log('setting cart server');
          dispatch(setCart(await getServercart().unwrap()));
        } catch (error) {
          console.error((error as Error).message);
        }
      })();
    } else {
      console.log('setting cart local');
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
          element: <ProductDetailPage />,
        },
        {
          path: '/products',
          element: <ProductsPage />,
        },
        {
          path: '/categories',
          element: <CategoriesPage />,
        },
        {
          path: '/cart',
          element: <CartPage />,
        },
        {
          path: '/orders',
          element: <OrderHistory />,
        },
        {
          path: '/checkout',
          element: <CheckoutPage />,
        },
        {
          path: '/wishlist',
          element: <WishlistPage />,
        },
        {
          path: '/payment-methods',
          element: <SavedPaymentMethods />,
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
