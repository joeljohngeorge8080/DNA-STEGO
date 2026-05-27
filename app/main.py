from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.pipeline.stego_pipeline import (
    encode_message,
    decode_message,
    DEFAULT_FASTA_PATH,
)
from app.auth.auth import optional_authentication, CognitoToken
import shutil
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment detection
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = ENVIRONMENT == "development"

# Parse allowed origins from environment
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

app = FastAPI(
    title="DNA-Stego API",
    version="2.0",
    docs_url="/docs" if DEBUG else None,
    openapi_url="/openapi.json" if DEBUG else None,
    debug=DEBUG
)

# Configure CORS based on environment
cors_config = {
    "allow_origins": ALLOWED_ORIGINS if ENVIRONMENT == "production" else ["*"],
    "allow_credentials": True,
    "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["*"],
}

app.add_middleware(CORSMiddleware, **cors_config)

logger.info(f"Starting DNA-Stego API in {ENVIRONMENT} mode")
logger.info(f"CORS Origins: {cors_config['allow_origins']}")

# ─────────────────────────────────────────────────
# HEALTH CHECK ENDPOINT
# ─────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Health check endpoint for container health monitoring."""
    return {"status": "healthy", "service": "dna-stego-backend"}

# ─────────────────────────────────────────────────
# ENCRYPT ENDPOINT
# ─────────────────────────────────────────────────


@app.post("/api/encrypt")
async def encrypt_message_endpoint(
    message: str = Form(...),
    use_encryption: str = Form(default="true"),  # "true" | "false"
    fasta_file: UploadFile = File(default=None),
    user: CognitoToken = optional_authentication,
):
    """
    Encode a secret message into a stego FASTA file.

    - use_encryption: "true" → apply AES encryption (returns a key)
                      "false" → no encryption (key will be null)
    - fasta_file:     optional — if not supplied the server default FASTA is used.
    - user:           optional authenticated user info
    """
    do_encrypt = use_encryption.lower() == "true"

    # Log user activity if authenticated
    if user:
        print(f"Authenticated user {user.username} ({user.email}) performing encryption")
    else:
        print("Guest user performing encryption")

    # ── Resolve cover FASTA ──────────────────────────────────────────────────
    do_encrypt = use_encryption.lower() == "true"

    # ── Resolve cover FASTA ──────────────────────────────────────────────────
    if fasta_file and fasta_file.filename:
        temp_path = f"storage/fasta_files/{fasta_file.filename}"
        with open(temp_path, "wb") as buf:
            shutil.copyfileobj(fasta_file.file, buf)
        cover_path = temp_path
    else:
        cover_path = DEFAULT_FASTA_PATH
        if not os.path.exists(cover_path):
            raise HTTPException(
                status_code=500, detail="Default FASTA file not found on server."
            )

    # ── Run pipeline ─────────────────────────────────────────────────────────
    try:
        stego_file, key = encode_message(message, cover_path, use_encryption=do_encrypt)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return {
        "stego_file": stego_file,
        "key": key.decode() if key else None,
        "encrypted": do_encrypt,
    }


# ─────────────────────────────────────────────────
# DOWNLOAD GENERATED FASTA
# ─────────────────────────────────────────────────


@app.get("/api/download")
async def download_file(path: str):
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found.")
    return FileResponse(
        path,
        media_type="text/plain",
        filename=os.path.basename(path),
    )


# ─────────────────────────────────────────────────
# DECRYPT ENDPOINT
# ─────────────────────────────────────────────────


@app.post("/api/decrypt")
async def decrypt_message_endpoint(
    stego_file: UploadFile = File(...),
    key: str = Form(default=""),  # empty string = no encryption was used
):
    """
    Decode a stego FASTA file.

    - key: leave empty (or send "") if the file was encoded WITHOUT encryption.
    """
    temp_path = f"storage/fasta_files/{stego_file.filename}"
    with open(temp_path, "wb") as buf:
        shutil.copyfileobj(stego_file.file, buf)

    try:
        message = decode_message(temp_path, key.encode() if key.strip() else b"")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {"message": message}
