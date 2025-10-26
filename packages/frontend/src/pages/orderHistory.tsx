import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import {
  useGetUserOrdersQuery,
  type Order,
} from '../features/orders/ordersAPI';
import styles from '../styles/pages/orderHistory.module.scss';

const OrderHistory: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const {
    data,
    isLoading: isLoadingOrders,
    error: fetchOrdersError,
  } = useGetUserOrdersQuery({
    page,
    status,
    limit,
    sortBy,
    sortOrder,
  });

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;
  const hasNextPage = data?.hasNextPage || false;
  const hasPrevPage = data?.hasPrevPage || false;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value || undefined);
    setPage(1);
  };

  const handleSortBy = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleSortOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'asc' | 'desc');
    setPage(1);
  };

  const renderOrderCard = (order: Order, index: number) => (
    <motion.div
      key={order._id}
      className={styles.orderCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className={styles.orderDetails}>
        <FontAwesomeIcon icon={faShoppingCart} className={styles.orderIcon} />
        <div className={styles.orderInfo}>
          <h3 className={styles.orderId}>Order #{order._id.slice(-6)}</h3>
          <p className={styles.orderDate}>
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <p className={styles.orderStatus}>
            Status: <span className={styles[order.status]}>{order.status}</span>
          </p>
          <p className={styles.orderTotal}>
            Total: {order.currency} {order.total.toFixed(2)}
          </p>
          <div className={styles.orderProducts}>
            <h4>Products:</h4>
            <ul>
              {order.products.map((product) => (
                <li key={product.pId}>
                  {product.name} x{product.quantity} @ {order.currency}{' '}
                  {product.price.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
          <p className={styles.orderPayment}>
            <p>Email: {order.email}</p>
            Payment method: {order.paymentDetails.method}
            <p>
              transaction ID:{' '}
              {order.paymentDetails.transactionId
                ? order.paymentDetails.transactionId
                : ''}
            </p>
          </p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <main className='main'>
      <div className={styles.orderHistory}>
        <header className={styles.header}>
          <h1 className={styles.title}>Order History</h1>
          <p className={styles.subtitle}>View and manage your past orders</p>
        </header>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label htmlFor='statusFilter'>Filter by Status:</label>
            <select
              id='statusFilter'
              className={styles.select}
              onChange={handleStatusFilter}
              value={status || ''}
            >
              <option value=''>All</option>
              <option value='pending'>Pending</option>
              <option value='processing'>Processing</option>
              <option value='shipped'>Shipped</option>
              <option value='delivered'>Delivered</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor='sortBy'>Sort by:</label>
            <select
              className={styles.select}
              id='sortBy'
              onChange={handleSortBy}
              value={sortBy}
            >
              <option value='createdAt'>Date</option>
              <option value='total'>Total</option>
              <option value='status'>Status</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor='sortOrder'>Order:</label>
            <select
              className={styles.select}
              id='sortOrder'
              onChange={handleSortOrder}
              value={sortOrder}
            >
              <option value='desc'>Descending</option>
              <option value='asc'>Ascending</option>
            </select>
          </div>
        </div>

        <AnimatePresence>
          {isLoadingOrders ? (
            <div className={styles.loading}>Loading orders...</div>
          ) : fetchOrdersError ? (
            <motion.p
              className={styles.errorText}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              role='alert'
            >
              Failed to load orders
            </motion.p>
          ) : orders.length > 0 ? (
            <div className={styles.orderSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    className={styles.sectionIcon}
                  />
                  Orders
                  <span className={styles.sectionCount}>
                    ({data?.total || 0})
                  </span>
                </h2>
              </div>
              <div className={styles.orderGrid}>
                {orders.map((order, index) => renderOrderCard(order, index))}
              </div>

              <div className={styles.pagination}>
                <p>
                  Page {data?.page} of {totalPages}
                </p>
                <button
                  onClick={() => handlePageChange((data?.page as number) - 1)}
                  disabled={!hasPrevPage}
                  aria-label='Previous page'
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange((data?.page as number) + 1)}
                  disabled={!hasNextPage}
                  aria-label='Next page'
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No orders found</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default OrderHistory;
