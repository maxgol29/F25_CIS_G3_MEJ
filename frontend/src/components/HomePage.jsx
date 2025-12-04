import React from 'react';
import NavBar from '../components/NavBar';
import styles from '../styles/HomePage.module.css';

const HomePage = ({ user, onLogout, onNavigate }) => {
  const handleLogoClick = () => {
    window.scrollTo(0, 0);
  };
  return (
    <div className={styles.homePage}>
      <NavBar user={user} onLogoClick={handleLogoClick} onNavigate={onNavigate} />
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