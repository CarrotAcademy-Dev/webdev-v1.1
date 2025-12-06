# 🚀 Deployment Guide - CarrotAcademy v1.1

## 📋 Prerequisites

- Node.js 18+ installed
- Vercel account (https://vercel.com)
- GitHub repository access
- Environment variables ready

---

## 🌐 Deploy to Vercel (Recommended)

### Method 1: Via Vercel Dashboard (Easiest)

#### Step 1: Import Project
1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub account and find `CarrotAcademy-Dev/webdev-v1.1`
5. Click **"Import"**

#### Step 2: Configure Project
1. **Framework Preset**: Vite (auto-detected)
2. **Root Directory**: `./` (leave as is)
3. **Build Command**: `npm run build` (auto-filled)
4. **Output Directory**: `dist` (auto-filled)
5. **Install Command**: `npm install` (auto-filled)

#### Step 3: Setup Environment Variables
Click **"Environment Variables"** and add:

```env
VITE_API_BASE_URL=https://script.google.com/macros/s
VITE_API_CSO_BERSAMA_ENDPOINT=https://script.google.com/macros/s/AKfycbyDTye9Z2GFj2NuXi8ik0FiazXhK56J0zNKyEEvmUcC-V_U_kn1NvwsMy1zgu_HUBqMjg/exec
VITE_API_CSO_PERSONAL_ENDPOINT=https://script.google.com/macros/s/AKfycby89UyE4OF71-PruxKQR4xc3_FaKpHr-kPJhzZe22WyVNDpAD1SsuayWl0X4OXdtbiz/exec
VITE_API_AUTH_ENDPOINT=/AKfycbzaQqdmBXWstfEkDm3lMpC7DFeselitztz7zsxIYVWeOmVoDAxFQPiAqkm0EWrDpMFl2A/exec
VITE_APP_NAME=CarrotAcademy Dashboard
VITE_APP_VERSION=1.1.0
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=false
```

**Important:** 
- Apply to: **Production, Preview, and Development**
- Or just select **"Preview"** for develop branch testing

#### Step 4: Configure Branch Settings
1. After project is created, go to **Settings** → **Git**
2. **Production Branch**: Set to `main`
3. **Preview Branches**: Enable for `develop` and feature branches

#### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. You'll get URLs:
   - **Production**: `https://your-project.vercel.app` (from `main` branch)
   - **Preview**: `https://your-project-git-develop.vercel.app` (from `develop` branch)

---

### Method 2: Via Vercel CLI (For Advanced Users)

#### Install Vercel CLI
```bash
npm install -g vercel
```

#### Login to Vercel
```bash
vercel login
```

#### Deploy to Preview (develop branch)
```bash
# Make sure you're on develop branch
git checkout develop

# Deploy preview
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? Select your account
# - Link to existing project? N (first time) or Y (subsequent)
# - Project name? carrotacademy-v1-1
# - Directory? ./
```

#### Deploy to Production (main branch)
```bash
git checkout main
vercel --prod
```

---

## 🔧 Post-Deployment Configuration

### 1. Custom Domain (Optional)
1. Go to **Settings** → **Domains**
2. Add your domain: `dashboard.carrotacademy.com`
3. Update DNS records as instructed
4. SSL certificate auto-configured

### 2. Setup Deployment Protection
1. Go to **Settings** → **Deployment Protection**
2. Enable **Vercel Authentication** for preview deployments
3. Add team members who can access previews

### 3. Setup Build & Development Settings
1. **Node.js Version**: 18.x (recommended)
2. **Install Command**: `npm install`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

### 4. Setup Redirects (Already in vercel.json)
- All routes redirect to index.html for SPA routing
- Static assets cached for 1 year

---

## 🌿 Branch Deployment Strategy

### Automatic Deployments:

| Branch | Environment | URL | Auto Deploy |
|--------|-------------|-----|-------------|
| `main` | Production | `https://carrotacademy-v1-1.vercel.app` | ✅ Yes |
| `develop` | Preview/Staging | `https://carrotacademy-v1-1-git-develop.vercel.app` | ✅ Yes |
| `feature/*` | Preview | `https://carrotacademy-v1-1-git-feature-*.vercel.app` | ✅ Yes |

### Workflow:
1. **Development**: Work on `feature/*` branches
   - Push → Auto deploy preview
   - Test on preview URL
   
2. **Integration**: Merge to `develop`
   - Auto deploy to preview environment
   - Team testing & QA
   
3. **Production**: Merge `develop` to `main`
   - Auto deploy to production
   - Live for users

---

## 🐛 Troubleshooting

### Build Fails
**Error**: `Module not found` or dependency issues
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working
**Issue**: API calls failing in production
**Solution**:
1. Check env vars in Vercel dashboard
2. Make sure variables start with `VITE_`
3. Redeploy after adding env vars

### HTTPS Certificate Issues
**Issue**: Using `basicSsl` plugin locally
**Solution**: Remove from production build
```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    jsconfigPaths(),
    svgr(),
    // basicSsl() // Remove for production
  ],
  // Remove server config for production
  // server: {
  //   https: true,
  // }
})
```

### Routing Issues (404 on refresh)
**Solution**: Already handled by `vercel.json` rewrites
- All routes redirect to `/index.html`
- SPA routing works correctly

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Optional)
1. Go to **Analytics** tab
2. Enable **Web Analytics**
3. Add to your app:
```bash
npm install @vercel/analytics
```

```javascript
// src/main.jsx
import { Analytics } from '@vercel/analytics/react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* ... your app */}
    <Analytics />
  </StrictMode>,
)
```

### Vercel Speed Insights (Optional)
```bash
npm install @vercel/speed-insights
```

```javascript
import { SpeedInsights } from '@vercel/speed-insights/react';

// Add to main.jsx
<SpeedInsights />
```

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Build succeeds locally (`npm run build`)
- [ ] Preview deployment tested
- [ ] All features working on preview
- [ ] API endpoints accessible
- [ ] Authentication working
- [ ] No console errors
- [ ] Performance optimized
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] Team reviewed changes

---

## 🔄 Rollback Strategy

If production has issues:

### Method 1: Via Dashboard
1. Go to **Deployments**
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**

### Method 2: Via Git
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push -f origin main
```

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev/guide/
- **Project Issues**: https://github.com/CarrotAcademy-Dev/webdev-v1.1/issues

---

**Last Updated**: December 6, 2025
**Version**: 1.1.0
