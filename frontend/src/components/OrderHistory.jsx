import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import styles from '../styles/OrderHistory.module.css';
import { useNavigate } from 'react-router-dom';

const OrderHistory = ({ user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.id) return;

      try {
        setLoading(true);
        const response = await fetch(`${REACT_APP_API_BASE_URL}/orders/user/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, REACT_APP_API_BASE_URL]);

  const filteredOrders = orders.filter(order => {
    if (filter === 'completed') {
      return order.status === 'completed';
    } else if (filter === 'processing') {
      return ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status);
    }
    return true; 
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return '{styles.statusCompleted}';
      case 'ready':
        return '{styles.statusReady}';
      case 'preparing':
        return '{styles.statusPreparing}';
      case 'confirmed':
        return '{styles.statusConfirmed}';
      case 'pending':
        return '{styles.statusPending}';
      case 'cancelled':
        return '{styles.statusCancelled}';
      default:
        return '{styles.statusPending}';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className={styles.orderHistoryPage}>
        <NavBar user={user} onLogoClick={() => navigate('/home')} />
        <div className={styles.historyContainer}>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.orderHistoryPage}>
        <NavBar user={user} onLogoClick={() => navigate('/home')} />
        <div className={styles.historyContainer}>
          <div className={styles.errorBox}>
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/home')} className={styles.backBtn}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.orderHistoryPage}>
      <NavBar user={user} onLogoClick={() => navigate('/home')} />

      <div className={styles.historyContainer}>
        <div className={styles.historyContent}>
          <div className={styles.historyHeader}>
            <h1>Order History</h1>
            <p>{sortedOrders.length} {sortedOrders.length === 1 ? 'order' : 'orders'}</p>
          </div>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterBtn} ${filter === `${styles.all}` ? `${styles.active}` : ''}`}
              onClick={() => setFilter('all')}
            >
              All Orders
            </button>
            <button
              className={`${styles.filterBtn} ${filter === `${styles.processing}` ? `${styles.active}`: ''}`}
              onClick={() => setFilter('processing')}
            >
              Processing
            </button>
            <button
              className={`${styles.filterBtn} ${filter === `${styles.completed}` ? `${styles.active}` : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
          {sortedOrders.length === 0 ? (
            <div className={styles.emptyOrders}>
              <h2>No orders yet</h2>
              <p>Start by ordering from your favorite restaurants!</p>
              <button 
                onClick={() => navigate('/map')}
                className={styles.actionBtn}
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {sortedOrders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderCardHeader}>
                    <div className={styles.orderInfo}>
                      <h3>Order #{order.id}</h3>
                      <p className={styles.orderDate}>
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className={styles.orderStatus}>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.businessSection}>
                    <h4>{order.businessName}</h4>
                  </div>
                  <div className={styles.itemsSection}>
                    {order.items && order.items.length > 0 ? (
                      <div className={styles.itemsDetails}>
                        {order.items.map((item, idx) => (
                          <p key={idx} className={styles.itemLine}>
                            {item.name} <span className={styles.itemQty}>x{item.quantity}</span>
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.itemsCount}>No items</p>
                    )}
                  </div>
                  <div className={styles.orderCardFooter}>
                    <div className={styles.total}>
                      <span className={styles.label}>Total:</span>
                      <span className={styles.amount}>${parseFloat(order.total_amount).toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/order/${order.id}`)}
                      className={styles.viewDetailsBtn}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;