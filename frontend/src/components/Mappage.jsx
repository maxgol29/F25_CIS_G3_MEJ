import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import NavBar from './NavBar';
import '../styles/Mappage.css';

const MapPage = ({ user, onNavigate, onLogout }) => {
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userAddress, setUserAddress] = useState(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [addressFetched, setAddressFetched] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const mapRef = useRef(null);

  const API_BASE_URL = 'http://localhost:5000/api';
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

  const saveRestaurantsToDatabase = useCallback(async (restaurantsList) => {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/save-from-places`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurants: restaurantsList })
      });

      if (response.ok) {
        const result = await response.json();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  }, [API_BASE_URL]);

  const fetchNearbyRestaurants = useCallback((lat, lng) => {
    if (!window.google?.maps?.places) return;

    setLoadingRestaurants(true);
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    const request = {
      location: new window.google.maps.LatLng(lat, lng),
      radius: RADIUS_METERS,
      type: 'restaurant'
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const sorted = results.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        const detailsService = new window.google.maps.places.PlacesService(document.createElement('div'));
        const detailPromises = sorted.map(place => 
          new Promise(resolve => {
            detailsService.getDetails({ placeId: place.place_id, fields: [
              'name', 'place_id', 'international_phone_number', 'website', 'opening_hours', 
              'rating', 'user_ratings_total', 'types', 'geometry'
            ]}, (detail, detailStatus) => {
              if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) resolve(detail);
              else resolve(place); // fallback
            });
          })
        );

        Promise.all(detailPromises).then(fullPlaces => {
          setRestaurants(fullPlaces);
          saveRestaurantsToDatabase(fullPlaces);
          setLoadingRestaurants(false);
        });
      } else {
        setLoadingRestaurants(false);
      }
    });
  }, [RADIUS_METERS, saveRestaurantsToDatabase]);

  const geocodeAddress = useCallback((data) => {
    if (!window.google?.maps) return;

    const fullAddress = `${data.street}${data.building_number ? ' ' + data.building_number : ''}${data.apartment_number ? ' Apt ' + data.apartment_number : ''}, ${data.city}${data.state ? ', ' + data.state : ''} ${data.zip_code}, ${data.country}`;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === 'OK' && results.length > 0) {
        const location = results[0].geometry.location;
        const coordinates = { lat: location.lat(), lng: location.lng() };
        setMapCenter(coordinates);
        setError('');
        setLoading(false);
        fetchNearbyRestaurants(coordinates.lat, coordinates.lng);
      } else {
        setError('Could not locate address on map');
        setLoading(false);
      }
    });
  }, [fetchNearbyRestaurants]);

  const fetchUserAddress = useCallback(async () => {
    if (addressFetched) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to fetch user address');

      const data = await response.json();
      setUserAddress(data);
      setAddressFetched(true);

      if (data.street && data.city) {
        if (mapsReady) {
          geocodeAddress(data);
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
  }, [user.id, mapsReady, geocodeAddress, addressFetched, API_BASE_URL]);

  useEffect(() => {
    if (mapsReady && userAddress?.street) {
      geocodeAddress(userAddress);
    }
  }, [mapsReady, userAddress, geocodeAddress]);

  useEffect(() => {
    if (user?.id && !addressFetched) {
      fetchUserAddress();
    }
  }, [user?.id, fetchUserAddress, addressFetched]);

  const handleLogoClick = () => {
    window.scrollTo(0, 0);
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const restaurantIcon = {
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
      <div className="map-page">
        <NavBar user={user} onLogoClick={handleLogoClick} onNavigate={onNavigate} />
        <div className="map-container">
          <div className="loading">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page-fullscreen">
      <NavBar user={user} onLogoClick={handleLogoClick} onNavigate={onNavigate} />

      {error && <div className="error-message-floating">{error}</div>}

      <div className="fullscreen-map-section">
        {!GOOGLE_MAPS_API_KEY ? (
          <div className="api-key-error">
            <h3>Google Maps API Key Missing</h3>
          </div>
        ) : (
          <LoadScript
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            libraries={['places']}
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

              {restaurants.map((restaurant, index) => (
                <Marker
                  key={index}
                  position={{
                    lat: restaurant.geometry.location.lat(),
                    lng: restaurant.geometry.location.lng()
                  }}
                  title={restaurant.name}
                  icon={restaurantIcon}
                  onClick={() => handleRestaurantClick(restaurant)}
                />
              ))}

              {selectedRestaurant && (
                <InfoWindow
                  position={{
                    lat: selectedRestaurant.geometry.location.lat(),
                    lng: selectedRestaurant.geometry.location.lng()
                  }}
                  onCloseClick={() => setSelectedRestaurant(null)}
                >
                  <div style={{ color: '#000', padding: '8px' }}>
                    <h3 style={{ margin: '0 0 8px 0' }}>{selectedRestaurant.name}</h3>
                    {selectedRestaurant.rating && (
                      <p style={{ margin: '4px 0', fontSize: '13px' }}>
                        {selectedRestaurant.rating} ({selectedRestaurant.user_ratings_total} reviews)
                      </p>
                    )}
                    {selectedRestaurant.vicinity && (
                      <p style={{ margin: '4px 0', fontSize: '12px' }}>
                        {selectedRestaurant.vicinity}
                      </p>
                    )}
                    {selectedRestaurant.opening_hours && (
                      <p style={{ margin: '4px 0', fontSize: '12px' }}>
                        {selectedRestaurant.opening_hours.open_now ? 'Open Now' : 'Closed'}
                      </p>
                    )}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        )}
      </div>

      {restaurants.length > 0 && (
        <div className="fullscreen-restaurants-section">
          <div className="restaurants-header">
            <h2> Restaurants ({restaurants.length})</h2>
          </div>

          {loadingRestaurants ? (
            <div className="loading-restaurants">Loading restaurants...</div>
          ) : (
            <div className="restaurants-grid">
              {restaurants.map((restaurant, index) => (
                <div
                  key={index}
                  className={`restaurant-card ${selectedRestaurant?.place_id === restaurant.place_id ? 'active' : ''}`}
                  onClick={() => handleRestaurantClick(restaurant)}
                >
                  <div className="restaurant-name">{restaurant.name}</div>
                  <div className="restaurant-rating">
                    {restaurant.rating ? (
                      <>
                        <span className="stars">{restaurant.rating}</span>
                        <span className="reviews">({restaurant.user_ratings_total})</span>
                      </>
                    ) : (
                      <span className="no-rating">No ratings yet</span>
                    )}
                  </div>
                  <div className="restaurant-status">
                    {restaurant.opening_hours?.open_now ? (
                      <span className="open">Open</span>
                    ) : restaurant.opening_hours ? (
                      <span className="closed">Closed</span>
                    ) : (
                      <span className="unknown">Hours unknown</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapPage;