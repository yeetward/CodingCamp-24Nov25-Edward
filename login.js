// login.js - Updated for Cognito
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const loginBtn = document.getElementById('login-btn');

    // Form submission
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Basic validation
        if (!email || !password) {
            showError('Please enter both email and password');
            return;
        }
        
        if (!email.includes('@')) {
            showError('Please enter a valid email');
            return;
        }
        
        // Show loading
        loginBtn.textContent = 'Signing in...';
        loginBtn.disabled = true;
        
        try {
            // Try to sign in with Cognito
            await CognitoAuth.signIn(email, password);
            
            // Success!
            showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            console.error('Cognito error:', error);
            
            // User-friendly error messages
            let errorMsg = 'Login failed. ';
            if (error.message.includes('UserNotFoundException')) {
                errorMsg = 'User not found. Please check your email or sign up first.';
            } else if (error.message.includes('NotAuthorizedException')) {
                errorMsg = 'Incorrect password. Please try again.';
            } else if (error.message.includes('UserNotConfirmedException')) {
                errorMsg = 'Please check your email to confirm your account first.';
            } else {
                errorMsg += error.message || 'Please try again later.';
            }
            
            showError(errorMsg);
            
            // Reset button
            loginBtn.textContent = 'Sign In';
            loginBtn.disabled = false;
        }
    });
    
    // Helper functions
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'block bg-red-50 text-red-700 p-3 rounded border border-red-200';
        errorMessage.classList.remove('hidden');
        
        // Shake animation
        loginForm.classList.add('shake');
        setTimeout(() => loginForm.classList.remove('shake'), 500);
    }
    
    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'block bg-green-50 text-green-700 p-3 rounded border border-green-200';
        errorMessage.classList.remove('hidden');
    }
});