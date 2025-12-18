import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const GeminiService = {
  async generateCarbonInsights(activities, userProfile = {}) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `
        You are an expert environmental scientist and carbon footprint analyst. 
        Analyze the following carbon footprint data and provide 3 personalized, actionable insights.
        
        USER CARBON DATA:
        ${JSON.stringify(activities.slice(0, 25), null, 2)}
        
        Please provide insights in this exact JSON format:
        {
          "insights": [
            {
              "title": "Short, impactful title (max 6 words)",
              "description": "Detailed explanation with specific numbers and data from their activities. Be encouraging and practical.",
              "impact": "High/Medium/Low",
              "category": "transport/food/energy",
              "savingsPotential": "Estimated CO2 savings if action is taken",
              "actionSteps": ["Step 1", "Step 2", "Step 3"]
            }
          ]
        }
        
        Focus on:
        1. Identifying the biggest emission sources
        2. Spotting patterns and trends in their behavior
        3. Providing practical, achievable recommendations
        4. Estimating potential carbon savings
        5. Being encouraging and supportive
        
        Make the insights personalized to their actual data. If they have high transport emissions, focus on transport solutions.
        If they eat a lot of meat, focus on food choices. Be specific and data-driven.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response (Gemini sometimes adds markdown)
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      
      try {
        return JSON.parse(cleanText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', cleanText);
        // Fallback to mock data if parsing fails
        return this.getFallbackInsights(activities);
      }
    } catch (error) {
      console.error('Gemini AI error:', error);
      return this.getFallbackInsights(activities);
    }
  },

  getFallbackInsights(activities) {
    // Smart fallback based on actual data
    const transportCount = activities.filter(a => a.category === 'transport').length;
    const foodCount = activities.filter(a => a.category === 'food').length;
    const energyCount = activities.filter(a => a.category === 'energy').length;
    
    const insights = [];
    
    if (transportCount > foodCount && transportCount > energyCount) {
      insights.push({
        title: "Transport is Your Top Emitter",
        description: `Based on your ${transportCount} transport activities, this category contributes the most to your carbon footprint. Consider carpooling or using public transportation.`,
        impact: "High",
        category: "transport",
        savingsPotential: "Up to 30% reduction possible",
        actionSteps: ["Try public transport 2 days/week", "Explore carpooling options", "Combine errands to reduce trips"]
      });
    }
    
    if (foodCount > 0) {
      insights.push({
        title: "Food Choices Matter",
        description: `Your ${foodCount} food-related activities show dietary impact. Plant-based meals can significantly reduce emissions.`,
        impact: "Medium",
        category: "food", 
        savingsPotential: "1-2 kg CO₂ per meal",
        actionSteps: ["Try meat-free Mondays", "Choose local produce", "Reduce food waste"]
      });
    }
    
    insights.push({
      title: "Track Consistently for Better Insights",
      description: "Regular tracking helps identify patterns. Keep logging your activities for more personalized recommendations.",
      impact: "Low",
      category: "general",
      savingsPotential: "Varies with consistency",
      actionSteps: ["Log activities daily", "Set weekly reminders", "Review trends monthly"]
    });
    
    return { insights: insights.slice(0, 3) };
  },

  async predictFutureEmissions(historicalData, months = 6) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Based on this historical carbon emission data, predict the trend for the next ${months} months:
      ${JSON.stringify(historicalData)}
      
      Return as JSON: { prediction: string, confidence: "High/Medium/Low", recommendation: string }
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return JSON.parse(response.text().replace(/```json\n?|\n?```/g, '').trim());
  }
};