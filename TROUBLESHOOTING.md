# Troubleshooting Guide

This document provides solutions for common issues you may encounter when running the Password Vault application.

## Browser Console Errors

### "Cannot connect to server" or "ERR_CONNECTION_REFUSED"

**Problem:** The frontend cannot reach the backend API server.

**Solution:**
1. Ensure the backend server is running:
   ```bash
   cd backend
   npm run dev
   ```
   The backend should start on port 3000.

2. Verify the backend is accessible:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. Check for port conflicts:
   ```bash
   lsof -i :3000
   # or on Windows:
   netstat -ano | findstr :3000
   ```

4. Review backend environment variables in `backend/.env`:
   - Ensure all required variables are set
   - Run validation: `cd backend && npm run validate-env`

### Missing Favicon (404 error)

**Problem:** Browser shows 404 error for `/favicon.ico`

**Solution:** The favicon has been added to `frontend/public/favicon.ico`. If you still see this error:
1. Clear your browser cache
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Verify the file exists: `ls frontend/public/favicon.ico`

### Chrome Extension Errors

**Problem:** Errors like "Uncaught SyntaxError: Unexpected token 'export'" or "runtime.lastError: Could not establish connection"

**Cause:** These errors come from browser extensions trying to inject scripts into the page, not from the application itself.

**Solution:**
1. Try opening the application in an incognito/private window
2. Disable browser extensions one by one to identify the problematic one
3. These errors don't affect the application functionality - they can be safely ignored

## Development Setup Issues

### Backend Won't Start

**Checklist:**
1. Node.js version 18+ installed: `node --version`
2. Dependencies installed: `cd backend && npm install`
3. MySQL database running and accessible
4. Environment file configured: `cp backend/.env.example backend/.env` and fill in values
5. Database migrations run: `cd backend && npm run migrate`

### Frontend Won't Start

**Checklist:**
1. Node.js version 18+ installed: `node --version`
2. Dependencies installed: `cd frontend && npm install`
3. Vite port 5173 is available
4. Run: `cd frontend && npm run dev`

### Database Connection Errors

**Problem:** Backend logs show "ECONNREFUSED" or "ER_ACCESS_DENIED_ERROR"

**Solution:**
1. Verify MySQL is running:
   ```bash
   # Linux/Mac:
   sudo systemctl status mysql
   # or
   brew services list | grep mysql
   
   # Windows: Check Services panel
   ```

2. Test database connection:
   ```bash
   mysql -h localhost -u your_user -p
   ```

3. Verify database credentials in `backend/.env`:
   - DB_HOST
   - DB_PORT (usually 3306)
   - DB_USER
   - DB_PASSWORD
   - DB_NAME

4. Check MySQL user permissions:
   ```sql
   SHOW GRANTS FOR 'your_user'@'localhost';
   ```

## Build and Deployment Issues

### Build Fails

**Problem:** `npm run build` fails

**Common causes:**
1. TypeScript errors (if using TypeScript)
2. Missing dependencies
3. Syntax errors in code
4. Environment variables not set

**Solution:**
1. Check the error message carefully
2. Run `npm install` to ensure all dependencies are present
3. For frontend: Ensure VITE_ prefixed environment variables are set
4. For backend: No build step required

### GitHub Pages Deployment Issues

**Problem:** Deployed site shows blank page or 404 errors

**Solution:**
1. Verify `base` path in `frontend/vite.config.js` matches repository name
2. Ensure the workflow has proper permissions
3. Check GitHub Pages is enabled in repository settings
4. Review GitHub Actions logs for deployment errors

## API Request Errors

### 401 Unauthorized

**Problem:** API returns 401 status

**Possible causes:**
1. No authentication token provided
2. Token expired
3. Token invalid

**Solution:**
1. Log in again to get a fresh token
2. Check token is being sent in Authorization header
3. Verify JWT_SECRET is consistent between requests

### CORS Errors

**Problem:** Browser console shows CORS policy errors

**Solution:**
1. Verify backend CORS configuration includes frontend origin
2. For local development, ensure frontend runs on localhost:5173
3. For production, update allowed origins in `backend/src/index.js`
4. Check the CORS_SETUP.md document for detailed configuration

## Performance Issues

### Slow API Responses

**Checklist:**
1. Check database query performance
2. Verify database indexes are created (run migrations)
3. Review MySQL slow query log
4. Check server resources (CPU, RAM, disk)
5. Monitor connection pool usage

### High Memory Usage

**Solution:**
1. Check for connection leaks in database pool
2. Review MySQL connection limits
3. Monitor Node.js process: `node --max-old-space-size=2048 src/index.js`

## Getting Help

If you continue experiencing issues:

1. **Check logs:**
   - Backend: Look at console output when running `npm run dev`
   - Frontend: Open browser Developer Tools (F12) → Console tab
   - Database: Check MySQL error logs

2. **Review documentation:**
   - README.md - General setup
   - DATABASE_SETUP.md - Database configuration
   - CORS_SETUP.md - CORS issues
   - AUTH_DOCUMENTATION.md - Authentication issues

3. **Verify environment:**
   - Node.js version: `node --version` (should be 18+)
   - npm version: `npm --version`
   - MySQL version: `mysql --version` (should be 8.0+)

4. **Test individual components:**
   - Backend tests: `cd backend && npm test`
   - Backend integration tests: `cd backend && npm run test:integration`
   - Environment validation: `cd backend && npm run validate-env`
