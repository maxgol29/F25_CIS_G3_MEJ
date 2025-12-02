import { useState, useEffect, useCallback } from 'react';
import NavBar from './NavBar';
import '../styles/ProfilePage.css';

const ProfilePage = ({ user, onLogout, onNavigate }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [savings, setSavings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${REACT_APP_API_BASE_URL}/auth/users/${user.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to fetch user details');

      const data = await response.json();
      setUserDetails(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load user information');
    } finally {
      setLoading(false);
    }
  }, [user.id, REACT_APP_API_BASE_URL]);

  const fetchSavings = useCallback(async () => {
    try {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/promo-codes/users/${user.id}/savings`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to fetch savings');

      const data = await response.json();
      setSavings(data);
    } catch (err) {
      console.error('Failed to fetch savings:', err);
      setSavings({ total_savings: 0 });
    }
  }, [user.id, REACT_APP_API_BASE_URL]);

  useEffect(() => {
    if (user?.id) {
      fetchUserDetails();
      fetchSavings();
    }
  }, [user?.id, fetchUserDetails, fetchSavings]);

  const handleLogoClick = () => {
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <NavBar user={user} onLogoClick={handleLogoClick} onNavigate={onNavigate} />
        <div className="profile-container">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <NavBar user={user} onLogoClick={handleLogoClick} onNavigate={onNavigate} />

      <div className="profile-container">
        <div className="profile-header">
          <h1>Profile</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-content">
          {/* Personal Information */}
          <section className="profile-section">
            <h2>Personal Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>First Name</label>
                <p>{userDetails?.first_name || user?.first_name || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Last Name</label>
                <p>{userDetails?.last_name || user?.last_name || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{userDetails?.email || user?.email || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <p>{userDetails?.phone || 'Not provided'}</p>
              </div>
            </div>
          </section>

          {/* Address Information */}
          {userDetails?.street && (
            <section className="profile-section">
              <h2>Address</h2>
              <div className="address-block">
                <p className="street">
                  {userDetails.street}
                  {userDetails.building_number && ` ${userDetails.building_number}`}
                  {userDetails.apartment_number && ` Apt ${userDetails.apartment_number}`}
                </p>
                <p className="city-state">
                  {userDetails.city}
                  {userDetails.state && `, ${userDetails.state}`}
                  {userDetails.zip_code && ` ${userDetails.zip_code}`}
                </p>
                <p className="country">{userDetails.country}</p>
              </div>
            </section>
          )}

          <section className="profile-section savings-section">
            <div className="savings-box">
              <div className="savings-content">
                <h2>Total Savings</h2>
                <p className="savings-amount">
                  ${savings?.total_savings.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </section>
          
          {/* Account Actions */}
          <section className="profile-section">
            <h2>Account</h2>
            <div className="actions">
              <button className="action-button secondary">Edit Profile</button>
              <button className="action-button secondary">Change Password</button>
              <button className="action-button danger" onClick={onLogout}>
                Log Out
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;