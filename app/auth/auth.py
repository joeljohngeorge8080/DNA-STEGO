import os
import time
from typing import Optional
from fastapi import HTTPException
from pydantic import BaseModel

JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = 86400


class UserInfo(BaseModel):
    sub: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None


# Keep alias so nothing breaks
CognitoToken = UserInfo


def create_jwt_token(user_info: dict) -> str:
    import jwt
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
    import jwt
    try:
        return jwt.decode(
            token, JWT_SECRET, algorithms=[JWT_ALGORITHM]
        )
    except Exception:
        raise HTTPException(
            status_code=401, detail="Invalid or expired token"
        )


def optional_authentication(token: Optional[str] = None) -> Optional[UserInfo]:
    if not token:
        return None
    try:
        payload = decode_jwt_token(token)
        return UserInfo(**payload)
    except Exception:
        return None

