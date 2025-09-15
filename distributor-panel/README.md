# Distributor Panel - Next.js Application

A comprehensive distributor management system built with Next.js, TypeScript, and Tailwind CSS. This application allows distributors to login, manage product orders, and track transaction history.

## Features

### 🔐 Authentication System
- Secure login/logout functionality
- User session management with localStorage
- Protected routes and components

### 📊 Dashboard Overview
- Real-time statistics and metrics
- Recent orders and transactions summary
- Visual status indicators
- Quick access to all features

### 🛍️ Product Ordering
- Browse available products by category
- Search and filter functionality
- Interactive shopping cart
- Quantity management with stock validation
- Place orders directly to factory

### 📋 Order Management
- View all order history
- Filter orders by status
- Detailed order information
- Track order progress from pending to delivered

### 💰 Transaction Log
- Complete transaction history
- Advanced filtering options (type, status, date range)
- Search functionality
- Export capabilities
- Real-time balance calculations

## Technology Stack

- **Framework**: Next.js 15.5.0 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form with Yup validation
- **Notifications**: React Hot Toast
- **State Management**: React Context API

## Installation

1. **Clone the repository**
   \`\`\`bash
   cd /path/to/analytics/distributor-panel
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Demo Credentials

For testing purposes, use these credentials:
- **Email**: distributor@example.com
- **Password**: password123

## Project Structure

\`\`\`
src/
├── app/                  # Next.js app router
│   ├── layout.tsx       # Root layout with providers
│   └── page.tsx         # Main application entry point
├── components/          # React components
│   ├── AuthProvider.tsx # Authentication context
│   ├── LoginForm.tsx    # Login interface
│   ├── DashboardLayout.tsx # Main layout wrapper
│   ├── Dashboard.tsx    # Dashboard overview
│   ├── Products.tsx     # Product ordering interface
│   ├── Orders.tsx       # Order management
│   └── Transactions.tsx # Transaction log
├── lib/                 # Utilities and data
│   ├── utils.ts         # Helper functions
│   └── mockData.ts      # Sample data for development
└── types/               # TypeScript type definitions
    └── index.ts         # Application types
\`\`\`

## Key Features Explained

### Authentication Flow
- Uses React Context for state management
- Persists user session in localStorage
- Automatic logout and session validation

### Product Management
- Real-time inventory tracking
- Category-based filtering
- Interactive quantity selectors
- Shopping cart functionality with persistent state

### Order Processing
- Multi-item orders with detailed breakdowns
- Status tracking throughout the order lifecycle
- Expected delivery date management
- Order notes and special instructions

### Transaction Tracking
- Complete financial history
- Multiple transaction types (orders, payments, refunds, adjustments)
- Advanced filtering and search capabilities
- Balance calculations in NPR currency [[memory:6904782]]

## Currency Display

All monetary values are displayed in NPR (Nepalese Rupees) as per user preference [[memory:6904782]].

## Development

### Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint

### Adding New Features

1. **New Components**: Add to \`src/components/\`
2. **New Types**: Define in \`src/types/index.ts\`
3. **Utilities**: Add to \`src/lib/utils.ts\`
4. **Mock Data**: Update \`src/lib/mockData.ts\`

## Production Deployment

1. **Build the application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start production server**
   \`\`\`bash
   npm start
   \`\`\`

## Future Enhancements

- [ ] Real API integration
- [ ] PDF report generation
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Inventory management integration
- [ ] Payment gateway integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

**Note**: This is a demonstration application with mock data. In a production environment, you would need to integrate with real APIs for authentication, product management, and transaction processing.