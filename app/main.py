import os
import httpx
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
from app.pipeline.stego_pipeline import encode_message, decode_message, DEFAULT_FASTA_PATH
from app.auth.auth import create_jwt_token, decode_jwt_token, UserInfo
import shutil
import urllib.parse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===== ENVIRONMENT CONFIGURATION =====
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = ENVIRONMENT == "development"

# CORS: Allow frontend URLs and localhost for development
DEFAULT_ORIGINS = "http://localhost:3000,http://localhost:5173"
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", DEFAULT_ORIGINS).split(",")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
SESSION_SECRET = os.getenv("SECRET_KEY", os.getenv("JWT_SECRET", "dev-secret-change-me"))

# ===== FASTAPI SETUP =====
app = FastAPI(
    title="DNA-Stego API",
    version="2.0",
    docs_url="/docs",  # Always enable docs for debugging
    openapi_url="/openapi.json",
    debug=DEBUG,
)

# Session middleware — required for OAuth state tracking
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ENVIRONMENT == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

logger.info(f"Starting DNA-Stego API in {ENVIRONMENT} mode")

# ===== GOOGLE OAUTH SETUP =====
oauth = OAuth()
if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    oauth.register(
        name="google",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )
else:
    logger.warning("Google OAuth not configured - GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set")


# ===== ROOT ENDPOINT =====
@app.get("/")
async def root():
    """Root endpoint - API is running."""
    return {"service": "DNA-Stego API", "status": "running", "version": "2.0"}


# ===== HEALTH CHECK =====
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "service": "dna-stego-backend"}


# ===== GOOGLE OAUTH ROUTES =====
@app.get("/auth/google/login")
async def google_login(request: Request):
    """Redirect browser to Google's OAuth consent screen."""
    if not (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET):
        raise HTTPException(status_code=400, detail="Google OAuth not configured")
    redirect_uri = str(request.base_url).rstrip("/") + "/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google/callback")
async def google_callback(request: Request):
    """Handle Google OAuth callback."""
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")
        
        if not user_info:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {token['access_token']}"},
                )
                user_info = resp.json()

        jwt_token = create_jwt_token(user_info)
        return RedirectResponse(
            url=f"{FRONTEND_URL}/auth/callback?token={jwt_token}"
        )
    except Exception as e:
        logger.error(f"Google OAuth error: {e}")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=oauth_failed")


@app.get("/auth/me")
async def get_current_user(request: Request):
    """Return user info from JWT token in Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No token provided")
    token = auth_header.split(" ", 1)[1]
    payload = decode_jwt_token(token)
    return payload


# ===== ENCRYPTION ENDPOINT =====
@app.post("/api/encrypt")
async def encrypt_message_endpoint(
    message: str = Form(...),
    use_encryption: str = Form(default="true"),
    fasta_file: UploadFile = File(default=None),
):
    """Encode a message into a FASTA file."""
    do_encrypt = use_encryption.lower() == "true"
    
    if fasta_file and fasta_file.filename:
        temp_path = f"storage/fasta_files/{fasta_file.filename}"
        with open(temp_path, "wb") as buf:
            shutil.copyfileobj(fasta_file.file, buf)
        cover_path = temp_path
    else:
        cover_path = DEFAULT_FASTA_PATH
        if not os.path.exists(cover_path):
            raise HTTPException(
                status_code=500, 
                detail="Default FASTA file not found on server."
            )
    
    try:
        stego_file, key = encode_message(message, cover_path, use_encryption=do_encrypt)
        logger.info(f"Encryption successful. Stego file: {stego_file}")
    except Exception as exc:
        logger.error(f"Encryption failed: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))
    
    return {
        "stego_file": stego_file,
        "key": key.decode() if key else None,
        "encrypted": do_encrypt,
    }


# ===== DOWNLOAD ENDPOINT =====
@app.get("/api/download")
async def download_file(path: str):
    """Download a generated FASTA file."""
    path = urllib.parse.unquote(path)
    
    if not path:
        raise HTTPException(status_code=400, detail="Path parameter is required")
    
    if ".." in path or path.startswith("/"):
        raise HTTPException(status_code=400, detail="Invalid path")
    
    abs_path = os.path.abspath(path)
    
    if not os.path.exists(abs_path) or not os.path.isfile(abs_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    logger.info(f"Downloading file: {abs_path}")
    
    return FileResponse(
        abs_path,
        media_type="application/octet-stream",
        filename=os.path.basename(abs_path),
        headers={"Content-Disposition": f"attachment; filename={os.path.basename(abs_path)}"}
    )


# ===== DECRYPT ENDPOINT =====
@app.post("/api/decrypt")
async def decrypt_message_endpoint(
    stego_file: UploadFile = File(...),
    key: str = Form(default=""),
):
    """Decode a message from a stego FASTA file."""
    temp_path = f"storage/fasta_files/{stego_file.filename}"
    with open(temp_path, "wb") as buf:
        shutil.copyfileobj(stego_file.file, buf)
    
    try:
        message = decode_message(
            temp_path, 
            key.encode() if key.strip() else b""
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    
    return {"message": message}
