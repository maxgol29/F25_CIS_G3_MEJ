import React, { useEffect, useState } from 'react';
import '../styles/OwnerOrders.css';
import NavBar from './NavBar';

const OwnerOrders = ({ user, onNavigate }) => {
  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

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

  const handleStatusClick = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${REACT_APP_API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update order status (${res.status})`);
      }
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      setSuccess(`Order #${orderId} marked as ${newStatus}`);
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('Status update error:', err);
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const isStatusDisabled = (currentStatus, targetStatus) => {
    if (currentStatus === 'completed' || currentStatus === 'declined') {
      return true;
    }
    if (currentStatus === targetStatus) {
      return true;
    }
    
    return false;
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
                    <strong>Order #{o.id}</strong> {o.status?.toUpperCase() || 'unknown'} ${o.total_amount}
                    <div className="order-items">
                      {o.items && o.items.map((it, idx) => (
                        <div key={idx} className="order-line">{it.dish_name || it.name || 'item'} x {it.quantity || 1}</div>
                      ))}
                    </div>
                  </div>
                  <div className="order-actions">
                    <button 
                      onClick={() => handleStatusClick(o.id, 'confirmed')}
                      disabled={isStatusDisabled(o.status, 'confirmed') || updatingOrderId === o.id}
                      title={isStatusDisabled(o.status, 'confirmed') ? 'Cannot perform this action' : 'Confirm order'}
                    >
                      {updatingOrderId === o.id ? 'Updating...' : 'Confirmed'}
                    </button>
                    <button 
                      onClick={() => handleStatusClick(o.id, 'Preparing')}
                      disabled={isStatusDisabled(o.status, 'Preparing') || updatingOrderId === o.id}
                      title={isStatusDisabled(o.status, 'Preparing') ? 'Cannot perform this action' : 'Prepare order'}
                    >
                      {updatingOrderId === o.id ? 'Updating...' : 'Preparing'}
                    </button>
                    <button 
                      onClick={() => handleStatusClick(o.id, 'Ready')}
                      disabled={isStatusDisabled(o.status, 'Ready') || updatingOrderId === o.id}
                      title={isStatusDisabled(o.status, 'Ready') ? 'Cannot perform this action' : 'Mark as ready'}
                    >
                      {updatingOrderId === o.id ? 'Updating...' : 'Ready'}
                    </button>
                    <button 
                      onClick={() => handleStatusClick(o.id, 'Completed')}
                      disabled={isStatusDisabled(o.status, 'Completed') || updatingOrderId === o.id}
                      title={isStatusDisabled(o.status, 'Completed') ? 'Cannot perform this action' : 'Mark as completed'}
                    >
                      {updatingOrderId === o.id ? 'Updating...' : 'Completed'}
                    </button>
                    <button 
                      onClick={() => handleStatusClick(o.id, 'Cancelled')}
                      disabled={isStatusDisabled(o.status, 'Cancelled') || updatingOrderId === o.id}
                      title={isStatusDisabled(o.status, 'Cancelled') ? 'Cannot perform this action' : 'Mark as cancelled'}
                    >
                      {updatingOrderId === o.id ? 'Updating...' : 'Declined'}
                    </button>
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
