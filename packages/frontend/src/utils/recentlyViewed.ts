import type { RecentlyViewedProduct } from '../features/recentlyViewed/recentlyviewedAPI';

export const getLocalRecentlyViewedProducts = (): RecentlyViewedProduct[] => {
  try {
    const stored = localStorage.getItem('recentlyViewed');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving recently viewed products:', error);
    return [];
  }
};

export const addLocalRecentlyViewedProduct = (product: RecentlyViewedProduct) => {
  try {
    const stored = localStorage.getItem('recentlyViewed');
    let products: RecentlyViewedProduct[] = stored ? JSON.parse(stored) : [];

    products = products.filter((p) => p.id !== product.id);
    products.unshift(product);

    if (products.length > 10) {
      products = products.slice(0, 10);
    }

    localStorage.setItem('recentlyViewed', JSON.stringify(products));
  } catch (error) {
    console.error('Error saving recently viewed product:', error);
  }
};

export const clearLocalRecentlyViewedProducts = () => {
  try {
    localStorage.removeItem('recentlyViewed');
  } catch (error) {
    console.error('Error clearing recently viewed products:', error);
  }
};
