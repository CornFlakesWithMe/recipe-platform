/**
 * Database Seed Script
 * Populates the database with sample data for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Recipe = require('./models/Recipe');
const Review = require('./models/Review');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_platform';

// Sample Users
const users = [
    {
        username: 'chef_maria',
        email: 'maria@example.com',
        password: 'password123',
        firstName: 'Maria',
        lastName: 'Garcia',
        bio: 'Professional chef with 10 years of experience. Love creating Italian and Mexican cuisine!'
    },
    {
        username: 'baker_john',
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Smith',
        bio: 'Home baker passionate about desserts and pastries.'
    },
    {
        username: 'foodie_sarah',
        email: 'sarah@example.com',
        password: 'password123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        bio: 'Food enthusiast exploring cuisines from around the world.'
    }
];

// Sample Recipes
const recipes = [
    {
        title: 'Classic Spaghetti Carbonara',
        description: 'A traditional Italian pasta dish made with eggs, cheese, pancetta, and black pepper. Creamy, savory, and absolutely delicious!',
        category: 'dinner',
        cuisine: 'Italian',
        difficulty: 'medium',
        prepTime: 15,
        cookTime: 20,
        servings: 4,
        ingredients: [
            { amount: '400', unit: 'g', name: 'spaghetti' },
            { amount: '200', unit: 'g', name: 'pancetta or guanciale' },
            { amount: '4', unit: 'large', name: 'egg yolks' },
            { amount: '1', unit: 'cup', name: 'Pecorino Romano cheese, grated' },
            { amount: '1', unit: 'tsp', name: 'black pepper, freshly ground' },
            { amount: '1', unit: 'tbsp', name: 'salt for pasta water' }
        ],
        instructions: [
            { stepNumber: 1, instruction: 'Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.' },
            { stepNumber: 2, instruction: 'While pasta cooks, cut pancetta into small cubes and cook in a large skillet over medium heat until crispy, about 8 minutes.' },
            { stepNumber: 3, instruction: 'In a bowl, whisk together egg yolks, grated Pecorino Romano, and black pepper.' },
            { stepNumber: 4, instruction: 'Reserve 1 cup pasta water, then drain the spaghetti.' },
            { stepNumber: 5, instruction: 'Remove skillet from heat. Add hot pasta to the pancetta and toss.' },
            { stepNumber: 6, instruction: 'Quickly pour egg mixture over pasta, tossing constantly. Add pasta water as needed to create a creamy sauce.' },
            { stepNumber: 7, instruction: 'Serve immediately with extra cheese and pepper on top.' }
        ],
        dietaryInfo: {
            vegetarian: false,
            vegan: false,
            glutenFree: false,
            dairyFree: false,
            nutFree: true
        },
        nutritionInfo: {
            calories: 650,
            protein: 25,
            carbs: 70,
            fat: 28
        },
        tags: ['pasta', 'italian', 'quick', 'comfort food']
    },
    {
        title: 'Fluffy Blueberry Pancakes',
        description: 'Light and fluffy pancakes loaded with fresh blueberries. Perfect for a weekend breakfast!',
        category: 'breakfast',
        cuisine: 'American',
        difficulty: 'easy',
        prepTime: 10,
        cookTime: 15,
        servings: 4,
        ingredients: [
            { amount: '2', unit: 'cups', name: 'all-purpose flour' },
            { amount: '2', unit: 'tbsp', name: 'sugar' },
            { amount: '2', unit: 'tsp', name: 'baking powder' },
            { amount: '1', unit: 'tsp', name: 'baking soda' },
            { amount: '1/2', unit: 'tsp', name: 'salt' },
            { amount: '2', unit: 'cups', name: 'buttermilk' },
            { amount: '2', unit: 'large', name: 'eggs' },
            { amount: '4', unit: 'tbsp', name: 'melted butter' },
            { amount: '1', unit: 'cup', name: 'fresh blueberries' }
        ],
        instructions: [
            { stepNumber: 1, instruction: 'In a large bowl, whisk together flour, sugar, baking powder, baking soda, and salt.' },
            { stepNumber: 2, instruction: 'In another bowl, whisk buttermilk, eggs, and melted butter.' },
            { stepNumber: 3, instruction: 'Pour wet ingredients into dry ingredients and stir until just combined. Do not overmix.' },
            { stepNumber: 4, instruction: 'Gently fold in blueberries.' },
            { stepNumber: 5, instruction: 'Heat a griddle or non-stick pan over medium heat. Lightly grease with butter.' },
            { stepNumber: 6, instruction: 'Pour 1/4 cup batter per pancake. Cook until bubbles form on surface, then flip.' },
            { stepNumber: 7, instruction: 'Cook until golden brown. Serve with maple syrup and extra blueberries.' }
        ],
        dietaryInfo: {
            vegetarian: true,
            vegan: false,
            glutenFree: false,
            dairyFree: false,
            nutFree: true
        },
        nutritionInfo: {
            calories: 380,
            protein: 10,
            carbs: 52,
            fat: 14
        },
        tags: ['breakfast', 'pancakes', 'blueberry', 'weekend']
    },
    {
        title: 'Thai Green Curry',
        description: 'Aromatic and spicy Thai green curry with chicken and vegetables in creamy coconut milk.',
        category: 'dinner',
        cuisine: 'Thai',
        difficulty: 'medium',
        prepTime: 20,
        cookTime: 25,
        servings: 4,
        ingredients: [
            { amount: '500', unit: 'g', name: 'chicken breast, sliced' },
            { amount: '400', unit: 'ml', name: 'coconut milk' },
            { amount: '3', unit: 'tbsp', name: 'green curry paste' },
            { amount: '1', unit: 'cup', name: 'bamboo shoots' },
            { amount: '1', unit: 'cup', name: 'Thai eggplant, quartered' },
            { amount: '1', unit: 'cup', name: 'bell peppers, sliced' },
            { amount: '2', unit: 'tbsp', name: 'fish sauce' },
            { amount: '1', unit: 'tbsp', name: 'palm sugar' },
            { amount: '1', unit: 'cup', name: 'Thai basil leaves' },
            { amount: '2', unit: 'whole', name: 'kaffir lime leaves' }
        ],
        instructions: [
            { stepNumber: 1, instruction: 'Heat 1/2 cup coconut milk in a wok over medium-high heat until oil separates.' },
            { stepNumber: 2, instruction: 'Add green curry paste and stir-fry for 1-2 minutes until fragrant.' },
            { stepNumber: 3, instruction: 'Add chicken and cook until no longer pink on the outside.' },
            { stepNumber: 4, instruction: 'Pour in remaining coconut milk and bring to a simmer.' },
            { stepNumber: 5, instruction: 'Add eggplant, bamboo shoots, and bell peppers. Cook for 10 minutes.' },
            { stepNumber: 6, instruction: 'Season with fish sauce and palm sugar. Add kaffir lime leaves.' },
            { stepNumber: 7, instruction: 'Remove from heat, stir in Thai basil, and serve with jasmine rice.' }
        ],
        dietaryInfo: {
            vegetarian: false,
            vegan: false,
            glutenFree: true,
            dairyFree: true,
            nutFree: true
        },
        nutritionInfo: {
            calories: 450,
            protein: 35,
            carbs: 18,
            fat: 28
        },
        tags: ['thai', 'curry', 'spicy', 'asian']
    },
    {
        title: 'Classic Chocolate Chip Cookies',
        description: 'Crispy on the edges, chewy in the middle - these chocolate chip cookies are absolutely perfect!',
        category: 'dessert',
        cuisine: 'American',
        difficulty: 'easy',
        prepTime: 15,
        cookTime: 12,
        servings: 24,
        ingredients: [
            { amount: '2 1/4', unit: 'cups', name: 'all-purpose flour' },
            { amount: '1', unit: 'tsp', name: 'baking soda' },
            { amount: '1', unit: 'tsp', name: 'salt' },
            { amount: '1', unit: 'cup', name: 'butter, softened' },
            { amount: '3/4', unit: 'cup', name: 'granulated sugar' },
            { amount: '3/4', unit: 'cup', name: 'brown sugar, packed' },
            { amount: '2', unit: 'large', name: 'eggs' },
            { amount: '2', unit: 'tsp', name: 'vanilla extract' },
            { amount: '2', unit: 'cups', name: 'chocolate chips' }
        ],
        instructions: [
            { stepNumber: 1, instruction: 'Preheat oven to 375°F (190°C). Line baking sheets with parchment paper.' },
            { stepNumber: 2, instruction: 'Whisk together flour, baking soda, and salt in a bowl.' },
            { stepNumber: 3, instruction: 'Beat butter and both sugars until light and fluffy, about 3 minutes.' },
            { stepNumber: 4, instruction: 'Beat in eggs one at a time, then add vanilla.' },
            { stepNumber: 5, instruction: 'Gradually mix in flour mixture until just combined.' },
            { stepNumber: 6, instruction: 'Fold in chocolate chips.' },
            { stepNumber: 7, instruction: 'Drop rounded tablespoons of dough onto prepared baking sheets.' },
            { stepNumber: 8, instruction: 'Bake for 10-12 minutes until edges are golden. Cool on pan for 5 minutes.' }
        ],
        dietaryInfo: {
            vegetarian: true,
            vegan: false,
            glutenFree: false,
            dairyFree: false,
            nutFree: true
        },
        nutritionInfo: {
            calories: 180,
            protein: 2,
            carbs: 24,
            fat: 9
        },
        tags: ['cookies', 'dessert', 'chocolate', 'baking']
    },
    {
        title: 'Fresh Garden Salad',
        description: 'A light and refreshing salad with mixed greens, cherry tomatoes, cucumbers, and a zesty lemon vinaigrette.',
        category: 'salad',
        cuisine: 'American',
        difficulty: 'easy',
        prepTime: 15,
        cookTime: 0,
        servings: 4,
        ingredients: [
            { amount: '6', unit: 'cups', name: 'mixed salad greens' },
            { amount: '1', unit: 'cup', name: 'cherry tomatoes, halved' },
            { amount: '1', unit: 'medium', name: 'cucumber, sliced' },
            { amount: '1/2', unit: 'cup', name: 'red onion, thinly sliced' },
            { amount: '1/4', unit: 'cup', name: 'olive oil' },
            { amount: '2', unit: 'tbsp', name: 'lemon juice' },
            { amount: '1', unit: 'tsp', name: 'Dijon mustard' },
            { amount: '1', unit: 'clove', name: 'garlic, minced' },
            { amount: '1', unit: 'pinch', name: 'salt and pepper' }
        ],
        instructions: [
            { stepNumber: 1, instruction: 'Wash and dry all vegetables thoroughly.' },
            { stepNumber: 2, instruction: 'In a large bowl, combine mixed greens, tomatoes, cucumber, and red onion.' },
            { stepNumber: 3, instruction: 'In a small jar, combine olive oil, lemon juice, Dijon mustard, garlic, salt, and pepper.' },
            { stepNumber: 4, instruction: 'Shake vigorously until well combined.' },
            { stepNumber: 5, instruction: 'Drizzle dressing over salad just before serving and toss gently.' }
        ],
        dietaryInfo: {
            vegetarian: true,
            vegan: true,
            glutenFree: true,
            dairyFree: true,
            nutFree: true
        },
        nutritionInfo: {
            calories: 120,
            protein: 2,
            carbs: 8,
            fat: 10
        },
        tags: ['salad', 'healthy', 'quick', 'vegan']
    },
    {
        title: 'Creamy Tomato Soup',
        description: 'A comforting bowl of creamy tomato soup, perfect for dipping grilled cheese sandwiches!',
        category: 'soup',
        cuisine: 'American',
        difficulty: 'easy',
        prepTime: 10,
        cookTime: 30,
        servings: 6,
        ingredients: [
            { amount: '2', unit: 'cans (28 oz)', name: 'whole peeled tomatoes' },
            { amount: '1', unit: 'medium', name: 'onion, diced' },
            { amount: '3', unit: 'cloves', name: 'garlic, minced' },
            { amount: '2', unit: 'cups', name: 'vegetable broth' },
            { amount: '1', unit: 'cup', name: 'heavy cream' },
            { amount: '2', unit: 'tbsp', name: 'butter' },
            { amount: '1', unit: 'tsp', name: 'sugar' },
            { amount: '1', unit: 'tsp', name: 'dried basil' },
            { amount: '1', unit: 'pinch', name: 'salt and pepper' }
        ],
        instructions: [
            { stepNumber: 1, instruction: 'Melt butter in a large pot over medium heat. Sauté onion until soft, about 5 minutes.' },
            { stepNumber: 2, instruction: 'Add garlic and cook for 1 minute until fragrant.' },
            { stepNumber: 3, instruction: 'Add tomatoes, vegetable broth, sugar, and basil. Bring to a boil.' },
            { stepNumber: 4, instruction: 'Reduce heat and simmer for 20 minutes.' },
            { stepNumber: 5, instruction: 'Use an immersion blender to puree until smooth.' },
            { stepNumber: 6, instruction: 'Stir in heavy cream and season with salt and pepper.' },
            { stepNumber: 7, instruction: 'Serve hot with a drizzle of cream and fresh basil if desired.' }
        ],
        dietaryInfo: {
            vegetarian: true,
            vegan: false,
            glutenFree: true,
            dairyFree: false,
            nutFree: true
        },
        nutritionInfo: {
            calories: 220,
            protein: 4,
            carbs: 18,
            fat: 16
        },
        tags: ['soup', 'tomato', 'comfort food', 'vegetarian']
    }
];

// Sample Reviews
const reviewsData = [
    { recipeIndex: 0, userIndex: 1, rating: 5, title: 'Absolutely Perfect!', comment: 'This carbonara is restaurant quality! The sauce was so creamy and delicious. Will definitely make again.' },
    { recipeIndex: 0, userIndex: 2, rating: 4, title: 'Great recipe', comment: 'Really tasty! I added some peas for extra veggies. The technique for the sauce is key.' },
    { recipeIndex: 1, userIndex: 0, rating: 5, title: 'Best pancakes ever!', comment: 'So fluffy and the blueberries burst in every bite. My kids loved these!' },
    { recipeIndex: 2, userIndex: 1, rating: 4, title: 'Authentic taste', comment: 'Takes me back to my trip to Thailand. Great balance of flavors.' },
    { recipeIndex: 3, userIndex: 2, rating: 5, title: 'Cookie perfection', comment: 'Crispy edges, chewy middle - exactly as described. These disappeared in minutes!' }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        console.log('Clearing existing data...');
        await Review.deleteMany({});
        await Recipe.deleteMany({});
        await User.deleteMany({});

        // Create users
        console.log('Creating users...');
        const createdUsers = [];
        for (const userData of users) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = new User({
                ...userData,
                password: hashedPassword
            });
            await user.save();
            createdUsers.push(user);
            console.log(`  Created user: ${user.username}`);
        }

        // Create recipes
        console.log('Creating recipes...');
        const createdRecipes = [];
        for (let i = 0; i < recipes.length; i++) {
            const recipeData = recipes[i];
            // Assign recipes to different users
            const authorIndex = i % createdUsers.length;
            const recipe = new Recipe({
                ...recipeData,
                author: createdUsers[authorIndex]._id
            });
            await recipe.save();
            createdRecipes.push(recipe);
            console.log(`  Created recipe: ${recipe.title}`);
        }

        // Create reviews
        console.log('Creating reviews...');
        for (const reviewData of reviewsData) {
            const review = new Review({
                recipe: createdRecipes[reviewData.recipeIndex]._id,
                user: createdUsers[reviewData.userIndex]._id,
                rating: reviewData.rating,
                title: reviewData.title,
                comment: reviewData.comment
            });
            await review.save();

            // Update recipe rating
            const recipe = createdRecipes[reviewData.recipeIndex];
            const reviews = await Review.find({ recipe: recipe._id });
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            recipe.averageRating = totalRating / reviews.length;
            recipe.totalRatings = reviews.length;
            await recipe.save();

            console.log(`  Created review for: ${recipe.title}`);
        }

        // Add some favorites
        console.log('Adding favorites...');
        createdUsers[0].favorites.push(createdRecipes[3]._id, createdRecipes[4]._id);
        await createdUsers[0].save();
        createdUsers[1].favorites.push(createdRecipes[0]._id, createdRecipes[2]._id);
        await createdUsers[1].save();

        console.log('\n✅ Database seeded successfully!');
        console.log('\nTest accounts:');
        console.log('  Email: maria@example.com | Password: password123');
        console.log('  Email: john@example.com  | Password: password123');
        console.log('  Email: sarah@example.com | Password: password123');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
    }
}

seedDatabase();