import { useCart } from '../context/CartContext';
import NavBar from './NavBar';
import '../styles/CartPage.css';

const CartPage = ({ user, onNavigate, onLogout }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, calculateTotals } = useCart();
  const totals = calculateTotals();

  const handleLogoClick = () => {
    window.scrollTo(0, 0);
    onNavigate('home');
  };

  if (cart.items.length === 0) {
    return (
      <div className="cart-page">
        <NavBar user={user} onLogoClick={handleLogoClick} onNavigate={onNavigate} />
        <div className="cart-container">
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add items from restaurants to get started</p>
            <button
              className="continue-shopping-btn"
              onClick={() => onNavigate('map')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <NavBar user={user} onLogoClick={handleLogoClick} onNavigate={onNavigate} />

      <div className="cart-container">
        <div className="cart-header">
          <h1>Order from {cart.businessName}</h1>
          <button className="clear-cart-btn" onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            <h2>Items ({cart.items.length})</h2>
            <div className="cart-items-list">
              {cart.items.map(item => (
                <div key={item.itemId} className="cart-item">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.dishName} className="item-image-cart" />
                  )}

                  <div className="item-details">
                    <h3>{item.dishName}</h3>
                    <div className="item-pricing">
                      {item.discountPercentage > 0 ? (
                        <>
                          <span className="original-price">
                            ${item.price.toFixed(2)}
                          </span>
                          <span className="discount-badge">
                            -{item.discountPercentage}%
                          </span>
                          <span className="price">
                            ${(
                              item.price *
                              (1 - item.discountPercentage / 100)
                            ).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="price">${item.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  <div className="item-controls">
                    <button
                      className="qty-btn"
                      onClick={() =>
                        updateQuantity(item.itemId, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="qty-input"
                      value={item.quantity}
                      onChange={e =>
                        updateQuantity(
                          item.itemId,
                          parseInt(e.target.value) || 1
                        )
                      }
                      min="1"
                    />
                    <button
                      className="qty-btn"
                      onClick={() =>
                        updateQuantity(item.itemId, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    ${(
                      item.price *
                      item.quantity *
                      (1 - item.discountPercentage / 100)
                    ).toFixed(2)}
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.itemId)}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>

            {totals.totalDiscount > 0 && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span>-${totals.totalDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>${totals.tax.toFixed(2)}</span>
            </div>

            <div className="summary-row total">
              <span>Total</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>

            <button className="checkout-btn">
              Proceed to Checkout
            </button>

            <button
              className="continue-shopping-btn"
              onClick={() => onNavigate('businessDetail', cart.businessId)}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;