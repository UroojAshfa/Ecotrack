# 🌱 EcoTrack Carbon Footprint Tracker
### AI-Powered Carbon Emission Tracking with Real-Time Analytics & Personalized Reduction Recommendations


### 🌟 Live Demo

🌐 **Live Application**: [Deployment pending — but you can still showcase your work]
Upload a screen recording to YouTube, Loom, or Google Drive, then paste the link below:

👉 Demo Video: [[EcoTrack Demo]] [(https://www.loom.com/share/8aa7b666abe14d3dbafe551eb484c84e)]

## 🧩 1. Project Summary

EcoTrack Carbon Footprint Tracker is an intelligent environmental monitoring platform that automates carbon calculations using AI-driven insights, real-time analytics, and personalized sustainability recommendations. It offers a seamless way to track and reduce environmental impact using modern web technologies + AI intelligence.

## 📖 2. Overview / Introduction

Modern environmental tracking is manual, complex, and lacks personalization. This project reimagines carbon footprint monitoring using accurate emission calculations, AI-powered insights, and an intuitive user experience.

### 🎯 What Problem Does It Solve?

* Complex carbon calculation formulas
* Lack of personalized reduction strategies
* Manual tracking of environmental impact
* No central platform for sustainability goals
* Poor UX around environmental data

### 💡 Why This Exists

To demonstrate how AI + Modern Web Stack + Environmental Science can fully automate carbon tracking while keeping everything user-friendly and scientifically accurate.

### 👥 Who Is This For?

* Environmentally conscious individuals
* Sustainability advocates
* Eco-friendly businesses
* Educational institutions
* Developers evaluating full-stack + AI projects

## ⚙️ 3. Features
### 🤖 AI-Powered Insights (Google Gemini AI)

* Natural-language carbon analysis
* Personalized reduction recommendations
* Intelligent agent that analyzes user patterns
* Actionable steps with impact ratings

### 📊 Carbon Calculation Engine

* Automated emission calculations
* Multi-category tracking (Transport, Food, Energy)
* Historical trend visualization
* Real-time dashboard analytics

### 💻 Modern Frontend (React + Vite)

* Interactive carbon calculator
* Real-time dashboard with visualizations
* Responsive design with Tailwind CSS
* User-friendly activity logging

### 🛠 Backend API (Node.js / Express)

* RESTful API endpoints
* Google Gemini AI integration
* Secure authentication system
* Ready for serverless deployment

### 🔐 Security & Performance

* JWT authentication with bcrypt
* Rate limiting & brute force protection
* Input sanitization & validation
* Optimized database queries with Prisma


## 🛠 4. Installation Instructions

### CLone the repository

```
git clone https://github.com/yourusername/ecotrack.git
cd ecotrack
```

###Backend Setup
```
cd backend
npm install
```

Create .env file

```
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_jwt_secret_key"
GEMINI_API_KEY="your_google_gemini_api_key"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

Start backend server:

```
npm run dev
```


###Frontend Setup

```
cd frontend
npm install
npm run dev
```

Open the app at:

```
http://localhost:5173
```


## 📁 5. Project Structure
ecotrack/
│
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── context/         # Auth & state management
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── App.jsx          # Root component
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js + Express backend
│   ├── server.js            # Main server file
│   ├── services/           # AI & utility services
│   ├── prisma/             # Database schema & migrations
│   └── package.json
│
└── README.md


## 🔧 6. Environment Variables

### Backend .env

```
DATABASE_URL="postgresql://user:password@localhost:5432/ecotrack"
JWT_SECRET="your_secure_jwt_secret_here"
GEMINI_API_KEY="your_google_gemini_api_key"
FRONTEND_URL="http://localhost:5173"
PORT=5000
```

### Frontend .env

```
VITE_API_URL="http://localhost:5000/api"
```

## 🧱 7. Tech Stack

### Frontend
* React 18
* Vite (Build tool)
* Tailwind CSS
* Context API
* Fetch API

### Backend
* Node.js
* Express
* Prisma ORM
* PostgreSQL

### AI & Analytics
* Google Gemini AI
* Custom carbon algorithms
* Real-time analytics

### Security
* JWT Authentication
* Bcrypt hashing
* Rate limiting
* Input sanitization

### Database
* Neon PostgreSQL
* Prisma migrations
* Relationship modeling

## 🧪 8. Carbon Calculation System
The project includes a scientific carbon emission calculation system with:

Transportation: Car, bus, train, flight emissions (kg CO₂ per mile/km)
Food: Meat, dairy, vegetables, grains (kg CO₂ per kg)
Energy: Electricity, heating, renewables (kg CO₂ per kWh)

### Calculation Engine:
```
Emissions = Activity Amount × Emission Factor
Database-backed historical tracking
Real-time category analysis
```

## 9. AI Insights Architecture
```
User Activity Data
   ↓
Data Processing & Pattern Recognition
   ↓
Google Gemini AI (Personalized Analysis)
   ↓
Smart Recommendations + Action Steps
   ↓
Frontend Display (Interactive Dashboard)
```

The AI agent can:

* Analyze emission patterns across categories
* Identify high-impact reduction opportunities
* Generate personalized action plans
* Estimate potential carbon savings
* Provide motivation and tracking

## 🚀 10. Deployment Guide

### Frontend Deployment (Vercel)
1. Go to Vercel
2. Import GitHub repo
3. Select /frontend directory
4. Set build commands:

```
Build: npm run build
Output: dist
```
5. Add environment variable:

```
VITE_API_URL="https://your-backend-url.com/api"
```
6. Deploy

### Deploy
1. Import repo
2. Set root directory to /backend
3. Set commands:

```
Build: npm install
Start: node server.js
```

4. Add all environment variables
5. Deploy

### Database Deployment (Neon.tech)
1. Create Neon PostgreSQL project
2. Get connection string
3. Update DATABASE_URL
4. Run migrations:

```
npx prisma migrate deploy
```

## 🤝 11. Contributions

Pull requests and feature ideas are welcome. Please follow the existing code style and add tests where applicable.


Built with ❤️ for a sustainable future 🌍

Track smart. Reduce effectively. Live sustainably.
