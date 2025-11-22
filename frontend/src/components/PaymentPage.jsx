import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import NavBar from './NavBar';
import '../styles/PaymentPage.css';

const PaymentPage = ({ user, onNavigate }) => {
  const { cart, calculateTotals, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'card', 
    promoCode: ''
  });

  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const API_BASE_URL = process.env.API_BASE_URL;

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="payment-page">
        <NavBar user={user} onLogoClick={() => onNavigate('home')} onNavigate={onNavigate} />
        <div className="payment-container">
          <div className="empty-payment">
            <h2>Your cart is empty</h2>
            <p>Please add items before checkout</p>
            <button onClick={() => onNavigate('map')} className="back-btn">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (formData.paymentMethod === 'card') {
      if (!formData.cardName.trim()) {
        setError('Cardholder name is required');
        return false;
      }
      if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{13,19}$/)) {
        setError('Please enter a valid card number');
        return false;
      }
      if (!formData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
        setError('Expiry date must be MM/YY');
        return false;
      }
      if (!formData.cvv.match(/^\d{3,4}$/)) {
        setError('CVV must be 3-4 digits');
        return false;
      }
    }
    return true;
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const applyPromoCode = async () => {
    if (!formData.promoCode.trim()) {
      setError('Please enter a promo code');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/promos/validate`, { // NOT YET IMPLEMENTED
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.promoCode,
          subtotal: totals.subtotal
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPromoDiscount(data.discount_amount || 0);
        setPromoApplied(true);
        setError('');
      } else {
        setError('Invalid promo code');
        setPromoApplied(false);
      }
    } catch (err) {
      setError('Failed to validate promo code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const orderData = {
        userID: user.id,
        businessID: cart.businessId,
        items: cart.items,
        subtotal: totals.subtotal,
        discount_amount: totals.totalDiscount + promoDiscount,
        tax_amount: totals.tax.toFixed(2),
        processing_fee: (totals.subtotal - totals.totalDiscount) * 0.02, // 2% processing fee
        total_amount: totals.total - promoDiscount + ((totals.subtotal - totals.totalDiscount) * 0.02),
        promoCode: promoApplied ? formData.promoCode : null
      };

      const response = await fetch(`${API_BASE_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }
      const result = await response.json();
      clearCart();
      setSuccess(true);
      setTimeout(() => {
        onNavigate('orderConfirmation', result.order.id);
      }, 2000);

    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const finalTotal = totals.total - promoDiscount + (totals.subtotal * 0.02);

  if (success) {
    return (
      <div className="payment-page">
        <NavBar user={user} onLogoClick={() => onNavigate('home')} onNavigate={onNavigate} />
        <div className="payment-container">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <p>Your order has been placed</p>
            <p className="small">Redirecting to confirmation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <NavBar user={user} onLogoClick={() => onNavigate('home')} onNavigate={onNavigate} />

      <div className="payment-container">
        <div className="payment-content">
          <div className="payment-form-section">
            <h1>Checkout</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-section">
                <h3>Payment Method</h3>
                <div className="payment-methods">
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                    />
                    <span>Credit/Debit Card</span>
                  </label>
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleInputChange}
                    />
                    <span>Cash</span>
                  </label>
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="apple_pay"
                      checked={formData.paymentMethod === 'apple_pay'}
                      onChange={handleInputChange}
                    />
                    <span>Apple Pay</span>
                  </label>
                </div>
              </div>

              {formData.paymentMethod === 'card' && (
                <div className="form-section">
                  <h3>Card Details</h3>

                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formatCardNumber(formData.cardNumber)}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        cardNumber: e.target.value.replace(/\s/g, '')
                      }))}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formatExpiryDate(formData.expiryDate)}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          expiryDate: e.target.value
                        }))}
                        placeholder="MM/YY"
                        maxLength="5"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="4"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-section">
                <h3>Promo Code (Optional)</h3>
                <div className="promo-group">
                  <input
                    type="text"
                    name="promoCode"
                    value={formData.promoCode}
                    onChange={handleInputChange}
                    placeholder="Enter promo code"
                    disabled={loading || promoApplied}
                  />
                  {!promoApplied ? (
                    <button
                      type="button"
                      onClick={applyPromoCode}
                      disabled={loading || !formData.promoCode.trim()}
                      className="apply-promo-btn"
                    >
                      Apply
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setPromoApplied(false);
                        setPromoDiscount(0);
                        setFormData(prev => ({ ...prev, promoCode: '' }));
                      }}
                      className="remove-promo-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {promoApplied && (
                  <p className="promo-success">✓ Promo applied: -${promoDiscount.toFixed(2)}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="submit-payment-btn"
              >
                {loading ? 'Processing...' : `Pay $${finalTotal.toFixed(2)}`}
              </button>
            </form>
          </div>
          <div className="order-summary-sidebar">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cart.items.map((item, idx) => (
                <div key={idx} className="summary-item">
                  <div className="item-info">
                    <span className="item-name">{item.dishName}</span>
                    <span className="item-qty">x{item.quantity}</span>
                  </div>
                  <span className="item-price">
                    ${(item.price * item.quantity * (1 - item.discountPercentage / 100)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>

              {totals.totalDiscount > 0 && (
                <div className="total-row discount">
                  <span>Item Discount</span>
                  <span>-${totals.totalDiscount.toFixed(2)}</span>
                </div>
              )}

              {promoDiscount > 0 && (
                <div className="total-row discount">
                  <span>Promo Discount</span>
                  <span>-${promoDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="total-row">
                <span>Tax</span>
                <span>${totals.tax.toFixed(2)}</span>
              </div>

              <div className="total-row">
                <span>Processing Fee (2%)</span>
                <span>${(totals.subtotal * 0.02).toFixed(2)}</span>
              </div>

              <div className="total-row final">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="restaurant-info">
              <h3>{cart.businessName}</h3>
              <p>{cart.items.length} items</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;