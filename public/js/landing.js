// Landing Page JavaScript
class LandingPage {
    constructor() {
        this.modal = document.getElementById('loginModal');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.loginBtn = document.getElementById('loginBtn');
        this.playBtn = document.getElementById('playBtn');
        this.closeModal = document.getElementById('closeModal');
        this.registerBtn = document.getElementById('registerBtn');
        this.backToLogin = document.getElementById('backToLogin');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.setCurrentDate();
    }
    
    setupEventListeners() {
        // Modal controls
        this.playBtn.addEventListener('click', () => this.handlePlay());
        this.closeModal.addEventListener('click', () => this.hideModal());
        
        // Email login form (removed - no longer needed)
        
        // Google login
        this.googleLoginBtn = document.getElementById('googleLoginBtn');
        if (this.googleLoginBtn) {
            this.googleLoginBtn.addEventListener('click', () => this.handleGoogleLogin());
        }
        
        // Traditional auth toggle
        this.showTraditionalAuth = document.getElementById('showTraditionalAuth');
        this.traditionalAuth = document.getElementById('traditionalAuth');
        this.loginToggle = document.getElementById('loginToggle');
        this.registerToggle = document.getElementById('registerToggle');
        
        if (this.showTraditionalAuth) {
            this.showTraditionalAuth.addEventListener('click', () => this.showTraditionalAuthForm());
        }
        
        if (this.loginToggle && this.registerToggle) {
            this.loginToggle.addEventListener('click', () => this.showForm('login'));
            this.registerToggle.addEventListener('click', () => this.showForm('register'));
        }
        
        // Button clicks instead of form submissions
        const loginSubmitBtn = document.getElementById('loginSubmitBtn');
        const registerSubmitBtn = document.getElementById('registerSubmitBtn');
        
        if (loginSubmitBtn) {
            loginSubmitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleLogin(e);
            });
        }
        
        if (registerSubmitBtn) {
            registerSubmitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleRegister(e);
            });
        }
        
        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
        
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.hideModal();
            }
        });
    }
    
    setCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const now = new Date();
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            const formattedDate = now.toLocaleDateString('en-US', options);
            dateElement.textContent = formattedDate;
        }
    }
    
    checkAuthStatus() {
        // Check if user is already logged in
        const token = localStorage.getItem('authToken');
        if (token) {
            if (this.playBtn) {
                this.playBtn.innerHTML = '<i class="fas fa-play"></i> Continue Playing';
            }
            if (this.loginBtn) {
                this.loginBtn.innerHTML = '<i class="fas fa-user"></i> Profile';
                this.loginBtn.onclick = () => window.location.href = '/profile';
            }
        }
    }
    
    showModal(formType = 'login') {
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.showForm(formType);
        
        // Focus first input
        setTimeout(() => {
            const firstInput = this.modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }
    
    hideModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.clearForms();
    }
    
    showForm(formType) {
        if (formType === 'login') {
            this.loginForm.style.display = 'block';
            this.registerForm.style.display = 'none';
        } else {
            this.loginForm.style.display = 'none';
            this.registerForm.style.display = 'block';
        }
    }
    
    clearForms() {
        this.loginForm.reset();
        this.registerForm.reset();
        this.clearErrors();
    }
    
    clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.style.display = 'none');
        
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
        });
    }
    
    showError(fieldId, message) {
        const formGroup = document.querySelector(`#${fieldId}`).closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message') || this.createErrorMessage();
        formGroup.appendChild(errorMessage);
        
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    showSuccess(fieldId, message) {
        const formGroup = document.querySelector(`#${fieldId}`).closest('.form-group');
        const successMessage = formGroup.querySelector('.success-message') || this.createSuccessMessage();
        formGroup.appendChild(successMessage);
        
        formGroup.classList.add('success');
        formGroup.classList.remove('error');
        successMessage.textContent = message;
        successMessage.style.display = 'block';
    }
    
    createErrorMessage() {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        return errorDiv;
    }
    
    createSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        return successDiv;
    }
    
    setButtonLoading(button, loading = true) {
        if (!button) {
            console.warn('setButtonLoading: Button not found');
            return;
        }
        
        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            button.innerHTML = button.dataset.originalText || button.innerHTML;
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        this.clearErrors();
        
        const formData = new FormData(this.loginForm);
        const username = formData.get('username');
        const password = formData.get('password');
        
        const submitBtn = document.getElementById('loginSubmitBtn');
        this.setButtonLoading(submitBtn, true);
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                
                // Set cookie for server-side authentication
                document.cookie = `authToken=${result.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
                
                this.showSuccess('username', 'Login successful!');
                
                setTimeout(() => {
                    this.hideModal();
                    window.location.href = '/';
                }, 1000);
            } else {
                this.showError('username', result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('username', 'Connection error. Please try again.');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }
    
    async handleRegister(e) {
        e.preventDefault();
        this.clearErrors();
        
        const formData = new FormData(this.registerForm);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        // Client-side validation
        if (password !== confirmPassword) {
            this.showError('confirmPassword', 'Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            this.showError('regPassword', 'Password must be at least 6 characters');
            return;
        }
        
        const submitBtn = document.getElementById('registerSubmitBtn');
        this.setButtonLoading(submitBtn, true);
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess('regUsername', 'Account created successfully!');
                
                setTimeout(() => {
                    this.showForm('login');
                    this.registerForm.reset();
                }, 1500);
            } else {
                this.showError('regUsername', result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showError('regUsername', 'Connection error. Please try again.');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }
    
    handlePlay() {
        const token = localStorage.getItem('authToken');
        
        if (token) {
            // User is logged in, go to game
            console.log('🎮 User is authenticated, redirecting to game...');
            window.location.href = '/';
        } else {
            // User not logged in, show login modal
            console.log('🎮 User not authenticated, showing login modal...');
            this.showModal();
        }
    }
    
    
    showTraditionalAuthForm() {
        if (this.traditionalAuth) {
            this.traditionalAuth.style.display = 'block';
            this.showTraditionalAuth.style.display = 'none';
        }
    }
    
    
    async handleGoogleLogin() {
        try {
            // Redirect to Google OAuth
            window.location.href = '/login/google';
        } catch (error) {
            console.error('Google login error:', error);
            alert('Google login failed. Please try again.');
        }
    }
}

// Global function for logout
function clearAuth() {
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log('🧹 Cleared authentication data');
    location.reload();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LandingPage();
});
