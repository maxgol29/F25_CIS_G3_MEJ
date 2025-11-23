import React, { useEffect, useState } from 'react';
import '../styles/MenuEditor.css';

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MenuEditor = ({ user, onNavigate }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    dish_name: '',
    image_url: '',
    food_type: '',
    ingredients: '',
    portion_size: '',
    nutritional_profile: '',
    cooking_method: ''
  });
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const businessId = user?.business_id || null;

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const url = `${REACT_APP_API_BASE_URL}/businesses/${businessId}/items`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch items');
        const data = await res.json();
        setItems(data.items || []);
      } catch (err) {
        console.error(err);
        setError('Could not load items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [businessId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!form.dish_name) {
      setError('Dish name is required');
      return;
    }

    const payload = {
      ...form
    };

    try {
      const res = await fetch(`${REACT_APP_API_BASE_URL}/items`, { // OUTDATED (maxgol29 will fix)
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to add item');
      }

      setSuccessMsg('Item added');
      setForm({
        dish_name: '',
        image_url: '',
        food_type: '',
        ingredients: '',
        portion_size: '',
        nutritional_profile: '',
        cooking_method: ''
      });

      const refreshRes = await fetch(`${REACT_APP_API_BASE_URL}/businesses/${businessId}/items`);
      const refreshData = await refreshRes.json();
      setItems(refreshData.items || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Add failed');
    }
  };

  return (
    <div className="menu-editor-page">
      <h2>Menu Editor</h2>
      {businessId ? (
        <p>Managing menu for business id: <strong>{businessId}</strong></p>
      ) : (
        <p className="warning">No `business_id` found on user. Showing all items.</p>
      )}

      <div className="menu-content">
        <div className="menu-list">
          <h3>Your Items</h3>
          {loading ? <p>Loading...</p> : (
            items.length === 0 ? <p>No items found.</p> : (
              <ul>
                {items.map((it) => (
                  <li key={it.id} className="menu-item">
                    <div className="menu-item-left">
                      <strong>{it.dish_name}</strong>
                      <div className="menu-item-meta">{it.food_type || ''} {it.portion_size ? `· ${it.portion_size}` : ''}</div>
                    </div>
                    <div className="menu-item-right">{it.image_url ? <img src={it.image_url} alt={it.dish_name} /> : null}</div>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>

        <div className="menu-form">
          <h3>Add Item</h3>
          {error && <div className="form-error">{error}</div>}
          {successMsg && <div className="form-success">{successMsg}</div>}
          <form onSubmit={handleAdd}>
            <label>Dish name *</label>
            <input name="dish_name" value={form.dish_name} onChange={handleChange} />

            <label>Image URL</label>
            <input name="image_url" value={form.image_url} onChange={handleChange} />

            <label>Food type</label>
            <input name="food_type" value={form.food_type} onChange={handleChange} />

            <label>Ingredients (comma-separated)</label>
            <input name="ingredients" value={form.ingredients} onChange={handleChange} />

            <label>Portion size</label>
            <input name="portion_size" value={form.portion_size} onChange={handleChange} />

            <label>Nutritional profile</label>
            <input name="nutritional_profile" value={form.nutritional_profile} onChange={handleChange} />

            <label>Cooking method</label>
            <input name="cooking_method" value={form.cooking_method} onChange={handleChange} />

            <button type="submit">Add Item</button>
          </form>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => onNavigate && onNavigate('owner')}>Back to Dashboard</button>
      </div>
    </div>
  );
};

export default MenuEditor;
