# Distributor Creation & Login Testing Scripts

This directory contains scripts to create an approved distributor with credentials and test the distributor panel login.

## 📋 Scripts

### 1. `create-approved-distributor.js`
Creates a complete approved distributor with credentials.

**What it does:**
- ✅ Creates a distributor application with sample data
- ✅ Approves the application 
- ✅ Creates distributor user account with credentials
- ✅ Tests login with created credentials
- ✅ Creates sample categories (if needed)

**Usage:**
```bash
node create-approved-distributor.js
```

### 2. `test-distributor-login.js`
Tests distributor panel login and functionality.

**What it does:**
- ✅ Tests login with distributor credentials
- ✅ Accesses user profile
- ✅ Tests data access (products, categories, orders)
- ✅ Tests logout functionality

**Usage:**
```bash
node test-distributor-login.js
```

## 🔧 Prerequisites

1. **Start the Distributor API:**
   ```bash
   cd distributor-api
   npm run dev
   ```

2. **Ensure API is running on:** `http://localhost:4444`

3. **Database should be accessible** (Prisma/MongoDB)

## 📝 Test Credentials

The script creates a distributor with these credentials:
- **Email:** `test.distributor@example.com`
- **Username:** `testdistributor`  
- **Password:** `Test123456!`

## 🚀 Quick Start

1. **Start API server** (in one terminal):
   ```bash
   cd distributor-api
   npm run dev
   ```

2. **Create distributor** (in another terminal):
   ```bash
   node create-approved-distributor.js
   ```

3. **Test login** (in another terminal):
   ```bash
   node test-distributor-login.js
   ```

## 📱 Testing in Distributor Panel

Use the created credentials to login to distributor panel:
- URL: `http://localhost:3001` (or where distributor-panel runs)
- Email: `test.distributor@example.com`
- Password: `Test123456!`

## 🛠️ API Endpoints Tested

### Authentication
- `POST /api/auth/login` - Distributor login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - User profile

### Applications
- `POST /api/applications/submit` - Submit application
- `PUT /api/applications/dev/:id/status` - Approve application

### Distributors
- `POST /api/distributors/:id/credentials` - Create credentials

### Data Access
- `GET /api/products` - Get products
- `GET /api/categories` - Get categories  
- `GET /api/orders` - Get orders

## 🐛 Troubleshooting

### API Connection Issues
```bash
# Check if API is running
curl http://localhost:4444/api/health

# Expected response
{
  "success": true,
  "message": "API स्वस्थ छ",
  "data": { ... }
}
```

### Login Issues
1. **Check if distributor was created**
   ```bash
   node test-distributor-login.js
   ```

2. **Verify database connection**
   - Check Prisma configuration
   - Ensure database server is running

3. **Check API logs**
   ```bash
   cd distributor-api
   tail -f server.log
   ```

### CORS Issues
If you get CORS errors, ensure distributor-panel URL is in CORS config:
- Check `distributor-api/src/index.ts` CORS origins
- Add distributor-panel URL if needed

## 📊 Test Data Created

The script creates realistic test data:

### Distributor Info
- **Name:** Test Approved Distributor
- **Company:** Test Distribution Company
- **Business Type:** Private Limited
- **Location:** Kathmandu, Nepal

### Products
- Smartphones (1000+ units/month)
- Laptops (500+ units/month)  
- Accessories (2000+ units/month)

### Coverage Areas
- Kathmandu (1M+ population)
- Lalitpur (500K+ population)
- Bhaktapur (300K+ population)

## 🔄 Reset Testing

To clean up and start fresh:

1. **Delete test distributor** (via admin panel or database)
2. **Clear browser cache/cookies**
3. **Run scripts again**

## 📝 Notes

- These scripts use `/dev` endpoints for testing (no auth required)
- In production, use proper authenticated endpoints
- Always change default passwords in production
- Scripts include comprehensive error handling and logging