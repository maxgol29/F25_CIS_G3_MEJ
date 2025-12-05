import React, { useState, useEffect } from 'react';
import styles from '../styles/BusinessDetailPage.module.css';
import NavBar from './NavBar';
import CartFooter from './CartFooter'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext'; 
import { useParams,useNavigate } from 'react-router-dom';

const BusinessDetailPage = ({ user }) => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [business, setBusiness] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemId, setAddedItemId] = useState(null);
  const [promos, setPromos] = useState([]);
  const [promosLoading, setPromosLoading] = useState(false);
  
  const { addToCart, cart } = useCart(); 
  useEffect(() => {
    const fetchPromos = async () => {
      setPromosLoading(true);
      try {
        const response = await fetch(`${REACT_APP_API_BASE_URL}/promo-codes/business/${businessId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch promo codes');
        }

        const data = await response.json();
        const activePromos = (data.promos || []).filter(promo => promo.is_active);
        setPromos(activePromos);
      } catch (err) {
        console.error('Error fetching promos:', err);
        setPromos([]);
      } finally {
        setPromosLoading(false);
      }
    };

    if (businessId && REACT_APP_API_BASE_URL) {
      fetchPromos();
    }
  }, [businessId, REACT_APP_API_BASE_URL]);

  useEffect(() => {
    const fetchData = async () => {
    try {
        setLoading(true);

        const businessResponse = await fetch(`${REACT_APP_API_BASE_URL}/businesses/${businessId}`);
        
        if (!businessResponse.ok) {
        const errorData = await businessResponse.json();
        throw new Error(errorData.error || 'Business not found');
        }
        
        const businessData = await businessResponse.json();
        if (!businessData.business) {
        throw new Error('Business object is empty');
        }
        
        setBusiness(businessData.business);
        const itemsResponse = await fetch(`${REACT_APP_API_BASE_URL}/businesses/${businessId}/items`);
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
  }, [businessId, REACT_APP_API_BASE_URL]);

  const handleAddToCart = (item) => {
    try {
      addToCart(
        {
          id: item.id,
          dish_name: item.dish_name,
          price: item.price,
          discount_percentage: item.discount_percentage || 0,
          image_url: item.image_url,
          quantity: 1
        },
        businessId,
        business.name
      );

      setAddedItemId(item.id);
      setTimeout(() => setAddedItemId(null), 2000);
      
    } catch (error) {
      alert(error.message);
    }
  };
  const copyPromoToClipboard = (code) => {
    navigator.clipboard.writeText(code);
  };

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
      <div className={`${styles.detailPage} ${styles.loadingPage}`}>
        <p>Loading restaurant...</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className={`${styles.detailPage} ${styles.errorPage}`}>
        <h2>{error || 'Restaurant not found'}</h2>
        <button onClick={() => navigate('/browse')}>← Back</button>
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
      <NavBar user={user} onLogoClick={handleLogoClick} />

      <div className={`${styles.detailPage} ${styles.detailPage}`}>
        <div className={styles.detailHeader}>
          <button className={styles.backBtn} onClick={() => navigate('/browse')}>← Back</button>
        </div>

        <div className={styles.businessHeader}>
          <h1>{business.name}</h1>

          <div className={styles.businessMeta}>
            <div className={styles.metaItem}>
              <span className={styles.value}>{business.type.charAt(0).toUpperCase() + business.type.slice(1)}</span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.value}>
                {[...Array(Math.floor(business.rating || 0))].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} size="sm" style={{color: "#FFD43B",}} />
                ))} {business.rating || 'N/A'}
                <small> ({business.total_reviews || 0} reviews)</small>
              </span>
            </div>

            {business.phone && (
              <div className={styles.metaItem}>
                <a href={`tel:${business.phone}`}>{business.phone}</a>
              </div>
            )}

            {business.website && (
              <div className={styles.metaItem}>
                <a href={business.website} target="_blank" rel="noopener noreferrer">
                  Visit Website
                </a>
              </div>
            )}

            {business.opening_hours && (
              <div className={styles.metaItem}>
                <span className={`${styles.status} ${business.opening_hours.open_now ? styles.open : styles.closed}`}>
                  {business.opening_hours.open_now ? 'Open Now' : 'Closed'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.menuSection}>
          <div className={styles.menuHeader}>
            <h2>Menu</h2>
            <span className={styles.itemCount}>({filteredItems.length} items)</span>
          </div>

          <div className={styles.menuSearch}>
            <input
              type="text"
              placeholder="Search..."
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
          {!promosLoading && promos.length > 0 && (
            <div className={styles.promoCodesSection}>
              <div className={styles.promoCodesContainer}>
                {promos.map((promo) => (
                  <div key={promo.id} className={styles.promoCodeItem}>
                    <div className={styles.promoCodeBadge}>
                      <span className={styles.code}>{promo.code}</span>
                    </div>
                    <div className={styles.promoInfo}>
                      <p className={styles.promoDescription}>{promo.description}</p>
                      <div className={styles.promoMeta}>
                        {promo.discount_percentage > 0 && (
                          <span className={styles.promoDiscount}>{promo.discount_percentage}% Off</span>
                        )}
                        {promo.discount_fixed_amount > 0 && (
                          <span className={styles.promoDiscount}>${promo.discount_fixed_amount} Off</span>
                        )}
                        {promo.expiration_date && (
                          <span className={styles.promoExpires}>
                            Expires: {new Date(promo.expiration_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      className={styles.promoCopyBtn} 
                      onClick={() => copyPromoToClipboard(promo.code)}
                    >
                      Copy Code
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className={styles.noItems}>
              <p>No items available for this restaurant</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className={styles.noItems}>
              <p>No items match your search</p>
              <button onClick={() => setSearchQuery('')}>Clear Search</button>
            </div>
          ) : (
            <div className={styles.categoriesContainer}>
              {categories.map((category) => (
                <div key={category} className={styles.categorySection}>
                  <h3 className={styles.categoryTitle}>{category} ({itemsByCategory[category].length})</h3>

                  <div className={styles.itemsGrid}>
                    {itemsByCategory[category].map((item) => (
                      <div key={item.id} className={styles.itemCard}>
                        {item.image_url && (
                          <div className={styles.itemImage}>
                            <img src={item.image_url} alt={item.dish_name} />
                          </div>
                        )}
                        <div className={styles.itemInfo}>
                          <h4>{item.dish_name}</h4>
                          <div className={styles.priceSection}>
                            {item.discount_percentage > 0 ? (
                              <>
                                <span className={styles.originalPrice}>${item.price.toFixed(2)}</span>
                                <span className={styles.discountBadge}>-{item.discount_percentage}%</span>
                                <span className={styles.finalPrice}>
                                  ${(item.price * (1 - item.discount_percentage / 100)).toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className={styles.finalPrice}>${item.price.toFixed(2)}</span>
                            )}
                          </div>
                          <button 
                            className={`${styles.addToCartBtn} ${addedItemId === item.id ? styles.added : ''}`}
                            disabled={!item.is_available}
                            onClick={() => handleAddToCart(item)}
                          >
                            {addedItemId === item.id ? 'Added!' : (item.is_available ? 'Add to Cart' : 'Unavailable')}
                          </button>
                        </div>
                        <div className={styles.itemDetailsOverlay}>
                          <div className={styles.itemDetails}>
                            {item.portion_size && <span className={styles.detail}>{item.portion_size}</span>}
                            {item.cooking_method && <span className={styles.detail}>{item.cooking_method}</span>}
                            {item.available_quantity > 0 && (
                              <span className={styles.detail}> {item.available_quantity} in stock</span>
                            )}
                            {!item.is_available && <span className={styles.detail}>Unavailable</span>}
                          </div>
                          {item.ingredients && item.ingredients.length > 0 && (
                            <div className={styles.ingredients}>
                              <span className={styles.ingredientsLabel}>Ingredients:</span>
                              <div className={styles.ingredientsList}>
                                {Array.isArray(item.ingredients) ? (
                                  item.ingredients.map((ing, idx) => (
                                    <span key={idx} className={styles.ingredientTag}>{ing}</span>
                                  ))
                                ) : (
                                  <span className={styles.ingredientTag}>{JSON.stringify(item.ingredients)}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {item.description && (
                          <div className={styles.descriptionOverlayWrapper}>
                            <p>{item.description}</p>
                            <div className={styles.overlayButtonContainer}>
                              <button
                                className={`${styles.addToCartBtn} ${addedItemId === item.id ? styles.added : ''}`}
                                onClick={() => handleAddToCart(item)}
                                disabled={!item.is_available}
                              >
                                {addedItemId === item.id ? 'Added!' : (item.is_available ? 'Add to Cart' : 'Unavailable')}
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
      <CartFooter businessId={businessId} businessName={business.name} />
    </div>
  );
};

export default BusinessDetailPage;