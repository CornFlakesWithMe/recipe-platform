

### Online Deployment
https://recipe-platform-qior.onrender.com

Note: This way is probably the best way to view the project unless you want to start via zip file.


## 💻 Local Deployment

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (local installation) OR [MongoDB Atlas](https://www.mongodb.com/atlas) account

### Step 1: Extract the Project Files

Extract the `recipe-platform.zip` file to your desired location.

```bash
cd recipe-platform
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Connection
# Option A: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/recipe_platform

# Option B: MongoDB Atlas (cloud)
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/recipe_platform

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secret-key-change-this-in-production

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Start MongoDB (if using local)

**Windows:**
```bash
mongod
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### Step 5: Seed the Database (Optional)

```bash
node seed.js
```

This creates sample users, recipes, and reviews.

### Step 6: Start the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### Step 7: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## ☁️ Cloud Deployment

### Deploy to Render.com

#### Step 1: Set Up MongoDB Atlas (Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Click **"Connect"** → **"Connect your application"**
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/recipe_platform
   ```
5. Replace `<username>` and `<password>` with your database credentials
6. Go to **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)

#### Step 2: Set Up Cloudinary (Image Storage)

1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. From the Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

#### Step 3: Create a Render Account

1. Go to [Render.com](https://render.com/)
2. Sign up for a free account

#### Step 4: Deploy the Application

1. In Render, click **"New +"** → **"Web Service"**
2. Select **"Build and deploy from a Git repository"**
3. Connect your GitHub/GitLab account OR use **"Public Git repository"**
4. Configure as shown in Step 5

#### Step 5: Configure the Web Service

| Setting | Value |
|---------|-------|
| **Name** | recipe-platform (or your choice) |
| **Region** | Oregon (US West) or nearest to you |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

#### Step 6: Add Environment Variables

In the Render dashboard, go to **Environment** and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `SESSION_SECRET` | A long random string (e.g., `flavorshare-secret-key-2024`) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

#### Step 7: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Access your app at `https://your-app-name.onrender.com`

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `SESSION_SECRET` | Yes | Secret key for session encryption |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |

---

## 🗄 Database Setup

### Seeding Sample Data

Run the seed script to populate the database with sample data:

```bash
# Local database
node seed.js

# Production database (use with caution - clears existing data)
MONGODB_URI="your-production-uri" node seed.js
```

**Windows PowerShell:**
```powershell
$env:MONGODB_URI="your-production-uri"; node seed.js
```
