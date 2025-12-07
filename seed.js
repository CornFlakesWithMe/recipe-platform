/**
 * Database Seed Script
 * Populates the database with sample data for testing
 * 
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Recipe = require('./models/Recipe');
const Review = require('./models/Review');

// Sample data
const sampleUsers = [
    {
        username: 'chef_maria',
        email: 'maria@example.com',
        password: 'password123',
        firstName: 'Maria',
        lastName: 'Garcia',
        bio: 'Passionate home cook specializing in Mediterranean cuisine.'
    },
    {
        username: 'baker_john',
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Smith',
        bio: 'Professional baker with 10 years of experience.'
    },
    {
        username: 'foodie_sarah',
        email: 'sarah@example.com',
        password: 'password123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        bio: 'Food blogger and recipe developer.'
    }
];

const sampleRecipes = [
    {
        title: 'Classic Spaghetti Carbonara',
        description: 'An authentic Italian pasta dish made with eggs, cheese, pancetta, and black pepper. This creamy, savory dish comes together in minutes and is perfect for a quick weeknight dinner.',
        category: 'dinner',
        cuisine: 'Italian',
        difficulty: 'medium',
        prepTime: 15,
        cookTime: 20,
        servings: 4,
        ingredients: [
            { name: 'spaghetti', amount: '400', unit: 'g' },
            { name: 'pancetta or guanciale', amount: '200', unit: 'g' },
            { name: 'eggs', amount: '4', unit: 'large' },
            { name: 'Pecorino Romano cheese', amount: '100', unit: 'g' },
            { name: 'black pepper', amount: '2', unit: 'tsp' },
            { name: 'salt', amount: '1', unit: 'tsp' }
        ],
        instructions: [
            { stepNumber: 1, instruction: 'Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.' },
            { stepNumber: 2, instruction: 'While pasta cooks, cut pancetta into small cubes and cook in a large skillet over medium heat until crispy, about 8 minutes.' },
            { stepNumber: 3, instruction: 'In a bowl, whisk together eggs, grated Pecorino cheese, and plenty of black pepper.' },
            { stepNumber: 4, instruction: 'Reserve 1 cup of pasta water, then drain the spaghetti.' },
            { stepNumber: 5, instruction: 'Add hot pasta to the skillet with pancetta (off heat). Quickly pour in egg mixture, tossing constantly.' },
            { stepNumber: 6, instruction: 'Add pasta water as needed to create a creamy sauce. Serve immediately with extra cheese and pepper.' }
        ],
        tags: ['pasta', 'italian', 'quick', 'comfort food'],
        dietaryInfo: { vegetarian: false, vegan: false, glutenFree: false, dairyFree: false, nutFree: true },
        nutritionInfo: { calories: 650, protein: 28, carbs: 72, fat: 26 }
    },
    {
        title: 'Fluffy Blueberry Pancakes',
        description: 'Light and fluffy pancakes bursting with fresh blueberries. Perfect for a lazy weekend breakfast with maple syrup and butter.',
        category: 'breakfast',
        cuisine: 'American',
        difficulty: 'easy',
        prepTime: 10,
        cookTime: 15,
        servings: 4,
        ingredients: [
            { name: 'all-purpose flour', amount: '2', unit: 'cups' },
            { name: 'sugar', amount: '3', unit: 'tbsp' },
            { name: 'baking powder', amount: '2', unit: 'tsp' },
            { name: 'salt', amount: '1/2', unit: 'tsp' },
            { name: 'milk', amount: '1.5', unit: 'cups' },
            { name: 'egg', amount: '1', unit: 'large' },
            { name: 'melted butter', amount: '3', unit: 'tbsp' },
            { name: 'vanilla extract', amount: '1', unit: 'tsp' },
            { name: 'fresh blueberries', amount: '1', unit: 'cup' }
        ],
        instructions: [
            { stepNumber: 1, instruction: 'In a large bowl, whisk together flour, sugar, baking powder, and salt.' },
            { stepNumber: 2, instruction: 'In another bowl, mix milk, egg, melted butter, and vanilla.' },
            { stepNumber: 3, instruction: 'Pour wet ingredients into dry and stir until just combined. Do not overmix - lumps are okay!' },
            { stepNumber: 4, instruction: 'Gently fold in the blueberries.' },
            { stepNumber: 5, instruction: 'Heat a griddle or non-stick pan over medium heat. Lightly grease with butter.' },
            { stepNumber: 6, instruction: 'Pour 1/4 cup batter per pancake. Cook until bubbles form on surface, then flip and cook until golden.' },
            { stepNumber: 7, instruction: 'Serve warm with maple syrup, extra blueberries, and butter.' }
        ],
        tags: ['breakfast', 'pancakes', 'blueberry', 'weekend'],
        dietaryInfo: { vegetarian: true, vegan: false, glutenFree: false, dairyFree: false, nutFree: true },
        nutritionInfo: { calories: 320, protein: 8, carbs: 48, fat: 11 }
    },
    {
        title: 'Thai Green Curry',
        description: 'A fragrant and spicy Thai curry with tender chicken, vegetables, and creamy coconut milk. Restaurant-quality curry you can make at home!',
        category: 'dinner',
        cuisine: 'Thai',
        difficulty: 'medium',
        prepTime: 20,
        cookTime: 25,
        servings: 4,
        ingredients: [
            { name: 'chicken breast', amount: '500', unit: 'g' },
            { name: 'green curry paste', amount: '3', unit: 'tbsp' },
            { name: 'coconut milk', amount: '400', unit: 'ml' },
            { name: 'bamboo shoots', amount: '1', unit: 'can' },
            { name: 'Thai basil', amount: '1', unit: 'cup' },
            { name: 'bell pepper', amount: '1', unit: 'large' },
            { name: 'fish sauce', amount: '2', unit: 'tbsp' },
            { name: 'palm sugar', amount: '1', unit: 'tbsp' },
            { name: 'kaffir lime leaves', amount: '4', unit: 'pieces' },
            { name: 'vegetable oil', amount: '2', unit: 'tbsp' }
        ],
        instructions: [
            { stepNumber: 1, instruction: 'Cut chicken into bite-sized pieces. Slice bell pepper into strips.' },
            { stepNumber: 2, instruction: 'Heat oil in a wok or large pan over medium-high heat.' },
            { stepNumber: 3, instruction: 'Add curry paste and fry for 1 minute until fragrant.' },
            { stepNumber: 4, instruction: 'Add half the coconut milk and stir until it begins to separate.' },
            { stepNumber: 5, instruction: 'Add chicken and cook for 5 minutes, stirring occasionally.' },
            { stepNumber: 6, instruction: 'Add remaining coconut milk, bamboo shoots, bell pepper, fish sauce, palm sugar, and lime leaves.' },
            { stepNumber: 7, instruction: 'Simmer for 10-15 minutes until chicken is cooked through.' },
            { stepNumber: 8, instruction: 'Stir in Thai basil just before serving. Serve with jasmine rice.' }
        ],
        tags: ['thai', 'curry', 'spicy', 'asian'],
        dietaryInfo: { vegetarian: false, vegan: false, glutenFree: true, dairyFree: true, nutFree: true }
    },
    {
        title: 'Classic Chocolate Chip Cookies',
        description: 'Soft and chewy chocolate chip cookies with crispy edges. The perfect cookie recipe that never fails!',
        category: 'dessert',
        cuisine: 'American',
        difficulty: 'easy',
        prepTime: 15,
        cookTime: 12,
        servings: 24,
        ingredients: [
            { name: 'all-purpose flour', amount: '2.25', unit: 'cups' },
            { name: 'butter, softened', amount: '1', unit: 'cup' },
            { name: 'granulated sugar', amount: '3/4', unit: 'cup' },
            { name: 'brown sugar', amount: '3/4', unit: 'cup' },
            { name: 'eggs', amount: '2', unit: 'large' },
            { name: 'vanilla extract', amount: '1', unit: 'tsp' },
            { name: 'baking soda', amount: '1', unit: 'tsp' },
            { name: 'salt', amount: '1', unit: 'tsp' },
            { name: 'chocolate chips', amount: '2', unit: 'cups' }
        ],
        instructions: [
            { stepNumber: 1, instruction: 'Preheat oven to 375°F (190°C). Line baking sheets with parchment paper.' },
            { stepNumber: 2, instruction: 'Cream together butter, granulated sugar, and brown sugar until light and fluffy.' },
            { stepNumber: 3, instruction: 'Beat in eggs one at a time, then add vanilla extract.' },
            { stepNumber: 4, instruction: 'In a separate bowl, whisk together flour, baking soda, and salt.' },
            { stepNumber: 5, instruction: 'Gradually add dry ingredients to wet ingredients, mixing until just combined.' },
            { stepNumber: 6, instruction: 'Fold in chocolate chips.' },
            { stepNumber: 7, instruction: 'Drop rounded tablespoons of dough onto prepared baking sheets, spacing 2 inches apart.' },
            { stepNumber: 8, instruction: 'Bake for 10-12 minutes until edges are golden but centers look slightly underdone.' },
            { stepNumber: 9, instruction: 'Let cool on baking sheet for 5 minutes before transferring to wire rack.' }
        ],
        tags: ['cookies', 'chocolate', 'baking', 'classic'],
        dietaryInfo: { vegetarian: true, vegan: false, glutenFree: false, dairyFree: false, nutFree: true },
        nutritionInfo: { calories: 180, protein: 2, carbs: 24, fat: 9 }
    },
    {
        title: 'Fresh Garden Salad with Lemon Vinaigrette',
        description: 'A crisp and refreshing salad with mixed greens, cherry tomatoes, cucumber, and a zesty homemade lemon vinaigrette.',
        category: 'salad',
        cuisine: 'Mediterranean',
        difficulty: 'easy',
        prepTime: 15,
        cookTime: 0,
        servings: 4,
        ingredients: [
            { name: 'mixed salad greens', amount: '6', unit: 'cups' },
            { name: 'cherry tomatoes', amount: '1', unit: 'cup' },
            { name: 'cucumber', amount: '1', unit: 'medium' },
            { name: 'red onion', amount: '1/4', unit: 'cup' },
            { name: 'feta cheese', amount: '1/2', unit: 'cup' },
            { name: 'olive oil', amount: '1/4', unit: 'cup' },
            { name: 'lemon juice', amount: '3', unit: 'tbsp' },
            { name: 'Dijon mustard', amount: '1', unit: 'tsp' },
            { name: 'honey', amount: '1', unit: 'tsp' },
            { name: 'salt and pepper', amount: '', unit: 'to taste' }
        ],
        instructions: [
            { stepNumber: 1, instruction: 'Wash and dry all salad greens thoroughly.' },
            { stepNumber: 2, instruction: 'Cut cherry tomatoes in half. Slice cucumber into thin rounds. Thinly slice red onion.' },
            { stepNumber: 3, instruction: 'For the vinaigrette: whisk together olive oil, lemon juice, Dijon mustard, honey, salt, and pepper.' },
            { stepNumber: 4, instruction: 'Place greens in a large salad bowl. Add tomatoes, cucumber, and red onion.' },
            { stepNumber: 5, instruction: 'Drizzle with vinaigrette and toss gently to combine.' },
            { stepNumber: 6, instruction: 'Top with crumbled feta cheese and serve immediately.' }
        ],
        tags: ['salad', 'healthy', 'quick', 'vegetarian'],
        dietaryInfo: { vegetarian: true, vegan: false, glutenFree: true, dairyFree: false, nutFree: true },
        nutritionInfo: { calories: 180, protein: 5, carbs: 10, fat: 14 }
    },
    {
        title: 'Creamy Tomato Soup',
        description: 'A comforting bowl of silky smooth tomato soup, perfect for pairing with a grilled cheese sandwich on a cold day.',
        category: 'soup',
        cuisine: 'American',
        difficulty: 'easy',
        prepTime: 10,
        cookTime: 30,
        servings: 6,
        ingredients: [
            { name: 'canned whole tomatoes', amount: '2', unit: 'cans (28 oz each)' },
            { name: 'onion, diced', amount: '1', unit: 'large' },
            { name: 'garlic cloves', amount: '3', unit: 'cloves' },
            { name: 'vegetable broth', amount: '2', unit: 'cups' },
            { name: 'heavy cream', amount: '1/2', unit: 'cup' },
            { name: 'butter', amount: '2', unit: 'tbsp' },
            { name: 'sugar', amount: '1', unit: 'tsp' },
            { name: 'dried basil', amount: '1', unit: 'tsp' },
            { name: 'salt and pepper', amount: '', unit: 'to taste' }
        ],
        instructions: [
            { stepNumber: 1, instruction: 'Melt butter in a large pot over medium heat. Add diced onion and cook until soft, about 5 minutes.' },
            { stepNumber: 2, instruction: 'Add minced garlic and cook for 1 minute until fragrant.' },
            { stepNumber: 3, instruction: 'Add canned tomatoes (with juice), vegetable broth, sugar, and basil. Bring to a boil.' },
            { stepNumber: 4, instruction: 'Reduce heat and simmer for 20 minutes.' },
            { stepNumber: 5, instruction: 'Use an immersion blender to puree soup until smooth (or blend in batches in a regular blender).' },
            { stepNumber: 6, instruction: 'Stir in heavy cream and season with salt and pepper to taste.' },
            { stepNumber: 7, instruction: 'Serve hot, garnished with fresh basil or croutons.' }
        ],
        tags: ['soup', 'tomato', 'comfort food', 'winter'],
        dietaryInfo: { vegetarian: true, vegan: false, glutenFree: true, dairyFree: false, nutFree: true },
        nutritionInfo: { calories: 160, protein: 3, carbs: 15, fat: 10 }
    }
];

const sampleReviews = [
    { rating: 5, title: 'Amazing recipe!', comment: 'This carbonara is absolutely perfect. The technique of adding the egg mixture off heat is key. My family loved it!' },
    { rating: 4, title: 'Delicious pancakes', comment: 'These pancakes are so fluffy! I added a bit more blueberries because we love them. Will definitely make again.' },
    { rating: 5, title: 'Restaurant quality', comment: 'I\'ve been trying to replicate Thai restaurant curry for years. This recipe finally nailed it. The balance of flavors is perfect.' },
    { rating: 5, title: 'Best cookies ever', comment: 'These are now my go-to chocolate chip cookie recipe. Perfectly chewy in the middle with crispy edges. Pro tip: chill the dough for 30 minutes!' },
    { rating: 4, title: 'Fresh and simple', comment: 'Love this light salad! The lemon vinaigrette is so refreshing. I added some olives and it was even better.' }
];

// Seed function
async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Recipe.deleteMany({});
        await Review.deleteMany({});

        // Create users
        console.log('Creating users...');
        const createdUsers = [];
        for (const userData of sampleUsers) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
            console.log(`  Created user: ${user.username}`);
        }

        // Create recipes
        console.log('Creating recipes...');
        const createdRecipes = [];
        for (let i = 0; i < sampleRecipes.length; i++) {
            const recipeData = {
                ...sampleRecipes[i],
                author: createdUsers[i % createdUsers.length]._id
            };
            const recipe = new Recipe(recipeData);
            await recipe.save();
            createdRecipes.push(recipe);
            console.log(`  Created recipe: ${recipe.title}`);
        }

        // Create reviews
        console.log('Creating reviews...');
        for (let i = 0; i < sampleReviews.length; i++) {
            const reviewData = {
                ...sampleReviews[i],
                recipe: createdRecipes[i]._id,
                user: createdUsers[(i + 1) % createdUsers.length]._id // Different user than author
            };
            const review = new Review(reviewData);
            await review.save();
            console.log(`  Created review for: ${createdRecipes[i].title}`);
        }

        // Add some favorites
        console.log('Adding favorites...');
        createdUsers[0].favorites = [createdRecipes[1]._id, createdRecipes[3]._id];
        await createdUsers[0].save();
        createdUsers[1].favorites = [createdRecipes[0]._id, createdRecipes[2]._id];
        await createdUsers[1].save();

        console.log('\n✅ Database seeded successfully!');
        console.log('\nTest accounts:');
        console.log('  Email: maria@example.com | Password: password123');
        console.log('  Email: john@example.com | Password: password123');
        console.log('  Email: sarah@example.com | Password: password123');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
    }
}

// Run seed
seedDatabase();
