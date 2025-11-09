import React, { useState } from 'react';
import '../styles/AuthPage.css';

const AuthPage = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    last_name: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api'; // Update with your Flask backend URL

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up: POST to create new user
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            last_name: formData.last_name,
            email: formData.email
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Sign up failed');
        }

        const data = await response.json();
        setSuccess('Account created successfully! Logging in...');
        setTimeout(() => {
          onLoginSuccess(formData);
        }, 1500);
      } else {
        // Login: GET users and verify credentials
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'GET'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        const userExists = data.users.some(
          user => user.email === formData.email && user.last_name === formData.last_name
        );

        if (userExists) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            onLoginSuccess(formData);
          }, 1500);
        } else {
          setError('Invalid email or last name. Please try again or sign up.');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
    setFormData({ last_name: '', email: '' });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">{isSignUp ? 'Sign Up' : 'Log In'}</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              placeholder="Enter your last name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <div className="toggle-mode">
          <p>
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button 
              type="button" 
              className="toggle-button"
              onClick={toggleMode}
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;