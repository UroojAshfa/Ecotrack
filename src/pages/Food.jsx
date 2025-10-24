import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { carbonAPI } from '../services/api';

const Food = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    type: 'beef',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedItems, setSelectedItems] = useState([]);
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
      const response = await carbonAPI.getActivities('food');
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

  const toggleFoodItem = (foodType) => {
    setSelectedItems(prev => 
      prev.includes(foodType) 
        ? prev.filter(item => item !== foodType)
        : [...prev, foodType]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please sign in to track your food carbon footprint!');
      return;
    }

    if (selectedItems.length === 0 && !formData.type) {
      alert('Please select at least one food item');
      return;
    }

    setLoading(true);
    try {
      // Calculate for single item or multiple selected items
      const itemsToCalculate = selectedItems.length > 0 ? selectedItems : [formData.type];
      let totalEmissions = 0;

      for (const foodType of itemsToCalculate) {
        const result = await carbonAPI.calculate({
          category: 'food',
          type: foodType,
          amount: parseFloat(formData.amount) || 1, // Default to 1kg if no amount specified
          description: formData.description || `Food: ${foodType}`,
          date: formData.date
        });
        totalEmissions += result.emissions;
      }

      setCalculation({
        emissions: totalEmissions,
        items: itemsToCalculate
      });
      
      setFormData({
        type: 'beef',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setSelectedItems([]);
      
      await loadActivities();
      
    } catch (error) {
      console.error('Calculation failed:', error);
      alert('Failed to calculate carbon footprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const foodTypes = [
    { value: 'beef', label: 'Beef', icon: '🥩', impact: 'high' },
    { value: 'lamb', label: 'Lamb', icon: '🐑', impact: 'high' },
    { value: 'cheese', label: 'Cheese', icon: '🧀', impact: 'high' },
    { value: 'pork', label: 'Pork', icon: '🐖', impact: 'medium' },
    { value: 'chicken', label: 'Chicken', icon: '🍗', impact: 'medium' },
    { value: 'fish', label: 'Fish', icon: '🐟', impact: 'medium' },
    { value: 'eggs', label: 'Eggs', icon: '🥚', impact: 'medium' },
    { value: 'milk', label: 'Milk', icon: '🥛', impact: 'medium' },
    { value: 'vegetables', label: 'Vegetables', icon: '🥦', impact: 'low' },
    { value: 'fruits', label: 'Fruits', icon: '🍎', impact: 'low' },
    { value: 'grains', label: 'Grains', icon: '🌾', impact: 'low' },
    { value: 'nuts', label: 'Nuts', icon: '🥜', impact: 'low' },
    { value: 'tofu', label: 'Tofu', icon: '📦', impact: 'low' },
    { value: 'lentils', label: 'Lentils', icon: '🥣', impact: 'low' }
  ];

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Footprint</h1>
        <p className="text-gray-600">Track and reduce your emissions from dietary choices</p>
      </div>

      {/* Carbon Calculation Form */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Log Your Food Consumption</h3>
          
          {!isAuthenticated && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Sign in required:</strong> Please log in to track your food emissions and save your progress.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Food Items
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {foodTypes.map(food => (
                  <button
                    key={food.value}
                    type="button"
                    onClick={() => toggleFoodItem(food.value)}
                    className={`p-3 border rounded-lg text-center transition-all ${
                      selectedItems.includes(food.value)
                        ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50'
                        : getImpactColor(food.impact)
                    } hover:shadow-md`}
                  >
                    <div className="text-2xl mb-1">{food.icon}</div>
                    <div className="text-xs font-medium">{food.label}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {selectedItems.length} items
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Or Select Single Item
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {foodTypes.map(food => (
                    <option key={food.value} value={food.value}>
                      {food.icon} {food.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (kg)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  placeholder="e.g., 0.5"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for 1kg (standard portion)
                </p>
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
                placeholder="e.g., Dinner, Lunch meal, etc."
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
              {loading ? 'Calculating...' : 'Calculate Food Carbon Footprint'}
            </button>
          </form>

          {calculation && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Carbon Calculation Result</h4>
              <p className="text-green-700">
                Your food consumption generated <strong>{calculation.emissions.toFixed(1)} kg CO₂</strong>
              </p>
              {calculation.items && (
                <p className="text-sm text-green-600 mt-1">
                  Items: {calculation.items.map(item => foodTypes.find(f => f.value === item)?.label).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Food Impact Guide */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Food Impact Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="text-2xl mb-2">🥩</div>
              <h4 className="font-medium text-red-800 mb-1">High Impact</h4>
              <p className="text-sm text-red-600">Beef, Lamb, Cheese</p>
              <p className="text-xs text-red-500 mt-2">27-39 kg CO₂ per kg</p>
            </div>
            <div className="text-center p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <div className="text-2xl mb-2">🍗</div>
              <h4 className="font-medium text-yellow-800 mb-1">Medium Impact</h4>
              <p className="text-sm text-yellow-600">Pork, Chicken, Fish, Dairy</p>
              <p className="text-xs text-yellow-500 mt-2">3-13 kg CO₂ per kg</p>
            </div>
            <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="text-2xl mb-2">🥦</div>
              <h4 className="font-medium text-green-800 mb-1">Low Impact</h4>
              <p className="text-sm text-green-600">Plants, Grains, Legumes</p>
              <p className="text-xs text-green-500 mt-2">0.3-2 kg CO₂ per kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      {isAuthenticated && activities.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Food Activities</h3>
            <div className="space-y-3">
              {activities.slice(0, 5).map(activity => (
                <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {foodTypes.find(f => f.value === activity.type)?.icon || '🍽️'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800 capitalize">{activity.type}</p>
                      <p className="text-sm text-gray-500">
                        {activity.amount} kg • {new Date(activity.date).toLocaleDateString()}
                      </p>
                      {activity.description && (
                        <p className="text-sm text-gray-400">{activity.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">
                      {activity.amount * getEmissionFactor(activity.type)} kg CO₂
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(foodTypes.find(f => f.value === activity.type)?.impact)}`}>
                      {foodTypes.find(f => f.value === activity.type)?.impact} impact
                    </span>
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
            <p className="text-gray-500">No food activities logged yet.</p>
            <p className="text-sm text-gray-400 mt-1">Start logging your food consumption above!</p>
          </div>
        </div>
      )}
    </main>
  );
};

// Helper function to calculate emissions for display
function getEmissionFactor(type) {
  const factors = {
    beef: 27.0,
    lamb: 39.2,
    cheese: 13.5,
    pork: 12.1,
    chicken: 6.9,
    fish: 6.1,
    eggs: 4.8,
    milk: 3.2,
    vegetables: 2.0,
    fruits: 1.1,
    grains: 1.4,
    nuts: 0.3,
    tofu: 2.0,
    lentils: 0.9
  };
  return factors[type] || 5.0;
}

export default Food;