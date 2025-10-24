const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Rate Limiting 
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per windowMs
  message: { 
    error: 'Too many login attempts from this IP, please try again after 15 minutes.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/', generalLimiter);

// Security functions
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '').substring(0, 255);
};

const validatePassword = (password) => {
  if (typeof password !== 'string') return false;
  
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  const isValid = password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
  
  
  const commonPasswords = [
    'password', '12345678', 'qwerty', 'letmein', 'welcome',
    'admin', 'password1', '123456789', '1234567', '123123'
  ];
  
  const isCommon = commonPasswords.includes(password.toLowerCase());
  
  return {
    isValid,
    isCommon,
    feedback: !isValid ? [
      ...(password.length < minLength ? ['Must be at least 8 characters'] : []),
      ...(!hasUpperCase ? ['Include at least one uppercase letter'] : []),
      ...(!hasLowerCase ? ['Include at least one lowercase letter'] : []),
      ...(!hasNumbers ? ['Include at least one number'] : [])
    ] : []
  };
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Test database connection
app.get('/api/db-health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'OK', 
      database: 'Neon PostgreSQL connected successfully 🚀',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Failed to connect to Neon',
      error: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EcoTrack Backend is running! 🚀',
    timestamp: new Date().toISOString(),
    security: 'Enhanced security enabled ✅'
  });
});

// Emission factors database
const emissionFactors = {
  transport: {
    car: 0.404, electric_car: 0.1, bus: 0.17, train: 0.14, 
    subway: 0.15, bicycle: 0, walking: 0, motorcycle: 0.24, 
    flight: 0.254, carpool: 0.202
  },
  food: {
    beef: 27.0, lamb: 39.2, cheese: 13.5, pork: 12.1, 
    chicken: 6.9, fish: 6.1, eggs: 4.8, milk: 3.2, 
    vegetables: 2.0, fruits: 1.1, grains: 1.4, nuts: 0.3,
    tofu: 2.0, lentils: 0.9
  },
  energy: {
    electricity: 0.5, natural_gas: 5.3, heating_oil: 10.1, 
    propane: 5.8, solar: 0.05, wind: 0.01, geothermal: 0.02
  }
};

// Public carbon calculation
app.post('/api/calculate/public', (req, res) => {
  try {
    const { category, type, amount } = req.body;
    
    let emissions = 0;
    if (emissionFactors[category] && emissionFactors[category][type]) {
      emissions = amount * emissionFactors[category][type];
    }

    res.json({
      success: true,
      emissions: Math.round(emissions * 100) / 100,
      unit: 'kg CO2',
      category,
      type,
      amount
    });
  } catch (error) {
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// Get emission factors
app.get('/api/emission-factors', (req, res) => {
  res.json({ emissionFactors });
});

//Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired, please login again' });
      }
      return res.status(403).json({ error: 'Invalid token' });
    }

    // Additional security check
    if (!user.userId || !user.email) {
      return res.status(403).json({ error: 'Malformed token' });
    }

    req.user = user;
    next();
  });
};

