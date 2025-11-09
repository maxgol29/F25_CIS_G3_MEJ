import React from 'react';
import '../styles/HomePage.css';

const HomePage = ({ user, onLogout }) => {
  return (
    <div className="home-container">
      <div className="home-content">
        <button onClick={onLogout} className="logout-button">
          Log Out
        </button>
      </div>
    </div>
  );
};

export default HomePage;