import { useState, useEffect, useCallback } from 'react';
import NavBar from './NavBar';
import styles from '../styles/ProfilePage.module.css';
import { useNavigate } from 'react-router-dom';

const ProfilePage = ({ user, onLogout }) => {
  const navigate = useNavigate();
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
    navigate('/home');
  };

  if (loading) {
    return (
      <div className={styles.profilePage}>
        <NavBar user={user} onLogoClick={handleLogoClick} />
        <div className={styles.profileContainer}>
          <div className={styles.loading}>Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
    <NavBar user={user} onLogoClick={handleLogoClick} />

      <div className={styles.profileContainer}>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.profileContent}>
          {/* Personal Information */}
          <section className={styles.profileSection}>
            <h2>Personal Information</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>First Name</label>
                <p>{userDetails?.first_name || user?.first_name || 'N/A'}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Last Name</label>
                <p>{userDetails?.last_name || user?.last_name || 'N/A'}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Email</label>
                <p>{userDetails?.email || user?.email || 'N/A'}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Phone</label>
                <p>{userDetails?.phone || 'Not provided'}</p>
              </div>
            </div>
          </section>

          {/* Address Information */}
          {userDetails?.street && (
            <section className={styles.profileSection}>
              <h2>Address</h2>
              <div className={styles.addressBlock}>
                <p className={styles.street}>
                  {userDetails.street}
                  {userDetails.building_number && ` ${userDetails.building_number}`}
                  {userDetails.apartment_number && ` Apt ${userDetails.apartment_number}`}
                </p>
                <p className={styles.cityState}>
                  {userDetails.city}
                  {userDetails.state && `, ${userDetails.state}`}
                  {userDetails.zip_code && ` ${userDetails.zip_code}`}
                </p>
                <p className={styles.country}>{userDetails.country}</p>
              </div>
            </section>
          )}

          <section className={`${styles.profileSection} ${styles.savingsSection}`}>
            <div className={styles.savingsBox}>
              <div className={styles.savingsContent}>
                <h2>Total Savings</h2>
                <p className={styles.savingsAmount}>
                  ${savings?.total_savings.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={`${styles.actionButton} ${styles.secondary}`}>Edit Profile</button>
              <button className={`${styles.actionButton} ${styles.secondary}`}>Change Password</button>
              <button className={`${styles.actionButton} ${styles.danger}`} onClick={onLogout}>
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