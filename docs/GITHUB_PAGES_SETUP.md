# GitHub Pages Configuration Guide

## Problem
The GitHub Pages site at https://zairo12.github.io/password-vault/ may show a 404 error ("There isn't a GitHub Pages site here") or display the README instead of the actual Password Vault application.

## Root Cause
This typically happens when:
1. GitHub Pages is not enabled in the repository settings, OR
2. GitHub Pages is configured to deploy from a branch (like `main` or `gh-pages`) instead of using the GitHub Actions workflow, OR
3. The "github-pages" environment doesn't exist or isn't properly configured

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
2. You should see the "Deploy UI to GitHub Pages" workflow has run successfully
3. Visit https://zairo12.github.io/password-vault/
4. You should now see the Password Vault login page instead of the README

## Technical Changes Made

This PR includes the following technical improvements to ensure robust SPA routing:

### 1. Workflow Updates (`.github/workflows/deploy-ui.yml`)
- ✅ Explicitly ensures `.nojekyll` file exists in `dist/` to prevent GitHub Pages from processing the site with Jekyll
- ✅ Verifies `404.html` exists in `dist/` for SPA fallback routing (with fallback to copy from `index.html` if missing)
- ✅ Uses `actions/deploy-pages@v4` for modern GitHub Pages deployment

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
3. `404.html` script redirects to `/?/login` (preserving the path as query parameter)
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
