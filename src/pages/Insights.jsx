import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { carbonAPI, goalsAPI } from '../services/api';

Chart.register(...registerables);

const Insights = () => {
  const { isAuthenticated } = useAuth();
  const footprintChartRef = useRef(null);
  const comparisonChartRef = useRef(null);
  
  const [insightsData, setInsightsData] = useState({
    summary: null,
    activities: [],
    goals: [],
    recommendations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadInsightsData();
    }
  }, [isAuthenticated]);

  const loadInsightsData = async () => {
    try {
      setLoading(true);
      
      // Load data from multiple endpoints
      const [summaryResponse, activitiesResponse, goalsResponse] = await Promise.all([
        carbonAPI.getSummary(),
        carbonAPI.getActivities(),
        goalsAPI.getGoals()
      ]);

      const processedData = processInsightsData(
        summaryResponse, 
        activitiesResponse, 
        goalsResponse
      );

      setInsightsData(processedData);
      
    } catch (error) {
      console.error('Failed to load insights data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update charts when data loads
  useEffect(() => {
    if (!insightsData.summary || loading) return;
    updateChartsWithRealData(insightsData);
  }, [insightsData, loading]);

  const updateChartsWithRealData = (data) => {
    // Update Footprint Chart with real data
    if (footprintChartRef.current) {
      footprintChartRef.current.destroy();
    }

    const footprintCtx = document.getElementById('footprintChart');
    if (footprintCtx) {
      const footprintChart = new Chart(footprintCtx, {
        type: 'radar',
        data: {
          labels: ['Transport', 'Food', 'Energy', 'Other'],
          datasets: [{
            label: 'Your Footprint',
            data: [
              data.summary.transport || 0,
              data.summary.food || 0, 
              data.summary.energy || 0,
              Math.max(0, (data.summary.total || 0) - (data.summary.transport || 0) - (data.summary.food || 0) - (data.summary.energy || 0))
            ],
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10b981',
            borderWidth: 2,
            pointBackgroundColor: '#10b981',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)'
              },
              suggestedMin: 0,
              suggestedMax: Math.max(50, ...Object.values(data.summary).filter(val => typeof val === 'number')) * 1.2
            }
          }
        }
      });
      footprintChartRef.current = footprintChart;
    }

    // Update Comparison Chart
    if (comparisonChartRef.current) {
      comparisonChartRef.current.destroy();
    }

    const comparisonCtx = document.getElementById('comparisonChart');
    if (comparisonCtx) {
      const comparisonChart = new Chart(comparisonCtx, {
        type: 'bar',
        data: {
          labels: ['Your Footprint', 'Similar Households', 'Climate Goal'],
          datasets: [{
            label: 'Monthly Carbon Footprint (kg CO₂)',
            data: [
              data.summary.total || 0,
              150, // Average household benchmark
              50   // Climate goal
            ],
            backgroundColor: [
              '#10b981',
              '#3b82f6', 
              '#8b5cf6'
            ],
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)'
              },
              title: {
                display: true,
                text: 'kg CO₂ per month'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
      comparisonChartRef.current = comparisonChart;
    }
  };

  // Calculate carbon score based on actual data
  const calculateCarbonScore = (summary) => {
    if (!summary || !summary.total) return 72;
    
    const total = summary.total;
    // Simple scoring: lower footprint = higher score
    const score = Math.max(0, Math.min(100, 100 - (total / 200 * 100)));
    return Math.round(score);
  };

  // Calculate savings based on footprint reduction
  const calculateSavings = (summary) => {
    if (!summary || !summary.total) return { current: 420, potential: 1200 };
    
    const total = summary.total;
    // Simple calculation: $10 savings per 10kg CO₂ reduction from average
    const currentSavings = Math.round((150 - total) * 1.0); // $1 per kg below average
    const potentialSavings = Math.round(currentSavings * 2.5); // 2.5x more potential
    
    return {
      current: Math.max(0, currentSavings),
      potential: Math.max(currentSavings, potentialSavings)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your insights...</p>
        </div>
      </div>
    );
  }

  const carbonScore = calculateCarbonScore(insightsData.summary);
  const savings = calculateSavings(insightsData.summary);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Sustainability Insights</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Based on {insightsData.activities.length} activities across all categories
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Carbon Score */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Your Carbon Score</p>
                  <p className="text-3xl font-bold text-gray-800">{carbonScore}/100</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  carbonScore >= 80 ? 'bg-emerald-100 text-emerald-800' :
                  carbonScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {carbonScore >= 80 ? 'Excellent' : carbonScore >= 60 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full ${
                    carbonScore >= 80 ? 'bg-emerald-500' :
                    carbonScore >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} 
                  style={{width: `${carbonScore}%`}}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                Total footprint: {insightsData.summary?.total?.toFixed(1) || 0} kg CO₂ this month
              </p>
            </div>
          </div>

          {/* Annual Savings */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Savings</p>
                  <p className="text-3xl font-bold text-gray-800">${savings.current}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">From your current reduction efforts</p>
            </div>
          </div>

          {/* Potential Savings */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Potential Savings</p>
                  <p className="text-3xl font-bold text-gray-800">${savings.potential}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">If you implement all recommendations</p>
            </div>
          </div>
        </div>

        {/* Main Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Footprint Breakdown */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Footprint Breakdown</h3>
              <div className="h-80">
                <canvas id="footprintChart" key="footprint-chart"></canvas>
              </div>
            </div>
          </div>

          {/* Comparison Chart */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Comparison With Benchmarks</h3>
              <div className="h-80">
                <canvas id="comparisonChart" key="comparison-chart"></canvas>
              </div>
            </div>
          </div>
        </div>

        {/* Top Recommendations */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-12">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Personalized Recommendations
            </h3>
            <div className="space-y-6">
              {insightsData.recommendations.map((rec, index) => (
                <RecommendationCard key={index} recommendation={rec} />
              ))}
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Your Activity Timeline</h3>
            <ProgressTimeline activities={insightsData.activities} />
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Components
const RecommendationCard = ({ recommendation }) => (
  <div className="border border-gray-100 rounded-lg p-6 hover:shadow-lg transition duration-300">
    <div className="flex items-start">
      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mr-4 mt-1">
        <span className="text-2xl">{recommendation.icon}</span>
      </div>
      <div className="flex-1">
        <h4 className="text-xl font-bold text-gray-800 mb-2">{recommendation.title}</h4>
        <div className="flex items-center mb-4">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mr-2">
            {recommendation.impact} tCO₂/month
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            ${recommendation.savings}/month savings
          </span>
        </div>
        <p className="text-gray-600 mb-4">{recommendation.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Difficulty: {recommendation.difficulty}</span>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition duration-300">
            Learn More
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ProgressTimeline = ({ activities }) => {
  const recentActivities = activities.slice(0, 5); // Show last 5 activities

  return (
    <div className="relative">
      <div className="border-l-2 border-emerald-200 absolute h-full left-4 top-0"></div>
      <div className="space-y-8">
        {recentActivities.map((activity, index) => (
          <div key={activity.id} className="relative pl-12">
            <div className="absolute w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center left-0">
              <span className="text-lg">✅</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-1 capitalize">
                {activity.category}: {activity.type}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {new Date(activity.date).toLocaleDateString()} • {activity.amount} {activity.unit}
              </p>
              <p className="text-gray-600">
                {activity.description || `Recorded ${activity.category} activity`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Data processing functions
function processInsightsData(summaryResponse, activitiesResponse, goalsResponse) {
  const activities = activitiesResponse?.activities || [];
  
  return {
    summary: summaryResponse?.summary || {},
    activities: activities,
    goals: goalsResponse?.goals || [],
    recommendations: generatePersonalizedRecommendations(activities, summaryResponse?.summary)
  };
}

function generatePersonalizedRecommendations(activities, summary) {
  const recommendations = [];
  
  // Analyze user patterns and generate recommendations
  const transportActivities = activities.filter(a => a.category === 'transport');
  const foodActivities = activities.filter(a => a.category === 'food');
  const energyActivities = activities.filter(a => a.category === 'energy');
  
  // Transport recommendations
  if (transportActivities.length > 0) {
    recommendations.push({
      title: "Optimize Your Commute",
      description: "Based on your transportation usage, consider carpooling or using public transit to reduce emissions.",
      impact: 0.3,
      savings: 50,
      difficulty: "Medium",
      icon: "🚗"
    });
  }
  
  // Food recommendations
  if (foodActivities.length > 0) {
    recommendations.push({
      title: "Plant-Based Options",
      description: "Try incorporating more plant-based meals to reduce your food carbon footprint.",
      impact: 0.2,
      savings: 30,
      difficulty: "Easy", 
      icon: "🌱"
    });
  }
  
  // Energy recommendations
  if (energyActivities.length > 0) {
    recommendations.push({
      title: "Energy Efficiency",
      description: "Your energy usage suggests opportunities for efficiency improvements and renewable options.",
      impact: 0.4,
      savings: 60,
      difficulty: "Medium",
      icon: "⚡"
    });
  }
  
  // Default recommendations if no specific patterns
  if (recommendations.length === 0) {
    recommendations.push(
      {
        title: "Start Tracking Regularly",
        description: "Continue logging your activities to get more personalized recommendations.",
        impact: 0.1,
        savings: 20,
        difficulty: "Easy",
        icon: "📊"
      }
    );
  }
  
  return recommendations;
}

export default Insights;