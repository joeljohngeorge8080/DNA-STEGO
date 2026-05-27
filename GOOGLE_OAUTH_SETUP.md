# Google OAuth & Vercel Deployment - Implementation Guide

## ✅ Completed Changes

### Backend
- ✅ `requirements.txt` - Added: authlib, httpx, itsdangerous
- ✅ `app/auth/auth.py` - Replaced with JWT-based Google OAuth
- ✅ `app/main.py` - Added Google OAuth routes (/auth/google/login, /auth/google/callback, /auth/me)

### Frontend
- ✅ `frontend/src/context/AuthContext.jsx` - Replaced with Google OAuth + JWT
- ✅ `frontend/src/pages/LoginPage.jsx` - Updated with Google Sign-In button
- ✅ `frontend/src/pages/SignupPage.jsx` - Redirects to login (no separate signup)

## 📋 Remaining Setup Steps

### Step 1: Update App.jsx (Frontend Routing)

File: `frontend/src/App.jsx`

```jsx
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext.jsx'
import { Component } from 'react'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import DashboardLayout from './components/layout/DashboardLayout.jsx'
import DashboardHome from './pages/DashboardHome.jsx'
import DnaStego from './pages/tools/DnaStego.jsx'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }
    static getDerivedStateFromError(error) { return { hasError: true, error } }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-8">
                    <div className="max-w-2xl w-full bg-cyber-red/10 border border-cyber-red/30 rounded-xl p-6">
                        <h2 className="text-cyber-red font-mono text-lg mb-3">Runtime Error</h2>
                        <pre className="text-xs text-cyber-muted font-mono whitespace-pre-wrap">
                            {this.state.error?.toString()}
                        </pre>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}

// Handles /auth/callback?token=xxx redirect from backend
function OAuthCallback() {
    const [params] = useSearchParams()
    const { loading } = useAuth()
    const token = params.get('token')

    // AuthContext useEffect handles the token — just navigate to dashboard
    if (!loading && token) {
        return <Navigate to="/dashboard" replace />
    }
    return (
        <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
            <p className="text-cyber-text font-mono animate-pulse">Signing you in...</p>
        </div>
    )
}

function ProtectedRoute({ children }) {
    const { isAuthenticated, isGuest } = useAuth()
    if (!isAuthenticated && !isGuest) return <Navigate to="/" replace />
    return children
}

export default function App() {
    return (
        <ErrorBoundary>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />
                <Route
                    path="/dashboard"
                    element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
                >
                    <Route index element={<DashboardHome />} />
                    <Route path="dna-stego" element={<DnaStego />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </ErrorBoundary>
    )
}
```

### Step 2: Update LandingPage.jsx (Button References)

File: `frontend/src/pages/LandingPage.jsx`

Find the navigation section and update button routes:

```jsx
// Change from:
<Button variant="ghost" size="sm" onClick={() => navigate('/signup')}>Sign Up</Button>

// To:
<Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
```

### Step 3: Create .env File (Root)

File: `.env`

```env
# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# JWT Secret
JWT_SECRET=<generate-with-: python -c 'import secrets; print(secrets.token_urlsafe(32))'>

# Session Secret
SECRET_KEY=<generate-with-: python -c 'import secrets; print(secrets.token_urlsafe(32))'>

# URLs
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173

# Environment
ENVIRONMENT=development
```

### Step 4: Google Cloud Console Setup

1. Go to https://console.cloud.google.com
2. Create a new project: "DNA-Stego"
3. **OAuth Consent Screen:**
   - User type: External
   - App name: "DNA-Stego"
   - Support email: Your email
   - Scopes: email, profile, openid
   - Save

4. **Create Credentials:**
   - Type: Web application
   - Authorized JavaScript origins: `http://localhost:8000`
   - Authorized redirect URIs:
     - `http://localhost:8000/auth/google/callback`
   - Copy Client ID and Secret → paste into `.env`

### Step 5: Update Docker Configuration

**frontend/Dockerfile** (ensure it has build args):

```dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG VITE_API_BASE=http://localhost:8000
ENV VITE_API_BASE=$VITE_API_BASE

RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
```

**docker-compose.yml** (backend section - add Google OAuth vars):

```yaml
backend:
  build:
    context: .
    dockerfile: Dockerfile
  container_name: dna-stego-backend
  ports:
    - "8000:8000"
  volumes:
    - ./app:/app/app
    - ./storage:/app/storage
  environment:
    - ENVIRONMENT=development
    - API_HOST=0.0.0.0
    - API_PORT=8000
    - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
    - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    - FRONTEND_URL=http://localhost:5173
    - SECRET_KEY=${SECRET_KEY:-dev-secret}
    - JWT_SECRET=${JWT_SECRET:-dev-jwt-secret}
  networks:
    - dna-stego-network
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

**frontend section** - ensure it has build args:

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    args:
      - VITE_API_BASE=http://localhost:8000
  container_name: dna-stego-frontend
  ports:
    - "5173:5173"
  depends_on:
    - backend
  networks:
    - dna-stego-network
  restart: unless-stopped
```

### Step 6: Test Locally

```bash
# Rebuild
docker-compose down
docker-compose up -d --build

# Wait for startup
sleep 10

# Test encryption still works
curl -s -X POST http://localhost:8000/api/encrypt \
  -F "message=hello" \
  -F "use_encryption=true" | jq

# Test backend health
curl http://localhost:8000/health

# Visit frontend
# http://localhost:5173 → Click "Sign In" → "Continue with Google"
```

## 🚀 Vercel Deployment (Optional)

### Backend Deployment

1. Create `api/index.py`:

```python
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
```

2. Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ]
}
```

3. Deploy:

```bash
npm install -g vercel
vercel

# Follow prompts, then
vercel --prod

# Note your backend URL: https://dna-stego-backend.vercel.app
```

4. Add environment variables in Vercel dashboard:

```
GOOGLE_CLIENT_ID         = <your-client-id>
GOOGLE_CLIENT_SECRET     = <your-client-secret>
JWT_SECRET               = <your-jwt-secret>
SECRET_KEY               = <your-secret-key>
FRONTEND_URL             = https://dna-stego-frontend.vercel.app
ALLOWED_ORIGINS          = https://dna-stego-frontend.vercel.app
ENVIRONMENT              = production
```

### Frontend Deployment

1. Create `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

2. Deploy:

```bash
cd frontend
vercel

# Follow prompts
vercel --prod

# Note URL: https://dna-stego-frontend.vercel.app
```

3. Add environment variable:

```
VITE_API_BASE = https://dna-stego-backend.vercel.app
```

4. Redeploy frontend:

```bash
vercel --prod
```

### Update Google Console

Add this redirect URI to Google OAuth credentials:

```
https://dna-stego-backend.vercel.app/auth/google/callback
```

## 🔑 Important Notes

- **JWT Secret**: Generate unique secrets for production
- **FASTA Storage**: Vercel serverless has no persistent storage — use default FASTA or S3/Supabase Storage
- **CORS**: Update ALLOWED_ORIGINS for your production domain
- **Frontend URL**: Must match where your frontend is deployed

## ✅ Checklist

- [ ] Update App.jsx with OAuth callback route
- [ ] Update LandingPage.jsx button references
- [ ] Create .env file with Google OAuth credentials
- [ ] Setup Google Cloud Console OAuth
- [ ] Update frontend/Dockerfile with build args
- [ ] Update docker-compose.yml with Google secrets
- [ ] Test locally: `docker-compose up --build`
- [ ] Test Google login flow
- [ ] (Optional) Deploy to Vercel

## 🧪 Testing Google OAuth Locally

1. Start Docker: `docker-compose up -d`
2. Open http://localhost:5173
3. Click "Sign In"
4. Click "Continue with Google"
5. You'll be redirected to Google login
6. After login, you should be redirected back with JWT token
7. Dashboard should load with your user info

---

**Status**: Ready for Google OAuth integration. All backend changes complete, frontend mostly complete. Follow remaining setup steps to activate OAuth.
