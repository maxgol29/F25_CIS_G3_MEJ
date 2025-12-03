import React, { useEffect, useState } from 'react';
import styles from  '../styles/PromoManager.module.css';
import NavBar from './NavBar';

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PromoManager = ({ user, onNavigate }) => {
  const [promos, setPromos] = useState([]);
  const [promoTypes, setPromoTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(false);
  const [form, setForm] = useState({
    code: '',
    typeID: '',
    description: '',
    max_uses: '',
    expiration_date: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchPromoTypes = async () => {
      setTypesLoading(true);
      try {
        const res = await fetch(`${REACT_APP_API_BASE_URL}/promo-codes/types`);
        if (!res.ok) throw new Error('Failed to load promo types');
        const data = await res.json();
        setPromoTypes(data.promo_types || []);
      } catch (err) {
        console.error('Error fetching promo types:', err);
        setError('Could not load promo types');
      } finally {
        setTypesLoading(false);
      }
    };

    fetchPromoTypes();
  }, []);

  useEffect(() => {
    const fetchPromos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${REACT_APP_API_BASE_URL}/promo-codes/business/${user.business_id}`);
        if (!res.ok) throw new Error('Failed to load promos');
        const data = await res.json();
        setPromos(data.promos || []);
      } catch (err) {
        console.error(err);
        setError('Could not load promo codes');
      } finally {
        setLoading(false); 
      }
    }; 
    if (user && user.business_id) {
      fetchPromos();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.code || !form.description || !form.typeID) {
      setError('Code, description, and type are required');
      return;
    }
    if (form.code.length < 3) {
      setError('Promo code must be at least 3 characters');
      return;
    }

    try {
      const res = await fetch(`${REACT_APP_API_BASE_URL}/promo-codes/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessID: user.business_id,
          code: form.code,
          typeID: parseInt(form.typeID),
          description: form.description,
          max_uses: form.max_uses ? parseInt(form.max_uses) : null,
          expiration_date: form.expiration_date || null,
          is_active: true
        })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to create promo (${res.status})`);
      }

      setSuccess(`Promo "${form.code}" created successfully!`);
      setForm({
        code: '',
        typeID: '',
        description: '',
        max_uses: '',
        expiration_date: ''
      });
      await refreshPromos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Create promo error:', err);
      setError(err.message || 'Failed to create promo');
    }
  };
  const refreshPromos = async () => {
    try {
      const res = await fetch(`${REACT_APP_API_BASE_URL}/promo-codes/business/${user.business_id}`);
      if (!res.ok) throw new Error('Failed to refresh promos');
      const data = await res.json();
      setPromos(data.promos || []);
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  return (
    <div className={styles.promoManagerPage}>
      <NavBar user={user} onLogoClick={() => onNavigate('home')} onNavigate={onNavigate} />
      
      <div className={styles.promoContainer}>
        <div className={styles.promoListSection}>
          <h2>Existing Promo Codes</h2>
          {loading ? (
            <p className={styles.loading}>Loading promo codes...</p>
          ) : promos.length === 0 ? (
            <p className={styles.noPromos}>No promo codes yet</p>
          ) : (
            <div className={styles.promosTable}>
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Max Uses</th>
                    <th>Expires</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((promo, i) => (
                    <tr key={i}>
                      <td><strong>{promo.code}</strong></td>
                      <td>{promo.description}</td>
                      <td>{promo.max_uses || 'No'}</td>
                      <td>{promo.expiration_date ? new Date(promo.expiration_date).toLocaleDateString() : '—'}</td>
                      <td>{promo.is_active ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className={styles.promoFormSection}>
          <h2>Create New Promo Code</h2>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}
          <form onSubmit={handleCreate} className={styles.promoForm}>
            <div className={styles.formGroup}>
              <label htmlFor="code">Promo Code *</label>
              <input
                id="code"
                name="code"
                type="text"
                placeholder="e.g., SAVE10"
                value={form.code}
                onChange={handleChange}
                maxLength="50"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="typeID">Discount Type *</label>
              {typesLoading ? (
                <p className={styles.loadingSmall}>Loading types...</p>
              ) : promoTypes.length === 0 ? (
                <p className={styles.errorSmall}>No promo types available</p>
              ) : (
                <select
                  id="typeID"
                  name="typeID"
                  value={form.typeID}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a type...</option>
                  {promoTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.description}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="description">Description *</label>
              <textarea 
                id="description"
                name="description"
                placeholder="e.g., Get 10% off"
                value={form.description}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="max_uses">Max Uses (Optional)</label>
              <input
                id="max_uses"
                name="max_uses"
                type="number"
                placeholder="Leave empty for unlimited"
                value={form.max_uses}
                onChange={handleChange}
                min="1"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="expiration_date">Expiration Date (Optional)</label>
              <input
                id="expiration_date"
                name="expiration_date"
                type="date"
                value={form.expiration_date}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className={styles.btnCreate} disabled={typesLoading}>
              {typesLoading ? 'Loading...' : 'Create Promo Code'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromoManager;