# FlavorShare - Recipe Sharing Platform

A full-stack web application for sharing and discovering recipes. Built for CIS 435 at the University of Michigan-Dearborn.

## 🍳 Features

- **User Authentication**: Secure registration, login, and session management
- **Recipe Management**: Full CRUD operations for recipes
- **Recipe Search & Filter**: Search by keyword, filter by category, difficulty, and dietary preferences
- **Reviews & Ratings**: Users can review and rate recipes
- **Favorites**: Save favorite recipes for quick access
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Image Upload**: Upload photos for recipes

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3 (Custom styling with CSS variables)
- Vanilla JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose ODM

### Security
- bcrypt.js for password hashing
- express-session for session management
- express-validator for input validation
- Mongoose schema validation

## 📁 Project Structure

```
recipe-platform/
├── config/
│   └── database.js          # MongoDB connection configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── validation.js        # Input validation middleware
├── models/
│   ├── User.js              # User schema
│   ├── Recipe.js            # Recipe schema
│   └── Review.js            # Review schema
├── public/
│   ├── css/
│   │   └── styles.css       # Main stylesheet
│   ├── js/
│   │   └── app.js           # Frontend JavaScript
│   ├── images/              # Static images
│   ├── index.html           # Home page
│   ├── recipes.html         # Browse recipes page
│   ├── recipe.html          # Recipe detail page
│   ├── create-recipe.html   # Create recipe page
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   └── profile.html         # User profile page
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── recipes.js           # Recipe CRUD routes
│   └── reviews.js           # Review routes
├── .env.example             # Environment variables template
├── package.json             # Node.js dependencies
├── server.js                # Main application entry point
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Installation

1. **Clone or extract the project**
   ```bash
   cd recipe-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your MongoDB connection string:
   ```
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/recipe_platform
   SESSION_SECRET=your-secret-key-here
   ```

4. **Start MongoDB** (if using local installation)
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 📦 Deployment

### Deploying to Render.com (Recommended)

1. Create a [Render](https://render.com) account
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables in the Render dashboard
6. Deploy!

### Deploying to Railway.app

1. Create a [Railway](https://railway.app) account
2. Create a new project
3. Add a MongoDB plugin (or use MongoDB Atlas)
4. Deploy from GitHub
5. Set environment variables
6. Your app will be live!

### MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or allow all IPs for cloud deployment)
5. Get your connection string and add it to your environment variables

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check` - Check authentication status
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Recipes
- `GET /api/recipes` - Get all recipes (with pagination & filters)
- `GET /api/recipes/featured` - Get featured recipes
- `GET /api/recipes/recent` - Get recent recipes
- `GET /api/recipes/:id` - Get single recipe
- `POST /api/recipes` - Create recipe (auth required)
- `PUT /api/recipes/:id` - Update recipe (owner only)
- `DELETE /api/recipes/:id` - Delete recipe (owner only)
- `POST /api/recipes/:id/favorite` - Toggle favorite

### Reviews
- `GET /api/reviews/recipe/:recipeId` - Get reviews for recipe
- `POST /api/reviews/recipe/:recipeId` - Add review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **Input Validation**: All user input is validated and sanitized
- **Schema Validation**: Mongoose schemas enforce data integrity
- **Session Management**: Secure session handling with MongoDB store
- **XSS Prevention**: User input is escaped before display
- **CSRF Protection**: Forms use session-based authentication

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🎨 Customization

### Changing Colors
Edit the CSS variables in `/public/css/styles.css`:
```css
:root {
    --primary-color: #e63946;
    --secondary-color: #457b9d;
    /* ... more variables */
}
```

### Adding New Categories
Edit the category enum in `/models/Recipe.js` and update the select options in the HTML forms.

## 👥 Team Members

- [Your Name] - [Role]
- [Team Member 2] - [Role]
- [Team Member 3] - [Role]
- [Team Member 4] - [Role]

## 📄 License

This project was created for educational purposes as part of CIS 435 at the University of Michigan-Dearborn.

## 🙏 Acknowledgments

- University of Michigan-Dearborn
- CIS 435 Course Instructor
- MongoDB Documentation
- Express.js Documentation
