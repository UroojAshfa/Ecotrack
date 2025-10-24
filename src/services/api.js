// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Enhanced error handler for security responses
function handleApiError(error, endpoint) {
  console.error(`API Error [${endpoint}]:`, error);
  
  // Handle rate limiting errors
  if (error.message?.includes('Too many attempts') || error.message?.includes('429')) {
    throw new Error('Too many requests. Please wait and try again.');
  }
  
  // Handle password validation errors
  if (error.message?.includes('Password does not meet security requirements')) {
    if (error.details) {
      throw new Error(`Password requirements: ${error.details.join(', ')}`);
    }
    throw new Error('Password must be at least 8 characters with uppercase, lowercase letters and numbers');
  }
  
  // Handle common password errors
  if (error.message?.includes('too common')) {
    throw new Error('This password is too common. Please choose a stronger password.');
  }
  
  // Handle user already exists
  if (error.message?.includes('User with this email already exists')) {
    throw new Error('An account with this email already exists. Please log in instead.');
  }
  
  // Handle token expiration
  if (error.message?.includes('Token expired')) {
    localStorage.removeItem('ecotrack_token');
    localStorage.removeItem('ecotrack_user');
    window.dispatchEvent(new Event('tokenExpired'));
    throw new Error('Your session has expired. Please log in again.');
  }
  
  // Handle invalid token
  if (error.message?.includes('Invalid token') || error.message?.includes('401') || error.message?.includes('403')) {
    localStorage.removeItem('ecotrack_token');
    localStorage.removeItem('ecotrack_user');
    window.dispatchEvent(new Event('tokenExpired'));
    throw new Error('Please log in again.');
  }
  
  // Re-throw the original error if no specific handling
  throw error;
}

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('ecotrack_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    // Handle rate limiting (429) specifically
    if (response.status === 429) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Too many requests. Please try again later.');
    }
    
    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      localStorage.removeItem('ecotrack_token');
      localStorage.removeItem('ecotrack_user');
      window.dispatchEvent(new Event('tokenExpired'));
      throw new Error(errorData.error || 'Authentication failed. Please log in again.');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      // Add the response data to the error for better handling
      const error = new Error(data.error || `API request failed with status ${response.status}`);
      error.responseData = data;
      error.status = response.status;
      throw error;
    }
    
    return data;
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}

// Enhanced Auth API with better error handling
export const authAPI = {
  register: async (userData) => {
    try {
      return await apiCall('/auth/register', { method: 'POST', body: userData });
    } catch (error) {
      throw error; // Error is already handled by handleApiError
    }
  },
  
  login: async (credentials) => {
    try {
      return await apiCall('/auth/login', { method: 'POST', body: credentials });
    } catch (error) {
      throw error; // Error is already handled by handleApiError
    }
  },
};

// Carbon Calculation API
export const carbonAPI = {
  calculate: (data) => apiCall('/calculate', { method: 'POST', body: data }),
  getSummary: () => apiCall('/footprint/summary'),
  getActivities: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const queryString = queryParams.toString();
    return apiCall(`/activities${queryString ? `?${queryString}` : ''}`);
  },
};

// Goals API
export const goalsAPI = {
  getGoals: () => apiCall('/goals'),
  createGoal: (goalData) => apiCall('/goals', { method: 'POST', body: goalData }),
};

// Tips API
export const tipsAPI = {
  getTips: (category) => apiCall(`/tips${category ? `?category=${category}` : ''}`),
};

// Public API (no auth required)
export const publicAPI = {
  calculatePublic: (data) => apiCall('/calculate/public', { method: 'POST', body: data }),
  getEmissionFactors: () => apiCall('/emission-factors'),
};

// Analytics API (for historical trends)
export const analyticsAPI = {
  getHistoricalData: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiCall(`/analytics/historical${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  },
};

// Export API (for data export)
export const exportAPI = {
  exportData: (format = 'json') => {
    return fetch(`${API_BASE}/export/data?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('ecotrack_token')}`,
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Export failed');
      }
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecotrack-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true, message: 'Data exported successfully' };
    })
    .catch(error => {
      console.error('Export error:', error);
      throw new Error('Failed to export data');
    });
  },
};

// Health check API
export const healthAPI = {
  checkHealth: () => apiCall('/health'),
  checkDbHealth: () => apiCall('/db-health'),
  checkSecurity: () => apiCall('/security-test'),
};

// Utility function to check token validity
export const checkTokenValidity = async () => {
  const token = localStorage.getItem('ecotrack_token');
  if (!token) return false;
  
  try {
    await carbonAPI.getSummary();
    return true;
  } catch (error) {
    if (error.message.includes('Invalid token') || error.message.includes('401') || error.message.includes('403')) {
      localStorage.removeItem('ecotrack_token');
      localStorage.removeItem('ecotrack_user');
      window.dispatchEvent(new Event('tokenExpired'));
      return false;
    }
    // For other errors (network, server issues), assume token might still be valid
    return true;
  }
};

// Global token expiration listener
if (typeof window !== 'undefined') {
  window.addEventListener('tokenExpired', () => {
    // This can be used by components to show login modal or redirect
    console.log('Token expired - user should be logged out');
  });
}

export default apiCall;