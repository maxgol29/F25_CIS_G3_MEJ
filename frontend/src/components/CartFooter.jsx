import { useCart } from '../context/CartContext';
import styles from '../styles/CartFooter.module.css';

const CartFooter = ({ onNavigate, businessId, businessName }) => {
  const { itemCount, cart } = useCart();
  if (itemCount === 0 || cart.businessId !== businessId) {
    return null;
  }

  return (
    <div className={styles.cartFooter}>
      <div className={styles.cartFooterContent}>
        <div className={styles.cartFooterInfo}>
          <h3>{cart.businessName}</h3>
          <p>{itemCount} item{itemCount !== 1 ? 's' : ''} selected</p>
        </div>
        <button 
          className={styles.cartFooterBtn}
          onClick={() => onNavigate('cart')}
        >
          View Cart
        </button>
      </div>
    </div>
  );
};

export default CartFooter;