# 🚀 Deploy DNA-Stego to Vercel + Supabase + Cloudflare

**Complete Step-by-Step Guide**  
**Time Required:** 30-45 minutes  
**Cost:** FREE (Vercel free tier + Supabase free tier + Cloudflare free tier)

---

## 📋 **Pre-Deployment Checklist**

Before you start:
- [ ] Vercel account (free at https://vercel.com)
- [ ] Supabase account (free at https://supabase.com)
- [ ] Cloudflare account (free at https://cloudflare.com)
- [ ] Your domain name (registered with any registrar)
- [ ] Git repository (GitHub, GitLab, or Bitbucket)

---

## **PHASE 1: SUPABASE SETUP** ⏱️ ~10 minutes

### Step 1.1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click **"New project"**
3. Fill in:
   - **Project name:** `dna-stego`
   - **Database password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for database to initialize

### Step 1.2: Get Supabase Credentials

Once your project is ready:

1. Go to **Settings** → **Database**
2. Find **Connection String** section
3. You'll see:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

**Copy and save these separately:**
```
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=<find-in-Settings-API-Keys>
```

### Step 1.3: Get Supabase API Keys

1. Go to **Settings** → **API**
2. Copy these keys:
   - **Project URL:** `https://[project-ref].supabase.co`
   - **Anon Key:** (public key for frontend)
   - **Service Role Key:** (secret key for backend)

Save all of these - you'll need them for Vercel.

---

## **PHASE 2: PREPARE YOUR PROJECT** ⏱️ ~5 minutes

### Step 2.1: Create Environment Variables File

Create/update `.env.local` in your project root:

```bash
# Supabase
VITE_SUPABASE_URL=https://hhhxlhugrsqwlnpbghyt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHhsaHVncnNxd2xucGJnaHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDE4NzMsImV4cCI6MjA5NTQxNzg3M30.BNwTy4I_x6j3SMFNppP0M1DBg3IiCht1IyUSIZsCNnY
DATABASE_URL=postgresql://postgres:Onepiece%402005q@db.hhhxlhugrsqwlnpbghyt.supabase.co:5432/postgres

# Security
VITE_API_URL=https://your-domain.com
SECRET_KEY=<generate-with-python>
JWT_SECRET=<generate-with-python>

# Vercel (optional)
VERCEL_URL=
```

### Step 2.2: Generate Secure Keys

```bash
# Generate SECRET_KEY
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"

# Generate JWT_SECRET
python3 -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(32))"
```

### Step 2.3: Don't Commit Secrets!

```bash
# Add to .gitignore
echo ".env.local" >> .gitignore
echo ".env*.local" >> .gitignore

# Commit other changes
git add -A
git commit -m "Setup Vercel + Supabase configuration"
git push
```

---

## **PHASE 3: SETUP VERCEL** ⏱️ ~10 minutes

### Step 3.1: Connect Git Repository

1. Go to https://vercel.com and sign in
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub/GitLab/Bitbucket account
5. Find and select your `dna-stego` repository
6. Click **"Import"**

### Step 3.2: Configure Project Settings

**Root Directory:** (if not in root)
- If frontend is in `/frontend` → set to `frontend`
- If backend is in `/app` → you may need separate Vercel projects

**Build & Output:**
For frontend:
- Build Command: `npm run build`
- Output Directory: `dist`

For backend (FastAPI):
- You may need to use a serverless function approach or separate deployment

### Step 3.3: Add Environment Variables

1. In Vercel project settings, go to **Settings** → **Environment Variables**
2. Add all your variables from `.env.local`:

```
VITE_SUPABASE_URL = https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY = <your-anon-key>
DATABASE_URL = postgresql://...
SECRET_KEY = <your-generated-key>
JWT_SECRET = <your-generated-key>
```

3. Select which environments: Production, Preview, Development

### Step 3.4: Deploy Frontend

**Option A: Frontend Only (Recommended for simplicity)**

If deploying just your React frontend:
1. Make sure your frontend can reach backend via environment variable
2. Click **"Deploy"**
3. Vercel will automatically build and deploy
4. Wait 2-3 minutes for deployment

**Expected output:**
```
✓ Deployed to https://dna-stego.vercel.app
```

### Step 3.5: Deploy Backend (If Needed)

**Option B: Backend as Vercel Functions**

If you want backend on Vercel too:

1. Create `/api` directory in project root:
   ```
   /api
   ├─ encode.js      (POST /api/encode)
   ├─ decode.js      (POST /api/decode)
   └─ health.js      (GET /api/health)
   ```

2. Rewrite your FastAPI endpoints as Node.js functions:
   ```javascript
   // /api/health.js
   export default function handler(req, res) {
     res.status(200).json({ status: 'healthy' });
   }
   ```

3. Deploy same way (Vercel auto-deploys `/api` as serverless functions)

**Alternative: Keep Backend Separate**

If you prefer to keep your Python FastAPI backend elsewhere:
- Deploy to Railway (free tier) or Render
- Update `VITE_API_URL` to point to backend URL
- Use CORS for cross-domain calls

---

## **PHASE 4: POINT DOMAIN TO CLOUDFLARE** ⏱️ ~5 minutes

### Step 4.1: Add Domain to Cloudflare

1. Go to https://cloudflare.com and sign in
2. Click **"Add a site"**
3. Enter your domain name
4. Click **"Add site"**
5. Choose **Free plan**
6. Click **"Continue"**

### Step 4.2: Update Nameservers

Cloudflare will show you **2 nameservers**:
```
example.ns.cloudflare.com
example.ns.cloudflare.com
```

Go to your domain registrar (GoDaddy, Namecheap, etc.):
1. Find **Nameserver** or **DNS** settings
2. Replace existing nameservers with Cloudflare's
3. Save changes
4. Wait 5-15 minutes for DNS to propagate

### Step 4.3: Verify Domain

Back in Cloudflare:
1. Wait for status to show **"Active"**
2. Once active, go to **DNS**
3. You should see your DNS records

---

## **PHASE 5: CONNECT VERCEL DEPLOYMENT TO DOMAIN** ⏱️ ~5 minutes

### Step 5.1: Add Domain to Vercel

1. In Vercel project, go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Choose option: **"Use Cloudflare nameservers"**
5. Click **"Confirm"**

### Step 5.2: Add CNAME Records

Vercel will tell you to add these records in Cloudflare:

In Cloudflare DNS:
1. Click **"Add record"**
2. Type: **CNAME**
3. Name: `www`
4. Content: `cname.vercel-dns.com` (or what Vercel shows)
5. Click **"Save"**

Wait 5-10 minutes for DNS to propagate.

### Step 5.3: Verify Domain

```bash
# Check if domain points to Vercel
nslookup yourdomain.com

# Should show Vercel's IP address
```

Visit `https://yourdomain.com` - your app should load!

---

## **PHASE 6: SETUP CUSTOM EMAIL (OPTIONAL)** ⏱️ ~5 minutes

In Cloudflare:

1. Go to **Email Routing** tab
2. Click **"Enable Email Routing"**
3. Add routing rule:
   ```
   From: hello@yourdomain.com
   To: your@email.com
   ```
4. Verify in your email inbox

---

## **PHASE 7: OPTIMIZE FOR PRODUCTION** ⏱️ ~5 minutes

### Step 7.1: Enable Cloudflare Security

In Cloudflare Dashboard:
1. Go to **Security** → **Overview**
2. Enable:
   - [ ] **DDoS Protection** (auto-enabled)
   - [ ] **Bot Fight Mode** (free tier)
   - [ ] **HTTPS Redirect** (force HTTPS)

### Step 7.2: Setup Caching

In Cloudflare:
1. Go to **Caching** → **Configuration**
2. Set **Browser Cache TTL:** 4 hours
3. Set **Cache Level:** Cache Everything

### Step 7.3: Enable HTTP/2 and Brotli

In Cloudflare:
1. Go to **Network**
2. Enable:
   - [ ] HTTP/2
   - [ ] HTTP/3 with QUIC
   - [ ] Brotli compression

### Step 7.4: Add Security Headers

In Vercel project settings:
1. Go to **Settings** → **Build & Development Settings**
2. Add **Headers** in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

---

## **PHASE 8: MONITOR & MAINTAIN** ⏱️ Ongoing

### Step 8.1: Monitor Vercel

1. In Vercel project, check **Analytics**:
   - Page views
   - Response times
   - Error rates

2. Enable **Vercel Error Tracking**:
   - Go to **Settings** → **Integrations**
   - Enable error notifications

### Step 8.2: Monitor Cloudflare

1. Go to **Analytics** tab in Cloudflare
2. Check:
   - Total requests
   - Cached bandwidth
   - Security events

### Step 8.3: Supabase Monitoring

1. In Supabase, go to **Reports** → **Database**
2. Monitor:
   - Query performance
   - Database size
   - Connection count

---

## **QUICK COMMAND REFERENCE**

### Local Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Run locally
npm run dev

# Test build
npm run build

# Test production build
npm run preview
```

### Git Deployment

```bash
# Make changes
git add .
git commit -m "Feature: xyz"

# Push to trigger Vercel auto-deploy
git push origin main
```

### Environment Variables

```bash
# Update in Vercel without git commit
# Go to Vercel Settings → Environment Variables
# Change value and click "Save"
# Next deployment uses new values
```

---

## **TROUBLESHOOTING**

### Problem: "Domain not found"

**Solution:**
```bash
# Check DNS propagation (wait 5-15 min)
nslookup yourdomain.com

# Clear browser cache (Ctrl+Shift+Del)
# Verify Cloudflare DNS shows active status
```

### Problem: "Build fails on Vercel"

**Solution:**
1. Check build logs in Vercel dashboard
2. Common issues:
   ```
   - Missing environment variables
   - Wrong output directory
   - Node version mismatch
   ```
3. Fix `.vercel.json` or `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist"
   }
   ```

### Problem: "Can't connect to Supabase from frontend"

**Solution:**
```bash
# Verify VITE_SUPABASE_URL is set
# Should include https://
# Check Supabase API keys in Vercel environment

# Test connection in browser console:
# Open DevTools → Console
# Try: fetch(process.env.VITE_SUPABASE_URL)
```

### Problem: "SSL certificate error"

**Solution:**
1. In Cloudflare, go to **SSL/TLS**
2. Set Mode to **"Full (strict)"**
3. Wait 5 minutes for certificate generation
4. Refresh browser

### Problem: "Site too slow"

**Solution:**
1. Check Cloudflare Analytics (caching ratio)
2. Enable in Cloudflare:
   - Brotli compression
   - HTTP/3
   - Cache static assets
3. In Vercel, check Function execution time
4. Optimize images and code splitting

---

## **COST BREAKDOWN**

| Component | Price | Notes |
|-----------|-------|-------|
| Vercel Frontend | FREE | Free tier (generous limits) |
| Vercel Serverless API | FREE | 100,000 requests/month |
| Supabase Database | FREE | Free tier (2GB storage) |
| Cloudflare DNS | FREE | Free tier included |
| Cloudflare Cache | FREE | Free tier included |
| Your Domain | $10-15/yr | One-time at registrar |
| **TOTAL** | **FREE** | Plus domain registration |

---

## **DEPLOYMENT CHECKLIST**

- [ ] Supabase project created
- [ ] Supabase credentials saved
- [ ] Git repository connected to Vercel
- [ ] Environment variables added to Vercel
- [ ] Frontend builds successfully
- [ ] Vercel domain assigned (*.vercel.app)
- [ ] Domain added to Cloudflare
- [ ] Nameservers updated at registrar
- [ ] DNS propagated (check with nslookup)
- [ ] Custom domain working in Vercel
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Cloudflare caching enabled
- [ ] Monitors set up
- [ ] Backup plan documented

---

## **POST-DEPLOYMENT VERIFICATION**

After deployment:

```bash
# Test frontend loads
curl https://yourdomain.com

# Check SSL certificate
curl -I https://yourdomain.com
# Should show: HTTP/2 200

# Check Cloudflare is caching
curl -I https://yourdomain.com | grep cf-cache-status
# Should show: HIT or MISS

# Test Supabase connection
# Open app, check browser console for errors
```

---

## **NEXT STEPS**

### Immediate (Today)
- [ ] Create Supabase project
- [ ] Create Vercel account
- [ ] Connect Git repository
- [ ] Add environment variables
- [ ] Deploy frontend

### Short-term (This week)
- [ ] Add custom domain
- [ ] Setup Cloudflare
- [ ] Enable SSL/TLS
- [ ] Configure caching

### Long-term (Ongoing)
- [ ] Monitor performance
- [ ] Scale as needed
- [ ] Add backend functions (if needed)
- [ ] Setup monitoring alerts

---

## **SCALING UP**

When you need more resources:

**For Frontend:**
- Upgrade Vercel to Pro ($20/month)
- Get priority support + analytics

**For Database:**
- Supabase Pro ($25/month)
- Get 8GB storage + better performance

**For Global CDN:**
- Cloudflare Pro ($20/month)
- Get advanced security + analytics

---

## **DIFFERENCES FROM EC2 DEPLOYMENT**

| Feature | EC2 | Vercel + Cloudflare |
|---------|-----|-------------------|
| **Setup Time** | 60 min | 30-45 min |
| **Cost** | $30/month | FREE |
| **Scaling** | Manual | Automatic |
| **SSL/TLS** | Manual setup | Auto-managed |
| **Monitoring** | Manual logs | Built-in |
| **DevOps** | You manage | Platform manages |
| **Uptime SLA** | Best effort | 99.9% |
| **Global CDN** | No | Yes (Cloudflare) |

---

## **YOU'RE LIVE! 🎉**

Your DNA-Stego application is now deployed to:
- **Frontend:** Vercel (global CDN)
- **Database:** Supabase (cloud PostgreSQL)
- **DNS/Security:** Cloudflare (free tier)
- **Domain:** Your custom domain

### Status: ✅ PRODUCTION READY
### Cost: FREE (except domain $10-15/year)
### Time to Deploy: 30-45 minutes

**Next:** Monitor performance and scale as needed!

---

**Questions?** Refer to:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Cloudflare Docs: https://developers.cloudflare.com/
