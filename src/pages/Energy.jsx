import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { carbonAPI } from '../services/api';

Chart.register(...registerables);

const Energy = () => {
  const { isAuthenticated } = useAuth();
  const monthlyEnergyChartRef = useRef(null);
  const energySourceChartRef = useRef(null);
  
  const [formData, setFormData] = useState({
    reading: '',
    source: 'Grid Electricity',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    description: ''
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
      const response = await carbonAPI.getActivities('energy');
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
      alert('Please sign in to track your energy usage!');
      return;
    }

    if (!formData.reading || formData.reading <= 0) {
      alert('Please enter a valid meter reading');
      return;
    }

    setLoading(true);
    try {
      // Use your existing calculate endpoint
      const result = await carbonAPI.calculate({
        category: 'energy',
        type: formData.source.toLowerCase().replace(' ', '-'),
        amount: parseFloat(formData.reading),
        description: formData.description || `Energy: ${formData.source}`,
        date: formData.startDate
      });

      if (result.success) {
        setCalculation({
          emissions: result.emissions,
          source: formData.source
        });
        
        // Reset form
        setFormData({
          reading: '',
          source: 'Grid Electricity',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          description: ''
        });
        
        // Reload activities
        await loadActivities();
      }
      
    } catch (error) {
      console.error('Calculation failed:', error);
      alert('Failed to save energy reading. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize charts
  useEffect(() => {
    let monthlyEnergyChart = null;
    let energySourceChart = null;

    // Update chart data based on actual activities
    const energyActivities = activities.filter(activity => activity.category === 'energy');
    const monthlyData = calculateMonthlyData(energyActivities);
    const sourceData = calculateSourceData(energyActivities);

    // Monthly Energy Chart
    const monthlyEnergyCtx = document.getElementById('monthlyEnergyChart');
    if (monthlyEnergyCtx) {
      if (monthlyEnergyChartRef.current) {
        monthlyEnergyChartRef.current.destroy();
      }
      
      monthlyEnergyChart = new Chart(monthlyEnergyCtx, {
        type: 'line',
        data: {
          labels: monthlyData.labels,
          datasets: [{
            label: 'CO₂ Emissions (kg)',
            data: monthlyData.emissions,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: false,
              grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: { grid: { display: false } }
          }
        }
      });
      monthlyEnergyChartRef.current = monthlyEnergyChart;
    }

    // Energy Source Chart
    const energySourceCtx = document.getElementById('energySourceChart');
    if (energySourceCtx) {
      if (energySourceChartRef.current) {
        energySourceChartRef.current.destroy();
      }
      
      energySourceChart = new Chart(energySourceCtx, {
        type: 'pie',
        data: {
          labels: sourceData.labels,
          datasets: [{
            data: sourceData.values,
            backgroundColor: [
              '#71717a', // Grid Electricity
              '#64748b', // Natural Gas
              '#6366f1', // Solar
              '#10b981', // Wind
              '#f59e0b'  // Other
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right' } }
        }
      });
      energySourceChartRef.current = energySourceChart;
    }

    // Cleanup function
    return () => {
      if (monthlyEnergyChart) monthlyEnergyChart.destroy();
      if (energySourceChart) energySourceChart.destroy();
    };
  }, [activities]);

  // Helper functions for chart data
  const calculateMonthlyData = (energyActivities) => {
    // Default data if no activities
    if (energyActivities.length === 0) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        emissions: [700, 650, 620, 600, 580, 560, 540]
      };
    }

    // Group by month and calculate emissions
    const monthlyEmissions = {};
    energyActivities.forEach(activity => {
      const month = new Date(activity.date).toLocaleString('default', { month: 'short' });
      const emissions = activity.amount * getEmissionFactor(activity.type);
      
      if (!monthlyEmissions[month]) {
        monthlyEmissions[month] = 0;
      }
      monthlyEmissions[month] += emissions;
    });

    const labels = Object.keys(monthlyEmissions);
    const emissions = Object.values(monthlyEmissions);

    return { labels, emissions };
  };

  const calculateSourceData = (energyActivities) => {
    if (energyActivities.length === 0) {
      return {
        labels: ['Grid Electricity', 'Solar', 'Wind', 'Hydropower', 'Other'],
        values: [60, 15, 10, 10, 5]
      };
    }

    const sourceCount = {};
    energyActivities.forEach(activity => {
      const source = activity.type.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      if (!sourceCount[source]) {
        sourceCount[source] = 0;
      }
      sourceCount[source]++;
    });

    const labels = Object.keys(sourceCount);
    const values = Object.values(sourceCount);

    return { labels, values };
  };

  const scrollToLogEnergy = () => {
    document.getElementById('log-energy')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getSourceIcon = (source) => {
    const icons = {
      'Grid Electricity': '⚡',
      'Solar': '☀️',
      'Wind': '💨',
      'Hydropower': '💧',
      'Other Renewable': '🌱',
      'grid-electricity': '⚡',
      'solar': '☀️',
      'wind': '💨',
      'hydropower': '💧',
      'other-renewable': '🌱'
    };
    return icons[source] || '⚡';
  };

  const formatSourceName = (source) => {
    return source.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Energy Footprint</h1>
        <p className="text-gray-600">Track and reduce your emissions from home energy usage</p>
      </div>

      {/* Authentication Notice */}
      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            <strong>Sign in required:</strong> Please log in to track your energy emissions and save your progress.
          </p>
        </div>
      )}

      {/* Energy Summary - Update with real data later */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Carbon Summary */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                <span className="text-2xl">☁️</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Emissions</p>
                <p className="text-2xl font-bold text-gray-800">
                  {activities.length > 0 ? calculateTotalEmissions(activities).toFixed(1) : '0.0'} kg CO₂
                </p>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Activities</span>
              <span>{activities.length} entries</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{width: `${Math.min((activities.length / 10) * 100, 100)}%`}}
              ></div>
            </div>
            <p className="text-xs text-green-600 mt-1">
              {activities.length > 0 ? 'Tracking active' : 'Start logging your energy usage'}
            </p>
          </div>
        </div>

        {/* Electricity Usage */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Recent Usage</p>
                <p className="text-2xl font-bold text-gray-800">
                  {activities.length > 0 ? activities[0].amount : '0'} kWh
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="font-medium text-gray-800">
                  {activities.length > 0 ? formatSourceName(activities[0].type) : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Carbon Intensity</p>
                <p className="font-medium text-gray-800">
                  {getEmissionFactor(activities.length > 0 ? activities[0].type : 'grid-electricity').toFixed(2)} kg/kWh
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Renewable Energy */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <span className="text-2xl">☀️</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Renewable %</p>
                <p className="text-2xl font-bold text-gray-800">
                  {calculateRenewablePercentage(activities)}%
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {calculateRenewablePercentage(activities) < 50 
                ? 'You could save emissions by switching to renewable sources' 
                : 'Great job using renewable energy!'}
            </p>
            <button 
              onClick={scrollToLogEnergy}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all"
            >
              Log Energy Reading
            </button>
          </div>
        </div>
      </div>

      {/* Rest of your component remains the same */}
      {/* Energy Breakdown, Smart Devices, Log Energy Form, Actionable Tips sections... */}
      
      {/* Recent Energy Activities */}
      {isAuthenticated && activities.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Energy Activities</h3>
            <div className="space-y-3">
              {activities.slice(0, 5).map(activity => (
                <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {getSourceIcon(activity.type)}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{formatSourceName(activity.type)}</p>
                      <p className="text-sm text-gray-500">
                        {activity.amount} kWh • {new Date(activity.date).toLocaleDateString()}
                      </p>
                      {activity.description && (
                        <p className="text-sm text-gray-400">{activity.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">
                      {(activity.amount * getEmissionFactor(activity.type)).toFixed(1)} kg CO₂
                    </p>
                    <span className="text-xs text-gray-500">
                      {getEmissionFactor(activity.type).toFixed(3)} kg/kWh
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Log Energy Form - Keep your existing form but it's now connected */}
      <div id="log-energy" className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Log Your Energy Usage</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meter Reading (kWh)</label>
              <input 
                type="number" 
                name="reading"
                value={formData.reading}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                placeholder="e.g. 450" 
                required
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Energy Source</label>
              <select 
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Grid Electricity">Grid Electricity</option>
                <option value="Solar">Solar</option>
                <option value="Wind">Wind</option>
                <option value="Hydropower">Hydropower</option>
                <option value="Other Renewable">Other Renewable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Period</label>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="date" 
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                />
                <input 
                  type="date" 
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <input 
                type="text" 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                placeholder="e.g., Monthly electricity bill"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !isAuthenticated}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              {loading ? 'Saving...' : 'Save Reading'}
            </button>
          </form>

          {calculation && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Energy Reading Saved</h4>
              <p className="text-green-700">
                Your energy usage generated <strong>{calculation.emissions.toFixed(1)} kg CO₂</strong>
              </p>
              <p className="text-sm text-green-600 mt-1">
                Source: {calculation.source}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Keep the rest of your existing sections */}
      {/* Smart Devices, Actionable Tips, etc. */}
      
    </main>
  );
};

// Helper functions
function getEmissionFactor(source) {
  const factors = {
    'grid-electricity': 0.475,
    'solar': 0.045,
    'wind': 0.011,
    'hydropower': 0.024,
    'other-renewable': 0.015,
    'Grid Electricity': 0.475,
    'Solar': 0.045,
    'Wind': 0.011,
    'Hydropower': 0.024,
    'Other Renewable': 0.015
  };
  return factors[source] || 0.475;
}

function calculateTotalEmissions(activities) {
  return activities.reduce((total, activity) => {
    return total + (activity.amount * getEmissionFactor(activity.type));
  }, 0);
}

function calculateRenewablePercentage(activities) {
  if (activities.length === 0) return 0;
  
  const renewableSources = ['solar', 'wind', 'hydropower', 'other-renewable', 'Solar', 'Wind', 'Hydropower', 'Other Renewable'];
  const renewableActivities = activities.filter(activity => 
    renewableSources.includes(activity.type)
  );
  
  return Math.round((renewableActivities.length / activities.length) * 100);
}

export default Energy;