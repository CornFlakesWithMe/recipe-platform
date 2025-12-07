/**
 * Recipe Sharing Platform - Main JavaScript
 * Handles all frontend functionality
 */

// API Base URL
const API_URL = '/api';

// ======================
// Utility Functions
// ======================

// Show alert message
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button class="alert-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format time (minutes to hours and minutes)
function formatTime(minutes) {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Render star rating
function renderStars(rating, interactive = false) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let html = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            html += '<span class="star filled">★</span>';
        } else if (i === fullStars + 1 && hasHalf) {
            html += '<span class="star filled">★</span>';
        } else {
            html += '<span class="star">☆</span>';
        }
    }
    
    return html;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ======================
// API Functions
// ======================

// Generic fetch wrapper
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'An error occurred');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API calls
const AuthAPI = {
    async register(userData) {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    
    async login(credentials) {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },
    
    async logout() {
        return apiRequest('/auth/logout', { method: 'POST' });
    },
    
    async checkAuth() {
        return apiRequest('/auth/check');
    },
    
    async getProfile() {
        return apiRequest('/auth/me');
    },
    
    async updateProfile(profileData) {
        return apiRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }
};

// Recipe API calls
const RecipeAPI = {
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/recipes?${queryString}`);
    },
    
    async getFeatured() {
        return apiRequest('/recipes/featured');
    },
    
    async getRecent() {
        return apiRequest('/recipes/recent');
    },
    
    async getById(id) {
        return apiRequest(`/recipes/${id}`);
    },
    
    async create(formData) {
        const response = await fetch(`${API_URL}/recipes`, {
            method: 'POST',
            body: formData
        });
        return response.json();
    },
    
    async update(id, formData) {
        const response = await fetch(`${API_URL}/recipes/${id}`, {
            method: 'PUT',
            body: formData
        });
        return response.json();
    },
    
    async delete(id) {
        return apiRequest(`/recipes/${id}`, { method: 'DELETE' });
    },
    
    async toggleFavorite(id) {
        return apiRequest(`/recipes/${id}/favorite`, { method: 'POST' });
    },
    
    async getFavoriteStatus(id) {
        return apiRequest(`/recipes/${id}/favorite-status`);
    },
    
    async getMyRecipes() {
        return apiRequest('/recipes/my-recipes');
    }
};

// Review API calls
const ReviewAPI = {
    async getForRecipe(recipeId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/reviews/recipe/${recipeId}?${queryString}`);
    },
    
    async create(recipeId, reviewData) {
        return apiRequest(`/reviews/recipe/${recipeId}`, {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    },
    
    async update(reviewId, reviewData) {
        return apiRequest(`/reviews/${reviewId}`, {
            method: 'PUT',
            body: JSON.stringify(reviewData)
        });
    },
    
    async delete(reviewId) {
        return apiRequest(`/reviews/${reviewId}`, { method: 'DELETE' });
    },
    
    async checkUserReview(recipeId) {
        return apiRequest(`/reviews/check/${recipeId}`);
    }
};

// ======================
// Auth State Management
// ======================

let currentUser = null;

async function checkAuthState() {
    try {
        const data = await AuthAPI.checkAuth();
        if (data.isLoggedIn) {
            currentUser = { id: data.userId, username: data.username };
            updateNavForAuth(true);
        } else {
            currentUser = null;
            updateNavForAuth(false);
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        currentUser = null;
        updateNavForAuth(false);
    }
}

function updateNavForAuth(isLoggedIn) {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    
    if (!authButtons || !userMenu) return;
    
    if (isLoggedIn) {
        authButtons.classList.add('d-none');
        userMenu.classList.remove('d-none');
        
        const usernameSpan = document.getElementById('username-display');
        if (usernameSpan && currentUser) {
            usernameSpan.textContent = currentUser.username;
        }
    } else {
        authButtons.classList.remove('d-none');
        userMenu.classList.add('d-none');
    }
}

// ======================
// Recipe Card Component
// ======================

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'card recipe-card';
    card.innerHTML = `
        <a href="recipe.html?id=${recipe._id}" class="card-image">
            <img src="${recipe.image || '/images/default-recipe.jpg'}" alt="${recipe.title}">
            <span class="recipe-category">${recipe.category}</span>
        </a>
        <div class="card-body">
            <a href="recipe.html?id=${recipe._id}">
                <h3 class="card-title">${recipe.title}</h3>
            </a>
            <p class="card-text">${recipe.description.substring(0, 100)}${recipe.description.length > 100 ? '...' : ''}</p>
            <div class="card-meta">
                <span class="recipe-time">
                    <span>⏱️</span>
                    <span>${formatTime(recipe.prepTime + recipe.cookTime)}</span>
                </span>
                <span class="recipe-rating">
                    <span>★</span>
                    <span>${recipe.averageRating.toFixed(1)}</span>
                    <span>(${recipe.totalRatings})</span>
                </span>
            </div>
        </div>
        <div class="card-footer">
            <div class="d-flex align-center justify-between">
                <span class="difficulty-badge ${recipe.difficulty}">${recipe.difficulty}</span>
                <span class="text-sm text-gray">${recipe.author?.username || 'Unknown'}</span>
            </div>
        </div>
    `;
    return card;
}

// ======================
// Page-Specific Functions
// ======================

// Home Page
async function initHomePage() {
    await loadFeaturedRecipes();
    await loadRecentRecipes();
    
    // Setup search
    const searchForm = document.getElementById('hero-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('hero-search-input').value;
            window.location.href = `recipes.html?q=${encodeURIComponent(query)}`;
        });
    }
}

