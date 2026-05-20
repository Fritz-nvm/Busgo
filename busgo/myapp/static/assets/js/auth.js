// Authentication JavaScript for BusGo

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthForms();
    initializePasswordToggle();
    initializeSocialLogin();
});

// Initialize authentication forms
function initializeAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
    const password = formData.get('password') || e.target.querySelector('input[type="password"]').value;
    
    // Validate form
    if (!email || !password) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }

    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'danger');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Signing in...';
    submitBtn.disabled = true;

    try {
        // Simulate API call
        await simulateApiCall(1500);
        
        // Mock successful login
        const userData = {
            id: 1,
            name: 'John Doe',
            email: email,
            phone: '+1 (555) 123-4567',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
        };

        // Store user data
        localStorage.setItem('busgo_user', JSON.stringify(userData));
        localStorage.setItem('busgo_auth_token', 'mock_token_' + Date.now());

        showAlert('Login successful! Redirecting...', 'success');
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        showAlert('Invalid email or password. Please try again.', 'danger');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const firstName = formData.get('firstName') || e.target.querySelector('input[placeholder*="First"]').value;
    const lastName = formData.get('lastName') || e.target.querySelector('input[placeholder*="Last"]').value;
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
    const phone = formData.get('phone') || e.target.querySelector('input[type="tel"]').value;
    const password = formData.get('password') || e.target.querySelector('input[placeholder*="Create"]').value;
    const confirmPassword = formData.get('confirmPassword') || e.target.querySelector('input[placeholder*="Confirm"]').value;
    const agreeTerms = e.target.querySelector('#agreeTerms').checked;

    // Validate form
    const validation = validateRegistrationForm({
        firstName, lastName, email, phone, password, confirmPassword, agreeTerms
    });

    if (!validation.isValid) {
        showAlert(validation.message, 'danger');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating Account...';
    submitBtn.disabled = true;

    try {
        // Simulate API call
        await simulateApiCall(2000);
        
        // Mock successful registration
        const userData = {
            id: Date.now(),
            name: `${firstName} ${lastName}`,
            email: email,
            phone: phone,
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
        };

        // Store user data
        localStorage.setItem('busgo_user', JSON.stringify(userData));
        localStorage.setItem('busgo_auth_token', 'mock_token_' + Date.now());

        showAlert('Account created successfully! Redirecting...', 'success');
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        showAlert('Registration failed. Please try again.', 'danger');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Validate registration form
function validateRegistrationForm(data) {
    const { firstName, lastName, email, phone, password, confirmPassword, agreeTerms } = data;

    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
        return { isValid: false, message: 'Please fill in all fields' };
    }

    if (!isValidEmail(email)) {
        return { isValid: false, message: 'Please enter a valid email address' };
    }

    if (!isValidPhone(phone)) {
        return { isValid: false, message: 'Please enter a valid phone number' };
    }

    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    if (password !== confirmPassword) {
        return { isValid: false, message: 'Passwords do not match' };
    }

    if (!agreeTerms) {
        return { isValid: false, message: 'Please agree to the Terms of Service and Privacy Policy' };
    }

    return { isValid: true };
}

// Initialize password toggle functionality
function initializePasswordToggle() {
    const toggleButtons = document.querySelectorAll('[onclick="togglePassword()"]');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Initialize social login
function initializeSocialLogin() {
    const googleBtn = document.querySelector('button:contains("Google")');
    const facebookBtn = document.querySelector('button:contains("Facebook")');

    if (googleBtn) {
        googleBtn.addEventListener('click', () => handleSocialLogin('google'));
    }

    if (facebookBtn) {
        facebookBtn.addEventListener('click', () => handleSocialLogin('facebook'));
    }
}

// Handle social login
async function handleSocialLogin(provider) {
    const button = event.target.closest('button');
    const originalText = button.innerHTML;
    
    button.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>Connecting...`;
    button.disabled = true;

    try {
        // Simulate social login
        await simulateApiCall(1500);
        
        // Mock successful social login
        const userData = {
            id: Date.now(),
            name: 'John Doe',
            email: `user@${provider}.com`,
            phone: '+1 (555) 123-4567',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
        };

        localStorage.setItem('busgo_user', JSON.stringify(userData));
        localStorage.setItem('busgo_auth_token', 'mock_token_' + Date.now());

        showAlert(`${provider} login successful! Redirecting...`, 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        showAlert(`${provider} login failed. Please try again.`, 'danger');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function simulateApiCall(delay = 1000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate 90% success rate
            if (Math.random() > 0.1) {
                resolve();
            } else {
                reject(new Error('API Error'));
            }
        }, delay);
    });
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Add to page
    document.body.appendChild(alert);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Global function for password toggle (for inline onclick)
function togglePassword() {
    // This function is calle by the onclick attribute
    // The actual functionality is handled by the event listener above
}

// Check if user is already logged in
function checkAuthStatus() {
    const user = localStorage.getItem('busgo_user');
    const token = localStorage.getItem('busgo_auth_token');
    
    if (user && token) {
        // User is logged in, redirect to home
        window.location.href = 'index.html';
    }
}

// Call auth check on auth pages
if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
    checkAuthStatus();
}