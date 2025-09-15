# Distributor Application API

A professional TypeScript backend API for managing distributor applications with comprehensive validation, authentication, and approval workflow.

## 🚀 Features

- **TypeScript**: Full type safety and modern JavaScript features
- **Express.js**: Fast and minimal web framework
- **Prisma ORM**: Type-safe database access with PostgreSQL
- **Zod Validation**: Comprehensive schema validation for all inputs
- **JWT Authentication**: Secure user authentication and authorization
- **Role-based Access Control**: Different permissions for Admin, Sales Manager, and Sales Representative
- **File Upload**: Secure document upload with validation
- **Rate Limiting**: Protection against abuse and spam
- **Email Notifications**: Automated email notifications for application status updates
- **Comprehensive Logging**: Detailed logging for monitoring and debugging
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **API Documentation**: Well-structured API endpoints with clear responses

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd distributor-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/distributor_db?schema=public"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="7d"
   
   # Server
   PORT=3001
   NODE_ENV="development"
   
   # File Upload
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH="./uploads"
   
   # CORS
   FRONTEND_URL="http://localhost:3000"
   ADMIN_PANEL_URL="http://localhost:3002"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Or run migrations (recommended for production)
   npm run db:migrate
   ```

5. **Build the application**
   ```bash
   npm run build
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3001`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Distributor Applications
- `POST /api/applications/submit` - Submit new application
- `GET /api/applications` - Get all applications (with filtering and pagination)
- `GET /api/applications/:id` - Get application by ID
- `PUT /api/applications/:id/status` - Update application status
- `DELETE /api/applications/:id` - Delete application
- `GET /api/applications/stats` - Get application statistics

### System
- `GET /api/health` - Health check endpoint
- `GET /api` - API information

## 🔐 Authentication & Authorization

The API uses JWT-based authentication with role-based access control:

### User Roles
- **ADMIN**: Full access to all features
- **SALES_MANAGER**: Can manage all applications and users
- **SALES_REPRESENTATIVE**: Can view and update assigned applications
- **DISTRIBUTOR**: Limited access (future use)

### Protected Routes
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📝 Data Validation

All API endpoints use Zod schemas for comprehensive data validation:

- **Input Sanitization**: Automatic trimming and cleaning of input data
- **Type Validation**: Strict type checking for all fields
- **Business Rules**: Custom validation rules for business logic
- **Error Messages**: Detailed error messages in Nepali and English

## 📁 File Upload

The API supports secure file upload for application documents:

- **Supported Files**: Images (JPEG, PNG) and PDFs
- **Size Limit**: 5MB per file
- **Storage**: Local file system with organized directory structure
- **Validation**: File type and size validation
- **Security**: Sanitized file names and secure storage

## 🔒 Security Features

- **Helmet**: Security headers for protection against common vulnerabilities
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Protection against brute force and spam attacks
- **Input Validation**: Comprehensive validation and sanitization
- **SQL Injection Protection**: Prisma ORM provides built-in protection
- **Password Hashing**: Bcrypt with salt rounds for secure password storage

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **User**: System users with role-based access
- **DistributorApplication**: Main application entity with all form data
- **CurrentTransaction**: Related transactions data
- **ProductToDistribute**: Products the distributor wants to handle
- **AreaCoverageDetail**: Coverage area information
- **ApplicationStatusHistory**: Audit trail for status changes

## 🚦 Error Handling

Comprehensive error handling with:

- **Centralized Error Handler**: Single point for error processing
- **HTTP Status Codes**: Proper status codes for different error types
- **Detailed Error Messages**: Clear error messages in both languages
- **Logging**: All errors are logged with context information
- **Graceful Degradation**: Proper fallback mechanisms

## 📈 Monitoring & Logging

- **Request Logging**: All HTTP requests are logged with details
- **Error Logging**: Comprehensive error logging with stack traces
- **Database Logging**: Database query logging in development
- **Performance Monitoring**: Response time tracking
- **Health Checks**: Database and system health monitoring

## 🔄 Development Workflow

### Available Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start           # Start production server
npm run db:generate # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:migrate  # Run database migrations
npm run db:studio   # Open Prisma Studio
```

### Code Structure
```
src/
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/         # API route definitions
├── schemas/        # Zod validation schemas
├── services/       # Business logic services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## 🧪 Testing

The application includes comprehensive error handling and validation. For testing:

1. Use the health check endpoint: `GET /api/health`
2. Test authentication with the register/login endpoints
3. Submit test applications through the API
4. Monitor logs for any issues

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set secure JWT secret
- [ ] Configure SMTP for email notifications
- [ ] Set up reverse proxy (nginx/Apache)
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Environment Variables
Ensure all required environment variables are set in production:
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV`
- `PORT`
- SMTP configuration (optional)

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use proper error handling
3. Add comprehensive validation
4. Include proper logging
5. Write clear documentation
6. Test thoroughly before submitting

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api`
- Review the health check at `/api/health`
- Check application logs for detailed error information
- Ensure all environment variables are properly configured

---

**Built with ❤️ using TypeScript, Express.js, Prisma, and modern web technologies.**
