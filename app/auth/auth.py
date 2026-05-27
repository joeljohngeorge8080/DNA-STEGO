import os
import jwt
import time
from typing import Optional
from fastapi import HTTPException
from pydantic import BaseModel

# ===== JWT CONFIGURATION =====
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = 86400  # 24 hours

# ===== GOOGLE OAUTH CONFIGURATION =====
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


class UserInfo(BaseModel):
    """User information from JWT payload"""
    sub: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None


# Alias for backwards compatibility
CognitoToken = UserInfo


def create_jwt_token(user_info: dict) -> str:
    """
    Create a JWT token from user information (typically from Google OAuth).
    
    Args:
        user_info: Dict with keys: sub, email, name, picture
        
    Returns:
        JWT token string
    """
    payload = {
        "sub": user_info.get("sub"),
        "email": user_info.get("email"),
        "name": user_info.get("name"),
        "picture": user_info.get("picture"),
        "iat": int(time.time()),
        "exp": int(time.time()) + JWT_EXPIRATION,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt_token(token: str) -> dict:
    """
    Decode and verify a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded payload dict
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")


def optional_authentication(token: Optional[str] = None) -> Optional[UserInfo]:
    """
    Optional authentication - returns user if token provided, else None.
    
    Args:
        token: Optional JWT token from Authorization header
        
    Returns:
        UserInfo object or None
    """
    if not token:
        return None
    try:
        payload = decode_jwt_token(token)
        return UserInfo(**payload)
    except Exception:
        return None

