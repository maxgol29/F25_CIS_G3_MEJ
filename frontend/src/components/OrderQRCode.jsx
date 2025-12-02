import React, { useState, useEffect } from 'react';
import '../styles/OrderQRCode.css';

const OrderQRCode = ({ orderId }) => {
  const [qrCode, setQrCode] = useState(null);
  const [orderUrl, setOrderUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchQRCode = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${REACT_APP_API_BASE_URL}/orders/${orderId}/qr-code`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch QR code');
        }

        const data = await response.json();
        setQrCode(data.qr_code);
        setOrderUrl(data.order_url);
      } catch (err) {
        console.error('Error fetching QR code:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && REACT_APP_API_BASE_URL) {
      fetchQRCode();
    }
  }, [orderId, REACT_APP_API_BASE_URL]);

  if (loading) {
    return <div className="qr-code-loading">Generating QR code...</div>;
  }

  if (error) {
    return <div className="qr-code-error">Error: {error}</div>;
  }

  if (!qrCode) {
    return null;
  }

  return (
    <div className="qr-code-container">
      <div className="qr-code-card">
        <h3>Order QR Code</h3>
        <p className="qr-code-id">Order #{orderId}</p>       
        <div className="qr-code-image">
          <img src={qrCode} alt={`QR Code for Order ${orderId}`} />
        </div>
      </div>
    </div>
  );
};

export default OrderQRCode;