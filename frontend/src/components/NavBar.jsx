import React from 'react';
import '../styles/NavBar.css';

const NavBar = ({ user, onLogoClick, onNavigate }) => {
  const handleNavigation = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo" onClick={onLogoClick}>
          localPromo
        </div>

        {/* Navigation Links */}
        <ul className="nav-menu">
          <li className="nav-item">
            <button 
              className="nav-link nav-button" 
              onClick={() => handleNavigation('home')}
            >
              Home
            </button>
          </li>
          <li className="nav-item">
            <button 
              className="nav-link nav-button" 
              onClick={() => handleNavigation('map')}
            >
              Map
            </button>
          </li>
          <li className="nav-item">
            <button 
              className="nav-link nav-button" 
              onClick={() => handleNavigation('browse')}
            >
              Browse
            </button>
          </li>
          <li className="nav-item">
            <button 
              className="nav-link nav-button" 
              onClick={() => handleNavigation('profile')}
            >
              Me
            </button>
          </li>
        </ul>

        {/* User Welcome */}
        <div className="navbar-user">
          Welcome, {user.last_name}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;