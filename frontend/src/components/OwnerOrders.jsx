import React, { useEffect, useState } from 'react';
import '../styles/OwnerOrders.css';
import NavBar from './NavBar';

const OwnerOrders = ({ user, onNavigate }) => {
  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user || !user.id) {
          setError('No user available');
          return;
        }

        const res = await fetch(`${REACT_APP_API_BASE_URL}/orders/business/${user.business_id}`);
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error(err);
        setError('Could not load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleStatusClick = (orderId, newStatus) => {
    alert(`Order status update to "${newStatus}" is not available: backend endpoint required.`);
  };

  return (
    <div className="owner-orders-page">
      <NavBar user={user} onLogoClick={() => onNavigate('home')} onNavigate={onNavigate} />
      <h2>Orders</h2>
      {loading ? <p>Loading...</p> : null}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="orders-list">
          {orders.length === 0 ? <p>No orders found.</p> : (
            <ul>
              {orders.map((o) => (
                <li key={o.id} className="order-item">
                  <div>
                    <strong>Order #{o.id}</strong> — {o.status || 'unknown'} — ${o.total_amount}
                    <div className="order-items">
                      {o.items && o.items.map((it, idx) => (
                        <div key={idx} className="order-line">{it.dish_name || it.name || 'item'} x {it.quantity || 1}</div>
                      ))}
                    </div>
                  </div>
                  <div className="order-actions">
                    <button onClick={() => handleStatusClick(o.id, 'accepted')}>Accept</button>
                    <button onClick={() => handleStatusClick(o.id, 'declined')}>Decline</button>
                    <button onClick={() => handleStatusClick(o.id, 'completed')}>Complete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerOrders;
