/**
 * Review Model
 * Defines the schema for recipe reviews and ratings
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        required: [true, 'Recipe reference is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    title: {
        type: String,
        trim: true,
        maxlength: [100, 'Review title cannot exceed 100 characters']
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        trim: true,
        minlength: [10, 'Comment must be at least 10 characters'],
        maxlength: [2000, 'Comment cannot exceed 2000 characters']
    },
    helpfulVotes: {
        type: Number,
        default: 0,
        min: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index to ensure one review per user per recipe
reviewSchema.index({ recipe: 1, user: 1 }, { unique: true });

// Index for queries
reviewSchema.index({ recipe: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });

// Static method to calculate average rating for a recipe
reviewSchema.statics.calculateAverageRating = async function(recipeId) {
    const result = await this.aggregate([
        { $match: { recipe: recipeId } },
        {
            $group: {
                _id: '$recipe',
                averageRating: { $avg: '$rating' },
                totalRatings: { $sum: 1 }
            }
        }
    ]);

    try {
        const Recipe = require('./Recipe');
        if (result.length > 0) {
            await Recipe.findByIdAndUpdate(recipeId, {
                averageRating: Math.round(result[0].averageRating * 10) / 10,
                totalRatings: result[0].totalRatings
            });
        } else {
            await Recipe.findByIdAndUpdate(recipeId, {
                averageRating: 0,
                totalRatings: 0
            });
        }
    } catch (error) {
        console.error('Error updating recipe rating:', error);
    }
};

// Post-save hook to update recipe rating
reviewSchema.post('save', function() {
    this.constructor.calculateAverageRating(this.recipe);
});

// Post-remove hook to update recipe rating
reviewSchema.post('findOneAndDelete', function(doc) {
    if (doc) {
        doc.constructor.calculateAverageRating(doc.recipe);
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
