import { useState, useEffect } from 'react';
import '../styles/NavBar.css';

const NavBar = ({ user, onLogoClick, onNavigate }) => {
  const [activeOrder, setActiveOrder] = useState(null);
  const API_BASE_URL = process.env.API_BASE_URL;

  useEffect(() => {
    const fetchActiveOrder = async () => {
      if (!user || !user.id) return;

      try {
        const response = await fetch(`${API_BASE_URL}/orders/user/${user.id}`);
        
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
  }, [user, API_BASE_URL]);

  const handleNavigation = (page, params) => {
    if (onNavigate) {
      onNavigate(page, params);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={onLogoClick}>
          localPromo
        </div>
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
        <div className="navbar-user">
          Welcome, {user.last_name}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;