import { useState } from 'react';
import styles from '../styles/AddressModalChange.module.css';

const AddressModalChange= ({ user, onClose, onSuccess }) => {
  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [formData, setFormData] = useState({
    street: '',
    building_number: '',
    apartment_number: '',
    city: '',
    state: '',
    zip_code: '',
    country: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.street.trim()) {
      setError('Street is required');
      return false;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.zip_code.trim()) {
      setError('Zip code is required');
      return false;
    }
    if (!formData.country.trim()) {
      setError('Country is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log('Submitting address update request with data:', formData);  

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch(`${REACT_APP_API_BASE_URL}/users/${user.id}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: 'update_address',
          address_data: formData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update address');
      }

      setSuccess('The request will be processed within 24-48 hours.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Edit Address</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Street *</label>
            <input
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Building Number</label>
              <input
                name="building_number"
                value={formData.building_number}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Apartment Number</label>
              <input
                name="apartment_number"
                value={formData.apartment_number}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>City *</label>
            <input
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>State/Province</label>
              <input
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Zip Code *</label>
              <input
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Country *</label>
            <input
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={`${styles.button} ${styles.cancel}`}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.submit}`}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModalChange;