// aws-config.js — AWS Amplify removed, using Google OAuth instead
export default {}


const awsConfig = {
  Auth: {
    // Amazon Cognito Region
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',

    // Amazon Cognito User Pool ID (optional)
    userPoolId: import.meta.env.VITE_USER_POOL_ID || undefined,

    // Amazon Cognito User Pool Client ID (optional)
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || undefined,

    // Hosted UI configuration (optional)
    oauth: {
      domain: import.meta.env.VITE_OAUTH_DOMAIN || undefined,
      scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
      redirectSignIn: import.meta.env.VITE_REDIRECT_SIGN_IN || 'http://localhost:5173/',
      redirectSignOut: import.meta.env.VITE_REDIRECT_SIGN_OUT || 'http://localhost:5173/',
      responseType: 'code'
    }
  }
}

// Only configure if we have Cognito credentials
if (hasCognitoConfig) {
  try {
    Amplify.configure(awsConfig)
  } catch (error) {
    console.warn('AWS Cognito configuration failed - using guest mode only:', error.message)
  }
} else {
  console.info('AWS Cognito not configured - guest mode available')
}

export default awsConfig