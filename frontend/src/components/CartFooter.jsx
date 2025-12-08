import { useCart } from '../context/CartContext';
import styles from '../styles/CartFooter.module.css';
import { useNavigate, useParams } from 'react-router-dom';
  
const CartFooter = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { itemCount, cart } = useCart();
  if (itemCount === 0 || cart.businessId !== businessId) {
    return null;
  }
  return (
    <div className={styles.cartFooter}>
      <div className={styles.cartFooterContent}>
        <div className={styles.cartFooterInfo}>
          <h3>{cart.businessName}</h3>
          <p>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''} selected</p>
        </div>
        <button 
          className={styles.cartFooterBtn}
          onClick={() => navigate('/cart')}
        >
          View Cart
        </button>
      </div>
    </div>
  );
};

export default CartFooter;