# GitHub Pages Configuration Guide

## Problem
The GitHub Pages site at https://zairo12.github.io/password-vault/ may show a 404 error ("There isn't a GitHub Pages site here") or display the README instead of the actual Password Vault application.

## Root Cause
This typically happens when:
1. GitHub Pages is not enabled in the repository settings, OR
2. GitHub Pages is configured to deploy from a branch (like `main` or `gh-pages`) instead of using the GitHub Actions workflow, OR
3. The "github-pages" environment doesn't exist or isn't properly configured

## Deployment Workflows

This repository has **two GitHub Actions workflows** for deploying to GitHub Pages:

### 1. `deploy.yml` - Main Deployment Workflow
- **File**: `.github/workflows/deploy.yml`
- **Name**: "🚀 Deploy Password Vault"
- **Trigger**: Push to `main` branch
- **Method**: Uses `peaceiris/actions-gh-pages@v3`
- **Features**: 
  - Deploys both backend configuration and frontend
  - ✅ Includes SPA routing support (.nojekyll and 404.html)
  - Uses production environment variables

### 2. `deploy-ui.yml` - UI-Only Deployment
- **File**: `.github/workflows/deploy-ui.yml`
- **Name**: "Deploy UI to GitHub Pages"
- **Trigger**: Push to `main` branch or manual dispatch
- **Method**: Uses `actions/deploy-pages@v4` (newer GitHub Pages API)
- **Features**:
  - Deploys frontend only
  - ✅ Includes SPA routing support (.nojekyll and 404.html)
  - Creates version tags automatically

**Both workflows now include the necessary SPA routing fixes** to prevent 404 errors when accessing routes directly or refreshing the page.

## Solution

### Step 1: Verify GitHub Pages Source Setting
1. Go to the repository on GitHub
2. Click **Settings** (requires admin access)
3. In the left sidebar, click **Pages**
4. Under "Build and deployment" → "Source", check the current setting

### Step 2: Change to GitHub Actions (if needed)
If the source is set to "Deploy from a branch":
1. Change the dropdown to **GitHub Actions**
2. Save the setting (it should save automatically)
3. Wait 1-2 minutes for the change to take effect

### Step 3: Verify the Fix
1. Go to the **Actions** tab
2. You should see either "🚀 Deploy Password Vault" or "Deploy UI to GitHub Pages" workflow has run successfully
3. Visit https://zairo12.github.io/password-vault/
4. You should now see the Password Vault login page instead of the README

### Step 4: Troubleshooting 404 Errors

If you still see 404 errors after deployment:

#### Common Issues and Solutions:

1. **404 on Main Page (`/password-vault/`)**
   - Check that GitHub Pages source is set to "GitHub Actions"
   - Verify the workflow completed successfully
   - Wait 2-3 minutes for GitHub CDN to update

2. **404 on Routes (`/login`, `/dashboard`, etc.)**
   - This was the main issue! Now fixed in both workflows
   - Verify `.nojekyll` file exists in deployment
   - Verify `404.html` file exists in deployment
   - Check browser console for asset loading errors

3. **404 on Assets (CSS, JS files)**
   - Verify `NODE_ENV=production` is set during build
   - Check that asset paths include `/password-vault/` prefix
   - Clear browser cache and hard refresh (Ctrl+Shift+R)

4. **How to Verify SPA Routing Works**:
   ```
   Test these URLs directly in your browser:
   - https://zairo12.github.io/password-vault/login
   - https://zairo12.github.io/password-vault/dashboard
   - https://zairo12.github.io/password-vault/register
   
   All should load the app (not show 404 error page)
   ```

## Technical Changes Made

This PR includes the following technical improvements to ensure robust SPA routing:

### 1. Workflow Updates

**Both workflows** (`.github/workflows/deploy.yml` and `.github/workflows/deploy-ui.yml`) now include:
- ✅ Explicitly ensures `.nojekyll` file exists in `dist/` to prevent GitHub Pages from processing the site with Jekyll
- ✅ Verifies `404.html` exists in `dist/` for SPA fallback routing (with fallback to copy from `index.html` if missing)
- ✅ Sets `NODE_ENV=production` to enable correct base path configuration

### 2. Vite Configuration (`frontend/vite.config.js`)
- ✅ Sets `base: '/password-vault/'` in production mode
- ✅ This ensures all assets (JS, CSS, images) load with the correct path prefix

### 3. Vue Router Configuration (`frontend/src/router/index.js`)
- ✅ Uses `import.meta.env.BASE_URL` which automatically picks up Vite's base path
- ✅ Creates router with `createWebHistory` for clean URLs without hash (#)

### 4. SPA Routing Files (in `frontend/public/`)
- ✅ `.nojekyll` - Empty file that disables Jekyll processing
- ✅ `404.html` - Contains redirect script that converts 404 errors into SPA route parameters
- ✅ `index.html` - Contains script that reads route parameters and updates browser history

### How SPA Routing Works
1. User visits `https://zairo12.github.io/password-vault/login`
2. GitHub Pages doesn't find `/login` page, serves `404.html`
3. `404.html` script redirects to `https://zairo12.github.io/password-vault/?/login` (preserving the path as query parameter)
4. `index.html` loads, its script reads `/?/login` from URL
5. Script updates browser history to show `/password-vault/login` (clean URL)
6. Vue Router takes over and renders the Login component

## What This Means

- The GitHub Actions workflow was already correctly configured and working
- The issue was only in the repository settings
- These code changes improve SPA routing support
- After changing the Pages source to "GitHub Actions", the application will display correctly

## Backend Note

As mentioned in the DEPLOYMENT.md, the backend API is not deployed to GitHub Pages. The GitHub Pages deployment is only for the frontend UI testing. For a fully functional application with working API calls, you would need to deploy the backend separately (e.g., to Heroku, Railway, or another hosting service) and configure the frontend to point to that backend URL.
