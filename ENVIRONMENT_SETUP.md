# Environment Configuration Setup

This document explains how to configure environment variables for the Analytics project.

## Required Environment Variables

### For Distributor Portal (`distributor/`)

Create a `.env.local` file in the `distributor/` directory with the following variables:

```bash
# Backend API base URL (without trailing slash)
# For development: http://localhost:5000/api
# For production: https://your-api-domain.com/api
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Application Configuration
NEXT_PUBLIC_APP_NAME=Distributor Portal
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### For Admin Panel (`admin-panel/`)

Create a `.env.local` file in the `admin-panel/` directory with the following variables:

```bash
# Backend API base URL (without trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Application Configuration
NEXT_PUBLIC_APP_NAME=Admin Panel
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### For Distributor Panel (`distributor-panel/`)

Create a `.env.local` file in the `distributor-panel/` directory with the following variables:

```bash
# Backend API base URL (without trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Application Configuration
NEXT_PUBLIC_APP_NAME=Distributor Panel
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### For Backend API (`distributor-api/`)

Create a `.env` file in the `distributor-api/` directory with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/analytics_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration (Mailjet)
MAILJET_API_KEY=your-mailjet-api-key
MAILJET_SECRET_KEY=your-mailjet-secret-key
MAILJET_FROM_EMAIL=noreply@yourdomain.com

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Environment-Specific Configurations

### Development Environment
- Use `http://localhost:5000/api` for all API URLs
- Set `NODE_ENV=development`
- Enable debug logging if needed

### Production Environment
- Use your production API domain: `https://your-api-domain.com/api`
- Set `NODE_ENV=production`
- Use secure JWT secrets
- Configure proper CORS settings

### Staging Environment
- Use your staging API domain: `https://staging-api-domain.com/api`
- Set `NODE_ENV=staging`
- Use different database if needed

## How to Use

1. Copy the appropriate configuration to your `.env.local` or `.env` file
2. Update the values according to your environment
3. Restart your development server
4. The application will automatically use the configured API URLs

## API URL Structure

All API calls now use the `NEXT_PUBLIC_API_URL` environment variable with the following pattern:

```
${NEXT_PUBLIC_API_URL}/endpoint
```

Examples:
- `${NEXT_PUBLIC_API_URL}/applications` → `http://localhost:5000/api/applications`
- `${NEXT_PUBLIC_API_URL}/auth/login` → `http://localhost:5000/api/auth/login`
- `${NEXT_PUBLIC_API_URL}/categories` → `http://localhost:5000/api/categories`

## Troubleshooting

1. **API calls failing**: Check that `NEXT_PUBLIC_API_URL` is correctly set
2. **CORS errors**: Ensure your backend API has proper CORS configuration
3. **Environment not loading**: Make sure the `.env.local` file is in the correct directory
4. **Build issues**: Environment variables must be prefixed with `NEXT_PUBLIC_` for client-side access
