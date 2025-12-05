import { useCart } from '../context/CartContext';
import NavBar from './NavBar';
import styles from '../styles/CartPage.module.css';
import { useNavigate } from 'react-router-dom';

const CartPage = ({ user }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, calculateTotals } = useCart();
  const totals = calculateTotals();

  const handleLogoClick = () => {
    window.scrollTo(0, 0);
    navigate('/home');
  };

  if (cart.items.length === 0) {
    return (
      <div className={styles.cartPage}>
        <NavBar user={user} onClick={() => navigate('/home')} />
        <div className={styles.cartContainer}>
          <div className={styles.emptyCart}>
            <h2>Your cart is empty</h2>
            <p>Add items from restaurants to get started</p>
            <button
              className={styles.continueShoppingBtn}
              onClick={() => navigate('/map')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <NavBar user={user} onLogoClick={handleLogoClick} />
      <div className={styles.cartContainer}>
        <div className={styles.cartHeader}>
          <h1>Order from {cart.businessName}</h1>
          <button className={styles.clearCartBtn} onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        <div className={styles.cartContent}>
          {/* Cart Items */}
          <div className={styles.cartItemsSection}>
            <h2>Items ({cart.items.length})</h2>
            <div className={styles.cartItemsList}>
              {cart.items.map(item => (
                <div key={item.itemId} className={styles.cartItem}>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.dishName} className={styles.itemImageCart} />
                  )}

                  <div className={styles.itemDetails}>
                    <h3>{item.dishName}</h3>
                    <div className={styles.itemPricing}>
                      {item.discountPercentage > 0 ? (
                        <>
                          <span className={styles.originalPrice}>
                            ${item.price.toFixed(2)}
                          </span>
                          <span className={styles.discountBadge}>
                            -{item.discountPercentage}%
                          </span>
                          <span className={styles.price}>
                            ${(
                              item.price *
                              (1 - item.discountPercentage / 100)
                            ).toFixed(2)}
                            ${item.price.toFixed(2)}
                          </span>
                          <span className={styles.discountBadge}>
                            -{item.discountPercentage}%
                          </span>
                          <span className={styles.price}>
                            ${(
                              item.price *
                              (1 - item.discountPercentage / 100)
                            ).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className={styles.price}>${item.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.itemControls}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() =>
                        updateQuantity(item.itemId, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className={styles.qtyInput}
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
                      className={styles.qtyBtn}
                      onClick={() =>
                        updateQuantity(item.itemId, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.itemTotal}>
                    ${(
                      item.price *
                      item.quantity *
                      (1 - item.discountPercentage / 100)
                    ).toFixed(2)}
                  </div>

                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.itemId)}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.orderSummary}>
            <h2>Order Summary</h2>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>

            {totals.totalDiscount > 0 && (
              <div className={styles.summaryRow}>
                <span>Discount</span>
                <span>-${totals.totalDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className={styles.summaryRow}>
              <span>Tax (8%)</span>
              <span>${totals.tax.toFixed(2)}</span>
            </div>

            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>

            <button 
              className={styles.checkoutBtn}
              onClick={() => navigate('/payment')}
              disabled={cart.items.length === 0}
            >
              Proceed to Checkout
            </button>

            <button
              className={styles.continueShoppingBtn}
              onClick={() => navigate(`/businessDetail/${cart.businessId}`)}
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