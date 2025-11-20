import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import MapPage from './components/Mappage';
import BrowsePage from './components/BrowsePage';
import BusinessDetailPage from './components/BusinessDetailPage';
import OwnerPage from './components/OwnerPage';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
        const isOwner = userData.user_type === 'owner' || userData.role === 'owner';        
        if (isOwner) {
          setCurrentPage('owner');
        } else {
          setCurrentPage('home');
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    const isOwner = userData.user_type === 'owner' || userData.role === 'owner';    
    if (isOwner) {
      setCurrentPage('owner');
    } else {
      setCurrentPage('home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('home');
    localStorage.removeItem('currentUser');
  };

  const handleNavigate = (page, businessId = null) => {
    setSelectedBusinessId(businessId);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfilePage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
      case 'map':
        return <MapPage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
      case 'browse':
        return <BrowsePage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
      case 'businessDetail':
        return (
          <BusinessDetailPage 
            businessId={selectedBusinessId} 
            user={user} 
            onLogout={handleLogout} 
            onNavigate={handleNavigate} 
          />
        );
      case 'owner':
        return <OwnerPage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
      case 'home':
      default:
        return <HomePage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="App">
      {isLoggedIn && user ? (
        renderPage()
      ) : (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;