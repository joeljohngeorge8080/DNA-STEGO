#!/bin/bash

# 📋 VERCEL + SUPABASE + CLOUDFLARE - COMMAND REFERENCE
# Copy-paste commands for each phase

# ═══════════════════════════════════════════════════════════════════════════
# PART 1: LOCAL SETUP (Run on your machine)
# ═══════════════════════════════════════════════════════════════════════════

# Generate SECRET_KEY
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"

# Generate JWT_SECRET
python3 -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(32))"

# Create .env.local
cat > .env.local << 'ENVFILE'
# Supabase
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Security
SECRET_KEY=<your-generated-key>
JWT_SECRET=<your-generated-key>
VITE_API_URL=https://yourdomain.com

# Don't commit this file!
ENVFILE

# Don't commit secrets
echo ".env.local" >> .gitignore
echo ".env*.local" >> .gitignore

# Commit changes
git add -A
git commit -m "Setup Vercel + Supabase configuration"
git push

# ═══════════════════════════════════════════════════════════════════════════
# PART 2: LOCAL TESTING
# ═══════════════════════════════════════════════════════════════════════════

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# ═══════════════════════════════════════════════════════════════════════════
# PART 3: SUPABASE CREDENTIALS (Get from Supabase console)
# ═══════════════════════════════════════════════════════════════════════════

# Settings → Database → Connection String (for DATABASE_URL)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Settings → API → Project URL
VITE_SUPABASE_URL=https://[project-ref].supabase.co

# Settings → API → Anon Key (public key for frontend)
VITE_SUPABASE_ANON_KEY=<copy-from-settings>

# ═══════════════════════════════════════════════════════════════════════════
# PART 4: VERCEL SETUP (Through web interface, but documented here)
# ═══════════════════════════════════════════════════════════════════════════

# 1. Go to https://vercel.com
# 2. Sign in with GitHub/GitLab/Bitbucket
# 3. Click "Add New" → "Project"
# 4. Select your git repository
# 5. Configure:
#    - Root Directory: (leave blank if frontend in root)
#    - Build Command: npm run build
#    - Output Directory: dist

# 6. Add Environment Variables:
#    VITE_SUPABASE_URL = https://[project-ref].supabase.co
#    VITE_SUPABASE_ANON_KEY = <your-key>
#    DATABASE_URL = postgresql://...
#    SECRET_KEY = <your-key>
#    JWT_SECRET = <your-key>

# 7. Click "Deploy"

# ═══════════════════════════════════════════════════════════════════════════
# PART 5: DNS & DOMAIN SETUP
# ═══════════════════════════════════════════════════════════════════════════

# Cloudflare Setup:
# 1. Go to https://cloudflare.com
# 2. Add your domain
# 3. Copy new nameservers:
#    - example.ns.cloudflare.com
#    - example.ns.cloudflare.com

# Update nameservers at your domain registrar:
# (Go to GoDaddy, Namecheap, etc. and replace existing nameservers)

# ═══════════════════════════════════════════════════════════════════════════
# PART 6: CONNECT DOMAIN TO VERCEL
# ═══════════════════════════════════════════════════════════════════════════

# In Vercel Project Settings:
# 1. Go to Settings → Domains
# 2. Click "Add"
# 3. Enter your domain (e.g., yourdomain.com)
# 4. Select "Use Cloudflare nameservers"
# 5. Confirm

# Wait 5-15 minutes for DNS propagation

# ═══════════════════════════════════════════════════════════════════════════
# PART 7: VERIFICATION COMMANDS
# ═══════════════════════════════════════════════════════════════════════════

# Check DNS propagation (wait until it shows Vercel's IP)
nslookup yourdomain.com

# Test HTTPS connection
curl -I https://yourdomain.com

# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com </dev/null | grep -A5 "Issuer"

# Check if Cloudflare is caching
curl -I https://yourdomain.com | grep cf-cache

# ═══════════════════════════════════════════════════════════════════════════
# PART 8: DEPLOYMENT COMMANDS
# ═══════════════════════════════════════════════════════════════════════════

# Automatic deployment (just git push!)
git push

