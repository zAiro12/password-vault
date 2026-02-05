# Authentication System Documentation

## Overview
This document describes the complete authentication system implemented for the Password Vault application.

## Architecture

### Backend (Node.js + Express)

#### 1. JWT Token Management (`backend/src/utils/jwt.js`)
- **generateToken(payload)**: Creates JWT tokens with 24h expiration
- **verifyToken(token)**: Validates and decodes JWT tokens
- Token payload includes: `userId`, `email`, `username`, `role`
- Uses `JWT_SECRET` from environment variables

#### 2. Authentication Middleware (`backend/src/middleware/auth.js`)
- **authenticateToken**: Protects routes by verifying JWT from `Authorization: Bearer <token>` header
- **optionalAuth**: Adds user data if token present, doesn't fail if missing
- **requireRole(...roles)**: Enforces role-based access control

#### 3. Auth Controller (`backend/src/controllers/authController.js`)
Handles all authentication business logic:

**POST /api/auth/register**
- Validates email format and password strength
- Requirements: 8+ characters, 1 number, 1 uppercase letter
- Checks for duplicate email/username
- Hashes password with bcrypt (10 rounds)
- Creates user with 'technician' role
- Returns JWT token + user data (without password)

**POST /api/auth/login**
- Validates email and password
- Checks if user account is active
- Verifies password with bcrypt
- Generates JWT token
- Returns token + user data (without password)

**GET /api/auth/me** (Protected)
- Requires valid JWT token
- Returns current user's data from database
- Never returns password hash

**POST /api/auth/logout**
- Placeholder for token blacklisting (future enhancement)
- Client-side logout clears token from localStorage

### Frontend (Vue 3 + Pinia)

#### 1. Axios Plugin (`frontend/src/plugins/axios.js`)
- Configures base URL from environment
- **Request Interceptor**: Automatically adds JWT token to all requests
- **Response Interceptor**: Handles 401 errors by clearing auth and redirecting to login

#### 2. Auth Store (`frontend/src/stores/auth.js`)
Pinia store managing authentication state:

**State**
- `user`: Current user object
- `token`: JWT token
- `isAuthenticated`: Boolean flag
- `loading`: Request in progress
- `error`: Last error message

**Actions**
- `initAuth()`: Restores auth from localStorage on app start
- `login(credentials)`: Authenticates user
- `register(userData)`: Registers new user
- `fetchUser()`: Refreshes user data from API
- `logout()`: Clears auth state and localStorage

**Getters**
- `currentUser`: Returns user object
- `isLoggedIn`: Returns authentication status
- `userRole`: Returns user's role

#### 3. Router Guards (`frontend/src/router/index.js`)
- Routes with `meta: { requiresAuth: true }` redirect to /login if not authenticated
- Routes with `meta: { requiresGuest: true }` redirect to /dashboard if authenticated
- Protected routes: `/dashboard`, `/client/:id`
- Guest routes: `/login`, `/register`

#### 4. Views

**LoginView.vue**
- Email + password form
- Client-side validation
- Error display
- Link to registration
- Redirects to dashboard on success

**Register.vue**
- Username + email + password + confirm password
- Client-side validation (password match, strength, email format)
- Auto-login after registration
- Link to login page

**DashboardView.vue**
- Displays user dashboard
- Logout button that uses auth store

#### 5. Components

**LogoutButton.vue**
- Reusable logout button
- Calls auth store logout
- Redirects to login page

## Security Features

### Password Security
- **Hashing**: bcrypt with 10 rounds
- **Validation**: Minimum 8 characters, 1 number, 1 uppercase letter
- **Storage**: Never returns password hashes in API responses

### JWT Security
- **Secret**: Uses environment variable `JWT_SECRET`
- **Expiration**: 24 hours (configurable via `JWT_EXPIRES_IN`)
- **Verification**: All protected endpoints verify token signature
- **Storage**: Client stores in localStorage (can be upgraded to httpOnly cookies)

### API Security
- **CORS**: Configured allowed origins
- **Token Required**: Protected endpoints reject requests without valid token
- **Role-based Access**: Middleware supports role checking
- **Active Users Only**: Login checks `is_active` flag

