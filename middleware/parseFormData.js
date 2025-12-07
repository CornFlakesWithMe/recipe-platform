/**
 * Middleware to parse JSON strings in FormData
 * This runs BEFORE validation to ensure arrays/objects are properly parsed
 */
const parseFormData = (req, res, next) => {
    // Parse ingredients
    if (typeof req.body.ingredients === 'string') {
        try {
            req.body.ingredients = JSON.parse(req.body.ingredients);
        } catch (e) {
            req.body.ingredients = [];
        }
    }
    
    // Parse instructions
    if (typeof req.body.instructions === 'string') {
        try {
            req.body.instructions = JSON.parse(req.body.instructions);
        } catch (e) {
            req.body.instructions = [];
        }
    }
    
    // Parse tags
    if (typeof req.body.tags === 'string') {
        try {
            req.body.tags = JSON.parse(req.body.tags);
        } catch (e) {
            req.body.tags = [];
        }
    }
    
    // Parse dietaryInfo
    if (typeof req.body.dietaryInfo === 'string') {
        try {
            req.body.dietaryInfo = JSON.parse(req.body.dietaryInfo);
        } catch (e) {
            req.body.dietaryInfo = {};
        }
    }
    
    // Parse nutritionInfo
    if (typeof req.body.nutritionInfo === 'string') {
        try {
            req.body.nutritionInfo = JSON.parse(req.body.nutritionInfo);
        } catch (e) {
            req.body.nutritionInfo = {};
        }
    }
    
    next();
};

module.exports = parseFormData;