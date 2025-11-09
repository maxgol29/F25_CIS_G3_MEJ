import NavBar from './NavBar';
import '../styles/HomePage.css';

const HomePage = ({ user, onLogout }) => {
  const handleLogoClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className="home-page">
      <NavBar user={user} onLogoClick={handleLogoClick} />
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