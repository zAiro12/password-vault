# CORS Configuration Documentation

## Overview

This document explains the Cross-Origin Resource Sharing (CORS) configuration for the Password Vault application, which allows the frontend to communicate with the backend API from different origins.

## What is CORS?

CORS is a security feature implemented by browsers that restricts web pages from making requests to a different domain than the one that served the web page. Without proper CORS configuration, the frontend (running on `http://localhost:5173` in development or `https://zairo12.github.io/password-vault/` in production) would be blocked from accessing the backend API (running on `http://localhost:3000`).

## Backend Configuration

The CORS configuration is implemented in `backend/src/index.js` with the following setup:

### Allowed Origins

The following origins are permitted to access the backend API:

1. **Local Development:**
   - `http://localhost:5173` - Vite dev server
   - `http://127.0.0.1:5173` - Vite dev server (alternative)
   - `http://localhost:3000` - Backend server
   - `http://127.0.0.1:3000` - Backend server (alternative)

2. **Production (GitHub Pages):**
   - `https://zairo12.github.io` - GitHub Pages root URL
   - `https://zairo12.github.io/password-vault` - Repository-specific GitHub Pages URL
   - `https://zairo12.github.io/password-vault/` - With trailing slash

### CORS Options

```javascript
const corsOptions = {
  origin: allowedOrigins,           // List of allowed origins
  credentials: true,                // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization']      // Allowed request headers
};
```

### Custom Origins (Optional)

You can add additional origins via the `CORS_ORIGINS` environment variable in `backend/.env`:

```env
# backend/.env
CORS_ORIGINS=http://localhost:8080,https://my-custom-domain.com
```

These custom origins will be added to the default allowed origins list.

## Frontend Configuration

### Development (Vite Proxy)

In development mode, the frontend uses Vite's proxy feature to forward `/api` requests to the backend. This is configured in `frontend/vite.config.js`:

```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

When running locally with `npm run dev:frontend`, the proxy handles the cross-origin requests automatically.

### Production (Direct API Calls)

In production, the frontend makes direct requests to the backend API URL specified in the `VITE_API_BASE_URL` environment variable:

```env
# frontend/.env
VITE_API_BASE_URL=http://localhost:3000  # For local testing
# or
VITE_API_BASE_URL=https://your-backend-api-url.com  # For production
```

## Testing CORS Configuration

To verify CORS is working correctly:

### 1. Start the Backend

```bash
cd backend
npm run dev
```

### 2. Test with curl

```bash
# Test preflight request
curl -i -X OPTIONS http://localhost:3000/api/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"
```

Expected response should include headers like:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
```

### 3. Test from Browser

Open the frontend app in your browser and check the Network tab in Developer Tools. You should see:

- **No CORS errors** in the console
- **Successful API requests** with proper CORS headers in the response
- `Access-Control-Allow-Origin` header matching the request origin

## Common CORS Issues and Solutions

### Issue: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Cause:** The origin making the request is not in the allowed origins list.

**Solution:** 
1. Check that the backend server is running
2. Verify the origin is in the `allowedOrigins` array in `backend/src/index.js`
3. If using a custom origin, add it to `CORS_ORIGINS` in `backend/.env`
4. Restart the backend server after making changes

### Issue: "Credentials flag is 'true', but the 'Access-Control-Allow-Credentials' header is ''"

**Cause:** The backend is not configured to allow credentials.

**Solution:** The configuration already includes `credentials: true`. Ensure:
1. You're using the updated CORS configuration
2. The backend server has been restarted
3. The frontend is sending requests with `credentials: 'include'` if needed

### Issue: CORS works locally but not in production

**Cause:** The production frontend URL is not in the allowed origins.

**Solution:**
1. Add the production frontend URL to the allowed origins in `backend/src/index.js`
2. For GitHub Pages, the configuration already includes the necessary patterns
3. Ensure the backend is deployed and accessible from the production frontend
4. Check that HTTPS is used for production (mixed content issues)

## Security Considerations

1. **Origin Validation:** Only explicitly allowed origins can access the API
2. **Credentials:** The `credentials: true` setting allows cookies and authorization headers to be sent with requests
3. **Methods & Headers:** Only specified HTTP methods and headers are allowed
4. **Wildcard Origins:** Avoid using `*` for origins when `credentials: true` is set (browsers will reject this)

## Production Deployment

When deploying to production:

1. **Update Allowed Origins:** Add your production frontend URL to the allowed origins list
2. **Use HTTPS:** Ensure both frontend and backend use HTTPS in production
3. **Environment Variables:** Set appropriate `VITE_API_BASE_URL` in the frontend
4. **Backend URL:** Ensure the frontend knows where to find the backend API
5. **Firewall Rules:** Configure your hosting environment to allow cross-origin requests

### Example Production Setup

**Backend (.env):**
```env
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://zairo12.github.io/password-vault
```

**Frontend (.env.production):**
```env
VITE_API_BASE_URL=https://your-backend-server.com
```

## Troubleshooting Checklist

- [ ] Backend server is running and accessible
- [ ] Frontend origin is in the allowed origins list
- [ ] CORS middleware is configured before route handlers
- [ ] Backend server has been restarted after configuration changes
- [ ] Browser cache has been cleared
- [ ] Network tab shows the correct CORS headers in responses
- [ ] No mixed content issues (HTTP frontend calling HTTPS backend or vice versa)
- [ ] Environment variables are correctly set for the environment

## References

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS middleware](https://www.npmjs.com/package/cors)
- [Vite Server Options](https://vitejs.dev/config/server-options.html)
