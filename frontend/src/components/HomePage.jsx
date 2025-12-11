import React from 'react';
import NavBar from '../components/NavBar';
import styles from '../styles/HomePage.module.css';
import { useNavigate } from 'react-router-dom';

const HomePage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const handleLogoClick = () => {
    window.scrollTo(0, 0);
    navigate('/home');
  };
  return (
    <div className={styles.homePage}>
      <NavBar user={user} onLogoClick={handleLogoClick} />
      <div className={styles.homeContainer}>
        <div className={styles.homeContent}>
          <button onClick={onLogout} className={styles.logoutButton}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;