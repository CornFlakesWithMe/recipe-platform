/**
 * Authentication Routes
 * Handles user registration, login, logout, and profile
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validateRegistration, async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return res.status(400).json({
                success: false,
                message: `A user with this ${field} already exists`
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            firstName,
            lastName
        });

        await user.save();

        // Set session
        req.session.userId = user._id;
        req.session.username = user.username;

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

/**
 * POST /api/auth/login
 * Log in a user
 */
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Set session
        req.session.userId = user._id;
        req.session.username = user.username;

        // Get redirect URL if any
        const redirectUrl = req.session.returnTo || '/';
        delete req.session.returnTo;

        res.json({
            success: true,
            message: 'Login successful',
            user: user.toPublicJSON(),
            redirectUrl
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

/**
 * POST /api/auth/logout
 * Log out a user
 */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error logging out'
            });
        }

        res.clearCookie('connect.sid');
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId)
            .select('-password')
            .populate('favorites', 'title image averageRating');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user.toPublicJSON(),
            favorites: user.favorites
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', isAuthenticated, async (req, res) => {
    try {
        const { firstName, lastName, bio } = req.body;

        const user = await User.findByIdAndUpdate(
            req.session.userId,
            {
                firstName,
                lastName,
                bio,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error('Update profile error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * PUT /api/auth/password
 * Change user password
 */
router.put('/password', isAuthenticated, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * GET /api/auth/check
 * Check if user is logged in
 */
router.get('/check', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            success: true,
            isLoggedIn: true,
            userId: req.session.userId,
            username: req.session.username
        });
    } else {
        res.json({
            success: true,
            isLoggedIn: false
        });
    }
});

module.exports = router;
