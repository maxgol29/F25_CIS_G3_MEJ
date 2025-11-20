import React, { useEffect, useState } from 'react';
import '../styles/OwnerOrders.css';

const API_BASE = process.env.API_BASE_URL || '';

const OwnerOrders = ({ user, onNavigate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Note: backend does not expose orders by business; fallback to user orders if needed
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user || !user.id) {
          setError('No user available');
          return;
        }

        // fallback: fetch orders for this user
        const res = await fetch(`${API_BASE}/orders/user/${user.id}`);
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
    // Backend currently has no order status update endpoint.
    alert(`Order status update to "${newStatus}" is not available: backend endpoint required.`);
  };

  return (
    <div className="owner-orders-page">
      <h2>Owner Orders</h2>
      <p className="muted">Note: backend lacks an orders-by-business endpoint. Showing user orders as fallback.</p>

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

      <div style={{ marginTop: 20 }}>
        <button onClick={() => onNavigate && onNavigate('owner')}>Back to Dashboard</button>
      </div>
    </div>
  );
};

export default OwnerOrders;