# Trigger rebuild in Vercel
# Go to Vercel Dashboard → Deployments → "Redeploy"
# Or use Vercel CLI:
npm i -g vercel
vercel --prod

# View deployment logs
vercel logs <deployment-url> --follow

# ═══════════════════════════════════════════════════════════════════════════
# PART 9: ENVIRONMENT VARIABLE UPDATES
# ═══════════════════════════════════════════════════════════════════════════

# Update environment variables without git commit:
# Go to Vercel Settings → Environment Variables
# Edit value and click "Save"
# Next deployment uses new values

# Or use Vercel CLI:
vercel env add VARIABLE_NAME
# Enter value and select environments (Production, Preview, Development)

# List all environment variables
vercel env ls

# ═══════════════════════════════════════════════════════════════════════════
# PART 10: MONITORING & MAINTENANCE
# ═══════════════════════════════════════════════════════════════════════════

# View Vercel Analytics
# Dashboard → Analytics tab

# Check build status
vercel list

# View recent deployments
vercel deployments

# Monitor Supabase
# Go to Supabase Dashboard → Reports → Database

# Monitor Cloudflare
# Go to Cloudflare Dashboard → Analytics

# ═══════════════════════════════════════════════════════════════════════════
# QUICK COPY-PASTE SEQUENCES
# ═══════════════════════════════════════════════════════════════════════════

# === SEQUENCE 1: Complete Local Setup ===
# Run this to prepare everything locally:
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
python3 -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(32))"
nano .env.local
echo ".env.local" >> .gitignore
git add -A
git commit -m "Setup Vercel + Supabase"
git push

# === SEQUENCE 2: Deploy with Vercel CLI ===
# Quick deployment using CLI:
npm run build
vercel --prod

# === SEQUENCE 3: Update Environment Variables ===
# Change a variable without redeploying:
vercel env add NEW_VARIABLE_NAME
# Then go to Vercel dashboard to set value

# === SEQUENCE 4: Monitor Everything ===
# Check health of deployment:
nslookup yourdomain.com
curl -I https://yourdomain.com
vercel list

# ═══════════════════════════════════════════════════════════════════════════
# ENVIRONMENT VARIABLES TEMPLATE
# ═══════════════════════════════════════════════════════════════════════════

# Copy this to .env.local and fill in YOUR values:

VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=<copy-from-supabase-settings>
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SECRET_KEY=<generate-with-python>
JWT_SECRET=<generate-with-python>
VITE_API_URL=https://yourdomain.com

# ═══════════════════════════════════════════════════════════════════════════
# USEFUL ONE-LINERS
# ═══════════════════════════════════════════════════════════════════════════

# Generate 10 different secret keys at once
for i in {1..10}; do python3 -c "import secrets; print('KEY_'$i'=' + secrets.token_urlsafe(32))"; done

# Test if Supabase connection works
curl -X GET "$(grep VITE_SUPABASE_URL .env.local | cut -d= -f2)/rest/v1/" \
  -H "Authorization: Bearer $(grep VITE_SUPABASE_ANON_KEY .env.local | cut -d= -f2)"

# Get current Vercel deployment URL
vercel --prod url

# Test frontend loads in 10 seconds
timeout 10 curl -s https://yourdomain.com | head -20

# Monitor real-time Vercel analytics
watch -n 5 'vercel analytics'

# Check if domain is still propagating
watch -n 5 'nslookup yourdomain.com'

# ═══════════════════════════════════════════════════════════════════════════
# IMPORTANT REMINDERS
# ═══════════════════════════════════════════════════════════════════════════

# 🔐 NEVER:
# ❌ Commit .env.local to git
# ❌ Share SUPABASE_ANON_KEY in public repos
# ❌ Put DATABASE_URL in frontend code
# ❌ Hardcode secrets anywhere

# ✅ ALWAYS:
# ✓ Use .env.local for local development
# ✓ Use Vercel Environment Variables for production
# ✓ Keep DATABASE_URL secret (backend only)
# ✓ Rotate keys periodically

# ═══════════════════════════════════════════════════════════════════════════

echo "✅ Commands reference ready!"
echo "📖 Read: DEPLOY_VERCEL_SUPABASE_CLOUDFLARE.md for complete guide"
echo "🚀 Start deployment now!"
