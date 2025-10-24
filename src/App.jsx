import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';

// Import your pages
import Dashboard from './pages/Dashboard';
import Transport from './pages/Transport';
import Food from './pages/Food';
import Energy from './pages/Energy';
import Insights from './pages/Insights';

// Navbar Component
const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <nav className="bg-emerald-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold">EcoTrack</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-600">Dashboard</a>
                <a href="/transport" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-600">Transport</a>
                <a href="/food" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-600">Food</a>
                <a href="/energy" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-600">Energy</a>
                <a href="/insights" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-600">Insights</a>
               
              </div>
            </div>
            <div className="flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm">Hello, {user?.name}</span>
                  <button 
                    onClick={logout}
                    className="px-3 py-1 bg-emerald-800 rounded text-sm hover:bg-emerald-900 transition duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-emerald-600 rounded text-sm hover:bg-emerald-700 transition duration-200"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {isLogin ? 'Sign In to EcoTrack' : 'Create Your Account'}
              </h3>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            {isLogin ? (
              <LoginForm 
                onSwitchToRegister={() => setIsLogin(false)}
                onSuccess={() => setShowAuthModal(false)}
              />
            ) : (
              <RegisterForm 
                onSwitchToLogin={() => setIsLogin(true)}
                onSuccess={() => setShowAuthModal(false)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-medium mb-4">EcoTrack</h4>
            <p className="text-gray-400 text-sm">
              Helping individuals and businesses track and reduce their environmental impact since 2023.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white">Carbon Calculator</a></li>
              <li><a href="/insights" className="hover:text-white">Reduction Goals</a></li>
              <li><a href="/insights" className="hover:text-white">Actionable Tips</a></li>
              <li><a href="/" className="hover:text-white">Progress Tracking</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Case Studies</a></li>
              <li><a href="#" className="hover:text-white">API Documentation</a></li>
              <li><a href="#" className="hover:text-white">Research</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">📱</a>
              <a href="#" className="text-gray-400 hover:text-white">💼</a>
              <a href="#" className="text-gray-400 hover:text-white">🐙</a>
              <a href="#" className="text-gray-400 hover:text-white">📸</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2023 EcoTrack. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Toast Notification Component
const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        <button 
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 text-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

function App() {
  const { loading, logout } = useAuth();
  const [toast, setToast] = useState(null);

  // Global token expiry handler
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('🟡 Global token expiry detected');
      logout();
      setToast({
        message: 'Your session has expired. Please log in again.',
        type: 'error'
      });
    };

    // Listen for token expiry events from API calls
    window.addEventListener('tokenExpired', handleTokenExpired);
    
    // Optional: Also handle browser tab focus for token verification
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became active, could trigger token verification here
        console.log('🟡 Tab focused - could verify token here');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [logout]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading EcoTrack...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Toast Notification */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transport" element={<Transport />} />
            <Route path="/food" element={<Food />} />
            <Route path="/energy" element={<Energy />} />
            <Route path="/insights" element={<Insights />} />
            
            
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;