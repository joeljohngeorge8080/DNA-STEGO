# DNA-Stego Production Environment Configuration
# Copy this file to .env and update values for your environment

# ===== ENVIRONMENT =====
ENVIRONMENT=production
DEBUG=false

# ===== API CONFIGURATION =====
API_HOST=0.0.0.0
API_PORT=8000
API_VERSION=v1

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

# ===== STORAGE =====
STORAGE_PATH=/app/storage
FASTA_FILES_PATH=/app/storage/fasta_files
MAX_UPLOAD_SIZE=104857600

# ===== LOGGING =====
LOG_LEVEL=INFO
LOG_FILE=/app/logs/dna-stego.log
LOG_FORMAT=json

# ===== RATE LIMITING =====
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=3600

# ===== PERFORMANCE =====
WORKERS=4
WORKER_TIMEOUT=120
KEEP_ALIVE=5