# User Registration Approval Workflow

## Overview

This implementation adds an admin approval workflow for user registration. New users can register themselves, but their accounts remain inactive until an admin approves them.

## Key Changes

### Database Schema

Added new fields to the `users` table:
- `is_verified` (BOOLEAN): Indicates if a user has been approved by an admin
- `approved_by` (INT): ID of the admin who approved the user
- `approved_at` (TIMESTAMP): When the user was approved

Migration file: `database/migrations/006_add_user_verification.sql`

### Backend API Changes

#### Modified Endpoints

**POST /api/auth/register**
- Users can now only register as `technician` or `viewer` (not `admin`)
- New users are created with `is_active=false` and `is_verified=false`
- No JWT token is returned (user cannot login until approved)
- Returns success message about pending approval

**POST /api/auth/login**
- Now checks both `is_active` and `is_verified` status
- Returns appropriate error if user is not verified or inactive

#### New Endpoints (Admin Only)

**GET /api/users/pending**
- Lists all users pending approval
- Requires admin authentication

**GET /api/users**
- Lists all users with their status
- Requires admin authentication

**POST /api/users**
- Admins can create new users directly (including admins)
- Created users are automatically active and verified
- Requires admin authentication

**PUT /api/users/:id/approve**
- Approves a pending user
- Sets `is_active=true` and `is_verified=true`
- Records who approved and when
- Requires admin authentication

**DELETE /api/users/:id/reject**
- Rejects and deletes a pending user registration
- Only works on unverified users
- Requires admin authentication

**PUT /api/users/:id/deactivate**
- Deactivates an active user
- Cannot deactivate yourself
- Requires admin authentication

**PUT /api/users/:id/reactivate**
- Reactivates an inactive verified user
- Requires admin authentication

### Frontend Changes

**Register Page (`/register`)**
- Shows success message after registration
- Redirects to login page instead of auto-login
- Informs user their account is pending approval

**User Management Page (`/users`)** (Admin Only)
- Shows pending user approvals
- Displays all users with their status
- Allows admins to:
  - Approve pending users
  - Reject pending users
  - Create new users directly
  - Deactivate/reactivate users

**Dashboard**
- Added "User Management" button (visible only to admins)
- Links to the user management page

**Router**
- Added `/users` route with admin-only access
- Enhanced navigation guard to check admin role

## User Workflow

### Normal User Registration Flow

1. User visits `/register` and creates an account
2. User sees: "Registration successful! Your account is pending approval..."
3. User is redirected to `/login`
4. If user tries to login, they see: "User account is pending approval by an administrator"
5. Admin approves the user via `/users` page
6. User can now successfully login

### Admin Creating User Flow

1. Admin logs in and clicks "User Management"
2. Admin clicks "Create User" button
3. Admin fills in user details (can select any role including admin)
4. User is created as active and verified
5. User can login immediately with provided credentials

## Security Considerations

1. **Role Validation**: Self-registration only allows `technician` and `viewer` roles
2. **Admin Protection**: Admins cannot deactivate themselves
3. **Verified Status**: Both login and authentication middleware check `is_verified`
4. **Authorization**: All user management endpoints require admin role
5. **Audit Trail**: System tracks who approved each user and when

## Migration Instructions

1. Run the migration to add new fields:
   ```bash
   cd backend
   npm run migrate
   ```

2. Ensure the seed script runs to update the default admin:
   ```bash
   npm run seed
   ```

3. The default admin user will be automatically verified and active

## Testing Checklist

- [ ] New user can register successfully
- [ ] New user cannot login before approval
- [ ] Login shows appropriate error message for unverified users
- [ ] Admin can see pending users in User Management
- [ ] Admin can approve pending users
- [ ] Approved users can login successfully
- [ ] Admin can reject pending users
- [ ] Admin can create users directly (including admins)
- [ ] Admin-created users can login immediately
- [ ] Admin can deactivate users
- [ ] Admin can reactivate users
- [ ] Admin cannot deactivate themselves
- [ ] Non-admin users cannot access user management endpoints
- [ ] Non-admin users cannot access user management page

## API Examples

### Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "Password123!",
    "full_name": "New User"
  }'
```

### Admin approves user
```bash
curl -X PUT http://localhost:3000/api/users/1/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Admin creates user directly
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "techuser",
    "email": "tech@example.com",
    "password": "Password123!",
    "full_name": "Tech User",
    "role": "technician"
  }'
```
