// auth-config.js
const awsConfig = {
    region: 'ap-southeast-2',
    userPoolId: 'ap-southeast-2_PjeR3UJVk',
    userPoolWebClientId: '3c5jt0jn8gmba0pa2j5nbc5ls4', // ← NEW ID
};

const poolData = {
    UserPoolId: awsConfig.userPoolId,
    ClientId: awsConfig.userPoolWebClientId
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
console.log('✅ Cognito configured with Client ID:', awsConfig.userPoolWebClientId);