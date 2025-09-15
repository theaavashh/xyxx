# API Testing Guide

This guide provides examples for testing the Distributor Application API endpoints.

## 🚀 Getting Started

1. **Start the server**
   ```bash
   npm run dev
   ```

2. **Create environment file**
   ```bash
   cp env.example .env
   # Update DATABASE_URL and other settings
   ```

3. **Setup database**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

## 🔐 Authentication

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "confirmPassword": "Test123!",
    "role": "SALES_REPRESENTATIVE",
    "department": "Sales",
    "phoneNumber": "9800000003"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@distributor.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "सफलतापूर्वक लगइन भयो",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@distributor.com",
      "fullName": "System Administrator",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 📋 Application Management

### Submit Application
```bash
curl -X POST http://localhost:3001/api/applications/submit \
  -H "Content-Type: application/json" \
  -d '{
    "personalDetails": {
      "fullName": "राम बहादुर श्रेष्ठ",
      "age": 35,
      "gender": "पुरुष",
      "citizenshipNumber": "12-34-56-78901",
      "issuedDistrict": "काठमाडौं",
      "mobileNumber": "9841234567",
      "email": "ram@example.com",
      "permanentAddress": "काठमाडौं, नेपाल"
    },
    "businessDetails": {
      "companyName": "श्रेष्ठ ट्रेडिंग",
      "registrationNumber": "REG123456",
      "panVatNumber": "123456789",
      "officeAddress": "काठमाडौं, नेपाल",
      "operatingArea": "काठमाडौं उपत्यका",
      "desiredDistributorArea": "काठमाडौं जिल्ला",
      "currentBusiness": "खुद्रा व्यापार",
      "businessType": "निजी कम्पनी"
    },
    "staffInfrastructure": {
      "salesManCount": 2,
      "salesManExperience": "५ वर्ष",
      "deliveryStaffCount": 1,
      "deliveryStaffExperience": "३ वर्ष",
      "accountAssistantCount": 1,
      "accountAssistantExperience": "२ वर्ष",
      "otherStaffCount": 0,
      "warehouseSpace": 500,
      "warehouseExperience": "गोदाम व्यवस्थापनमा ५ वर्ष",
      "truckCount": 0,
      "fourWheelerCount": 1,
      "fourWheelerExperience": "डेलिभरीमा ३ वर्ष",
      "twoWheelerCount": 2,
      "twoWheelerExperience": "डेलिभरीमा २ वर्ष",
      "cycleCount": 0,
      "thelaCount": 0
    },
    "currentTransactions": [
      {
        "company": "ABC कम्पनी",
        "products": "खाद्य सामग्री",
        "turnover": "५ लाख मासिक"
      }
    ],
    "businessInformation": {
      "productCategory": "उपभोग्य सामग्री",
      "yearsInBusiness": 5,
      "monthlySales": "१० लाख",
      "storageFacility": "आधुनिक गोदाम सुविधा"
    },
    "productsToDistribute": [
      {
        "productName": "दैनिक उपभोग्य सामग्री",
        "monthlySalesCapacity": "२ लाख"
      }
    ],
    "retailerRequirements": {
      "preferredProducts": "खाद्य सामग्री",
      "monthlyOrderQuantity": "१ लाख",
      "paymentPreference": "नगद",
      "creditDays": 15,
      "deliveryPreference": "दैनिक"
    },
    "areaCoverageDetails": [
      {
        "distributionArea": "काठमाडौं केन्द्र",
        "populationEstimate": "५०,०००",
        "competitorBrand": "XYZ ब्रान्ड"
      }
    ],
    "declaration": {
      "declaration": true,
      "signature": "राम बहादुर श्रेष्ठ",
      "date": "2024-01-15"
    }
  }'
```

### Get All Applications (Protected)
```bash
curl -X GET "http://localhost:3001/api/applications?page=1&limit=10&status=PENDING" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Application by ID (Protected)
```bash
curl -X GET http://localhost:3001/api/applications/APPLICATION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Application Status (Protected)
```bash
curl -X PUT http://localhost:3001/api/applications/APPLICATION_ID/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "reviewNotes": "सबै कागजातहरू सही छन्। आवेदन स्वीकृत गरिएको छ।",
    "reviewedBy": "Sales Manager"
  }'
```

### Get Application Statistics (Protected)
```bash
curl -X GET http://localhost:3001/api/applications/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🏥 Health Check

### API Health
```bash
curl -X GET http://localhost:3001/api/health
```

**Response:**
```json
{
  "success": true,
  "message": "API स्वस्थ छ",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": 3600,
    "database": "connected",
    "environment": "development"
  }
}
```

## 📁 File Upload Testing

### Upload Documents with Application
```bash
curl -X POST http://localhost:3001/api/applications/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "citizenshipId=@/path/to/citizenship.pdf" \
  -F "companyRegistration=@/path/to/registration.pdf" \
  -F "panVatRegistration=@/path/to/pan.pdf" \
  -F "officePhoto=@/path/to/office.jpg" \
  -F "areaMap=@/path/to/map.jpg" \
  -F 'data={
    "personalDetails": {...},
    "businessDetails": {...},
    ...
  }'
```

## 🔍 Query Parameters

### Applications Filtering
```bash
# Filter by status
curl -X GET "http://localhost:3001/api/applications?status=PENDING" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search applications
curl -X GET "http://localhost:3001/api/applications?search=राम" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Date range filter
curl -X GET "http://localhost:3001/api/applications?dateFrom=2024-01-01&dateTo=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Pagination
curl -X GET "http://localhost:3001/api/applications?page=2&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Sorting
curl -X GET "http://localhost:3001/api/applications?sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ⚠️ Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "प्रविष्ट गरिएको डाटा सही छैन",
  "error": "Validation failed",
  "errors": {
    "personalDetails.fullName": ["पूरा नाम कम्तिमा २ अक्षरको हुनुपर्छ"],
    "personalDetails.age": ["उमेर कम्तिमा १८ वर्ष हुनुपर्छ"]
  }
}
```

### Authentication Error
```json
{
  "success": false,
  "message": "अवैध टोकन",
  "error": "Authentication failed"
}
```

### Authorization Error
```json
{
  "success": false,
  "message": "यो कार्य गर्न अनुमति छैन",
  "error": "Insufficient permissions"
}
```

### Rate Limit Error
```json
{
  "success": false,
  "message": "धेरै अनुरोधहरू पठाइएको छ। केही समय पछि प्रयास गर्नुहोस्।",
  "error": "TOO_MANY_REQUESTS"
}
```

## 🧪 Testing Workflow

1. **Start the API server**
2. **Register/Login to get JWT token**
3. **Submit test applications**
4. **Test application retrieval and filtering**
5. **Test status updates**
6. **Test file uploads**
7. **Verify error handling**

## 📊 Default Users (After Seeding)

- **Admin**: `admin@distributor.com` / `admin123`
- **Sales Manager**: `sales.manager@distributor.com` / `manager123`
- **Sales Rep**: `sales.rep@distributor.com` / `sales123`

## 🔧 Environment Variables for Testing

```env
DATABASE_URL="postgresql://username:password@localhost:5432/distributor_test_db"
JWT_SECRET="test-secret-key"
NODE_ENV="development"
PORT=3001
```

## 📝 Notes

- All protected endpoints require `Authorization: Bearer <token>` header
- File uploads support PDF, JPEG, and PNG formats (max 5MB)
- Rate limiting is applied to prevent abuse
- All responses include success/error status and appropriate messages
- Validation errors provide detailed field-level error messages
- The API supports both English and Nepali error messages
