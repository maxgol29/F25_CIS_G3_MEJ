import '../styles/HomePage.css';

const HomePage = ({ user, onLogout }) => {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="welcome-section">
          <h1>Welcome, {user.last_name}!</h1>
          <p className="user-email">{user.email}</p>
        </div>

        <div className="home-message">
          <p>You have successfully logged in.</p>
        </div>

        <button onClick={onLogout} className="logout-button">
          Log Out
        </button>
      </div>
    </div>
  );
};

export default HomePage;