/**
 * Recipe Model
 * Defines the schema for recipes with full validation
 */

const mongoose = require('mongoose');

// Sub-schema for ingredients
const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ingredient name is required'],
        trim: true,
        maxlength: [100, 'Ingredient name cannot exceed 100 characters']
    },
    amount: {
        type: String,
        required: [true, 'Ingredient amount is required'],
        trim: true,
        maxlength: [50, 'Amount cannot exceed 50 characters']
    },
    unit: {
        type: String,
        trim: true,
        maxlength: [30, 'Unit cannot exceed 30 characters']
    }
}, { _id: false });

// Sub-schema for instructions
const instructionSchema = new mongoose.Schema({
    stepNumber: {
        type: Number,
        required: true,
        min: [1, 'Step number must be at least 1']
    },
    instruction: {
        type: String,
        required: [true, 'Instruction text is required'],
        trim: true,
        maxlength: [1000, 'Instruction cannot exceed 1000 characters']
    }
}, { _id: false });

// Main Recipe Schema
const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Recipe title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Recipe description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['breakfast', 'lunch', 'dinner', 'appetizer', 'dessert', 'snack', 'beverage', 'soup', 'salad', 'side-dish', 'other'],
            message: '{VALUE} is not a valid category'
        }
    },
    cuisine: {
        type: String,
        trim: true,
        maxlength: [50, 'Cuisine cannot exceed 50 characters']
    },
    difficulty: {
        type: String,
        required: [true, 'Difficulty level is required'],
        enum: {
            values: ['easy', 'medium', 'hard'],
            message: '{VALUE} is not a valid difficulty level'
        }
    },
    prepTime: {
        type: Number,
        required: [true, 'Prep time is required'],
        min: [0, 'Prep time cannot be negative'],
        max: [1440, 'Prep time cannot exceed 24 hours']
    },
    cookTime: {
        type: Number,
        required: [true, 'Cook time is required'],
        min: [0, 'Cook time cannot be negative'],
        max: [1440, 'Cook time cannot exceed 24 hours']
    },
    servings: {
        type: Number,
        required: [true, 'Number of servings is required'],
        min: [1, 'Servings must be at least 1'],
        max: [100, 'Servings cannot exceed 100']
    },
    ingredients: {
        type: [ingredientSchema],
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'At least one ingredient is required'
        }
    },
    instructions: {
        type: [instructionSchema],
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'At least one instruction step is required'
        }
    },
    image: {
        type: String,
        default: '/images/default-recipe.jpg'
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    dietaryInfo: {
        vegetarian: { type: Boolean, default: false },
        vegan: { type: Boolean, default: false },
        glutenFree: { type: Boolean, default: false },
        dairyFree: { type: Boolean, default: false },
        nutFree: { type: Boolean, default: false }
    },
    nutritionInfo: {
        calories: { type: Number, min: 0 },
        protein: { type: Number, min: 0 },
        carbs: { type: Number, min: 0 },
        fat: { type: Number, min: 0 }
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0,
        min: 0
    },
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Virtual for total time
recipeSchema.virtual('totalTime').get(function() {
    return this.prepTime + this.cookTime;
});

// Index for search functionality
recipeSchema.index({ title: 'text', description: 'text', 'ingredients.name': 'text', tags: 'text' });
recipeSchema.index({ category: 1 });
recipeSchema.index({ author: 1 });
recipeSchema.index({ averageRating: -1 });
recipeSchema.index({ createdAt: -1 });

// Method to update average rating
recipeSchema.methods.updateRating = async function(newRating) {
    const totalScore = this.averageRating * this.totalRatings + newRating;
    this.totalRatings += 1;
    this.averageRating = totalScore / this.totalRatings;
    await this.save();
};

// Static method to find recipes by ingredient
recipeSchema.statics.findByIngredient = function(ingredientName) {
    return this.find({
        'ingredients.name': { $regex: ingredientName, $options: 'i' },
        isPublished: true
    });
};

// Static method to find popular recipes
recipeSchema.statics.findPopular = function(limit = 10) {
    return this.find({ isPublished: true })
        .sort({ averageRating: -1, totalRatings: -1 })
        .limit(limit)
        .populate('author', 'username profileImage');
};

// Ensure virtuals are included in JSON
recipeSchema.set('toJSON', { virtuals: true });
recipeSchema.set('toObject', { virtuals: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
