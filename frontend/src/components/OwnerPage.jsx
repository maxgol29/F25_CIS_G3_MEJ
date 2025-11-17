import '../styles/OwnerPage.css';
import NavBar from './NavBar';

const OwnerPage = ({ user, onLogout, onNavigate }) => {
  const handleLogoClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className="owner-page">
      <NavBar user={user} onLogoClick={handleLogoClick} onNavigate={onNavigate} />

      <div className="owner-container">
        <div className="owner-card">
          <h1>Business Owner Dashboard</h1>
          
          <div className="owner-info">
            <div className="info-item">
              <label>Name</label>
              <p>{user.first_name} {user.last_name}</p>
            </div>

            <div className="info-item">
              <label>Email</label>
              <p>{user.email}</p>
            </div>

            {user.phone && (
              <div className="info-item">
                <label>Phone</label>
                <p>{user.phone}</p>
              </div>
            )}
          </div>

          <div className="owner-actions">
            <button 
              className="logout-btn"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="coming-soon">
          <p>More features coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default OwnerPage;