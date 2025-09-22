const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/auth');
const indicatorRoutes = require('./routes/indicators');
const crisisRoutes = require('./routes/crisis');
const externalDataRoutes = require('./routes/external-data');

// Middleware imports
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and performance middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());
app.use(morgan('combined'));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiting
app.use('/api/', generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/indicators', indicatorRoutes);
app.use('/api/crisis', crisisRoutes);
app.use('/api/external-data', externalDataRoutes);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
// app.use((error, req, res, next) => {
//   console.error('Global error handler:', error);
  
//   res.status(error.status || 500).json({
//     success: false,
//     message: error.message || 'Internal server error',
//     ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
//   });
// });

// Global error handler (add this to your server.js)
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(error.errors).map(err => err.message);
    message = messages.join('. ');
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    statusCode = 400;
    const field = Object.keys(error.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose cast error
  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // JWT error
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // JWT expired error
  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      error: error
    })
  });
});




// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Start server
let server;
const startServer = async () => {
  try {
    await connectDB();
    
    server=app.listen(PORT, () => {
      console.log(`
🚀 Crisis Dashboard Server Started Successfully!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server running on port ${PORT}
🔗 API Base URL: http://localhost:${PORT}/api
📊 Health Check: http://localhost:${PORT}/health
⏰ Started at: ${new Date().toISOString()}
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

startServer();
