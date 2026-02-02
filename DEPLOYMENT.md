# Deploy Pipeline Documentation

## Overview

This repository includes an automated deployment pipeline that publishes the frontend UI to GitHub Pages for testing on a real website.

## How It Works

### Workflow Trigger

The deployment pipeline is triggered:
- **Automatically** when code is pushed to the `main` branch
- **Manually** via the GitHub Actions UI (workflow_dispatch)

### Deployment Process

1. **Code Checkout**: The workflow checks out the latest code from the repository
2. **Node.js Setup**: Configures Node.js v18 with npm cache
3. **Version Detection**: Reads the version from `frontend/package.json`
4. **Tag Verification**: Checks if a tag with the current version already exists
5. **Dependencies Install**: Installs all required npm packages
6. **Frontend Build**: Builds the Vue 3 frontend for production
7. **GitHub Pages Deploy**: Uploads and deploys the built files to GitHub Pages
8. **Tag Creation**: Creates and pushes a version tag (e.g., `v1.0.0`) if it doesn't exist
9. **Summary**: Generates a deployment summary with the URL and version

### Accessing the Deployed UI

Once deployed, the UI will be available at:
```
https://zairo12.github.io/password-vault/
```

### Version Tagging

The pipeline automatically creates git tags based on the version in `frontend/package.json`. For example:
- Version `1.0.0` → Tag `v1.0.0`
- Version `1.2.3` → Tag `v1.2.3`

If a tag already exists, it will skip tag creation to avoid conflicts.

## Updating the Version

To deploy a new version:

1. Update the version in `frontend/package.json`:
   ```json
   {
     "version": "1.1.0"
   }
   ```

2. Commit and push to `main`:
   ```bash
   git add frontend/package.json
   git commit -m "Bump version to 1.1.0"
   git push origin main
   ```

3. The pipeline will automatically:
   - Build and deploy the new version
   - Create a new tag `v1.1.0`

## Manual Deployment

You can also trigger a deployment manually:

1. Go to the **Actions** tab in GitHub
2. Select the **Deploy UI to GitHub Pages** workflow
3. Click **Run workflow**
4. Select the branch (usually `main`)
5. Click **Run workflow** button

## Troubleshooting

### Seeing README Instead of the Application

If you see the README.md instead of the actual application when visiting the GitHub Pages URL:

1. Go to repository **Settings** → **Pages**
2. Under "Build and deployment" → "Source", make sure **GitHub Actions** is selected (NOT "Deploy from a branch")
3. If it was set to "Deploy from a branch", change it to **GitHub Actions**
4. Wait a few minutes for the change to take effect
5. Visit the URL again: https://zairo12.github.io/password-vault/

This is the most common issue - when the source is set to deploy from a branch, GitHub Pages will show the README.md from that branch instead of the built application deployed by the workflow.

### GitHub Pages Not Enabled

If the deployment fails with a pages error:

1. Go to repository **Settings** → **Pages**
2. Under "Source", select **GitHub Actions**
3. Save the settings
4. Re-run the workflow

### Build Failures

If the build fails:
- Check the workflow logs in the Actions tab
- Ensure all dependencies are correctly specified in `package.json`
- Test the build locally with `npm run build:frontend`

### Tag Already Exists

If you need to update an existing version:
1. Delete the existing tag locally and remotely:
   ```bash
   git tag -d v1.0.0
   git push origin :refs/tags/v1.0.0
   ```
2. Push the changes again to trigger the workflow

## Configuration Files

### Workflow File
`.github/workflows/deploy-ui.yml` - Main deployment workflow

### Frontend Config
`frontend/vite.config.js` - Includes base path configuration for GitHub Pages:
```javascript
base: process.env.NODE_ENV === 'production' ? '/password-vault/' : '/'
```

## Important Notes

- The deployed UI is for **testing purposes**
- The backend API is not deployed, so API calls will fail in the deployed version
- For a fully functional application, consider deploying both frontend and backend together
- The deployment uses GitHub Actions built-in tokens, no additional configuration needed
