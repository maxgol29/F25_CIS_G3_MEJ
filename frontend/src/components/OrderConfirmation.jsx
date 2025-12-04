import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import OrderQRCode from './OrderQRCode';
import styles from '../styles/OrderConfirmation.module.css';

const OrderConfirmation = ({ orderId, user, onNavigate }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${REACT_APP_API_BASE_URL}/orders/${orderId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, REACT_APP_API_BASE_URL]);

  if (loading) {
    return (
      <div className="confirmation-page">
        <NavBar user={user} onLogoClick={() => onNavigate('home')} onNavigate={onNavigate} />
        <div className="confirmation-container">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.confirmationPage}>
        <NavBar user={user} onLogoClick={() => onNavigate('home')} onNavigate={onNavigate} />
        <div className={styles.confirmationContainer}>
          <div className={styles.errorBox}>
            <h2>Something went wrong</h2>
            <p>{error || 'Order not found'}</p>
            <button onClick={() => onNavigate('home')} className={styles.homeBtn}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.confirmationPage}>
      <NavBar user={user} onLogoClick={() => onNavigate('home')} onNavigate={onNavigate} />

      <div className={styles.confirmationContainer}>
        <div className={styles.confirmationContent}>
          <div className={styles.confirmationHeader}>
            <h1>Order Confirmed!</h1>
            <p className={styles.orderNumber}>Order #{order.id}</p>
          </div>
          <div className={styles.confirmationDetails}>
            <div className={styles.itemsSummary}>
              <h3>Order Items</h3>
              <div className={styles.itemsList}>
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className={styles.itemRow}>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemName}>{item.dishName}</span>
                      <span className={styles.itemQty}>x{item.quantity}</span>
                    </div>
                    <span className={styles.itemPrice}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.priceBreakdown}>
              <h3>Order Summary</h3>
              <div className={styles.breakdownRow}>
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className={styles.breakdownRow}>
                  <span>Discount</span>
                  <span>-${order.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className={styles.breakdownRow}>
                <span>Tax</span>
                <span>${order.tax_amount.toFixed(2)}</span>
              </div>
                <div className={styles.breakdownRow}>
                  <span>Processing Fee</span>
                  <span>${order.processing_fee.toFixed(2)}</span>
                </div>
              <div className={`${styles.breakdownRow} ${styles.total}`}>
                <span>Total</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <div className={styles.deliveryInfo}>
              <h3>Delivery Information</h3>
              <div className={styles.infoBox}>
                <p>
                  <strong>Pick Up Address:</strong>
                  <br />
                  {order.business?.address?.street} {order.business?.address?.building_number && `#${order.business.address.building_number}`}
                  {order.business?.address?.apartment_number && ` Apt ${order.business.address.apartment_number}`}
                  <br />
                  {order.business?.address?.city}, {order.business?.address?.state} {order.business?.address?.zip_code}
                </p>
                <p>
                  <strong>Estimated Time:</strong>
                  <br />
                  30-45 minutes
                </p>
              </div>
            </div>

            <div className={styles.qrCodeSection}>
              <p className={styles.qrCodeDescription}>Scan to track your order or show at pickup</p>
              <OrderQRCode 
                orderId={order.id}
              />
            </div>

            <div className={styles.orderInfo}>
              <p>
                <strong>Order Placed:</strong> {new Date(order.created_at).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong> <span className={styles.statusBadgeOrder}>{order.status}</span>
              </p>
            </div>
          </div>

          <div className={styles.confirmationActions}>
            <button 
              onClick={() => onNavigate('orderHistory')}
              className={`${styles.actionBtn} ${styles.secondary}`}
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;