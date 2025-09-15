# Distributor Applications Management

This document describes the new functionality added to fetch and manage distributor applications from the backend.

## Features Added

### 1. API Service (`src/lib/api.ts`)
- Complete API service for interacting with distributor applications
- TypeScript interfaces for type safety
- Error handling and response parsing
- Support for all CRUD operations

### 2. Custom Hooks (`src/hooks/useApplications.ts`)
- `useApplications` - Main hook for managing applications data
- `useApplicationStats` - Hook for fetching application statistics
- Built-in state management, loading states, and error handling
- Automatic refetching and filter management

### 3. UI Components

#### ApplicationsTable (`src/components/ApplicationsTable.tsx`)
- Displays applications in a responsive table format
- Status badges with color coding
- Action buttons for view, edit, update status, and delete
- Built-in status update modal
- Loading and error states

#### ApplicationDetailsModal (`src/components/ApplicationDetailsModal.tsx`)
- Comprehensive view of application details
- Organized sections for personal, business, and other information
- Support for related data (transactions, products, area coverage)
- Application history timeline

#### ApplicationsManagement (`src/components/ApplicationsManagement.tsx`)
- Main management interface
- Search and filtering capabilities
- Pagination support
- Integration of all components

### 4. Navigation Integration
- Added navigation tabs to switch between form submission and applications view
- Clean, responsive header with active state indicators

## Usage

### Basic Usage
```tsx
import { useApplications } from '@/hooks/useApplications';

function MyComponent() {
  const {
    applications,
    loading,
    error,
    refetch,
    updateFilters,
    updateApplicationStatus
  } = useApplications();

  // Use the data and functions...
}
```

### API Service Usage
```tsx
import { apiService } from '@/lib/api';

// Fetch applications with filters
const response = await apiService.getApplications({
  page: 1,
  limit: 10,
  status: 'PENDING',
  search: 'John Doe'
});

// Update application status
await apiService.updateApplicationStatus('app-id', 'APPROVED', 'Application approved');
```

## API Endpoints Used

- `GET /api/applications` - Fetch all applications with filtering and pagination
- `GET /api/applications/:id` - Fetch single application by ID
- `PUT /api/applications/:id/status` - Update application status
- `GET /api/applications/stats` - Fetch application statistics

## Configuration

The API URL is configured in `src/lib/config.ts`. You can override it by setting the `NEXT_PUBLIC_API_URL` environment variable.

## Features

### Filtering and Search
- Search by name, company, email, phone, or citizenship number
- Filter by application status
- Sort by various fields (date, name, company)
- Pagination with customizable page size

### Status Management
- Update application status with optional notes
- Visual status indicators with color coding
- Status history tracking

### Data Display
- Comprehensive application details view
- Related data display (transactions, products, area coverage)
- Application history timeline
- Responsive design for all screen sizes

## Error Handling

- Network error handling with user-friendly messages
- Loading states for better UX
- Retry mechanisms for failed requests
- Validation error display

## Type Safety

All components are fully typed with TypeScript interfaces that match the backend API responses, ensuring type safety throughout the application.

## Future Enhancements

- Real-time updates using WebSocket connections
- Bulk operations (approve/reject multiple applications)
- Export functionality (PDF, Excel)
- Advanced filtering options
- Email notifications for status changes


