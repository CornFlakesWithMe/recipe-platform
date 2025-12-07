// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    
    // For API requests, return JSON error
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({
            success: false,
            message: 'Please log in to access this resource'
        });
    }
    
    // For regular requests, redirect to login
    req.session.returnTo = req.originalUrl;
    res.redirect('/login.html');
};

// Check if user is NOT authenticated (for login/register pages)
const isNotAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.redirect('/');
    }
    next();
};

// Check if user owns the resource
const isOwner = (model) => {
    return async (req, res, next) => {
        try {
            const resource = await model.findById(req.params.id);
            
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }
            
            // Check if user is the owner
            const ownerId = resource.author || resource.user;
            if (ownerId.toString() !== req.session.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to perform this action'
                });
            }
            
            req.resource = resource;
            next();
        } catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({
                success: false,
                message: 'Authorization error'
            });
        }
    };
};

// Attach user to request if logged in (optional auth)
const attachUser = async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const User = require('../models/User');
            const user = await User.findById(req.session.userId).select('-password');
            req.user = user;
        } catch (error) {
            console.error('Error attaching user:', error);
        }
    }
    next();
};

module.exports = {
    isAuthenticated,
    isNotAuthenticated,
    isOwner,
    attachUser
};
