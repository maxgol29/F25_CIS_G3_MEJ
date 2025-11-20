import { useCart } from '../context/CartContext';
import '../styles/CartFooter.css';

const CartFooter = ({ onNavigate, businessId, businessName }) => {
  const { itemCount, cart } = useCart();
  if (itemCount === 0 || cart.businessId !== businessId) {
    return null;
  }

  return (
    <div className="cart-footer">
      <div className="cart-footer-content">
        <div className="cart-footer-info">
          <h3>{cart.businessName}</h3>
          <p>{itemCount} item{itemCount !== 1 ? 's' : ''} selected</p>
        </div>
        <button 
          className="cart-footer-btn"
          onClick={() => onNavigate('cart')}
        >
          View Cart
        </button>
      </div>
    </div>
  );
};

export default CartFooter;