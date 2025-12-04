// login.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    
    // Test credentials (you can change these)
    const VALID_EMAIL = 'admin123@gmail.com';
    const VALID_PASSWORD = 'admin123';
    
    // Form submission handler
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get values
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Reset error
        hideError();
        
        // Validation
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }
        
        // Check credentials
        if (email === VALID_EMAIL && password === VALID_PASSWORD) {
            loginSuccess();
        } else {
            showError('Invalid email or password. Try: admin123@gmail.com / admin123');
        }
    });
    
    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        errorMessage.classList.add('block');
        
        // Shake animation
        loginForm.classList.add('shake');
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 500);
    }
    
    // Hide error message
    function hideError() {
        errorMessage.classList.add('hidden');
        errorMessage.classList.remove('block');
        errorMessage.textContent = '';
    }
    
    // Successful login
    function loginSuccess() {
        // Show success message
        errorMessage.textContent = 'Login successful! Redirecting...';
        errorMessage.classList.remove('hidden', 'bg-red-50', 'text-red-700');
        errorMessage.classList.add('block', 'bg-green-50', 'text-green-700');
        
        // Change button text
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Success!';
        submitBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        submitBtn.disabled = true;
        
        // Redirect to todo app after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
        // Store login state in localStorage (optional)
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', emailInput.value);
    }
    
    // Add shake animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .shake {
            animation: shake 0.5s ease-in-out;
        }
    `;
    document.head.appendChild(style);
    
    // Auto-fill test credentials on double-click (for testing)
    emailInput.addEventListener('dblclick', function() {
        emailInput.value = VALID_EMAIL;
        passwordInput.value = VALID_PASSWORD;
    });
});