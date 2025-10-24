import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { tipsAPI, goalsAPI } from '../services/api';

// Goals Section Component
const GoalsSection = () => {
  const { isAuthenticated } = useAuth();
  const [goals, setGoals] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    targetEmissions: '',
    description: '',
    deadline: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadGoals();
    }
  }, [isAuthenticated]);

  const loadGoals = async () => {
    try {
      const response = await goalsAPI.getGoals();
      setGoals(response.goals || []);
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await goalsAPI.createGoal(formData);
      setFormData({ 
        title: '', 
        targetEmissions: '', 
        description: '', 
        deadline: '' 
      });
      setShowCreateForm(false);
      await loadGoals();
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('Failed to create goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (goal) => {
    if (!goal.targetEmissions || goal.targetEmissions === 0) return 0;
    const progress = (goal.currentEmissions / goal.targetEmissions) * 100;
    return Math.min(100, Math.round(progress));
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Carbon Reduction Goals</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="text-sm bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition duration-200"
          >
            + New Goal
          </button>
        </div>

        {/* Create Goal Form */}
        {showCreateForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Create New Goal</h4>
            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Goal title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    placeholder="Target kg CO₂"
                    value={formData.targetEmissions}
                    onChange={(e) => setFormData({ ...formData, targetEmissions: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    min="1"
                    step="0.1"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    placeholder="Deadline"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div>
                <textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows="2"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50 transition duration-200"
                >
                  {loading ? 'Creating...' : 'Create Goal'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-4">
          {goals.slice(0, 3).map((goal) => {
            const progress = calculateProgress(goal);
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isOverdue = daysRemaining && daysRemaining < 0;
            
            return (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{goal.title}</h4>
                    {goal.description && (
                      <p className="text-gray-600 text-xs mb-2">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Target: {goal.targetEmissions} kg CO₂</span>
                      {goal.deadline && (
                        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                          {isOverdue ? 'Overdue' : daysRemaining ? `${daysRemaining} days left` : 'Deadline passed'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    goal.isCompleted 
                      ? 'bg-green-100 text-green-800' 
                      : isOverdue
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {progress}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      progress >= 100 ? 'bg-green-500' :
                      progress >= 75 ? 'bg-emerald-500' :
                      progress >= 50 ? 'bg-yellow-500' :
                      progress >= 25 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Progress: {goal.currentEmissions || 0} / {goal.targetEmissions} kg</span>
                  <span>Created: {new Date(goal.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}

          {goals.length === 0 && !showCreateForm && (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm text-gray-500 mb-2">No goals set yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="text-emerald-600 text-sm hover:text-emerald-700 font-medium"
              >
                Create your first goal
              </button>
            </div>
          )}

          {goals.length > 3 && (
            <div className="text-center pt-2">
              <a 
                href="/goals" 
                className="text-emerald-600 text-sm hover:text-emerald-700 font-medium"
              >
                View all {goals.length} goals →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [footprintData, setFootprintData] = useState(null);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    if (!isAuthenticated) {
      setFootprintData({
        summary: {
          transport: 12.5,
          food: 8.2,
          energy: 6.1,
          total: 26.8
        },
        recentEntries: [],
        totalEntries: 0,
        period: 'demo_data'
      });
      loadTips();
      return;
    }

    setLoading(true);
    try {
      const [tipsResponse] = await Promise.all([
        tipsAPI.getTips(),
      ]);
      
      setTips(tipsResponse.tips);
      setFootprintData({
        summary: {
          transport: 8.4,
          food: 6.2,
          energy: 4.1,
          total: 18.7
        },
        recentEntries: [],
        totalEntries: 0,
        period: 'demo_authenticated'
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setFootprintData({
        summary: {
          transport: 8.4,
          food: 6.2,
          energy: 4.1,
          total: 18.7
        },
        recentEntries: [],
        totalEntries: 0,
        period: 'demo_fallback'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTips = async () => {
    try {
      const tipsResponse = await tipsAPI.getTips();
      setTips(tipsResponse.tips);
    } catch (error) {
      console.error('Failed to load tips:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your carbon footprint...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.name || 'Eco Warrior';
  const isRealData = footprintData?.period === 'real_data';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Fixed padding */}
      <header className="pt-16 pb-16 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-3xl mx-auto">
          
          <h1 className="text-4xl md:text-5xl font-roboto font-extrabold text-gray-900 mb-6">
          {/*<h1 className="text-4xl md:text-5xl font-extrabold font-roboto bg-gradient-to-r from-emerald-500 to-emerald-500 bg-clip-text text-transparent mb-6">*/}
            {isAuthenticated ? `Welcome back, ${displayName}!` : 'Track Your Carbon Footprint'}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {isAuthenticated 
              ? 'Your environmental impact at a glance' 
              : 'Understand and reduce your environmental impact with real-time data'
            }
          </p>
          {!isAuthenticated && (
            <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-yellow-800 text-sm">
                <strong>Demo Mode:</strong> Showing sample data. Sign in to track your actual carbon footprint!
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - No negative margin */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Carbon Footprint Summary */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isAuthenticated ? 'Your Carbon Footprint' : 'Sample Carbon Footprint'}
              </h2>
              <div className="flex items-center space-x-2">
                {!isRealData && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Sample Data
                  </span>
                )}
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                  {footprintData?.summary?.total ? footprintData.summary.total.toFixed(1) : '0'} kg CO₂
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {footprintData?.summary && Object.entries(footprintData.summary)
                .filter(([key]) => key !== 'total')
                .map(([category, emissions]) => (
                  <div key={category} className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition cursor-pointer">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                        <span className="text-lg">
                          {category === 'transport' ? '🚗' : 
                           category === 'food' ? '🍽️' : 
                           category === 'energy' ? '⚡' : '📊'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 capitalize">{category}</p>
                        <p className="font-bold text-gray-800">{emissions.toFixed(1)} kg CO₂</p>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-emerald-500 rounded-full" 
                        style={{
                          width: `${(emissions / (footprintData.summary.total || 1)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>

            {!isAuthenticated && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-blue-800 font-medium">
                  Ready to track your actual carbon footprint?
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Sign in to start logging your activities and see your real impact!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Dashboard Grid with Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Goals Section - Takes one column */}
          <GoalsSection />

          {/* Carbon Reduction Tips - Takes two columns */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Carbon Reduction Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tips.slice(0, 4).map((tip) => (
                  <div key={tip.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition duration-300">
                    <div className="flex items-center mb-3">
                      <div className={`w-10 h-10 rounded-full ${
                        tip.impact === 'high' ? 'bg-red-100' :
                        tip.impact === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                      } flex items-center justify-center mr-3`}>
                        <span className="text-lg">💡</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{tip.title}</h4>
                        <p className="text-xs text-gray-500 capitalize">{tip.category} • {tip.difficulty}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{tip.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Saves {tip.savings}kg CO₂
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tip.impact === 'high' ? 'bg-red-100 text-red-800' :
                        tip.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {tip.impact} impact
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {tips.length > 4 && (
                <div className="mt-4 text-center">
                  <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                    View All {tips.length} Tips →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;