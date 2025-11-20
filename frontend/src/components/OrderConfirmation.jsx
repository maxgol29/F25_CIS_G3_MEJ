import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import '../styles/OrderConfirmation.css';

const OrderConfirmation = ({ orderId, user, onNavigate }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.API_BASE_URL;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
        
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
  }, [orderId, API_BASE_URL]);

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
      <div className="confirmation-page">
        <NavBar user={user} onLogoClick={() => onNavigate('home')} onNavigate={onNavigate} />
        <div className="confirmation-container">
          <div className="error-box">
            <h2>Something went wrong</h2>
            <p>{error || 'Order not found'}</p>
            <button onClick={() => onNavigate('home')} className="home-btn">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <NavBar user={user} onLogoClick={() => onNavigate('home')} onNavigate={onNavigate} />

      <div className="confirmation-container">
        <div className="confirmation-content">
          <div className="confirmation-header">
            <div className="success-animation">
              <div className="checkmark">✓</div>
            </div>
            <h1>Order Confirmed!</h1>
            <p className="order-number">Order #{order.id}</p>
          </div>
          <div className="confirmation-details">
            <div className="status-timeline">
              <h3>Order Status</h3>
              <div className="timeline">
                <div className="timeline-step completed">
                  <div className="timeline-dot">✓</div>
                  <div className="timeline-label">Order Placed</div>
                </div>
                <div className={`timeline-step ${order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready' || order.status === 'completed' ? 'completed' : ''}`}>
                  <div className="timeline-dot">2</div>
                  <div className="timeline-label">Confirmed</div>
                </div>
                <div className={`timeline-step ${order.status === 'preparing' || order.status === 'ready' || order.status === 'completed' ? 'completed' : ''}`}>
                  <div className="timeline-dot">3</div>
                  <div className="timeline-label">Preparing</div>
                </div>
                <div className={`timeline-step ${order.status === 'ready' || order.status === 'completed' ? 'completed' : ''}`}>
                  <div className="timeline-dot">4</div>
                  <div className="timeline-label">Ready</div>
                </div>
                <div className={`timeline-step ${order.status === 'completed' ? 'completed' : ''}`}>
                  <div className="timeline-dot">5</div>
                  <div className="timeline-label">Completed</div>
                </div>
              </div>
            </div>
            <div className="items-summary">
              <h3>Order Items</h3>
              <div className="items-list">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <div className="item-details">
                      <span className="item-name">{item.dishName}</span>
                      <span className="item-qty">x{item.quantity}</span>
                    </div>
                    <span className="item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="price-breakdown">
              <h3>Order Summary</h3>
              <div className="breakdown-row">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="breakdown-row discount">
                  <span>Discount</span>
                  <span>-${order.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="breakdown-row">
                <span>Tax</span>
                <span>${order.tax_amount.toFixed(2)}</span>
              </div>
              <div className="breakdown-row">
                <span>Processing Fee</span>
                <span>${order.processing_fee.toFixed(2)}</span>
              </div>
              <div className="breakdown-row total">
                <span>Total</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="delivery-info">
              <h3>Delivery Information</h3>
              <div className="info-box">
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

            <div className="order-info">
              <p>
                <strong>Order Placed:</strong> {new Date(order.created_at).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong> <span className="status-badge-order">{order.status}</span>
              </p>
            </div>
          </div>

          <div className="confirmation-actions">
            <button 
              onClick={() => onNavigate('orderHistory')}
              className="action-btn secondary"
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