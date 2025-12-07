/**
 * Recipe Sharing Platform - Main Server
 * CIS 435 Full Stack Web Application
 * 
 * A complete recipe sharing platform with user authentication,
 * CRUD operations, reviews, and favorites functionality.
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const reviewRoutes = require('./routes/reviews');

// Import middleware
const { attachUser } = require('./middleware/auth');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ======================
// Middleware Configuration
// ======================

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy in production (required for Render, Heroku, etc.)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60,
        autoRemove: 'native'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Attach user to request
app.use(attachUser);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// ======================
// API Routes
// ======================

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/reviews', reviewRoutes);

// ======================
// Health Check
// ======================

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Recipe Sharing Platform API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ======================
// Serve Frontend Routes
// ======================

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
    // Check if requesting an HTML file
    if (req.path.endsWith('.html') || req.path === '/') {
        const htmlFile = req.path === '/' ? 'index.html' : req.path;
        res.sendFile(path.join(__dirname, 'public', htmlFile));
    } else {
        // For other paths, try to serve static file or 404
        res.sendFile(path.join(__dirname, 'public', req.path), (err) => {
            if (err) {
                res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }
        });
    }
});

// ======================
// Error Handling
// ======================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);

    // Handle multer errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // Handle other errors
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred' 
            : err.message
    });
});

// ======================
// Start Server
// ======================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🍳 Recipe Sharing Platform Server                     ║
║                                                            ║
║     Environment: ${(process.env.NODE_ENV || 'development').padEnd(39)}║
║     Port: ${String(PORT).padEnd(47)}║
║     URL: http://localhost:${String(PORT).padEnd(32)}║
║                                                            ║
║     Ready to accept connections!                           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

module.exports = app;
