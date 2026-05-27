"""
AWS Cognito Authentication Module for DNA-Stego Backend

This module provides JWT token validation for AWS Cognito User Pool tokens.
"""

import os
import time
import requests
from typing import Optional, Dict, Any
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient

# AWS Cognito Configuration
COGNITO_REGION = os.getenv("COGNITO_REGION", "us-east-1")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")

# Cognito URLs
COGNITO_ISSUER = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
JWKS_URL = f"{COGNITO_ISSUER}/.well-known/jwks.json"

# Initialize JWK client for token verification
jwks_client = PyJWKClient(JWKS_URL) if COGNITO_USER_POOL_ID else None

# Security scheme
security = HTTPBearer(auto_error=False)

class CognitoToken:
    """Represents a validated Cognito JWT token"""

    def __init__(self, token_data: Dict[str, Any]):
        self.sub = token_data.get("sub")
        self.username = token_data.get("cognito:username")
        self.email = token_data.get("email")
        self.email_verified = token_data.get("email_verified")
        self.token_use = token_data.get("token_use")
        self.iss = token_data.get("iss")
        self.exp = token_data.get("exp")
        self.iat = token_data.get("iat")
        self.auth_time = token_data.get("auth_time")
        self.client_id = token_data.get("client_id")

    def is_expired(self) -> bool:
        """Check if the token is expired"""
        return time.time() > self.exp

def verify_cognito_token(token: str) -> CognitoToken:
    """
    Verify and decode a Cognito JWT token

    Args:
        token: The JWT token string

    Returns:
        CognitoToken: Validated token data

    Raises:
        HTTPException: If token is invalid or expired
    """
    if not jwks_client:
        raise HTTPException(
            status_code=500,
            detail="Cognito authentication not configured"
        )

    try:
        # Get the signing key
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Decode and verify the token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=COGNITO_CLIENT_ID,
            issuer=COGNITO_ISSUER,
            options={
                "verify_exp": True,
                "verify_iat": True,
                "verify_nbf": True
            }
        )

        # Create and return token object
        cognito_token = CognitoToken(payload)

        # Additional validation
        if cognito_token.iss != COGNITO_ISSUER:
            raise HTTPException(status_code=401, detail="Invalid token issuer")

        if cognito_token.client_id != COGNITO_CLIENT_ID:
            raise HTTPException(status_code=401, detail="Invalid client ID")

        return cognito_token

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[CognitoToken]:
    """
    Get current user from JWT token (optional authentication)

    Returns None if no token provided or invalid token
    """
    if not credentials:
        return None

    try:
        return verify_cognito_token(credentials.credentials)
    except HTTPException:
        return None

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> CognitoToken:
    """
    Get current user from JWT token (required authentication)

    Raises HTTPException if no valid token provided
    """
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return verify_cognito_token(credentials.credentials)

def require_authentication(user: CognitoToken = Depends(get_current_user)) -> CognitoToken:
    """
    Dependency that requires authentication

    Usage: @app.post("/protected")
    async def protected_route(user: CognitoToken = Depends(require_authentication)):
    """
    return user

def optional_authentication(user: Optional[CognitoToken] = Depends(get_current_user_optional)) -> Optional[CognitoToken]:
    """
    Dependency that allows optional authentication

    Usage: @app.post("/public")
    async def public_route(user: CognitoToken = Depends(optional_authentication)):
    """
    return user

# Utility functions
def get_user_info(token: CognitoToken) -> Dict[str, Any]:
    """Extract user information from token"""
    return {
        "user_id": token.sub,
        "username": token.username,
        "email": token.email,
        "email_verified": token.email_verified,
        "authenticated_at": token.auth_time
    }

def is_admin(token: CognitoToken) -> bool:
    """Check if user has admin role (customize based on your groups)"""
    # This would check for Cognito groups or custom claims
    # For now, return False - implement based on your requirements
    return False