# Admin Panel Setup Guide

This guide explains how to create an admin user and configure the admin panel to work with the distributor-api.

## 🔧 Prerequisites

1. **Database Setup**: Ensure your PostgreSQL database is running and properly configured
2. **API Setup**: The distributor-api should be running on `http://localhost:3000`
3. **Environment**: Node.js and npm/yarn installed

## 🚀 Creating an Admin User

### Step 1: Navigate to the distributor-api directory
```bash
cd distributor-api
```

### Step 2: Install dependencies (if not already done)
```bash
npm install
```

### Step 3: Run the admin creation script
```bash
npm run create-admin
```

The script will prompt you for the following information:
- **Full Name**: Admin user's full name
- **Email**: Valid email address (must be unique)
- **Username**: Unique username (3+ characters, alphanumeric + underscore)
- **Password**: Strong password (8+ characters, mixed case, number)
- **Address**: User's address
- **Department**: Department (default: Management)
- **Position**: Position (default: Admin)

### Example Usage:
```bash
$ npm run create-admin

=== Admin User Creation Script ===

This script will create an admin user with MANAGERIAL role for accessing the admin panel.

Enter full name: John Administrator
Enter email address: admin@company.com
Enter username (3+ characters, alphanumeric + underscore): admin
Enter password (8+ chars, mixed case, number): ********
Confirm password: ********
Enter address: Kathmandu, Nepal
Enter department (default: Management): Management
Enter position (default: Admin): System Administrator

Creating admin user...

✅ Admin user created successfully!

User Details:
- ID: clxxxxx...
- Full Name: John Administrator
- Email: admin@company.com
- Username: admin
- Role: MANAGERIAL
- Department: Management
- Position: System Administrator
- Status: Active
- Created: 12/8/2024, 10:30:00 AM

🔐 Admin Panel Access:
- URL: http://localhost:3001 (or your admin panel URL)
- Email: admin@company.com
- Password: [The password you just entered]

📝 Notes:
- This user has MANAGERIAL role and can access the admin panel
- Make sure the admin panel is configured to use the distributor-api for authentication
- The password is securely hashed and stored in the database
```

## 🔐 Admin Panel Configuration

### Step 1: Configure API URL
The admin panel will automatically connect to the API at `http://localhost:3000/api`. If your API is running on a different URL, create a `.env.local` file in the admin-panel directory:

```bash
# admin-panel/.env.local
NEXT_PUBLIC_API_URL=http://your-api-url:port/api
```

### Step 2: Start the admin panel
```bash
cd admin-panel
npm install
npm run dev
```

The admin panel will be available at `http://localhost:3001`

### Step 3: Login with your admin credentials
Use the email and password you created with the script to log into the admin panel.

## 🛡️ Security Features

### Authentication Flow
1. **Secure Login**: Uses the distributor-api authentication endpoint
2. **JWT Tokens**: Stores JWT tokens for session management
3. **Role-based Access**: Only users with ADMIN, MANAGERIAL, or SALES_MANAGER roles can access the panel
4. **Token Validation**: Automatically validates and refreshes tokens
5. **Secure Logout**: Properly clears tokens and session data

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Strong password requirements enforced
- No plain text passwords stored

### Session Management
- JWT tokens with expiration
- Automatic token refresh
- Session persistence across browser sessions
- Secure token storage

## 🔄 Updating Admin Users

To update an admin user's information, you can:

1. **Through the API**: Use the profile update endpoints
2. **Direct Database**: Update using Prisma studio or SQL
3. **Create New**: Run the script again with a different email/username

## 🐛 Troubleshooting

### Common Issues:

1. **"User already exists" error**
   - Use a different email or username
   - Check if the user was created previously

2. **"Network error" when logging in**
   - Ensure the distributor-api is running
   - Check the API URL configuration
   - Verify database connectivity

3. **"Access denied" error**
   - Ensure the user has MANAGERIAL, ADMIN, or SALES_MANAGER role
   - Check user is active in the database

4. **Script execution errors**
   - Ensure all dependencies are installed
   - Check database connection
   - Verify environment variables

### Database Check:
```sql
-- Check if user was created
SELECT id, email, username, "fullName", role, "isActive" 
FROM users 
WHERE email = 'your-email@company.com';
```

## 📋 Environment Variables

### Distributor API
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/database"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
```

### Admin Panel
```bash
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

## 🔗 API Endpoints Used

- `POST /api/auth/login` - User authentication
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh JWT token

## 📞 Support

If you encounter any issues:
1. Check the logs in both distributor-api and admin-panel
2. Verify database connectivity
3. Ensure all services are running
4. Check environment variables

For additional help, refer to the individual README files in the distributor-api and admin-panel directories.


