import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import styles from '../styles/BrowsePage.module.css';
import NavBar from './NavBar';

const BrowsePage = ({ user }) => {
  const navigate = useNavigate();
  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [minRating, setMinRating] = useState(1);
  const businessTypes = ['all', ...new Set(businesses.map(b => b.type))];
  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/businesses/get-all`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const data = await response.json();
      if (!data.businesses) {
        setBusinesses([]);
        return;
      }

      setBusinesses(data.businesses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [REACT_APP_API_BASE_URL]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    let filtered = businesses.filter(business => {
      const matchesSearch =
        business.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || business.type === selectedType;
      const matchesRating = (business.rating || 0) >= minRating;
      return matchesSearch && matchesType && matchesRating;
    });

    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    setFilteredBusinesses(filtered);
  }, [businesses, searchQuery, selectedType, minRating]);

  const handleLogoClick = () => {
    window.scrollTo(0, 0);
  };

  const handleBusinessClick = (business) => {
    navigate(`/business/${business.id}`);
  };
  return (
    <div>
      <NavBar user={user} onLogoClick={handleLogoClick} />

      <div className={styles.browsePage}>
        <div className={styles.browseHeader}>
          <h1>Discover Restaurants</h1>
        </div>
        <div className={styles.filtersSection}>
          {/* Search Bar */}
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                className={styles.clearBtn}
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
          <div className={styles.filterGroup}>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={styles.filterSelect}
            >
              {businessTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <div className={styles.ratingFilter}>
              <input
                type="range"
                min="1.0"
                max="5"
                step="0.1"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className={styles.ratingSlider}
              />
              <span className={styles.ratingDisplay}>{minRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        {loading && (
          <div className={styles.loading}>
            <p>Loading restaurants...</p>
          </div>
        )}
        {!loading && filteredBusinesses.length === 0 && (
          <div className={styles.noResults}>
            <p>No restaurants found</p>
            <button onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setMinRating(1.0);
            }}>
              Clear Filters
            </button>
          </div>
        )}

        {/* Businesses */}
        <div className={styles.businessesGrid}>
          {filteredBusinesses.map((business) => (
            <div className={styles.businessCard} key={business.id}>
              <div className={styles.cardHeader}>
                <h4>{business.name}</h4>
              </div>

              <div className={styles.ratingSection}>
                <span className={styles.ratingValue}>
                  {business.rating} ({business.total_reviews} reviews)
                </span>
                <span className={styles.typeBadge}>{business.type}</span>
              </div>

              <div
                className={styles.openButton}
                onClick={() => handleBusinessClick(business)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBusinessClick(business);
                  }
                }}
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                Open
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowsePage;