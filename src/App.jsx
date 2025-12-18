import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed w-full z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-emerald-100' 
          : 'bg-gradient-to-r from-emerald-600 to-teal-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                scrolled ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-white/20 backdrop-blur-sm'
              }`}>
                <span className="text-2xl">🌱</span>
              </div>
              <span className={`text-xl font-bold transition-colors duration-300 ${
                scrolled ? 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent' : 'text-white'
              }`}>
                EcoTrack
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              <a href="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                scrolled 
                  ? 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600' 
                  : 'text-white hover:bg-white/20'
              }`}>
                Dashboard
              </a>
              <a href="/transport" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                scrolled 
                  ? 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600' 
                  : 'text-white hover:bg-white/20'
              }`}>
                Transport
              </a>
              <a href="/food" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                scrolled 
                  ? 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600' 
                  : 'text-white hover:bg-white/20'
              }`}>
                Food
              </a>
              <a href="/energy" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                scrolled 
                  ? 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600' 
                  : 'text-white hover:bg-white/20'
              }`}>
                Energy
              </a>
              <a href="/insights" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                scrolled 
                  ? 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600' 
                  : 'text-white hover:bg-white/20'
              }`}>
                Insights
              </a>
            </div>
            
            <div className="flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                    scrolled ? 'bg-emerald-50' : 'bg-white/20'
                  }`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-sm font-medium">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className={`text-sm font-medium ${scrolled ? 'text-gray-700' : 'text-white'}`}>
                      {user?.name}
                    </span>
                  </div>
                  <button 
                    onClick={logout}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      scrolled
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-sm'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    scrolled
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                      : 'bg-white text-emerald-600 hover:bg-gray-50'
                  }`}
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {isLogin ? 'Welcome Back' : 'Join EcoTrack'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isLogin ? 'Track your environmental impact' : 'Start your sustainability journey'}
                </p>
              </div>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <span className="text-2xl">🌱</span>
              </div>
              <h4 className="text-xl font-bold">EcoTrack</h4>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering sustainable living through intelligent carbon tracking and actionable insights.
            </p>

            {/* Social icons */}
      <div className="flex space-x-3 mt-6">
           {/* fb */}
        <a href="https://www.facebook.com/" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-110">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
         </a>
  
         {/* instg */}
        <a href="https://www.instagram.com/" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center transition-all duration-200 hover:scale-110">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
  
              {/* reddit */}
          <a href="reddit" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-all duration-200 hover:scale-110">
           <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
           </svg>
          </a>
          </div>
      </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-emerald-400">Features</h4>
            <ul className="space-y-3">
              <li><a href="/" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                Carbon Calculator
              </a></li>
              <li><a href="/insights" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                Reduction Goals
              </a></li>
              <li><a href="/insights" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                Actionable Tips
              </a></li>
              <li><a href="/" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                Progress Tracking
              </a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-emerald-400">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                Blog
              </a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                Case Studies
              </a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                API Documentation
              </a></li>
              <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm flex items-center group">
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                Research
              </a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-emerald-400">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4">Get sustainability tips and updates</p>
            <div className="flex flex-col space-y-2">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">© 2025 EcoTrack. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Modern Toast Notification Component
const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    error: 'bg-gradient-to-r from-red-500 to-rose-500',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-500'
  };

  const icons = {
    error: '⚠️',
    success: '✓',
    info: 'ℹ️'
  };

  return (
    <div className={`fixed top-20 right-4 ${styles[type]} text-white px-6 py-4 rounded-xl shadow-2xl z-50 max-w-sm animate-in slide-in-from-right duration-300`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <span className="text-lg">{icons[type]}</span>
        </div>
        <span className="text-sm font-medium flex-1">{message}</span>
        <button 
          onClick={onClose}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

function App() {
  const { loading, logout } = useAuth();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('🟡 Global token expiry detected');
      logout();
      setToast({
        message: 'Your session has expired. Please log in again.',
        type: 'error'
      });
    };

    window.addEventListener('tokenExpired', handleTokenExpired);
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🌱</span>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading EcoTrack...</p>
          <p className="mt-2 text-sm text-gray-500">Preparing your sustainability dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col">
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        
        <Navbar />
        <main className="flex-grow pt-16">
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