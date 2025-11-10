import React from 'react';
import NavBar from '../components/NavBar';
import '../styles/HomePage.css';

const HomePage = ({ user, onLogout, onNavigate }) => {
  const handleLogoClick = () => {
    window.scrollTo(0, 0);
  };
  return (
    <div className="home-page">
      <NavBar user={user} onLogoClick={handleLogoClick} onNavigate={onNavigate} />
      <div className="home-container">
        <div className="home-content">
          <button onClick={onLogout} className="logout-button">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;