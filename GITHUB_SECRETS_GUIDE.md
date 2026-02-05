# GitHub Secrets Integration Guide

This guide explains how to configure GitHub secrets for secure deployment of the Password Vault application.

## Overview

The Password Vault application uses environment variables for configuration, particularly for sensitive data like database credentials and encryption keys. When deploying via GitHub Actions, these values should be stored as **GitHub Secrets** rather than in `.env` files.

## Why GitHub Secrets?

✅ **Security**: Secrets are encrypted and never exposed in logs or code  
✅ **Centralized Management**: Update secrets in one place for all deployments  
✅ **Access Control**: Only authorized users can view/edit secrets  
✅ **Audit Trail**: GitHub tracks who accessed or modified secrets  

## Setting Up GitHub Secrets

### Step 1: Generate Secure Keys

Before adding secrets, generate secure random keys for JWT and encryption:

```bash
# Generate JWT_SECRET (32+ bytes recommended)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate ENCRYPTION_KEY (must be exactly 32 bytes = 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important**: Save these keys securely! If you lose them, you won't be able to decrypt existing credentials.

### Step 2: Add Secrets to GitHub Repository

1. Navigate to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret individually:

### Required Secrets

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `JWT_SECRET` | Secret key for JWT token signing | `a1b2c3d4e5f6...` (64 hex chars) |
| `ENCRYPTION_KEY` | Key for encrypting credentials | `f6e5d4c3b2a1...` (exactly 64 hex chars) |
| `DB_HOST` | Database server hostname | `mysql.example.com` or `localhost` |
| `DB_USER` | Database username | `password_vault_user` |
| `DB_PASSWORD` | Database password | `your-secure-db-password` |
| `DB_NAME` | Database name | `password_vault` |

### Optional Secrets

| Secret Name | Description | Default Value |
|------------|-------------|---------------|
| `DB_PORT` | Database port | `3306` |
| `ADMIN_DEFAULT_USERNAME` | Initial admin username | `admin` |
| `ADMIN_DEFAULT_PASSWORD` | Initial admin password | (generate strong password) |
| `ADMIN_DEFAULT_EMAIL` | Initial admin email | `admin@passwordvault.local` |

### Step 3: Verify GitHub Workflow Configuration

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically uses these secrets:

```yaml
- name: 🔐 Create .env file
  run: |
    cd backend
    cat << 'EOF' > .env
    DB_HOST=${{ secrets.DB_HOST }}
    DB_PORT=${{ secrets.DB_PORT }}
    DB_USER=${{ secrets.DB_USER }}
    DB_PASSWORD=${{ secrets.DB_PASSWORD }}
    DB_NAME=${{ secrets.DB_NAME }}
    ENCRYPTION_KEY=${{ secrets.ENCRYPTION_KEY }}
    JWT_SECRET=${{ secrets.JWT_SECRET }}
    # ... etc
    EOF
```

This creates a `.env` file during deployment with values from GitHub Secrets.

## Environment Variable Validation

The application validates all required environment variables at startup:

### Automatic Validation

When the backend starts, it automatically:
1. Checks that all required environment variables are set
2. Validates `ENCRYPTION_KEY` format (must be 64 hex characters)
3. Warns if `JWT_SECRET` is too short (< 32 characters)
4. Shows production-specific warnings for security issues

### Manual Validation

To validate environment configuration manually:

```bash
cd backend
npm run validate-env
```

### Validation Errors

If required variables are missing, the server will **not start** and will display:

```
❌ ENVIRONMENT CONFIGURATION ERROR
════════════════════════════════════════════════════════════
The following required environment variables are missing or invalid:

  ❌ JWT_SECRET
     JWT secret for token signing (must be a strong, random string)

  ❌ ENCRYPTION_KEY
     Encryption key for credential storage (must be 64 hex characters)

════════════════════════════════════════════════════════════
Please set these variables in your .env file or environment.
See .env.example for a template.
```

## Local Development vs Production

### Local Development

For local development, use a `.env` file:

```bash
cd backend
cp .env.example .env
# Edit .env with your local configuration
npm start
```

### Production Deployment

For production (GitHub Actions), secrets are injected at runtime:
- No `.env` file needed in the repository
- Secrets are set in GitHub repository settings
- Values are injected during workflow execution

## Security Best Practices

### ✅ DO:
- Use GitHub Secrets for all sensitive data
- Generate cryptographically secure random keys
- Use different secrets for development and production
- Rotate secrets periodically
- Limit access to secrets to necessary team members
- Use strong, unique database passwords

### ❌ DON'T:
- Commit `.env` files to the repository
- Share secrets via email or chat
- Use weak or guessable secrets
- Reuse secrets across different applications
- Log secret values in application code
- Use default/example secrets in production

## Rotating Secrets

If you need to rotate secrets (recommended periodically):

### JWT_SECRET Rotation

1. Generate new `JWT_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Update the secret in GitHub Settings
3. Deploy the application
4. **Impact**: All existing JWT tokens will be invalidated; users must log in again

### ENCRYPTION_KEY Rotation

⚠️ **CRITICAL**: Rotating the encryption key requires re-encrypting all existing credentials!

**Process**:
1. Generate new key
2. Create migration script to decrypt with old key and re-encrypt with new key
3. Run migration
4. Update GitHub Secret
5. Deploy

**Alternative**: Maintain backward compatibility by supporting multiple keys (key versioning)

### Database Password Rotation

1. Update password in your database server
2. Update `DB_PASSWORD` secret in GitHub
3. Deploy the application

## Troubleshooting

### Server Won't Start

**Error**: `JWT_SECRET is not configured in environment variables`
- **Solution**: Add `JWT_SECRET` to GitHub Secrets

**Error**: `ENCRYPTION_KEY must be 64 hex characters`
- **Solution**: Generate correct key format: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Secrets Not Applied in GitHub Actions

1. Check that secret names match exactly (case-sensitive)
2. Verify secrets are set at repository level, not environment level
3. Check workflow file uses correct secret references: `${{ secrets.SECRET_NAME }}`
4. Re-run the workflow after adding secrets

### Database Connection Fails

1. Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` are correct
2. Check database server allows connections from GitHub Actions runners
3. Verify database server is accessible from the internet (if applicable)

## Testing Secret Configuration

### Test Locally with Secret Values

1. Export secrets as environment variables:
   ```bash
   export JWT_SECRET="your-jwt-secret"
   export ENCRYPTION_KEY="your-encryption-key"
   # ... etc
   ```

2. Run the application without `.env` file:
   ```bash
   cd backend
   npm start
   ```

3. Verify environment validation passes

### Test GitHub Actions Workflow

1. Push a commit to trigger the workflow
2. Go to **Actions** tab in GitHub
3. Check the workflow run logs
4. Look for environment validation output:
   ```
   ✅ Environment Configuration Valid
   ```

## Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)

## Support

If you encounter issues with GitHub Secrets configuration:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review GitHub Actions workflow logs
3. Verify all secrets are correctly set
4. Check that environment validation passes
