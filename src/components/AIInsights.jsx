import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchAIInsights = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ecotrack_token')}`
        },
        body: JSON.stringify({ timeframe: '30d' })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get insights');
      }
      
      setInsights(data.insights || []);
      
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      setError(error.message);
      // Set fallback insights
      setInsights([
        {
          title: "AI Insights Temporarily Unavailable",
          description: "We're having trouble connecting to our AI service. Here are some general tips to reduce your carbon footprint.",
          impact: "Medium",
          category: "general",
          savingsPotential: "Varies with implementation",
          actionSteps: ["Use public transportation when possible", "Reduce meat consumption", "Turn off unused electronics"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAIInsights();
    }
  }, [user]);

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'transport': return '🚗';
      case 'food': return '🍎';
      case 'energy': return '⚡';
      default: return '🌱';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">🤖</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gemini AI Insights</h3>
          <p className="text-sm text-gray-600">Personalized carbon reduction tips</p>
        </div>
        <button 
          onClick={fetchAIInsights}
          disabled={loading}
          className="ml-auto text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              <span>🔍</span>
              Refresh Insights
            </>
          )}
        </button>
      </div>

      {error && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <span>⚠️</span>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Gemini AI is analyzing your carbon footprint...</p>
          <p className="text-sm text-gray-500 mt-2">Examining your activities and patterns</p>
        </div>
      ) : insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className="border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-white rounded-r-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-lg">{getCategoryIcon(insight.category)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getImpactColor(insight.impact)}`}>
                      {insight.impact} Impact
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{insight.description}</p>
                  
                  {insight.savingsPotential && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                        💰 Save {insight.savingsPotential}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {insight.actionSteps && insight.actionSteps.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-600 mb-2">Action Steps:</p>
                  <ul className="space-y-1">
                    {insight.actionSteps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-600 font-medium">No insights yet</p>
          <p className="text-sm text-gray-500 mt-1">Start logging activities to get AI-powered recommendations</p>
          <button 
            onClick={fetchAIInsights}
            className="mt-4 text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Powered by Google Gemini AI • Your data remains private and secure
        </p>
      </div>
    </div>
  );
};

export default AIInsights;