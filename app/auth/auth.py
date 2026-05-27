# DNA-Stego Production Environment Configuration
# Copy this file to .env and update values for your environment

# ===== ENVIRONMENT =====
ENVIRONMENT=production
DEBUG=false

<<<<<<< HEAD
# ===== API CONFIGURATION =====
API_HOST=0.0.0.0
API_PORT=8000
API_VERSION=v1
=======
import os
import time
import requests
from typing import Optional, Dict, Any
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient
from pydantic import BaseModel
>>>>>>> f1d52d7 (Fix CognitoToken Pydantic model)

# ===== FRONTEND CONFIGURATION =====
VITE_API_URL=https://api.joelz.site
VITE_APP_NAME=DNA-Stego
VITE_APP_URL=https://dnastego.joelz.site

# ===== SECURITY =====
SECRET_KEY=
JWT_SECRET=generate-a-secure-jwt-secret-here-change-this-value
JWT_ALGORITHM=HS256
JWT_EXPIRATION=86400

# ===== CORS CONFIGURATION =====
ALLOWED_ORIGINS=https://joelz.site,https://dnastego.joelz.site
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOW_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOW_HEADERS=Content-Type,Authorization

# ===== DATABASE =====
DATABASE_URL=postgresql://postgres:Onepiece%402005q@db.hhhxlhugrsqwlnpbghyt.supabase.co:5432/postgres
DATABASE_ECHO=false
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

<<<<<<< HEAD
# ===== STORAGE =====
STORAGE_PATH=/app/storage
FASTA_FILES_PATH=/app/storage/fasta_files
MAX_UPLOAD_SIZE=104857600

# ===== LOGGING =====
LOG_LEVEL=INFO
LOG_FILE=/app/logs/dna-stego.log
LOG_FORMAT=json
=======
class CognitoToken(BaseModel):
    """Represents a validated Cognito JWT token"""

    sub: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    email_verified: Optional[bool] = None
    token_use: Optional[str] = None
    iss: Optional[str] = None
    exp: Optional[int] = None
    iat: Optional[int] = None
    auth_time: Optional[int] = None
    client_id: Optional[str] = None
>>>>>>> f1d52d7 (Fix CognitoToken Pydantic model)

# ===== RATE LIMITING =====
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=3600

<<<<<<< HEAD
# ===== PERFORMANCE =====
WORKERS=4
WORKER_TIMEOUT=120
KEEP_ALIVE=5
=======
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
        cognito_token = CognitoToken(
    sub=payload.get("sub"),
    username=payload.get("cognito:username"),
    email=payload.get("email"),
    email_verified=payload.get("email_verified"),
    token_use=payload.get("token_use"),
    iss=payload.get("iss"),
    exp=payload.get("exp"),
    iat=payload.get("iat"),
    auth_time=payload.get("auth_time"),
    client_id=payload.get("client_id")
)

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
>>>>>>> f1d52d7 (Fix CognitoToken Pydantic model)
