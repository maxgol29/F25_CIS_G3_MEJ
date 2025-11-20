import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import '../styles/OrderHistory.css';

const OrderHistory = ({ user, onNavigate, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const API_BASE_URL = process.env.API_BASE_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.id) return;

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/orders/user/${user.id}`);
        
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
  }, [user, API_BASE_URL]);

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
        return 'status-completed';
      case 'ready':
        return 'status-ready';
      case 'preparing':
        return 'status-preparing';
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="order-history-page">
        <NavBar user={user} onLogoClick={() => onNavigate('home')} onNavigate={onNavigate} />
        <div className="history-container">
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-page">
        <NavBar user={user} onLogoClick={() => onNavigate('home')} onNavigate={onNavigate} />
        <div className="history-container">
          <div className="error-box">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => onNavigate('home')} className="back-btn">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <NavBar user={user} onLogoClick={() => onNavigate('home')} onNavigate={onNavigate} />

      <div className="history-container">
        <div className="history-content">
          <div className="history-header">
            <h1>Order History</h1>
            <p>{sortedOrders.length} {sortedOrders.length === 1 ? 'order' : 'orders'}</p>
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Orders
            </button>
            <button
              className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
              onClick={() => setFilter('processing')}
            >
              Processing
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
          {sortedOrders.length === 0 ? (
            <div className="empty-orders">
              <h2>No orders yet</h2>
              <p>Start by ordering from your favorite restaurants!</p>
              <button 
                onClick={() => onNavigate('map')}
                className="action-btn"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {sortedOrders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-info">
                      <h3>Order #{order.id}</h3>
                      <p className="order-date">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="order-status">
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                  <div className="business-section">
                    <h4>{order.businessName || 'Unknown Restaurant'}</h4>
                  </div>
                  <div className="items-section">
                    {order.items && order.items.length > 0 ? (
                      <div className="items-details">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="item-line">
                            {item.name} <span className="item-qty">x{item.quantity}</span>
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="items-count">No items</p>
                    )}
                  </div>
                  <div className="order-card-footer">
                    <div className="total">
                      <span className="label">Total:</span>
                      <span className="amount">${parseFloat(order.total_amount).toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => onNavigate('orderConfirmation', order.id)}
                      className="view-details-btn"
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