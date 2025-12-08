// signup.js - Signup functionality
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const messageDiv = document.getElementById('message');
    const signupBtn = document.getElementById('signup-btn');

    // Form submission
    signupForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        
        // Validation
        if (!email || !password || !confirmPassword) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (!email.includes('@')) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters', 'error');
            return;
        }
        
        // Show loading
        signupBtn.textContent = 'Creating Account...';
        signupBtn.disabled = true;
        
        try {
            // Sign up with Cognito
            await CognitoAuth.signUp(email, password);
            
            // Success - show verification form
            showMessage('✅ Account created! Check your email for verification code.', 'success');
            
            // Add verification form
            addVerificationForm(email);
            
        } catch (error) {
            console.error('Signup error:', error);
            
            let errorMsg = 'Signup failed. ';
            if (error.code === 'UsernameExistsException') {
                errorMsg = 'Email already exists. Please use a different email or sign in.';
            } else if (error.code === 'InvalidPasswordException') {
                errorMsg = 'Password does not meet requirements.';
            } else if (error.code === 'InvalidParameterException') {
                errorMsg = 'Invalid email format.';
            } else {
                errorMsg += error.message || 'Please try again later.';
            }
            
            showMessage(errorMsg, 'error');
            
            // Reset button
            signupBtn.textContent = 'Create Account';
            signupBtn.disabled = false;
        }
    });
    
    // Helper functions
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `p-3 rounded border fade-in ${
            type === 'error' 
                ? 'bg-red-50 text-red-700 border-red-200' 
                : 'bg-green-50 text-green-700 border-green-200'
        }`;
        messageDiv.classList.remove('hidden');
        
        // Shake animation for errors
        if (type === 'error') {
            signupForm.classList.add('shake');
            setTimeout(() => signupForm.classList.remove('shake'), 500);
        }
    }
    
    function addVerificationForm(email) {
        const verificationHTML = `
            <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg fade-in">
                <p class="font-medium text-blue-800 mb-3">Verify Your Email</p>
                <p class="text-sm text-blue-700 mb-3">
                    We sent a 6-digit code to <strong>${email}</strong>.
                    Enter it below to verify your account.
                </p>
                <div class="flex space-x-2 mb-3">
                    <input 
                        type="text" 
                        id="verifyCode" 
                        placeholder="e.g., 123456" 
                        maxlength="6"
                        class="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                    <button 
                        type="button" 
                        onclick="verifyEmail('${email}')"
                        class="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 active:scale-95 transition-all duration-200"
                    >
                        Verify
                    </button>
                </div>
                <div class="text-sm">
                    <p class="text-blue-600">
                        Didn't receive the code? 
                        <a href="#" onclick="resendCode('${email}')" class="underline font-medium">Resend code</a>
                    </p>
                    <p class="text-gray-500 mt-1">
                        Check your spam folder if you don't see it in your inbox.
                    </p>
                </div>
            </div>
        `;
        
        // Insert after the message
        messageDiv.insertAdjacentHTML('afterend', verificationHTML);
        
        // Hide signup form
        signupForm.style.opacity = '0.5';
        signupForm.style.pointerEvents = 'none';
    }
});

// Verification functions (global for onclick)
async function verifyEmail(email) {
    const codeInput = document.getElementById('verifyCode');
    const code = codeInput.value.trim();
    const messageDiv = document.getElementById('message');
    
    if (!code || code.length !== 6) {
        messageDiv.textContent = 'Please enter a valid 6-digit code';
        messageDiv.className = 'p-3 rounded border bg-red-50 text-red-700 border-red-200';
        return;
    }
    
    try {
        const userData = {
            Username: email,
            Pool: userPool
        };
        
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        
        cognitoUser.confirmRegistration(code, true, (err, result) => {
            if (err) {
                messageDiv.textContent = 'Invalid or expired code. Please try again.';
                messageDiv.className = 'p-3 rounded border bg-red-50 text-red-700 border-red-200';
                return;
            }
            
            messageDiv.textContent = '✅ Email verified! Redirecting to login...';
            messageDiv.className = 'p-3 rounded border bg-green-50 text-green-700 border-green-200';
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
        
    } catch (error) {
        messageDiv.textContent = 'Error: ' + error.message;
        messageDiv.className = 'p-3 rounded border bg-red-50 text-red-700 border-red-200';
    }
}

async function resendCode(email) {
    const messageDiv = document.getElementById('message');
    
    try {
        const userData = {
            Username: email,
            Pool: userPool
        };
        
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        
        cognitoUser.resendConfirmationCode((err, result) => {
            if (err) {
                messageDiv.textContent = 'Error resending code: ' + err.message;
                messageDiv.className = 'p-3 rounded border bg-red-50 text-red-700 border-red-200';
            } else {
                messageDiv.textContent = '✅ New verification code sent!';
                messageDiv.className = 'p-3 rounded border bg-green-50 text-green-700 border-green-200';
            }
        });
        
    } catch (error) {
        messageDiv.textContent = 'Error: ' + error.message;
        messageDiv.className = 'p-3 rounded border bg-red-50 text-red-700 border-red-200';
    }
}

// Add signUp method to CognitoAuth class in cognito-auth.js
// Add this to your existing cognito-auth.js:
CognitoAuth.signUp = async function(email, password) {
    return new Promise((resolve, reject) => {
        userPool.signUp(email, password, [], null, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('User signed up:', email);
            resolve(result.user);
        });
    });
};