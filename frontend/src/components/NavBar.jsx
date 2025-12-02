import { useState, useEffect } from 'react';
import styles from '../styles/NavBar.module.css';

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
          const activeOrders = data.orders?.filter(order => order.status !== 'completed' && order.status !== 'cancelled');
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
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.navbarLogo} onClick={onLogoClick}>
          localPromo
        </div>

        {isOwner ? (
          <ul className={styles.navMenu}>
            <li className={`${styles.navItem} ${styles.ownerDropdown}`}>
                  <button className={`${styles.navLink} ${styles.navButton}`} onClick={() => handleNavigation('dashboard')}>
                    Dashboard
                  </button> 
                  <button className={`${styles.navLink} ${styles.navButton}`} onClick={() => handleNavigation('ownerMenu')}>
                    Manage Menu
                  </button>
                  <button className={`${styles.navLink} ${styles.navButton}`} onClick={() => handleNavigation('ownerOrders')}>
                    Orders
                  </button>
                  <button className={`${styles.navLink} ${styles.navButton}`} onClick={() => handleNavigation('ownerPromos')}>
                    Promos
                  </button>
            </li>
          </ul>
        ) : (
          <ul className={styles.navMenu}>
            <li className={styles.navItem}>
              <button 
                className={`${styles.navLink} ${styles.navButton}`} 
                onClick={() => handleNavigation('home')}
              >
                Home
              </button>
            </li>
            <li className={styles.navItem}>
              <button 
                className={`${styles.navLink} ${styles.navButton}`} 
                onClick={() => handleNavigation('map')}
              >
                Map
              </button>
            </li>
            <li className={styles.navItem}>
              <button 
                className={`${styles.navLink} ${styles.navButton}`} 
                onClick={() => handleNavigation('browse')}
              >
                Browse
              </button>
            </li>
            <li className={styles.navItem}>
              <button 
                className={`${styles.navLink} ${styles.navButton}`} 
                onClick={() => handleNavigation('profile')}
              >
                Me
              </button>
            </li>
            <li className={`${styles.navItem} ${styles.cartItemNav}`}>
              <button 
                className={`${styles.navLink} ${styles.navButton}`} 
                onClick={() => handleNavigation('cart')}
              >
                Cart
              </button>
            </li>
            <li className={styles.navItem}>
              <button 
                className={`${styles.navLink} ${styles.navButton}`} 
                onClick={() => handleNavigation('orderHistory')}
              >
                History
              </button>
            </li>

            {activeOrder && (
              <li className={styles.navItem}>
                <button 
                  className={`${styles.navLink} ${styles.navButton} ${styles.activeOrderLink}`} 
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