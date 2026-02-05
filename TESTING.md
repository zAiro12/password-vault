# Testing Documentation - Password Vault Backend

This document describes the testing infrastructure for the Password Vault backend API.

## Overview

The backend includes comprehensive test coverage for all major features:
- **Authentication** - JWT token generation/verification, password hashing, validation
- **Client Management** - Full CRUD operations with validation and error handling

## Test Structure

### Test Files

```
backend/test/
├── auth-test.js          # Authentication unit tests (4 tests)
└── clients-test.js       # Client CRUD integration tests (13 tests)
```

### Running Tests

```bash
# Navigate to backend directory
cd backend

# Run all tests
npm test

# Run specific test suites
npm run test:auth       # Authentication tests only
npm run test:clients    # Client API tests only
```

## Test Suites

### 1. Authentication Tests (`auth-test.js`)

**Type:** Unit Tests  
**Tests:** 4  
**Dependencies:** None (standalone)

#### Test Coverage:
1. ✅ JWT Token Generation and Verification
2. ✅ Invalid JWT Token Handling
3. ✅ Password Hashing with bcrypt
4. ✅ Password Validation Rules

```bash
npm run test:auth
```

**Expected Output:**
```
============================================================
Authentication System - Unit Tests
============================================================

Test 1: JWT Token Generation and Verification
✓ All checks passed

Test 2: Invalid JWT Token Handling
✓ Invalid tokens properly rejected

Test 3: Password Hashing with bcrypt
✓ Password hashing and verification working

Test 4: Password Validation Rules
✓ Password validation rules enforced

============================================================
Passed: 4  Failed: 0  Total: 4
✓ All tests passed!
============================================================
```

### 2. Client CRUD Tests (`clients-test.js`)

**Type:** Integration Tests  
**Tests:** 13  
**Dependencies:** 
- Running MySQL database
- Database migrations executed
- Backend server running on port 3000

#### Test Coverage:

**Create Operations:**
1. ✅ Create client with valid data (POST /api/clients)
2. ✅ Create client with validation error - missing name (400)
3. ✅ Create client with invalid email format (400)
4. ✅ Create client without authentication (401)

**Read Operations:**
5. ✅ Get all clients with pagination (GET /api/clients)
6. ✅ Get client by ID (GET /api/clients/:id)
7. ✅ Get non-existent client (404)
8. ✅ Pagination validation and limits

**Update Operations:**
9. ✅ Update client with valid data (PUT /api/clients/:id)
10. ✅ Update client with no fields - validation error (400)
11. ✅ Update non-existent client (404)

**Delete Operations:**
12. ✅ Delete client - soft delete (DELETE /api/clients/:id)
13. ✅ Delete non-existent client (404)

```bash
npm run test:clients
```

## Prerequisites for Integration Tests

### 1. Database Setup

```bash
# Start MySQL
sudo service mysql start

# Create test database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS password_vault_test;"
```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
# Server Configuration
PORT=3000
NODE_ENV=test

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=password_vault_test
DB_CONNECTION_LIMIT=10

# JWT Configuration
JWT_SECRET=test-secret-key-for-tests
JWT_EXPIRES_IN=24h

# Encryption Configuration
ENCRYPTION_KEY=your-64-character-hex-key-here
```

### 3. Run Migrations

```bash
npm run migrate
```

### 4. Start Backend Server

```bash
# In one terminal
npm start

# In another terminal, run tests
npm run test:clients
```

## Test Data Management

### Automatic Cleanup
- Integration tests automatically create and clean up test data
- Test user is created with username `testuser_client_api`
- All test clients are deleted after tests complete
- Database transactions ensure data integrity

### Test Isolation
- Each test suite is independent
- Tests can run in any order
- No shared state between tests
- Proper setup and teardown for each test run

## Writing New Tests

### Adding Client API Tests

Follow the existing pattern in `clients-test.js`:

```javascript
/**
 * Test: Your new test
 */
async function testYourNewFeature() {
  console.log('Test X: Your Test Description');
  console.log('-'.repeat(60));
  
  try {
    // Make API request
    const response = await request('GET', '/api/clients', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    // Verify response
    if (response.status === 200) {
      console.log('✓ Test passed');
      passed++;
    } else {
      console.log('✗ Test failed');
      failed++;
    }
  } catch (error) {
    console.log('✗ Test failed:', error.message);
    failed++;
  }
  console.log();
}
```

### Helper Functions

**`request(method, path, body, headers)`** - Make HTTP requests
```javascript
const response = await request('POST', '/api/clients', {
  name: 'Test Client',
  email: 'test@example.com'
}, {
  'Authorization': `Bearer ${authToken}`
});
```

**`setupTestUser()`** - Create test user and auth token
```javascript
await setupTestUser();
// Now you have:
// - testUserId: ID of the test user
// - authToken: JWT token for authentication
```

**`cleanup()`** - Remove test data from database
```javascript
await cleanup();
// Removes all test clients and test user
```

## Continuous Integration

### GitHub Actions

Tests can be integrated into CI/CD pipelines:

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: password_vault_test
        ports:
          - 3306:3306
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Run migrations
        run: |
          cd backend
          npm run migrate
        env:
          DB_HOST: localhost
          DB_USER: root
          DB_PASSWORD: root
          DB_NAME: password_vault_test
      
      - name: Start server
        run: |
          cd backend
          npm start &
          sleep 5
      
      - name: Run tests
        run: |
          cd backend
          npm test
```

## Troubleshooting

### Common Issues

**1. "Connection refused" errors**
- Ensure MySQL is running: `sudo service mysql start`
- Check database credentials in `.env`
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

**2. "Table doesn't exist" errors**
- Run migrations: `npm run migrate`
- Check migration status in `migrations` table

**3. "401 Unauthorized" errors**
- Check if authentication token is being generated
- Verify JWT_SECRET is set in `.env`
- Ensure auth middleware is working

**4. Tests fail intermittently**
- Check if server is fully started before running tests
- Increase wait time in test setup
- Verify no port conflicts (port 3000)

**5. Database cleanup issues**
- Manually clean test data:
  ```sql
  DELETE FROM clients WHERE created_by IN (
    SELECT id FROM users WHERE username = 'testuser_client_api'
  );
  DELETE FROM users WHERE username = 'testuser_client_api';
  ```

## Test Coverage Summary

| Feature | Tests | Status |
|---------|-------|--------|
| Authentication | 4 | ✅ Passing |
| Client CRUD | 13 | ✅ Passing |
| **Total** | **17** | **✅ 100%** |

## Future Test Additions

Planned test coverage for upcoming features:
- [ ] Resource CRUD API tests
- [ ] Credential encryption/decryption tests
- [ ] Audit log tests
- [ ] User permissions tests
- [ ] End-to-end integration tests
- [ ] Performance and load tests

## Best Practices

1. **Always clean up test data** - Use cleanup functions
2. **Test both success and failure cases** - Cover error scenarios
3. **Use meaningful test names** - Describe what is being tested
4. **Keep tests independent** - No dependencies between tests
5. **Validate response structure** - Check both status and data
6. **Test authentication** - Verify protected endpoints
7. **Test validation** - Check input validation rules
8. **Document test prerequisites** - List required setup steps

## Resources

- [Express.js Testing Guide](https://expressjs.com/en/guide/testing.html)
- [Node.js Testing Best Practices](https://github.com/goldbergyoni/nodebestpractices#-8-testing-best-practices)
- [MySQL Test Database Setup](https://dev.mysql.com/doc/refman/8.0/en/testing.html)

---

For questions or issues with tests, please refer to the main README.md or open an issue on GitHub.
