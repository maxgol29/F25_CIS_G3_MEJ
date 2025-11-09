import '../styles/NavBar.css';

const NavBar = ({ user, onLogoClick }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={onLogoClick}>
          localPromo
        </div>
        <ul className="nav-menu">
          <li className="nav-item">
            <a href="#home" className="nav-link">Home</a>
          </li>
          <li className="nav-item">
            <a href="#map" className="nav-link">Map</a>
          </li>
          <li className="nav-item">
            <a href="#browse" className="nav-link">Browse</a>
          </li>
          <li className="nav-item">
            <a href="#me" className="nav-link">Me</a>
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