## Environment Variables

### Backend (.env)
```env
JWT_SECRET=<64-char-hex-string>          # Required for JWT signing
JWT_EXPIRES_IN=24h                       # Token expiration time
BCRYPT_ROUNDS=10                         # bcrypt salt rounds
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000  # Backend API URL
```

## API Endpoints

### Public Endpoints
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and get token

### Protected Endpoints
- `GET /api/auth/me` - Get current user data
- `POST /api/auth/logout` - Logout (optional endpoint)

## Usage Examples

### Backend - Protecting a Route
```javascript
import { authenticateToken, requireRole } from './middleware/auth.js';

// Require authentication
router.get('/protected', authenticateToken, (req, res) => {
  const user = req.user; // Access decoded token
  res.json({ message: 'Protected data' });
});

// Require specific role
router.delete('/admin-only', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});
```

### Frontend - Using Auth Store
```vue
<script setup>
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Login
const handleLogin = async () => {
  const result = await authStore.login({ email, password });
  if (result.success) {
    router.push('/dashboard');
  }
};

// Check if logged in
const isLoggedIn = authStore.isLoggedIn;
const currentUser = authStore.currentUser;
</script>
```

### Frontend - API Calls with Auth
```javascript
import api from '@/plugins/axios';

// Token automatically added by interceptor
const response = await api.get('/api/protected-endpoint');
```

## Testing

### Unit Tests
Run backend unit tests:
```bash
cd backend
node test/auth-test.js
```

Tests cover:
- JWT token generation and verification
- Invalid token handling
- Password hashing with bcrypt
- Password validation rules

### Manual Testing Checklist
- [ ] Register new user with valid data
- [ ] Register fails with weak password
- [ ] Register fails with duplicate email
- [ ] Login with valid credentials
- [ ] Login fails with invalid credentials
- [ ] Login fails for inactive account
- [ ] Protected endpoint requires token
- [ ] Protected endpoint works with valid token
- [ ] Expired token redirects to login
- [ ] Logout clears authentication
- [ ] Page refresh maintains authentication

## Security Considerations

### Current Implementation
- **Password Hashing**: bcrypt with 10 rounds
- **JWT Secret**: Requires strong secret from environment
- **Token Expiration**: 24 hours by default
- **Active User Check**: Login verifies account is active
- **No Password Exposure**: API responses never include password hashes

### Known Security Limitations

⚠️ **Rate Limiting Not Implemented**: Authentication endpoints do not have rate limiting, making them vulnerable to brute force attacks. This should be implemented before production deployment.

**Recommendation**: Add rate limiting middleware using packages like `express-rate-limit`:
```javascript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
```

## Database Schema

The `users` table already includes all required fields:
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role ENUM('admin', 'technician', 'viewer') DEFAULT 'technician',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Future Enhancements

1. **Rate Limiting**: ⚠️ **PRIORITY** - Add rate limiting to prevent brute force attacks (see Security Considerations)
2. **Token Blacklist**: Implement server-side token revocation using Redis
3. **Refresh Tokens**: Add refresh token mechanism for better UX
4. **Multi-factor Authentication**: Add 2FA support
5. **Session Management**: Track active sessions in database
6. **Password Reset**: Email-based password recovery
7. **Account Lockout**: Lock accounts after failed login attempts
8. **HTTP-Only Cookies**: Store tokens in secure cookies instead of localStorage
9. **Remember Me**: Longer-lived tokens for trusted devices
10. **OAuth Integration**: Support for Google/GitHub login

## Troubleshooting

### "Access denied. No token provided"
- Ensure token is being sent in Authorization header
- Check that token is stored in localStorage after login

### "Invalid or expired token"
- Token may have expired (24h default)
- Token secret may have changed
- User needs to login again

### Frontend not persisting auth after refresh
- Check that `authStore.initAuth()` is called in main.js
- Verify localStorage has `auth_token` and `auth_user`

### CORS errors
- Check `CORS_ORIGINS` in backend .env
- Ensure frontend URL is in allowed origins list
