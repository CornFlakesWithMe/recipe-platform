const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Recipe = require('../models/Recipe');
const { isAuthenticated } = require('../middleware/auth');
const { validateReview, validateObjectId } = require('../middleware/validation');


 //GET /api/reviews/recipe/:recipeId
 //Get all reviews for a recipe
router.get('/recipe/:recipeId', async (req, res) => {
    try {
        const { recipeId } = req.params;
        const { page = 1, limit = 10, sortBy = 'createdAt' } = req.query;

        // Validate recipe exists
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Build sort options
        const sortOptions = {};
        if (sortBy === 'helpful') {
            sortOptions.helpfulVotes = -1;
        } else if (sortBy === 'rating') {
            sortOptions.rating = -1;
        } else {
            sortOptions.createdAt = -1;
        }

        const reviews = await Review.find({ recipe: recipeId })
            .sort(sortOptions)
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .populate('user', 'username profileImage')
            .lean();

        const total = await Review.countDocuments({ recipe: recipeId });

        // Get rating distribution
        const ratingDistribution = await Review.aggregate([
            { $match: { recipe: recipe._id } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        res.json({
            success: true,
            reviews,
            ratingDistribution,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                total
            }
        });

    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching reviews'
        });
    }
});


//GET /api/reviews/user/:userId
//Get all reviews by a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const reviews = await Review.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .populate('recipe', 'title image')
            .lean();

        const total = await Review.countDocuments({ user: userId });

        res.json({
            success: true,
            reviews,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                total
            }
        });

    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});


//GET /api/reviews/:id
//Get a single review
router.get('/:id', validateObjectId, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('user', 'username profileImage')
            .populate('recipe', 'title image');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            review
        });

    } catch (error) {
        console.error('Get review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});


//POST /api/reviews/recipe/:recipeId
//Create a new review for a recipe
router.post('/recipe/:recipeId', isAuthenticated, validateReview, async (req, res) => {
    try {
        const { recipeId } = req.params;
        const { rating, title, comment } = req.body;

        // Check if recipe exists
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Check if user is trying to review their own recipe
        if (recipe.author.toString() === req.session.userId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot review your own recipe'
            });
        }

        // Check if user has already reviewed this recipe
        const existingReview = await Review.findOne({
            recipe: recipeId,
            user: req.session.userId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this recipe. You can edit your existing review.'
            });
        }

        // Create review
        const review = new Review({
            recipe: recipeId,
            user: req.session.userId,
            rating,
            title,
            comment
        });

        await review.save();

        // Populate user data before sending response
        await review.populate('user', 'username profileImage');

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            review
        });

    } catch (error) {
        console.error('Create review error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        // Handle duplicate key error (user already reviewed)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this recipe'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error creating review'
        });
    }
});


//PUT /api/reviews/:id
//Update a review
router.put('/:id', isAuthenticated, validateObjectId, validateReview, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns the review
        if (review.user.toString() !== req.session.userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to edit this review'
            });
        }

        const { rating, title, comment } = req.body;

        // Update review
        review.rating = rating;
        review.title = title;
        review.comment = comment;

        await review.save();

        // Populate user data
        await review.populate('user', 'username profileImage');

        res.json({
            success: true,
            message: 'Review updated successfully',
            review
        });

    } catch (error) {
        console.error('Update review error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error updating review'
        });
    }
});


//DELETE /api/reviews/:id
//Delete a review
router.delete('/:id', isAuthenticated, validateObjectId, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns the review
        if (review.user.toString() !== req.session.userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this review'
            });
        }

        await Review.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting review'
        });
    }
});


//POST /api/reviews/:id/helpful
//Mark a review as helpful
router.post('/:id/helpful', isAuthenticated, validateObjectId, async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { $inc: { helpfulVotes: 1 } },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            helpfulVotes: review.helpfulVotes
        });

    } catch (error) {
        console.error('Mark helpful error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});


//GET /api/reviews/check/:recipeId
//Check if current user has reviewed a recipe
router.get('/check/:recipeId', isAuthenticated, async (req, res) => {
    try {
        const review = await Review.findOne({
            recipe: req.params.recipeId,
            user: req.session.userId
        });

        res.json({
            success: true,
            hasReviewed: !!review,
            review: review || null
        });

    } catch (error) {
        console.error('Check review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