//  User Registration with security
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Input sanitization and validation
    const sanitizedEmail = sanitizeInput(email?.toLowerCase().trim());
    const sanitizedName = sanitizeInput(name?.trim());
    const sanitizedPassword = password?.trim();

    if (!sanitizedEmail || !sanitizedPassword) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    //password validation
    const passwordValidation = validatePassword(sanitizedPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        details: passwordValidation.feedback
      });
    }

    if (passwordValidation.isCommon) {
      return res.status(400).json({
        error: 'This password is too common and easily guessable. Please choose a stronger password.'
      });
    }

    const existingUser = await prisma.user.findUnique({ 
      where: { email: sanitizedEmail } 
    });
    
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(sanitizedPassword, 12);
    const user = await prisma.user.create({
      data: { 
        email: sanitizedEmail, 
        password: hashedPassword, 
        name: sanitizedName || sanitizedEmail.split('@')[0] 
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Login with security
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;


    const sanitizedEmail = sanitizeInput(email?.toLowerCase().trim());
    const sanitizedPassword = password?.trim();

    if (!sanitizedEmail || !sanitizedPassword) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const user = await prisma.user.findUnique({ 
      where: { email: sanitizedEmail } 
    });
    
    if (!user) {
      
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(sanitizedPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Calculate and save carbon footprint
app.post('/api/calculate', authenticateToken, async (req, res) => {
  try {
    const { category, type, amount, description, date } = req.body;
    const userId = req.user.userId;

    // Input sanitization for user-generated content
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedCategory = sanitizeInput(category);
    const sanitizedType = sanitizeInput(type);

    let emissions = 0;
    if (emissionFactors[sanitizedCategory] && emissionFactors[sanitizedCategory][sanitizedType]) {
      emissions = amount * emissionFactors[sanitizedCategory][sanitizedType];
    }

    // Save activity
    const activity = await prisma.activity.create({
      data: {
        userId: parseInt(userId),
        category: sanitizedCategory,
        type: sanitizedType,
        amount,
        unit: getUnitForCategory(sanitizedCategory),
        description: sanitizedDescription,
        date: date ? new Date(date) : new Date()
      }
    });

    // Save carbon entry
    const carbonEntry = await prisma.carbonEntry.create({
      data: {
        userId: parseInt(userId),
        category: sanitizedCategory,
        emissions,
        date: date ? new Date(date) : new Date()
      }
    });

    res.json({
      success: true,
      emissions: Math.round(emissions * 100) / 100,
      activity,
      carbonEntry
    });
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// Get user's carbon footprint summary
app.get('/api/footprint/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get last 30 days entries
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entries = await prisma.carbonEntry.findMany({
      where: { 
        userId: parseInt(userId), 
        date: { gte: thirtyDaysAgo } 
      },
      orderBy: { date: 'desc' }
    });

    // Calculate summary by category
    const summary = entries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.emissions;
      acc.total = (acc.total || 0) + entry.emissions;
      return acc;
    }, {});

    res.json({
      summary,
      recentEntries: entries.slice(0, 10),
      totalEntries: entries.length,
      period: 'last_30_days'
    });
  } catch (error) {
    console.error('Footprint summary error:', error);
    res.status(500).json({ error: 'Failed to fetch footprint summary' });
  }
});

// Get user activities
app.get('/api/activities', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category, page = 1, limit = 20 } = req.query;

    // Sanitize query parameters
    const sanitizedCategory = category ? sanitizeInput(category) : undefined;

    const activities = await prisma.activity.findMany({
      where: { 
        userId: parseInt(userId), 
        ...(sanitizedCategory && { category: sanitizedCategory }) 
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    res.json({ activities });
  } catch (error) {
    console.error('Activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get tips
app.get('/api/tips', async (req, res) => {
  try {
    const { category } = req.query;
    
    // Sanitize category if provided
    const sanitizedCategory = category ? sanitizeInput(category) : undefined;

    const tips = await prisma.tip.findMany({
      where: sanitizedCategory ? { category: sanitizedCategory } : {},
      orderBy: { savings: 'desc' }
    });

    res.json({ tips });
  } catch (error) {
    console.error('Tips error:', error);
    res.status(500).json({ error: 'Failed to fetch tips' });
  }
});

// Goals management
app.get('/api/goals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const goals = await prisma.goal.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ goals });
  } catch (error) {
    console.error('Goals error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

app.post('/api/goals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, targetEmissions, deadline } = req.body;

    // Sanitize user inputs
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedDescription = sanitizeInput(description);

    const goal = await prisma.goal.create({
      data: {
        userId: parseInt(userId),
        title: sanitizedTitle,
        description: sanitizedDescription,
        targetEmissions: parseFloat(targetEmissions),
        deadline: deadline ? new Date(deadline) : null
      }
    });

    res.json({ goal, message: 'Goal created successfully' });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Helper function
function getUnitForCategory(category) {
  const units = {
    transport: 'miles',
    food: 'kg',
    energy: 'kWh'
  };
  return units[category] || 'unit';
}

// Security test endpoint (optional - for testing)
app.get('/api/security-test', (req, res) => {
  res.json({
    message: 'Security features active',
    features: [
      'Rate limiting enabled',
      'Password validation',
      'Input sanitization',
      'JWT token validation',
      'Helmet security headers'
    ],
    timestamp: new Date().toISOString()
  });
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` EcoTrack Backend Server Started!`);
  console.log(` Port: ${PORT}`);
  console.log(`Database: Neon PostgreSQL`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`DB Health: http://localhost:${PORT}/api/db-health`);
  console.log(`Ready for frontend integration!`);
});