/**
 * Validation Middleware
 * Input validation and sanitization using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    
    next();
};

// User registration validation
const validateRegistration = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
        .escape(),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword')
        .notEmpty().withMessage('Please confirm your password')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    body('firstName')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters')
        .escape(),
    body('lastName')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters')
        .escape(),
    handleValidationErrors
];

// User login validation
const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

// Recipe validation
const validateRecipe = [
    body('title')
        .trim()
        .notEmpty().withMessage('Recipe title is required')
        .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters')
        .escape(),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required')
        .isIn(['breakfast', 'lunch', 'dinner', 'appetizer', 'dessert', 'snack', 'beverage', 'soup', 'salad', 'side-dish', 'other'])
        .withMessage('Invalid category'),
    body('cuisine')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Cuisine cannot exceed 50 characters')
        .escape(),
    body('difficulty')
        .trim()
        .notEmpty().withMessage('Difficulty is required')
        .isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
    body('prepTime')
        .notEmpty().withMessage('Prep time is required')
        .isInt({ min: 0, max: 1440 }).withMessage('Prep time must be 0-1440 minutes'),
    body('cookTime')
        .notEmpty().withMessage('Cook time is required')
        .isInt({ min: 0, max: 1440 }).withMessage('Cook time must be 0-1440 minutes'),
    body('servings')
        .notEmpty().withMessage('Servings is required')
        .isInt({ min: 1, max: 100 }).withMessage('Servings must be 1-100'),
    body('ingredients')
        .isArray({ min: 1 }).withMessage('At least one ingredient is required'),
    body('ingredients.*.name')
        .trim()
        .notEmpty().withMessage('Ingredient name is required')
        .isLength({ max: 100 }).withMessage('Ingredient name cannot exceed 100 characters'),
    body('ingredients.*.amount')
        .trim()
        .notEmpty().withMessage('Ingredient amount is required')
        .isLength({ max: 50 }).withMessage('Amount cannot exceed 50 characters'),
    body('ingredients.*.unit')
        .optional()
        .trim()
        .isLength({ max: 30 }).withMessage('Unit cannot exceed 30 characters'),
    body('instructions')
        .isArray({ min: 1 }).withMessage('At least one instruction is required'),
    body('instructions.*.stepNumber')
        .isInt({ min: 1 }).withMessage('Step number must be at least 1'),
    body('instructions.*.instruction')
        .trim()
        .notEmpty().withMessage('Instruction text is required')
        .isLength({ max: 1000 }).withMessage('Instruction cannot exceed 1000 characters'),
    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array'),
    body('tags.*')
        .optional()
        .trim()
        .isLength({ max: 30 }).withMessage('Tag cannot exceed 30 characters'),
    body('dietaryInfo.vegetarian').optional().isBoolean(),
    body('dietaryInfo.vegan').optional().isBoolean(),
    body('dietaryInfo.glutenFree').optional().isBoolean(),
    body('dietaryInfo.dairyFree').optional().isBoolean(),
    body('dietaryInfo.nutFree').optional().isBoolean(),
    body('nutritionInfo.calories').optional().isInt({ min: 0 }),
    body('nutritionInfo.protein').optional().isInt({ min: 0 }),
    body('nutritionInfo.carbs').optional().isInt({ min: 0 }),
    body('nutritionInfo.fat').optional().isInt({ min: 0 }),
    handleValidationErrors
];

// Review validation
const validateReview = [
    body('rating')
        .notEmpty().withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('title')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters')
        .escape(),
    body('comment')
        .trim()
        .notEmpty().withMessage('Comment is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Comment must be 10-2000 characters'),
    handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = [
    param('id')
        .isMongoId().withMessage('Invalid ID format'),
    handleValidationErrors
];

// Search query validation
const validateSearch = [
    query('q')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Search query cannot exceed 100 characters')
        .escape(),
    query('category')
        .optional()
        .isIn(['', 'breakfast', 'lunch', 'dinner', 'appetizer', 'dessert', 'snack', 'beverage', 'soup', 'salad', 'side-dish', 'other'])
        .withMessage('Invalid category'),
    query('difficulty')
        .optional()
        .isIn(['', 'easy', 'medium', 'hard'])
        .withMessage('Invalid difficulty'),
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
    handleValidationErrors
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateRecipe,
    validateReview,
    validateObjectId,
    validateSearch,
    handleValidationErrors
};
