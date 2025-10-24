import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { carbonAPI } from '../services/api';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const Transport = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    type: 'car',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [calculation, setCalculation] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadActivities();
    }
  }, [isAuthenticated]);

  const loadActivities = async () => {
    try {
      const response = await carbonAPI.getActivities('transport');
      setActivities(response.activities || []);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please sign in to track your carbon footprint!');
      return;
    }

    setLoading(true);
    try {
      const result = await carbonAPI.calculate({
        category: 'transport',
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date
      });
      
      setCalculation(result);
      setFormData({
        type: 'car',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      // Reload activities to show the new entry
      await loadActivities();
      
    } catch (error) {
      console.error('Calculation failed:', error);
      alert('Failed to calculate carbon footprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const transportTypes = [
    { value: 'car', label: 'Car (Gasoline)', icon: '🚗' },
    { value: 'electric_car', label: 'Electric Car', icon: '⚡' },
    { value: 'bus', label: 'Bus', icon: '🚌' },
    { value: 'train', label: 'Train', icon: '🚆' },
    { value: 'subway', label: 'Subway', icon: '🚇' },
    { value: 'bicycle', label: 'Bicycle', icon: '🚲' },
    { value: 'walking', label: 'Walking', icon: '🚶' },
    { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
    { value: 'flight', label: 'Flight', icon: '✈️' },
    { value: 'carpool', label: 'Carpool', icon: '👥' }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transportation Footprint</h1>
        <p className="text-gray-600">Track and reduce your emissions from daily commutes and travel</p>
      </div>

      {/* Carbon Calculation Form */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Log Your Trip</h3>
          
          {!isAuthenticated && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Sign in required:</strong> Please log in to track your transportation emissions and save your progress.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transportation Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {transportTypes.map(transport => (
                    <option key={transport.value} value={transport.value}>
                      {transport.icon} {transport.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance (miles)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  placeholder="e.g., 15.5"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g., Commute to work, Grocery trip, etc."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !isAuthenticated}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              {loading ? 'Calculating...' : 'Calculate Carbon Footprint'}
            </button>
          </form>

          {calculation && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Carbon Calculation Result</h4>
              <p className="text-green-700">
                Your trip generated <strong>{calculation.emissions} kg CO₂</strong>
              </p>
              <p className="text-sm text-green-600 mt-1">
                This has been saved to your carbon footprint tracker.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      {isAuthenticated && activities.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transportation Activities</h3>
            <div className="space-y-3">
              {activities.slice(0, 5).map(activity => (
                <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {transportTypes.find(t => t.value === activity.type)?.icon || '🚗'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800 capitalize">{activity.type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">
                        {activity.amount} miles • {new Date(activity.date).toLocaleDateString()}
                      </p>
                      {activity.description && (
                        <p className="text-sm text-gray-400">{activity.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">
                      {((activity.amount * getEmissionFactor(activity.type)) || 0).toFixed(1)} kg CO₂
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && activities.length === 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 text-center">
            <p className="text-gray-500">No transportation activities logged yet.</p>
            <p className="text-sm text-gray-400 mt-1">Start logging your trips above!</p>
          </div>
        </div>
      )}
    </main>
  );
};

// Helper function to calculate emissions for display
function getEmissionFactor(type) {
  const factors = {
    car: 0.404,
    electric_car: 0.1,
    bus: 0.17,
    train: 0.14,
    subway: 0.15,
    bicycle: 0,
    walking: 0,
    motorcycle: 0.24,
    flight: 0.254,
    carpool: 0.202
  };
  return factors[type] || 0.3;
}

export default Transport;