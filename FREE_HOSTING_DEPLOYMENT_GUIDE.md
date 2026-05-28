# 🚀 DNA-Stego Free Hosting Deployment Guide

Complete step-by-step guide to deploy your DNA-Stego application for **completely free** using:
- **Frontend**: Vercel
- **Backend**: Render (Python Web Service)
- **Database**: Supabase (PostgreSQL, optional)

---

## Phase 1: Prepare Your Backend for Render

### Step 1.1: Verify Your Requirements File

Ensure `requirements.txt` has all necessary dependencies:

```txt
fastapi
uvicorn
authlib
httpx
itsdangerous
python-multipart
starlette
```

### Step 1.2: Generate Secret Keys

You'll need secure keys for production. Run this in your terminal:

```bash
python3 -c "import secrets; print('SECRET_KEY:', secrets.token_urlsafe(32)); print('JWT_SECRET:', secrets.token_urlsafe(32))"
```

Save these values. You'll add them to Render.

### Step 1.3: Prepare Environment Variables

Your backend needs these environment variables in Render:

```env
ENVIRONMENT=production
SECRET_KEY=<generated_key>
JWT_SECRET=<generated_key>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
FRONTEND_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Note**: Don't set `FRONTEND_URL` yet — you'll get this after deploying to Vercel.

---

## Phase 2: Deploy Backend to Render

### Step 2.1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended for auto-deploy)
3. Connect your GitHub repository

### Step 2.2: Create a New Web Service

1. Click **+ New** → **Web Service**
2. Select your GitHub repository
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `dna-stego-backend` |
| **Environment** | `Python 3` |
| **Region** | Choose closest to you |
| **Root Directory** | `.` (repo root) |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | `Free` |

### Step 2.3: Add Environment Variables

In Render dashboard:
1. Scroll to **Environment** section
2. Add each variable:

```
ENVIRONMENT: production
SECRET_KEY: <your_generated_key>
JWT_SECRET: <your_generated_key>
GOOGLE_CLIENT_ID: <from Google Cloud Console>
GOOGLE_CLIENT_SECRET: <from Google Cloud Console>
FRONTEND_URL: https://your-frontend.vercel.app (add after Vercel deploy)
ALLOWED_ORIGINS: https://your-frontend.vercel.app (add after Vercel deploy)
```

### Step 2.4: Deploy

Click **Create Web Service**. Render will:
1. Clone your repo
2. Install dependencies
3. Start the FastAPI server
4. Give you a URL like: `https://dna-stego-backend.onrender.com`

### Step 2.5: Verify Backend is Working

Once deployed, test these URLs:

- **Health check**: `https://dna-stego-backend.onrender.com/health`
  - Should return: `{"status":"healthy","service":"dna-stego-backend"}`

- **API docs**: `https://dna-stego-backend.onrender.com/docs`
  - Should show interactive Swagger UI

- **Root endpoint**: `https://dna-stego-backend.onrender.com/`
  - Should return: `{"service":"DNA-Stego API","status":"running","version":"2.0"}`

**Note**: First request may take 30 seconds (cold start on free tier).

---

## Phase 3: Deploy Frontend to Vercel

### Step 3.1: Prepare Frontend Environment

Update `frontend/.env` with your Render backend URL:

```env
VITE_API_URL=https://dna-stego-backend.onrender.com
```

### Step 3.2: Configure Vercel Deployment

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Project Name** | `dna-stego` |
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Install Command** | `npm install` |
| **Output Directory** | `dist` |

### Step 3.3: Add Environment Variables to Vercel

In Vercel dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add:

```
VITE_API_URL: https://dna-stego-backend.onrender.com
```

### Step 3.4: Deploy

Click **Deploy**. Vercel will give you a URL like: `https://dna-stego.vercel.app`

### Step 3.5: Update Backend with Frontend URL

1. Go back to Render dashboard
2. Go to your `dna-stego-backend` service
3. Edit **Environment** variables:
   - `FRONTEND_URL`: `https://dna-stego.vercel.app`
   - `ALLOWED_ORIGINS`: `https://dna-stego.vercel.app`
4. Click **Save**

Render will automatically redeploy with the new variables.

---

## Phase 4: Configure Google OAuth

### Step 4.1: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your OAuth 2.0 project
3. Go to **Credentials** → **OAuth 2.0 Client ID**
4. Update **Authorized JavaScript Origins**:

```
https://dna-stego.vercel.app
```

5. Update **Authorized Redirect URIs**:

```
https://dna-stego-backend.onrender.com/auth/google/callback
```

6. Click **Save**

### Step 4.2: Test OAuth Flow

1. Open your frontend: `https://dna-stego.vercel.app`
2. Click **Continue with Google**
3. You should be redirected back after login
4. Check browser console for any CORS errors

---

## Phase 5: Troubleshooting

### CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Check Render environment variable `ALLOWED_ORIGINS` matches your Vercel URL exactly
2. Verify backend is returning `Access-Control-Allow-Origin` headers
3. Check frontend is sending requests to correct backend URL

### OAuth Redirect Mismatch

**Error**: `redirect_uri_mismatch`

**Solution**:
1. Verify `https://dna-stego-backend.onrender.com/auth/google/callback` is in Google Console
2. Check `FRONTEND_URL` in Render env vars matches your Vercel URL
3. Wait 5-10 minutes for Google settings to propagate

### Frontend Showing Blank Page

**Error**: No errors in console, but page blank

**Solution**:
1. Check browser's Network tab for failed requests
2. Verify `VITE_API_URL` is set correctly in Vercel
3. Check if backend is responding to requests

### Render Free Tier Cold Starts

**Info**: Free tier services sleep after 15 minutes of inactivity

**Solution**:
- First request takes 30+ seconds
- Backend responds normally after warmup
- Use monitoring tools like UptimeRobot to keep services warm

---

## Final Checklist

- ✅ Backend running on Render (`/health` returns 200)
- ✅ Frontend running on Vercel (loads without 404s)
- ✅ Google OAuth working (login succeeds)
- ✅ Environment variables set correctly
- ✅ CORS headers present in API responses
- ✅ Frontend can communicate with backend
- ✅ All costs are $0

---

## Useful Links

- **Render**: https://render.com
- **Vercel**: https://vercel.com
- **Supabase**: https://supabase.com (for future database)
- **Google Cloud Console**: https://console.cloud.google.com

---

## Next Steps

After successful deployment:

1. Monitor both services for errors
2. Set up automatic backups if using database
3. Configure custom domain (optional, both services offer free domains)
4. Set up monitoring/alerting for production issues

---

**Questions?** Check the individual service dashboards for deployment logs.
