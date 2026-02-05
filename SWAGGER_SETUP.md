# Swagger API Documentation Setup

## Overview

This repository now includes comprehensive API documentation using Swagger/OpenAPI. This allows you to:
- View all available API endpoints
- Test API calls directly from the browser
- Debug authentication issues
- Understand request/response formats

## Accessing the Documentation

Once the backend server is running, you can access the documentation at:

### 1. Interactive Swagger UI
**URL:** `http://localhost:3000/swagger` (local) or `https://password-vault-wqj8.onrender.com/swagger` (production)

This provides the standard Swagger UI interface where you can:
- Browse all endpoints
- Try out requests directly
- See response schemas
- Test authentication with JWT tokens

### 2. Custom HTML Documentation
**URL:** `http://localhost:3000/api-docs` (local) or `https://password-vault-wqj8.onrender.com/api-docs` (production)

A custom-built HTML documentation page in Italian with:
- Clean, organized layout
- All endpoint details
- Request/response examples
- Authentication requirements highlighted

### 3. JSON API Specification
**URL:** `http://localhost:3000/api-docs/json`

Raw JSON format of all endpoints - useful for:
- Automated testing tools
- API client generators
- Integration with other tools

## Using Swagger UI for Authentication Testing

### Step 1: Access Swagger UI
Navigate to `/swagger` in your browser

### Step 2: Test the Login Endpoint
1. Find the **POST /api/auth/login** endpoint in the Authentication section
2. Click "Try it out"
3. Enter the request body:
```json
{
  "email": "lucaairoldi92@gmail.com",
  "password": "Admin2026!SecureP@ss"
}
```
4. Click "Execute"
5. Check the response

### Step 3: Authenticate for Protected Endpoints
If login is successful:
1. Copy the `token` from the response
2. Click the "Authorize" button at the top of the page
3. Enter: `Bearer <your-token-here>` (note: no "Bearer" prefix needed in the input box)
4. Click "Authorize"
5. Now you can test protected endpoints

## Debugging the 500 Error

The enhanced logging in the `authController` now provides detailed debug information:

### What to Look For in Server Logs

When a login attempt fails with 500 error, the logs will show:

```
[login_1234567890_abc123] Login attempt started
[login_1234567890_abc123] Attempting login for email: lucaairoldi92@gmail.com
[login_1234567890_abc123] Database query executed. Users found: 1
[login_1234567890_abc123] User found - ID: 1, Username: admin, Role: admin, Active: true
[login_1234567890_abc123] Verifying password...
[login_1234567890_abc123] Password verification result: true
[login_1234567890_abc123] Generating JWT token...
[login_1234567890_abc123] JWT token generated successfully
[login_1234567890_abc123] Login successful for user: admin
```

If there's an error, you'll see:
```
[login_1234567890_abc123] Login error - Type: <ErrorType>
[login_1234567890_abc123] Error message: <detailed message>
[login_1234567890_abc123] Error stack: <full stack trace>
```

### Common Causes of 500 Error

1. **Database Connection Issues**
   - Check `/health/db` endpoint
   - Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME environment variables

2. **Missing Environment Variables**
   - Check JWT_SECRET is set
   - Check ENCRYPTION_KEY is set (must be 64 hex characters)
   
3. **User Doesn't Exist**
   - Run database migrations: `npm run migrate`
   - Check if user exists in the database

4. **Bcrypt/JWT Library Errors**
   - Ensure all npm dependencies are installed: `npm install`
   - Check Node.js version compatibility

## Health Check Endpoints

Two new endpoints help diagnose issues:

### Basic Health Check
```bash
curl http://localhost:3000/health
```
Response:
```json
{
  "status": "ok",
  "message": "Password Vault API is running"
}
```

### Database Health Check
```bash
curl http://localhost:3000/health/db
```
Response (healthy):
```json
{
  "status": "healthy",
  "database": "password_vault",
  "host": "localhost",
  "port": 3306,
  "timestamp": "2026-02-05T22:42:23.546Z"
}
```

Response (unhealthy):
```json
{
  "status": "unhealthy",
  "error": "Connection refused",
  "timestamp": "2026-02-05T22:42:23.546Z"
}
```

## Testing from Command Line

Use the provided test scripts:

```bash
# Test all endpoints including Swagger
bash /tmp/test-swagger.sh

# Test authentication specifically
bash /tmp/test-auth.sh http://localhost:3000

# Test production server
bash /tmp/test-auth.sh https://password-vault-wqj8.onrender.com
```

## Deployment Notes

### Render.com Deployment

The Swagger documentation is automatically available in production. No additional configuration needed.

**Important:** Ensure these environment variables are set in Render.com:
- JWT_SECRET
- ENCRYPTION_KEY (64 hex characters)
- All database variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
- Admin user variables (ADMIN_DEFAULT_USERNAME, ADMIN_DEFAULT_PASSWORD, ADMIN_DEFAULT_EMAIL)

### Security Considerations

- The Swagger UI is publicly accessible by default but requires JWT tokens for protected endpoints
- API documentation can be disabled in production by setting `ENABLE_API_DOCS=false` in environment variables
- In development mode, error responses include debug information
- In production mode, error details are hidden from clients but logged server-side
- Consider disabling API documentation in production environments for additional security

## Files Added/Modified

- `backend/src/config/swagger.js` - Swagger/OpenAPI configuration
- `backend/src/utils/api-docs.js` - Custom HTML documentation generator
- `backend/src/index.js` - Added Swagger routes and database health check
- `backend/src/controllers/authController.js` - Enhanced error logging with request IDs
- `backend/package.json` - Added swagger-ui-express and swagger-jsdoc dependencies

## Next Steps for Complete Documentation

To add detailed annotations to all endpoints, you can add JSDoc comments above route definitions. Example:

```javascript
/**
 * @swagger
 * /api/clients:
 *   get:
 *     tags: [Clients]
 *     summary: Get all clients
 *     ...
 */
router.get('/', getAllClients);
```

This is optional - the current setup provides basic documentation through the configuration file.
