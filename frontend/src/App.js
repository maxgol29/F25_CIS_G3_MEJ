import { Suspense, useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
        if (userData.role === 'owner') {
          navigate('/owner');
        } else {
          navigate('/home');
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
    if (userData.role === 'owner') {
      navigate('/owner');
    } else {
      navigate('/home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <CartProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="App">
          {!isLoggedIn ? (
            <AuthPage onLoginSuccess={handleLoginSuccess} />
          ) : (
            <Routes>

              <Route path="/" element={<HomePage user={user} onLogout={handleLogout} />} />
              <Route path="/home" element={<HomePage user={user} onLogout={handleLogout} />} />
              <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
              <Route path="/map" element={<MapPage user={user} onLogout={handleLogout} />} />
              <Route path="/browse" element={<BrowsePage user={user} onLogout={handleLogout} />} />
              <Route path="/business/:businessId" element={<BusinessDetailPage user={user} onLogout={handleLogout} />} />
              <Route path="/cart" element={<CartPage user={user} onLogout={handleLogout} />} />
              <Route path="/payment" element={<PaymentPage user={user} onLogout={handleLogout} />} />
              <Route path="/order/:orderId" element={<OrderConfirmation user={user} onLogout={handleLogout} />} />
              <Route path="/order-history" element={<OrderHistory user={user} onLogout={handleLogout} />} />


              <Route path="/owner" element={<OwnerPage user={user} onLogout={handleLogout} />} />
              <Route path="/owner/dashboard" element={<Dashboard user={user} />} />
              <Route path="/owner/menu" element={<MenuEditor user={user} />} />
              <Route path="/owner/orders" element={<OwnerOrders user={user} />} />
              <Route path="/owner/promos" element={<PromoManager user={user} />} />

              <Route path="*" element={<div>404 Page Not Found</div>} />

            </Routes>
          )}
        </div>
      </Suspense>
    </CartProvider>
  );
}

export default App;