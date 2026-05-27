# 🔧 Google OAuth Implementation - Quick Checklist

## Completed ✅
- [x] Backend dependencies (authlib, httpx)
- [x] app/auth/auth.py - JWT + Google OAuth
- [x] app/main.py - OAuth routes
- [x] AuthContext.jsx - Google OAuth context
- [x] LoginPage.jsx - Google Sign-In button
- [x] SignupPage.jsx - Redirects to login
- [x] frontend/Dockerfile - Build args ready
- [x] docker-compose.yml structure ready

## Remaining Tasks (5 minutes each)

### 1. Google Cloud Console Setup
- [ ] Go to https://console.cloud.google.com
- [ ] Create project "DNA-Stego"
- [ ] OAuth Consent Screen → External → Email, profile, openid scopes
- [ ] Create OAuth credentials (Web application)
- [ ] Add redirect URI: `http://localhost:8000/auth/google/callback`
- [ ] Copy Client ID and Secret

### 2. Environment Setup
- [ ] Create `.env` in project root
- [ ] Add: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- [ ] Generate JWT_SECRET: `python -c 'import secrets; print(secrets.token_urlsafe(32))'`
- [ ] Generate SECRET_KEY: `python -c 'import secrets; print(secrets.token_urlsafe(32))'`

### 3. Remaining Frontend Updates
- [ ] Edit `frontend/src/App.jsx` - Add OAuth callback route + ProtectedRoute
- [ ] Edit `frontend/src/pages/LandingPage.jsx` - Change signup buttons to login

### 4. Docker Configuration
- [ ] Verify `frontend/Dockerfile` has build args (already added)
- [ ] Verify `docker-compose.yml` has Google env vars (already added)

### 5. Local Testing
```bash
docker-compose down
docker-compose up -d --build
sleep 10
# Test: http://localhost:5173 → "Sign In" → "Continue with Google"
```

### 6. (Optional) Deploy to Vercel
- [ ] Create `api/index.py`
- [ ] Create `vercel.json`
- [ ] Deploy backend: `vercel --prod`
- [ ] Deploy frontend: `cd frontend && vercel --prod`
- [ ] Update Google Console with Vercel callback URI

## Current Status

✅ **Backend**: Ready (awaiting Google credentials)
✅ **Frontend**: Ready (awaiting Google credentials)
⏳ **Config**: 3 files need minor edits
⏳ **Google Setup**: Required

## Time Estimate
- Google setup: 10 minutes
- Add credentials to .env: 2 minutes
- Edit 2 frontend files: 5 minutes
- Docker rebuild + test: 5 minutes
- **Total: ~25 minutes to full working Google OAuth**

## Next Command
```bash
cd /home/jojo/labs/git-lab/Projects/dna-stego

# After creating .env with Google credentials:
docker-compose down
docker-compose up -d --build

# Test:
curl http://localhost:8000/health
# Visit: http://localhost:5173
```

See `GOOGLE_OAUTH_SETUP.md` for detailed implementation steps.
