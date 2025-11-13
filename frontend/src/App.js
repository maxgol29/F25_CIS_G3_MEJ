import React, { useState, useEffect } from 'react';
import AuthPage from '../src/components/AuthPage';
import HomePage from '../src/components/HomePage';
import ProfilePage from '../src/components/ProfilePage';
import MapPage from '../src/components/Mappage';
import BrowsePage from '../src/components/BrowsePage';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage('home');
    // Store user info in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('home');
    localStorage.removeItem('currentUser');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfilePage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
      case 'map':
        return <MapPage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
      case 'home':
      default:
        return <HomePage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
      case 'browse':
        return <BrowsePage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
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