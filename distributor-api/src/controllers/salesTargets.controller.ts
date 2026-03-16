import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/error.middleware';
import { ApiResponse } from '@/types';

// Mock data - replace with actual database queries
const mockDistributors = [
  { id: 'dist_1', name: 'Kathmandu Distributors', email: 'kathmandu@dist.com', province: 'Province 3' },
  { id: 'dist_2', name: 'Pokhara Traders', email: 'pokhara@dist.com', province: 'Province 4' },
  { id: 'dist_3', name: 'Biratnagar Suppliers', email: 'biratnagar@dist.com', province: 'Province 1' },
  { id: 'dist_4', name: 'Nepal Wholesale', email: 'wholesale@dist.com', province: 'Province 2' },
  { id: 'dist_5', name: 'Himalaya Traders', email: 'himalaya@dist.com', province: 'Province 5' }
];

const mockProductCategories = [
  { id: 'achar', name: 'Achar', description: 'Traditional Nepali pickles' },
  { id: 'dry_meat', name: 'Dry Meat', description: 'Dried meat products' },
  { id: 'spices', name: 'Spices', description: 'Various spices and seasonings' }
];

const mockProducts = {
  achar: [
    { id: 'prod_achar_1', name: 'Buff Achar', units: '500 gm' },
    { id: 'prod_achar_2', name: 'Pork Achar', units: '500 gm' },
    { id: 'prod_achar_3', name: 'Chicken Achar', units: '500 gm' },
    { id: 'prod_achar_4', name: 'Mixed Achar', units: '750 gm' }
  ],
  dry_meat: [
    { id: 'prod_dry_1', name: 'Buff Sukuti', units: '500 gm' },
    { id: 'prod_dry_2', name: 'Pork Sukuti', units: '500 gm' },
    { id: 'prod_dry_3', name: 'Chicken Sukuti', units: '500 gm' }
  ],
  spices: [
    { id: 'prod_spice_1', name: 'Turmeric Powder', units: '250 gm' },
    { id: 'prod_spice_2', name: 'Cumin Powder', units: '250 gm' },
    { id: 'prod_spice_3', name: 'Coriander Powder', units: '250 gm' },
    { id: 'prod_spice_4', name: 'Chili Powder', units: '250 gm' }
  ]
};

// Get all distributors for target assignment
export const getDistributors = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { province, search } = req.query;

  let filteredDistributors = [...mockDistributors];

  // Filter by province
  if (province && typeof province === 'string') {
    filteredDistributors = filteredDistributors.filter(distributor => 
      distributor.province.toLowerCase().includes(province.toLowerCase())
    );
  }

  // Filter by search term
  if (search && typeof search === 'string') {
    const searchTerm = search.toLowerCase();
    filteredDistributors = filteredDistributors.filter(distributor =>
      distributor.name.toLowerCase().includes(searchTerm) ||
      distributor.email.toLowerCase().includes(searchTerm) ||
      distributor.province.toLowerCase().includes(searchTerm)
    );
  }

  const response: ApiResponse = {
    success: true,
    message: 'Distributors retrieved successfully',
    data: {
      distributors: filteredDistributors,
      total: filteredDistributors.length
    }
  };

  res.status(200).json(response);
});

// Get product categories for target assignment
export const getProductCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const response: ApiResponse = {
    success: true,
    message: 'Product categories retrieved successfully',
    data: mockProductCategories
  };

  res.status(200).json(response);
});

// Get products by category
export const getProductsByCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { categoryId } = req.params;

  const products = mockProducts[categoryId as keyof typeof mockProducts] || [];

  const response: ApiResponse = {
    success: true,
    message: 'Products retrieved successfully',
    data: {
      products,
      categoryId,
      total: products.length
    }
  };

  res.status(200).json(response);
});

// Get distributor targets by category and period
export const getDistributorTargets = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { categoryId, month, year, distributorId } = req.query;

  // Mock targets data - replace with actual database query
  const mockTargets = mockDistributors.map(distributor => ({
    distributorId: distributor.id,
    distributorName: distributor.name,
    categoryId: categoryId || 'achar',
    month: parseInt(month as string) || new Date().getMonth() + 1,
    year: parseInt(year as string) || new Date().getFullYear(),
    totalTarget: Math.floor(Math.random() * 1000) + 100,
    totalAchieved: Math.floor(Math.random() * 800) + 50,
    items: (mockProducts[categoryId as keyof typeof mockProducts] || mockProducts.achar).map(product => ({
      productId: product.id,
      productName: product.name,
      targetValue: Math.floor(Math.random() * 200) + 10,
      achievedValue: Math.floor(Math.random() * 150) + 5
    }))
  }));

  // Filter by distributor if specified
  let filteredTargets = mockTargets;
  if (distributorId && typeof distributorId === 'string') {
    filteredTargets = filteredTargets.filter(target => target.distributorId === distributorId);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Distributor targets retrieved successfully',
    data: {
      targets: filteredTargets,
      filters: {
        categoryId,
        month,
        year,
        distributorId
      }
    }
  };

  res.status(200).json(response);
});

// Save distributor targets
export const saveDistributorTargets = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { categoryId, month, year, targets } = req.body;

  // Validate required fields
  if (!categoryId || !month || !year || !targets || !Array.isArray(targets)) {
    const response: ApiResponse = {
      success: false,
      message: 'Missing required fields',
      error: 'INVALID_INPUT'
    };
    res.status(400).json(response);
    return;
  }

  // Mock save operation - replace with actual database transaction
  console.log('Saving distributor targets:', {
    categoryId,
    month,
    year,
    targetsCount: targets.length
  });

  // Here you would:
  // 1. Start a database transaction
  // 2. Delete existing targets for the period
  // 3. Insert new targets
  // 4. Commit transaction

  const response: ApiResponse = {
    success: true,
    message: 'Distributor targets saved successfully',
    data: {
      categoryId,
      month,
      year,
      savedTargets: targets.length
    }
  };

  res.status(200).json(response);
});

// Add new distributor
export const addDistributor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, province } = req.body;

  // Validate required fields
  if (!name || !email || !province) {
    const response: ApiResponse = {
      success: false,
      message: 'Missing required fields: name, email, and province are required',
      error: 'INVALID_INPUT'
    };
    res.status(400).json(response);
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid email format',
      error: 'INVALID_EMAIL'
    };
    res.status(400).json(response);
    return;
  }

  // Check if distributor already exists by email
  const existingDistributor = mockDistributors.find(d => d.email === email);
  if (existingDistributor) {
    const response: ApiResponse = {
      success: false,
      message: 'Distributor with this email already exists',
      error: 'DUPLICATE_EMAIL'
    };
    res.status(409).json(response);
    return;
  }

  // Create new distributor
  const newDistributor = {
    id: `dist_${Date.now()}`,
    name,
    email,
    province
  };

  // Add to mock data (in real implementation, save to database)
  mockDistributors.push(newDistributor);

  const response: ApiResponse = {
    success: true,
    message: 'Distributor added successfully',
    data: newDistributor
  };

  res.status(201).json(response);
});