async function loadFeaturedRecipes() {
    const container = document.getElementById('featured-recipes');
    if (!container) return;
    
    try {
        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        const data = await RecipeAPI.getFeatured();
        
        container.innerHTML = '';
        if (data.recipes.length === 0) {
            container.innerHTML = '<p class="text-center">No featured recipes yet.</p>';
            return;
        }
        
        data.recipes.forEach(recipe => {
            container.appendChild(createRecipeCard(recipe));
        });
    } catch (error) {
        container.innerHTML = '<p class="text-center text-error">Failed to load recipes.</p>';
    }
}

async function loadRecentRecipes() {
    const container = document.getElementById('recent-recipes');
    if (!container) return;
    
    try {
        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        const data = await RecipeAPI.getRecent();
        
        container.innerHTML = '';
        if (data.recipes.length === 0) {
            container.innerHTML = '<p class="text-center">No recipes yet.</p>';
            return;
        }
        
        data.recipes.forEach(recipe => {
            container.appendChild(createRecipeCard(recipe));
        });
    } catch (error) {
        container.innerHTML = '<p class="text-center text-error">Failed to load recipes.</p>';
    }
}

// Recipes Page
async function initRecipesPage() {
    const params = new URLSearchParams(window.location.search);
    await loadRecipes(Object.fromEntries(params));
    setupFilters();
}

async function loadRecipes(params = {}) {
    const container = document.getElementById('recipes-grid');
    if (!container) return;
    
    try {
        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        const data = await RecipeAPI.getAll(params);
        
        container.innerHTML = '';
        if (data.recipes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🍽️</div>
                    <h3>No recipes found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }
        
        data.recipes.forEach(recipe => {
            container.appendChild(createRecipeCard(recipe));
        });
        
        renderPagination(data.pagination);
    } catch (error) {
        container.innerHTML = '<p class="text-center text-error">Failed to load recipes.</p>';
    }
}

function setupFilters() {
    const filterForm = document.getElementById('filter-form');
    if (!filterForm) return;
    
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(filterForm);
        const params = {};
        
        formData.forEach((value, key) => {
            if (value) params[key] = value;
        });
        
        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value) {
            params.q = searchInput.value;
        }
        
        loadRecipes(params);
    });
    
    // Search with debounce
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const params = new URLSearchParams(window.location.search);
            params.set('q', e.target.value);
            loadRecipes(Object.fromEntries(params));
        }, 500));
    }
}

function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    if (pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button class="pagination-btn" ${pagination.current === 1 ? 'disabled' : ''} onclick="changePage(${pagination.current - 1})">← Prev</button>`;
    
    // Page numbers
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === 1 || i === pagination.pages || (i >= pagination.current - 2 && i <= pagination.current + 2)) {
            html += `<button class="pagination-btn ${i === pagination.current ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === pagination.current - 3 || i === pagination.current + 3) {
            html += '<span>...</span>';
        }
    }
    
    // Next button
    html += `<button class="pagination-btn" ${pagination.current === pagination.pages ? 'disabled' : ''} onclick="changePage(${pagination.current + 1})">Next →</button>`;
    
    container.innerHTML = html;
}

function changePage(page) {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);
    loadRecipes(Object.fromEntries(params));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ======================
// Event Listeners
// ======================

document.addEventListener('DOMContentLoaded', async () => {
    // Check auth state
    await checkAuthState();
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await AuthAPI.logout();
                currentUser = null;
                updateNavForAuth(false);
                window.location.href = '/';
            } catch (error) {
                showAlert('Logout failed', 'error');
            }
        });
    }
    
    // Page-specific initialization
    const page = document.body.dataset.page;
    
    switch (page) {
        case 'home':
            initHomePage();
            break;
        case 'recipes':
            initRecipesPage();
            break;
        case 'recipe-detail':
            initRecipeDetailPage();
            break;
        case 'create-recipe':
        case 'edit-recipe':
            initRecipeForm();
            break;
        case 'profile':
            initProfilePage();
            break;
        case 'login':
            initLoginPage();
            break;
        case 'register':
            initRegisterPage();
            break;
    }
});

// Make functions globally available
window.changePage = changePage;
window.showAlert = showAlert;
