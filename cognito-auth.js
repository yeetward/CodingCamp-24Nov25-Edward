// cognito-auth.js - Authentication Functions
class CognitoAuth {
    
    static async signIn(email, password) {
    return new Promise((resolve, reject) => {
        const authDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password
        });

        const userData = {
            Username: email,
            Pool: userPool
        };
        
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        
        cognitoUser.setAuthenticationFlowType('USER_PASSWORD_AUTH');
        
        cognitoUser.authenticateUser(authDetails, {
            onSuccess: (result) => {
                localStorage.setItem('cognitoIdToken', result.getIdToken().getJwtToken());
                localStorage.setItem('cognitoAccessToken', result.getAccessToken().getJwtToken());
                localStorage.setItem('cognitoUserEmail', email);
                
                // ADD THIS LINE - Store the Cognito User ID (sub claim)
                const userId = result.getIdToken().payload.sub;
                localStorage.setItem('cognitoUserId', userId);
                
                localStorage.setItem('isLoggedIn', 'true');
                console.log('Login successful for:', email, 'User ID:', userId);
                resolve(result);
            },
            onFailure: (err) => {
                console.error('Login failed:', err);
                reject(err);
            },
            // ADD THIS TO HANDLE NEW PASSWORD REQUIREMENT
            newPasswordRequired: (userAttributes, requiredAttributes) => {
                console.log('New password required');
                
                // In a real app, show a form to set new password
                // For now, just reject with a helpful message
                reject(new Error('Please set a new password. First-time login requires password change.'));
                
                // Or you could automatically set a new password:
                // const newPassword = prompt('Please set a new password:');
                // cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
            }
        });
    });
}

    // Sign out
    static signOut() {
        const user = userPool.getCurrentUser();
        if (user) {
            user.signOut();
        }
        // Clear all stored data
        localStorage.removeItem('cognitoIdToken');
        localStorage.removeItem('cognitoAccessToken');
        localStorage.removeItem('cognitoUserEmail');
        localStorage.removeItem('isLoggedIn');
        console.log('User signed out');
    }

    // Check if user is authenticated
    static isAuthenticated() {
        return localStorage.getItem('cognitoIdToken') !== null;
    }

    // Get current user email
    static getCurrentUserEmail() {
        return localStorage.getItem('cognitoUserEmail');
    }

    // Get current user object
    static getCurrentUser() {
        return userPool.getCurrentUser();
    }


    static async signUp(email, password) {
        return new Promise((resolve, reject) => {
            // userPool should already be defined from auth-config.js
            userPool.signUp(email, password, [], null, (err, result) => {
                if (err) {
                    console.error('Signup error:', err);
                    reject(err);
                    return;
                }
                console.log('User signed up:', email);
                resolve(result.user);
            });
        });
    }
}