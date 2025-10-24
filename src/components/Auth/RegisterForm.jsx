
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = ({ onSwitchToLogin, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ isValid: false, feedback: '' });
  const { register, validatePasswordStrength, isCommonPassword } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (error) setError('');

    // Validate password strength in real-time
    if (name === 'password') {
      const strength = validatePasswordStrength(value);
      setPasswordStrength(strength);
      
      // Check for common passwords
      if (value && isCommonPassword(value)) {
        setPasswordStrength({
          isValid: false,
          feedback: 'This password is too common and easily guessable.'
        });
      }
    }
  };

  // Validate form before submission
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!passwordStrength.isValid) {
      setError(passwordStrength.feedback || 'Password does not meet security requirements');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      onSuccess(); // Close modal on success
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrengthColor = () => {
    if (!formData.password) return 'bg-gray-200';
    if (passwordStrength.isValid) return 'bg-green-500';
    if (formData.password.length >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPasswordStrengthText = () => {
    if (!formData.password) return '';
    if (passwordStrength.isValid) return 'Strong password';
    if (formData.password.length >= 6) return 'Medium - add uppercase, lowercase, and numbers';
    return 'Too short';
  };

  return (
    <div className="max-w-md w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Account</h2>
      
      {error && (
        <div className={`p-4 rounded-md mb-4 ${
          error.includes('Too many attempts') 
            ? 'bg-orange-100 border border-orange-400 text-orange-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-center">
            {error.includes('Too many attempts') ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Rate Limited</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Registration Failed</span>
              </>
            )}
          </div>
          <p className="mt-1 text-sm">{error}</p>
          {error.includes('Too many attempts') && (
            <p className="mt-2 text-xs text-orange-600">
              This is a security feature to prevent spam registrations.
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
            placeholder="Enter your full name"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
            placeholder="Create a strong password"
            required
            disabled={loading}
          />
          
          {/* Password strength indicator */}
          {formData.password && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: passwordStrength.isValid ? '100%' : formData.password.length >= 6 ? '60%' : '30%' }}
                  ></div>
                </div>
              </div>
              <p className={`text-xs ${
                passwordStrength.isValid ? 'text-green-600' : 
                formData.password.length >= 6 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {getPasswordStrengthText()}
              </p>
            </div>
          )}

          {/* Password requirements */}
          <div className="mt-2 text-xs text-gray-500">
            <p className="font-medium mb-1">Password must contain:</p>
            <ul className="list-disc list-inside space-y-1">
              <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                At least 8 characters
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                One uppercase letter
              </li>
              <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                One lowercase letter
              </li>
              <li className={/\d/.test(formData.password) ? 'text-green-600' : ''}>
                One number
              </li>
            </ul>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-200 ${
              formData.confirmPassword && formData.password !== formData.confirmPassword
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-300 focus:border-emerald-500'
            }`}
            placeholder="Confirm your password"
            required
            disabled={loading}
          />
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !passwordStrength.isValid || formData.password !== formData.confirmPassword}
          className="w-full bg-emerald-600 text-white py-2 rounded-md font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onSwitchToLogin}
          disabled={loading}
          className="text-emerald-600 hover:text-emerald-700 font-medium text-sm disabled:opacity-50 transition duration-200"
        >
          Already have an account? Sign in
        </button>
      </div>


    </div>
  );
};

export default RegisterForm;