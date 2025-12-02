import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, LoadScriptNext, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import NavBar from './NavBar';
import styles from  '../styles/Mappage.module.css';

const GOOGLE_LIBS = ['places'];

const MapPage = ({ user, onNavigate }) => {
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userAddress, setUserAddress] = useState(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [addressFetched, setAddressFetched] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [databaseBusinesses, setDatabaseBusinesses] = useState([]);
  const mapRef = useRef(null);

  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;

  const RADIUS_METERS = 3200;

  const mapStyles = [
    { featureType: 'all', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.business', elementType: 'all', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.attraction', elementType: 'all', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', elementType: 'all', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.medical', elementType: 'all', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.place_of_worship', elementType: 'all', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.school', elementType: 'all', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.sports_complex', elementType: 'all', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'labels.text', stylers: [{ visibility: 'on' }] },
    { featureType: 'administrative', elementType: 'labels.text', stylers: [{ visibility: 'on' }] }
  ];

  const mapOptions = {
    styles: mapStyles,
    streetViewControl: false,
    fullscreenControl: true,
    mapTypeControl: false,
    zoomControl: true,
    gestureHandling: 'none',
    scrollwheel: false,
    draggable: false,
    disableDoubleClickZoom: true
  };

  const fetchDatabaseBusinesses = useCallback(async () => {
    try {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/businesses/get-all`);
      if (response.ok) {
        const data = await response.json();
        setDatabaseBusinesses(data.businesses || []);
      }
    } catch (err) {
    }
  }, [REACT_APP_API_BASE_URL]);

  const saveBusinessesToDatabase = useCallback(async (businessesList) => {
    try {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/businesses/save-from-places`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businesses: businessesList })
      });

      if (response.ok) {
        fetchDatabaseBusinesses();
      }
    } catch (err) {
      console.error('Error saving businesses:', err);
    }
  }, [REACT_APP_API_BASE_URL, fetchDatabaseBusinesses]);

  const fetchNearbyBusinesses = useCallback(async (lat, lng) => {
    setLoadingBusinesses(true);
    try {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/places/nearby-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          radius: RADIUS_METERS,
          type: 'restaurant'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const fullPlaces = data.places || [];
        setBusinesses(fullPlaces);
        saveBusinessesToDatabase(fullPlaces);
      } else {
        setError('Failed to fetch nearby businesses');
      }
    } catch (err) {
      setError('Error loading businesses');
    } finally {
      setLoadingBusinesses(false);
    }
  }, [RADIUS_METERS, saveBusinessesToDatabase]);

  const geocodeAddress = useCallback((userData) => {
    if (!window.google?.maps) return;

    const fullAddress = `${userData.street}${userData.building_number ? ' ' + userData.building_number : ''}${userData.apartment_number ? ' Apt ' + userData.apartment_number : ''}, ${userData.city}${userData.state ? ', ' + userData.state : ''} ${userData.zip_code}, ${userData.country}`;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === 'OK' && results.length > 0) {
        const location = results[0].geometry.location;
        const coordinates = { lat: location.lat(), lng: location.lng() };
        setMapCenter(coordinates);
        setError('');
        setLoading(false);
        fetchNearbyBusinesses(coordinates.lat, coordinates.lng);
      } else {
        setError('Could not locate address on map');
        setLoading(false);
      }
    });
  }, [fetchNearbyBusinesses]);

  const fetchUserAddress = useCallback(async () => {
    if (addressFetched) return;

    try {
      setLoading(true);
      const response = await fetch(`${REACT_APP_API_BASE_URL}/auth/users/${user.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to fetch user address');

      const data = await response.json();
      setUserAddress(data);
      setAddressFetched(true);

      if (data.user.street && data.user.city) {
        if (mapsReady) {
          geocodeAddress(data.user);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('Incomplete address information');
      }
    } catch (err) {
      setError(err.message || 'Failed to load user address');
      setLoading(false);
      setAddressFetched(true);
    }
  }, [user.id, mapsReady, geocodeAddress, addressFetched, REACT_APP_API_BASE_URL]);

  useEffect(() => {
    if (mapsReady && userAddress?.user?.street) {
      geocodeAddress(userAddress.user);
    }
  }, [mapsReady, userAddress, geocodeAddress]);

  useEffect(() => {
    if (user?.id && !addressFetched) {
      fetchUserAddress();
      fetchDatabaseBusinesses();
    }
  }, [user?.id, fetchUserAddress, addressFetched, fetchDatabaseBusinesses]);

  const handleLogoClick = () => {
    window.scrollTo(0, 0); 
  };

  const handleBusinessClick = (business) => {
    setSelectedBusiness(business);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const findDatabaseBusinessByName = (googleBusinessName) => {
    return databaseBusinesses.find(dbRest =>
      dbRest.name.toLowerCase().trim() === googleBusinessName.toLowerCase().trim()
    );
  };

  const handleViewItems = (googleBusiness) => {
    const dbBusiness = findDatabaseBusinessByName(googleBusiness.name);

    if (dbBusiness && dbBusiness.id) {
      onNavigate('businessDetail', dbBusiness.id);
    } else {
      setError(`Business "${googleBusiness.name}" not found in database. Please try again.`);
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '100vh'
  };

  const circleOptions = {
    strokeColor: '#667eea',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#667eea',
    fillOpacity: 0.15,
    radius: RADIUS_METERS
  };

  const BusinessIcon = {
    path: window.google?.maps?.SymbolPath?.CIRCLE,
    scale: 6,
    fillColor: '#FF6B6B',
    fillOpacity: 0.9,
    strokeColor: '#fff',
    strokeWeight: 1
  };

  const userLocationIcon = {
    path: window.google?.maps?.SymbolPath?.CIRCLE,
    scale: 8,
    fillColor: '#667eea',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2
  };

  if (loading) {
    return (
      <div className={styles.mapPage}>
        <NavBar user={user} onLogoClick={handleLogoClick} onNavigate={onNavigate} />
        <div className={styles.mapContainer}>
          <div className={styles.loading}>Loading map...</div>
        </div>
      </div>
    );
  }

  const getOpenStatus = (place) => {
    if (!place?.opening_hours) return null;
    try {
      return place.opening_hours.open_now;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className={styles.mapPageFullscreen}>
      <NavBar user={user} onLogoClick={handleLogoClick} onNavigate={onNavigate} />

      {error && <div className={styles.errorMessageFloating}>{error}</div>}

      <div className={styles.fullscreenMapSection}>
        {!GOOGLE_MAPS_API_KEY ? (
          <div className={styles.apiKeyError}>
            <h3>Google Maps API Key Missing</h3>
          </div>
        ) : (
          <LoadScriptNext
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            libraries={GOOGLE_LIBS}
            onLoad={() => setMapsReady(true)}
            onError={() => {
              setError('Failed to load Google Maps');
              setLoading(false);
            }}
          >
            <GoogleMap
              ref={mapRef}
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={14}
              options={mapOptions}
            >
              <Marker position={mapCenter} title="Your Location" icon={userLocationIcon} />
              <Circle center={mapCenter} options={circleOptions} />

              {businesses.map((business, index) => (
                <Marker
                  key={business.place_id || index}
                  position={{
                    lat: business.geometry.location.lat,
                    lng: business.geometry.location.lng
                  }}
                  title={business.name}
                  icon={BusinessIcon}
                  onClick={() => handleBusinessClick(business)}
                />
              ))}

              {selectedBusiness && (
                <InfoWindow
                  position={{
                    lat: selectedBusiness.geometry.location.lat,
                    lng: selectedBusiness.geometry.location.lng
                  }}
                  onCloseClick={() => setSelectedBusiness(null)}
                >
                  <div style={{ color: '#000', padding: '8px' }}>
                    <h3 style={{ margin: '0 0 8px 0' }}>{selectedBusiness.name}</h3>
                    {selectedBusiness.rating && (
                      <p style={{ margin: '4px 0', fontSize: '13px' }}>
                        {selectedBusiness.rating} ({selectedBusiness.user_ratings_total} reviews)
                      </p>
                    )}
                    {selectedBusiness.vicinity && (
                      <p style={{ margin: '4px 0', fontSize: '12px' }}>
                        {selectedBusiness.vicinity}
                      </p>
                    )}
                    {selectedBusiness.opening_hours && (
                      <p style={{ margin: '4px 0 12px 0', fontSize: '12px' }}>
                        {getOpenStatus(selectedBusiness) === true
                          ? 'Open Now'
                          : 'Closed'}
                      </p>
                    )}
                    <button
                      onClick={() => handleViewItems(selectedBusiness)}
                      style={{
                        background: '#858e96',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        width: '100%'
                      }}
                    >
                      View Items
                    </button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScriptNext>
        )}
      </div>

      {businesses.length > 0 && (
        <div className={styles.fullscreenBusinessesSection}>
          <div className={styles.businessesHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}> Businesses ({businesses.length})</h2>
            <div style={{ width: 300 }}>
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd'}}
              />
            </div>
          </div>

          {loadingBusinesses ? (
            <div className={styles.loadingBusinesses}>Loading Businesses...</div>
          ) : (
            <>
              <div className={styles.businessesGrid}>
                {businesses
                  .filter(r => !searchQuery || (r.name && r.name.toLowerCase().includes(searchQuery.toLowerCase())))
                  .map((business, index) => (
                    <div
                      key={business.place_id || index}
                      className={`${styles.businessesCard} ${selectedBusiness?.place_id === business.place_id ? styles.active : ''}`}
                      onClick={() => handleBusinessClick(business)}
                    >
                      <div className={styles.businessesImage}>
                        {business.photos && business.photos.length > 0 ? (
                          <img
                            alt={business.name}
                            src={business.photos[0]}
                            style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 6 }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '120px', background: '#eee', borderRadius: 6 }} />
                        )}
                      </div>
                      <div className={styles.businessesName}>{business.name}</div>
                      <div className={styles.businessesRating}>
                        {business.rating ? (
                          <>
                            <span className={styles.stars}>{business.rating}</span>
                            <span className={styles.reviews}>({business.user_ratings_total})</span>
                          </>
                        ) : (
                          <span className={styles.noRating}>No ratings yet</span>
                        )}
                      </div>
                      <div className={styles.businessesStatus}>
                        {getOpenStatus(business) === true ? (
                          <span className={styles.open}>Open</span>
                        ) : getOpenStatus(business) === false ? (
                          <span className={styles.closed}>Closed</span>
                        ) : (
                          <span className={styles.unknown}>Hours unknown</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MapPage;