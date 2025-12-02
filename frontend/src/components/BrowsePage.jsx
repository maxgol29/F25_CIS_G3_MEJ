import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/BrowsePage.module.css';
import NavBar from './NavBar';

const BrowsePage = ({ user, onNavigate, onLogout}) => {
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
      const data = await response.json();      if (!data.businesses || !Array.isArray(data.businesses)) {
        setBusinesses([]);
        return;
      }

      setBusinesses(data.businesses || []);
    } catch (err) {
      console.error('Error fetching businesses:', err);
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
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (business.phone && business.phone.includes(searchQuery));
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
        onNavigate('businessDetail', business.id);
    };
  return (
    <div>
        <NavBar user={user} onLogoClick={handleLogoClick} onNavigate={onNavigate} />

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
            <div
                key={business.id}
                onClick={() => handleBusinessClick(business)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleBusinessClick(business);
                    }
                }}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                className={styles.businessCard}
            >
                <div className={styles.cardHeader}>
                <h4>{business.name}</h4>
                </div>
                <div className={styles.ratingSection}>
                <span className={styles.ratingValue}>
                    {business.rating || 'N/A'} ({business.total_reviews || 0} reviews)
                </span>
                <span className={styles.typeBadge}>{business.type}</span>
                </div>
                <div className={styles.cardInfo}>
                {business.phone && (
                    <div className={styles.infoItem}>
                    <a href={`tel:${business.phone}`}>{business.phone}</a>
                    </div>
                )}

                {business.website && (
                    <div className={styles.infoItem}>
                    <a href={business.website} target="_blank" rel="noopener noreferrer">
                        Website
                    </a>
                    </div>
                )}
                {business.opening_hours && (
                    <div className={styles.infoItem}>
                    <span>
                        {business.opening_hours.open_now ? 'Open Now' : 'Closed'}
                    </span>
                    </div>
                )}
                </div>
            </div>
            ))}
        </div>
        </div>
    </div>
  );
};

export default BrowsePage;