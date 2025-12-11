import styles from '../styles/OwnerPage.module.css';
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom';

const OwnerPage = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    window.scrollTo(0, 0);
    navigate('/home');
  };

  return (
    <div className={styles.ownerPage}>
      <NavBar user={user} onLogoClick={handleLogoClick} />

      <div className={styles.ownerContainer}>
        <div className={styles.ownerCard}>
          <h1>Business Owner Dashboard</h1>
          
          <div className={styles.ownerInfo}>
            <div className={styles.infoItem}>
              <label>Name</label>
              <p>{user.first_name} {user.last_name}</p>
            </div>

            <div className={styles.infoItem}>
              <label>Email</label>
              <p>{user.email}</p>
            </div>

            {user.phone && (
              <div className={styles.infoItem}>
                <label>Phone</label>
                <p>{user.phone}</p>
              </div>
            )}
          </div>

          <div className={styles.ownerActions}>
            <button 
              className={styles.logoutBtn}
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerPage;