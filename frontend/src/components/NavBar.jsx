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
        <div className="navbar-logo" onClick={onLogoClick}>
          localPromo
        </div>
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
        <div className="navbar-user">
          Welcome, {user.last_name}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;