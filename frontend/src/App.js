import React, { Suspense, useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import './App.css';
import {
  AuthPage,
  HomePage,
  ProfilePage,
  MapPage,
  BrowsePage,
  BusinessDetailPage,
  CartPage,
  PaymentPage,
  OrderConfirmation,
  OrderHistory,
  OwnerPage,
  MenuEditor,
  OwnerOrders,
  PromoManager,
  Dashboard
} from './lazyPages';



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null); 

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
        const isOwner = userData.role === 'owner';        
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
    const isOwner = userData.role === 'owner';
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

  const handleNavigate = (page, id = null) => {
    if (page === 'businessDetail' && id) {
      setSelectedBusinessId(id);
    } else if (page === 'orderConfirmation' && id) {
      setSelectedOrderId(id);
    }
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
      case 'cart':
        return <CartPage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
      case 'payment': 
        return <PaymentPage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
      case 'orderConfirmation': 
        return (
          <OrderConfirmation 
            orderId={selectedOrderId} 
            user={user} 
            onLogout={handleLogout} 
            onNavigate={handleNavigate} 
          />
        );
      case 'orderHistory':
        return <OrderHistory user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
      case 'owner':
        return <OwnerPage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard user={user} onNavigate={handleNavigate} />;
      case 'ownerMenu':
        return <MenuEditor user={user} onNavigate={handleNavigate} />;
      case 'ownerOrders':
        return <OwnerOrders user={user} onNavigate={handleNavigate} />;
      case 'ownerPromos':
        return <PromoManager user={user} onNavigate={handleNavigate} />;
      case 'home':
      default:
        return <HomePage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
    }
  };

  return (
    <CartProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="App">
          {isLoggedIn ? renderPage() : <AuthPage onLoginSuccess={handleLoginSuccess} />}
        </div>
      </Suspense>
    </CartProvider>
  );
}

export default App;