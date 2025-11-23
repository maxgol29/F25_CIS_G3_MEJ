import React, { useEffect, useState } from 'react';
import '../styles/PromoManager.css';

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PromoManager = ({ user, onNavigate }) => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchPromos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${REACT_APP_API_BASE_URL}/promo_codes`); // NOT EXIST
        if (!res.ok) throw new Error('Failed to load promos');
        const data = await res.json();
        setPromos(data.promo_codes || []);
      } catch (err) {
        console.error(err);
        setError('Could not load promo codes');
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.name || !form.description) {
      setError('Name and description are required');
      return;
    }

    try {
      const res = await fetch(`${REACT_APP_API_BASE_URL}/promo_codes`, { // NOT EXIST
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to create promo');
      }
      setSuccess('Promo created');
      setForm({ name: '', description: '' });
      const refresh = await fetch(`${REACT_APP_API_BASE_URL}/promo_codes`);  // NOT EXIST
      const data = await refresh.json();
      setPromos(data.promo_codes || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Create failed');
    }
  };

  return (
    <div className="promo-manager-page">
      <h2>Promo Manager</h2>
      {loading ? <p>Loading promos...</p> : null}
      {error && <div className="error">{error}</div>}

      <div className="promo-list">
        <h3>Existing Promo Codes</h3>
        {promos.length === 0 ? <p>No promo codes</p> : (
          <ul>
            {promos.map((p, i) => (
              <li key={i}><strong>{p.name}</strong> — {p.description}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="promo-form">
        <h3>Create Promo</h3>
        {success && <div className="success">{success}</div>}
        <form onSubmit={handleCreate}>
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} />
          <label>Description</label>
          <input name="description" value={form.description} onChange={handleChange} />
          <button type="submit">Create</button>
        </form>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => onNavigate && onNavigate('owner')}>Back to Dashboard</button>
      </div>
    </div>
  );
};

export default PromoManager;
