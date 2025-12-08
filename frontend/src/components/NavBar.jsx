import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import styles from '../styles/NavBar.module.css';

const NavBar = ({ user }) => {
  const [activeOrder, setActiveOrder] = useState(null);
  const navigate = useNavigate();
  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchActiveOrder = async () => {
      if (user.role === 'owner') return;

      try {
        const response = await fetch(`${REACT_APP_API_BASE_URL}/orders/user/${user.id}`);

        if (response.ok) {
          const data = await response.json();
          const activeOrders = data.orders?.filter(
            order => order.status !== 'completed' && order.status !== 'cancelled'
          );
          if (activeOrders?.length > 0) {
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

  const navigateTo = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const isOwner = user && (user.user_type === 'owner' || user.role === 'owner' || user.business_id);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.navbarLogo} onClick={() => navigateTo('/home')}>
          localPromo
        </div>

        {isOwner ? (
          <ul className={styles.navMenu}>
            <li className={`${styles.navItem} ${styles.ownerDropdown}`}>
              <button className={`${styles.navLink} ${styles.navButton}`} onClick={() => navigateTo('/owner/dashboard')}>
                Dashboard
              </button>
              <button className={`${styles.navLink} ${styles.navButton}`} onClick={() => navigateTo('/owner/menu')}>
                Manage Menu
              </button>
              <button className={`${styles.navLink} ${styles.navButton}`} onClick={() => navigateTo('/owner/orders')}>
                Orders
              </button>
              <button className={`${styles.navLink} ${styles.navButton}`} onClick={() => navigateTo('/owner/promos')}>
                Promos
              </button>
            </li>
          </ul>
        ) : (
          <ul className={styles.navMenu}>
            <li className={styles.navItem}>
              <button className={`${styles.navLink} ${styles.navButton}`} onClick={() => navigateTo('/map')}>
                Map
              </button>
            </li>
            <li className={styles.navItem}>
              <button className={`${styles.navLink} ${styles.navButton}`} onClick={() => navigateTo('/browse')}>
                Browse
              </button>
            </li>
            <li className={styles.navItem}>
              <button className={`${styles.navLink} ${styles.navButton}`} onClick={() => navigateTo('/order-history')}>
                History
              </button>
            </li>
            <li className={`${styles.navItem} ${styles.cartItemNav}`}>
              <button className={`${styles.navLink} ${styles.navButton}`} onClick={() => navigateTo('/cart')}>
                Cart
              </button>
            </li>
            <li className={styles.navItem}>
              <button className={`${styles.navLink} ${styles.navButton}`} onClick={() => navigateTo('/profile')}>
                Profile
              </button>
            </li>

            {activeOrder && (
              <li className={styles.navItem}>
                <button
                  className={`${styles.navLink} ${styles.navButton} ${styles.activeOrderLink}`}
                  onClick={() => navigateTo(`/order/${activeOrder.id}`)}
                >
                  Active Order
                </button>
              </li>
            )}
          </ul>
        )}

        <div className={styles.navbarUser}>
          Welcome, {user.last_name}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
