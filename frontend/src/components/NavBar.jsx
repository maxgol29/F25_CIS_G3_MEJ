import { useState, useEffect } from 'react';
import '../styles/NavBar.css';

const NavBar = ({ user, onLogoClick, onNavigate }) => {
  const [activeOrder, setActiveOrder] = useState(null);
  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchActiveOrder = async () => {
      if (user.role === 'owner') return;

      try {
        const response = await fetch(`${REACT_APP_API_BASE_URL}/orders/user/${user.id}`);
        
        if (response.ok) {
          const data = await response.json();
          const activeOrders = data.orders?.filter(order => order.status !== 'completed');
          if (activeOrders && activeOrders.length > 0) {
            setActiveOrder(activeOrders[0]);
          } else {
            setActiveOrder(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch active order:', err);
      }
    };

    fetchActiveOrder();
    const interval = setInterval(fetchActiveOrder, 10000);
    return () => clearInterval(interval);
  }, [user, REACT_APP_API_BASE_URL]);

  const handleNavigation = (page, params) => {
    if (onNavigate) {
      onNavigate(page, params);
    }
  };

  const isOwner = user && (user.user_type === 'owner' || user.role === 'owner' || user.business_id);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={onLogoClick}>
          localPromo
        </div>

        {isOwner ? (
          <ul className="nav-menu">
            <li className="nav-item owner-dropdown">
                  <button className="nav-link nav-button" onClick={() => handleNavigation('dashboard')}>
                    Dashboard
                  </button>
                  <button className="nav-link nav-button" onClick={() => handleNavigation('ownerMenu')}>
                    Manage Menu
                  </button>
                  <button className="nav-link nav-button" onClick={() => handleNavigation('ownerOrders')}>
                    Orders
                  </button>
                  <button className="nav-link nav-button" onClick={() => handleNavigation('ownerPromos')}>
                    Promos
                  </button>
            </li>
          </ul>
        ) : (
          <ul className="nav-menu">
            <li className="nav-item">
              <button 
                className="nav-link nav-button" 
                onClick={() => handleNavigation('home')}
              >
                Home
              </button>
            </li>
            <li className="nav-item">
              <button 
                className="nav-link nav-button" 
                onClick={() => handleNavigation('map')}
              >
                Map
              </button>
            </li>
            <li className="nav-item">
              <button 
                className="nav-link nav-button" 
                onClick={() => handleNavigation('browse')}
              >
                Browse
              </button>
            </li>
            <li className="nav-item">
              <button 
                className="nav-link nav-button" 
                onClick={() => handleNavigation('profile')}
              >
                Me
              </button>
            </li>
            <li className="nav-item cart-item-nav-link">
              <button 
                className="nav-link nav-button" 
                onClick={() => handleNavigation('cart')}
              >
                Cart
              </button>
            </li>
            <li className="nav-item">
              <button 
                className="nav-link nav-button" 
                onClick={() => handleNavigation('orderHistory')}
              >
                History
              </button>
            </li>

            {activeOrder && (
              <li className="nav-item order-item">
                <button 
                  className="nav-link nav-button active-order-link" 
                  onClick={() => handleNavigation('orderConfirmation', activeOrder.id)}
                >
                  Active Order
                </button>
              </li>
            )}
          </ul>
        )}

        <div className="navbar-user">
          Welcome, {user.last_name}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;