import React, { useState, useEffect } from 'react';
import '../styles/BusinessDetailPage.css';
import NavBar from './NavBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const BusinessDetailPage = ({ businessId, user, onLogout, onNavigate }) => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  const [business, setBusiness] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
    try {
        setLoading(true);

        const businessResponse = await fetch(`${API_BASE_URL}/restaurants/${businessId}`);
        
        if (!businessResponse.ok) {
        const errorData = await businessResponse.json();
        throw new Error(errorData.error || 'Business not found');
        }
        
        const businessData = await businessResponse.json();
        if (!businessData.business) {
        throw new Error('Business object is empty');
        }
        
        setBusiness(businessData.business);
        const itemsResponse = await fetch(`${API_BASE_URL}/restaurants/${businessId}/items`);
        if (!itemsResponse.ok) throw new Error('Failed to fetch items');
        const itemsData = await itemsResponse.json();
        setItems(itemsData.items || []);
        
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
    };

    if (businessId) {
      fetchData();
    }
  }, [businessId, API_BASE_URL]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(item =>
        item.dish_name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.cooking_method?.toLowerCase().includes(query) ||
        (Array.isArray(item.ingredients) && item.ingredients.some(ing => ing.toLowerCase().includes(query)))
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  if (loading) {
    return (
      <div className="detail-page loading-page">
        <p>Loading restaurant...</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="detail-page error-page">
        <h2>{error || 'Restaurant not found'}</h2>
        <button onClick={() => onNavigate('browse')}>← Back to Browse</button>
      </div>
    );
  }

  const itemsByCategory = filteredItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const handleLogoClick = () => {
        window.scrollTo(0, 0);
  };


  const categories = Object.keys(itemsByCategory);

  return (
    <div>
              <NavBar user={user} onLogoClick={handleLogoClick} onNavigate={onNavigate} />

    <div className="detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => onNavigate('browse')}>← Back</button>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      <div className="business-header">
        <h1>{business.name}</h1>
        
        <div className="business-meta">
          <div className="meta-item">
            <span className="value">{business.type}</span>
          </div>

          <div className="meta-item">
            <span className="value">
              {[...Array(Math.floor(business.rating || 0))].map((_, i) => (
                <FontAwesomeIcon key={i} icon={faStar} size="sm" style={{color: "#FFD43B",}} />
              ))} {business.rating || 'N/A'}
              <small> ({business.total_reviews || 0} reviews)</small>
            </span>
          </div>

          {business.phone && (
            <div className="meta-item">
              <a href={`tel:${business.phone}`}>{business.phone}</a>
            </div>
          )}

          {business.website && (
            <div className="meta-item">
              <a href={business.website} target="_blank" rel="noopener noreferrer">
                Visit Website
              </a>
            </div>
          )}

          {business.opening_hours && (
            <div className="meta-item">
              <span className={`status ${business.opening_hours.open_now ? 'open' : 'closed'}`}>
                {business.opening_hours.open_now ? 'Open Now' : 'Closed'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="menu-section">
        <div className="menu-header">
          <h2>Menu</h2>
          <span className="item-count">({filteredItems.length} items)</span>
        </div>

        <div className="menu-search">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="clear-btn"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="no-items">
            <p>No items available for this restaurant</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="no-items">
            <p>No items match your search</p>
            <button onClick={() => setSearchQuery('')}>Clear Search</button>
          </div>
        ) : (
          <div className="categories-container">
            {categories.map((category) => (
              <div key={category} className="category-section">
                <h3 className="category-title">{category} ({itemsByCategory[category].length})</h3>
                
                <div className="items-grid">
                  {itemsByCategory[category].map((item) => (
                    <div key={item.id} className="item-card">
                      {item.image_url && (
                        <div className="item-image">
                          <img src={item.image_url} alt={item.dish_name} />
                        </div>
                      )}
                      <div className="item-info">
                        <h4>{item.dish_name}</h4>
                        <div className="price-section">
                          {item.discount_percentage > 0 ? (
                            <>
                              <span className="original-price">${item.price.toFixed(2)}</span>
                              <span className="discount-badge">-{item.discount_percentage}%</span>
                              <span className="final-price">
                                ${(item.price * (1 - item.discount_percentage / 100)).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="final-price">${item.price.toFixed(2)}</span>
                          )}
                        </div>
                        <button 
                          className="add-to-cart-btn"
                          disabled={!item.is_available}
                        >
                          {item.is_available ? 'Add to Cart' : 'Unavailable'}
                        </button>
                      </div>
                      <div className="item-details-overlay">
                        <div className="item-details">
                          {item.portion_size && <span className="detail">{item.portion_size}</span>}
                          {item.cooking_method && <span className="detail">{item.cooking_method}</span>}
                          {item.available_quantity > 0 && (
                            <span className="detail available">{item.available_quantity} in stock</span>
                          )}
                          {!item.is_available && <span className="detail unavailable">Unavailable</span>}
                        </div>
                        {item.ingredients && item.ingredients.length > 0 && (
                          <div className="ingredients">
                            <span className="ingredients-label">Ingredients:</span>
                            <div className="ingredients-list">
                              {Array.isArray(item.ingredients) ? (
                                item.ingredients.map((ing, idx) => (
                                  <span key={idx} className="ingredient-tag">{ing}</span>
                                ))
                              ) : (
                                <span className="ingredient-tag">{JSON.stringify(item.ingredients)}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {item.description && (
                        <div className="description-overlay-wrapper">
                          <p>{item.description}</p>
                          <div className="overlay-button-container">
                            <button 
                              className="add-to-cart-btn"
                              disabled={!item.is_available}
                            >
                              {item.is_available ? 'Add to Cart' : 'Unavailable'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
      </div>
  );
};

export default BusinessDetailPage;