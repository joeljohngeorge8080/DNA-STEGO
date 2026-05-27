import { Amplify } from 'aws-amplify'

const awsConfig = {
  Auth: {
    // Amazon Cognito Region
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',

    // Amazon Cognito User Pool ID
    userPoolId: import.meta.env.VITE_USER_POOL_ID,

    // Amazon Cognito User Pool Client ID
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,

    // Hosted UI configuration
    oauth: {
      domain: import.meta.env.VITE_OAUTH_DOMAIN,
      scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
      redirectSignIn: import.meta.env.VITE_REDIRECT_SIGN_IN || 'http://localhost:5173/',
      redirectSignOut: import.meta.env.VITE_REDIRECT_SIGN_OUT || 'http://localhost:5173/',
      responseType: 'code'
    }
  }
}

Amplify.configure(awsConfig)

export default awsConfig