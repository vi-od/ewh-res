// Authentication page functionality
let currentUser = null;

// DOM elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');
const showSignupBtn = document.getElementById('showSignup');
const showLoginBtn = document.getElementById('showLogin');
const loading = document.getElementById('loading');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkAuthStatus();
});

// Setup event listeners
function setupEventListeners() {
    // Form switching
    showSignupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showSignupForm();
    });
    
    showLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });
    
    // Form submissions
    loginFormElement.addEventListener('submit', handleLogin);
    signupFormElement.addEventListener('submit', handleSignup);
}

// Show signup form
function showSignupForm() {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    clearMessages();
}

// Show login form
function showLoginForm() {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    clearMessages();
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    setLoading(true);
    clearMessages();
    
    try {
        const session = await authService.signIn(email, password);
        console.log('User signed in:', session);
        showMessage('Welcome back! Redirecting...', 'success');
        
        // Redirect to main page after successful login
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage(getErrorMessage(error), 'error');
    } finally {
        setLoading(false);
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 8) {
        showMessage('Password must be at least 8 characters long', 'error');
        return;
    }
    
    setLoading(true);
    clearMessages();
    
    try {
        const user = await authService.signUp(email, password, name);
        console.log('User created:', user);
        
        // Create user profile in database
        await createUserProfile(user.$id, name, email);
        
        showMessage('Account created successfully! Redirecting...', 'success');
        
        // Redirect to main page after successful signup
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Signup error:', error);
        showMessage(getErrorMessage(error), 'error');
    } finally {
        setLoading(false);
    }
}

// Create user profile in database
async function createUserProfile(userId, name, email) {
    try {
        const profileData = {
            userId: userId,
            name: name,
            email: email,
            bio: '',
            avatar: '',
            joinedAt: new Date().toISOString()
        };
        
        await databaseService.createUserProfile(profileData);
        console.log('User profile created');
    } catch (error) {
        console.error('Error creating user profile:', error);
        // Don't throw error here as the user account is already created
    }
}

// Check authentication status
async function checkAuthStatus() {
    try {
        currentUser = await authService.getCurrentUser();
        if (currentUser) {
            // User is already logged in, redirect to main page
            window.location.href = 'index.html';
        }
    } catch (error) {
        // User not logged in, stay on auth page
        console.log('User not authenticated');
    }
}

// Show message
function showMessage(message, type = 'info') {
    // Remove existing messages
    clearMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message ${type}`;
    messageDiv.textContent = message;
    
    // Add to active form
    const activeForm = loginForm.classList.contains('hidden') ? signupForm : loginForm;
    const form = activeForm.querySelector('form');
    form.insertBefore(messageDiv, form.firstChild);
    
    // Auto-remove after 5 seconds for non-error messages
    if (type !== 'error') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Clear messages
function clearMessages() {
    const messages = document.querySelectorAll('.auth-message');
    messages.forEach(msg => msg.remove());
}

// Set loading state
function setLoading(isLoading) {
    const submitBtns = document.querySelectorAll('.auth-btn');
    
    if (isLoading) {
        loading.classList.add('active');
        submitBtns.forEach(btn => {
            btn.classList.add('loading');
            btn.disabled = true;
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-spinner';
            }
        });
    } else {
        loading.classList.remove('active');
        submitBtns.forEach(btn => {
            btn.classList.remove('loading');
            btn.disabled = false;
        });
        
        // Reset icons
        const loginBtn = loginFormElement.querySelector('.auth-btn i');
        const signupBtn = signupFormElement.querySelector('.auth-btn i');
        if (loginBtn) loginBtn.className = 'fas fa-sign-in-alt';
        if (signupBtn) signupBtn.className = 'fas fa-user-plus';
    }
}

// Get user-friendly error message
function getErrorMessage(error) {
    const message = error.message || error.toString();
    
    if (message.includes('Invalid credentials')) {
        return 'Invalid email or password';
    }
    if (message.includes('User already exists')) {
        return 'An account with this email already exists';
    }
    if (message.includes('Invalid email')) {
        return 'Please enter a valid email address';
    }
    if (message.includes('Password')) {
        return 'Password must be at least 8 characters long';
    }
    if (message.includes('network') || message.includes('fetch')) {
        return 'Connection error. Please check your internet connection';
    }
    
    return 'An error occurred. Please try again';
} 