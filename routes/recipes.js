/**
 * Recipe Routes
 * Full CRUD operations for recipes
 */

const parseFormData = require('../middleware/parseFormData');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { isAuthenticated, isOwner } = require('../middleware/auth');
const { validateRecipe, validateObjectId, validateSearch } = require('../middleware/validation');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './public/images/recipes';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'recipe-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

/**
 * GET /api/recipes
 * Get all recipes with pagination and filtering
 */
router.get('/', validateSearch, async (req, res) => {
    try {
        const {
            q,
            category,
            difficulty,
            cuisine,
            vegetarian,
            vegan,
            glutenFree,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 12
        } = req.query;

        // Build query
        const query = { isPublished: true };

        // Text search
        if (q) {
            query.$text = { $search: q };
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Difficulty filter
        if (difficulty) {
            query.difficulty = difficulty;
        }

        // Cuisine filter
        if (cuisine) {
            query.cuisine = { $regex: cuisine, $options: 'i' };
        }

        // Dietary filters
        if (vegetarian === 'true') query['dietaryInfo.vegetarian'] = true;
        if (vegan === 'true') query['dietaryInfo.vegan'] = true;
        if (glutenFree === 'true') query['dietaryInfo.glutenFree'] = true;

        // Sorting
        const sortOptions = {};
        const validSortFields = ['createdAt', 'averageRating', 'totalRatings', 'views', 'title'];
        if (validSortFields.includes(sortBy)) {
            sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
        } else {
            sortOptions.createdAt = -1;
        }

        // If text search, sort by text score
        if (q) {
            sortOptions.score = { $meta: 'textScore' };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        let recipesQuery = Recipe.find(query);
        
        if (q) {
            recipesQuery = recipesQuery.select({ score: { $meta: 'textScore' } });
        }

        const recipes = await recipesQuery
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('author', 'username profileImage')
            .lean();

        // Get total count
        const total = await Recipe.countDocuments(query);

        res.json({
            success: true,
            recipes,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching recipes'
        });
    }
});

/**
 * GET /api/recipes/featured
 * Get featured/popular recipes
 */
router.get('/featured', async (req, res) => {
    try {
        const recipes = await Recipe.find({ isPublished: true })
            .sort({ averageRating: -1, totalRatings: -1 })
            .limit(6)
            .populate('author', 'username profileImage')
            .lean();

        res.json({
            success: true,
            recipes
        });

    } catch (error) {
        console.error('Get featured recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * GET /api/recipes/recent
 * Get recently added recipes
 */
router.get('/recent', async (req, res) => {
    try {
        const recipes = await Recipe.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('author', 'username profileImage')
            .lean();

        res.json({
            success: true,
            recipes
        });

    } catch (error) {
        console.error('Get recent recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * GET /api/recipes/categories
 * Get recipe count by category
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = await Recipe.aggregate([
            { $match: { isPublished: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            categories
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * GET /api/recipes/user/:userId
 * Get recipes by a specific user
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 12 } = req.query;

        const recipes = await Recipe.find({ 
            author: userId,
            isPublished: true 
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('author', 'username profileImage')
            .lean();

        const total = await Recipe.countDocuments({ 
            author: userId,
            isPublished: true 
        });

        res.json({
            success: true,
            recipes,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Get user recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * GET /api/recipes/my-recipes
 * Get current user's recipes (including unpublished)
 */
router.get('/my-recipes', isAuthenticated, async (req, res) => {
    try {
        const recipes = await Recipe.find({ author: req.session.userId })
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            recipes
        });

    } catch (error) {
        console.error('Get my recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * GET /api/recipes/:id
 * Get a single recipe by ID
 */
router.get('/:id', validateObjectId, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('author', 'username profileImage bio');

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Check if recipe is published or user is the owner
        if (!recipe.isPublished && 
            (!req.session.userId || recipe.author._id.toString() !== req.session.userId)) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Increment view count
        recipe.views += 1;
        await recipe.save();

        res.json({
            success: true,
            recipe
        });

    } catch (error) {
        console.error('Get recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * POST /api/recipes
 * Create a new recipe
 */
router.post('/', isAuthenticated, upload.single('image'), parseFormData, validateRecipe, async (req, res) => {
    try {
        // Parse JSON strings from FormData
        if (typeof req.body.ingredients === 'string') {
            try {
                req.body.ingredients = JSON.parse(req.body.ingredients);
            } catch (e) {
                req.body.ingredients = [];
            }
        }
        
        if (typeof req.body.instructions === 'string') {
            try {
                req.body.instructions = JSON.parse(req.body.instructions);
            } catch (e) {
                req.body.instructions = [];
            }
        }
        
        if (typeof req.body.tags === 'string') {
            try {
                req.body.tags = JSON.parse(req.body.tags);
            } catch (e) {
                req.body.tags = [];
            }
        }
        
        if (typeof req.body.dietaryInfo === 'string') {
            try {
                req.body.dietaryInfo = JSON.parse(req.body.dietaryInfo);
            } catch (e) {
                req.body.dietaryInfo = {};
            }
        }
        
        if (typeof req.body.nutritionInfo === 'string') {
            try {
                req.body.nutritionInfo = JSON.parse(req.body.nutritionInfo);
            } catch (e) {
                req.body.nutritionInfo = {};
            }
        }

        const recipeData = {
            ...req.body,
            author: req.session.userId
        };

        // Parse JSON fields if they're strings (from form data)
        if (typeof recipeData.ingredients === 'string') {
            recipeData.ingredients = JSON.parse(recipeData.ingredients);
        }
        if (typeof recipeData.instructions === 'string') {
            recipeData.instructions = JSON.parse(recipeData.instructions);
        }
        if (typeof recipeData.tags === 'string') {
            recipeData.tags = JSON.parse(recipeData.tags);
        }
        if (typeof recipeData.dietaryInfo === 'string') {
            recipeData.dietaryInfo = JSON.parse(recipeData.dietaryInfo);
        }
        if (typeof recipeData.nutritionInfo === 'string') {
            recipeData.nutritionInfo = JSON.parse(recipeData.nutritionInfo);
        }

        // Add image path if uploaded
        if (req.file) {
            recipeData.image = '/images/recipes/' + req.file.filename;
        }

        const recipe = new Recipe(recipeData);
        await recipe.save();

        // Populate author before sending response
        await recipe.populate('author', 'username profileImage');

        res.status(201).json({
            success: true,
            message: 'Recipe created successfully',
            recipe
        });

    } catch (error) {
        console.error('Create recipe error:', error);

        // Delete uploaded file if there was an error
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error creating recipe'
        });
    }
});

/**
 * PUT /api/recipes/:id
 * Update a recipe
 */
router.put('/:id', isAuthenticated, validateObjectId, upload.single('image'), async (req, res) => {
    try {
        // Find the recipe and check ownership
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        if (recipe.author.toString() !== req.session.userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to edit this recipe'
            });
        }

        const updateData = { ...req.body };

        // Parse JSON fields if they're strings
        if (typeof updateData.ingredients === 'string') {
            updateData.ingredients = JSON.parse(updateData.ingredients);
        }
        if (typeof updateData.instructions === 'string') {
            updateData.instructions = JSON.parse(updateData.instructions);
        }
        if (typeof updateData.tags === 'string') {
            updateData.tags = JSON.parse(updateData.tags);
        }
        if (typeof updateData.dietaryInfo === 'string') {
            updateData.dietaryInfo = JSON.parse(updateData.dietaryInfo);
        }
        if (typeof updateData.nutritionInfo === 'string') {
            updateData.nutritionInfo = JSON.parse(updateData.nutritionInfo);
        }

        // Handle image upload
        if (req.file) {
            // Delete old image if it's not the default
            if (recipe.image && !recipe.image.includes('default-recipe')) {
                const oldImagePath = './public' + recipe.image;
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error('Error deleting old image:', err);
                });
            }
            updateData.image = '/images/recipes/' + req.file.filename;
        }

        // Update the recipe
        const updatedRecipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('author', 'username profileImage');

        res.json({
            success: true,
            message: 'Recipe updated successfully',
            recipe: updatedRecipe
        });

    } catch (error) {
        console.error('Update recipe error:', error);

        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error updating recipe'
        });
    }
});

/**
 * DELETE /api/recipes/:id
 * Delete a recipe
 */
router.delete('/:id', isAuthenticated, validateObjectId, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        if (recipe.author.toString() !== req.session.userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this recipe'
            });
        }

        // Delete recipe image if not default
        if (recipe.image && !recipe.image.includes('default-recipe')) {
            const imagePath = './public' + recipe.image;
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Error deleting image:', err);
            });
        }

        await Recipe.findByIdAndDelete(req.params.id);

        // Remove from users' favorites
        await User.updateMany(
            { favorites: req.params.id },
            { $pull: { favorites: req.params.id } }
        );

        res.json({
            success: true,
            message: 'Recipe deleted successfully'
        });

    } catch (error) {
        console.error('Delete recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting recipe'
        });
    }
});

/**
 * POST /api/recipes/:id/favorite
 * Toggle favorite status for a recipe
 */
router.post('/:id/favorite', isAuthenticated, validateObjectId, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        const user = await User.findById(req.session.userId);
        const isFavorited = user.favorites.includes(req.params.id);

        if (isFavorited) {
            // Remove from favorites
            user.favorites = user.favorites.filter(
                fav => fav.toString() !== req.params.id
            );
        } else {
            // Add to favorites
            user.favorites.push(req.params.id);
        }

        await user.save();

        res.json({
            success: true,
            isFavorited: !isFavorited,
            message: isFavorited ? 'Removed from favorites' : 'Added to favorites'
        });

    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * GET /api/recipes/:id/favorite-status
 * Check if recipe is favorited by current user
 */
router.get('/:id/favorite-status', isAuthenticated, validateObjectId, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const isFavorited = user.favorites.includes(req.params.id);

        res.json({
            success: true,
            isFavorited
        });

    } catch (error) {
        console.error('Check favorite status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
