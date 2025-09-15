import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  ApiResponse, 
  AuthenticatedRequest, 
  CreateCategoryData,
  UpdateCategoryData,
  PaginatedResponse,
  CategoryWithProducts
} from '../types';
import { asyncHandler } from '../middleware/error.middleware';

const prisma = new PrismaClient();

// Create new category
export const createCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const categoryData: CreateCategoryData = req.body;
  
  // Ensure slug is generated if missing
  if (!categoryData.slug) {
    categoryData.slug = categoryData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Check if category with same title or slug already exists
  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [
        { title: categoryData.title },
        { slug: categoryData.slug }
      ]
    }
  });

  if (existingCategory) {
    const field = existingCategory.title === categoryData.title ? 'title' : 'slug';
    const response: ApiResponse = {
      success: false,
      message: `Category with this ${field} already exists`,
      error: 'CATEGORY_ALREADY_EXISTS'
    };
    res.status(400).json(response);
    return;
  }

  // Create category
  const category = await prisma.category.create({
    data: {
      title: categoryData.title,
      description: categoryData.description,
      slug: categoryData.slug!,
      isActive: categoryData.isActive ?? true,
      sortOrder: categoryData.sortOrder ?? 0,
      createdBy: req.user?.id || 'system', // Fallback for development
    },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  const response: ApiResponse<typeof category> = {
    success: true,
    message: 'Category created successfully',
    data: category
  };
  
  res.status(201).json(response);
});

// Get all categories with pagination and filtering
export const getCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'sortOrder',
    sortOrder = 'asc',
    isActive,
    search,
    includeProducts = false
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build where clause
  const where: any = {};
  
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  // Build include clause
  const include: any = {
    _count: {
      select: { products: true }
    }
  };

  if (includeProducts) {
    include.products = {
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stockQuantity: true,
        isActive: true
      }
    };
  }

  // Get categories and total count
  const [categories, totalCount] = await Promise.all([
    prisma.category.findMany({
      where,
      include,
      skip,
      take,
      orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' }
    }),
    prisma.category.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / take);

  const response: PaginatedResponse<typeof categories[0]> = {
    success: true,
    message: 'Categories retrieved successfully',
    data: categories,
    pagination: {
      page: Number(page),
      limit: take,
      total: totalCount,
      totalPages,
      hasNext: Number(page) < totalPages,
      hasPrev: Number(page) > 1
    }
  };

  res.json(response);
});

// Get single category by ID
export const getCategoryById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const includeProducts = req.query.includeProducts === 'true';

  const include: any = {
    _count: {
      select: { products: true }
    }
  };

  if (includeProducts) {
    include.products = {
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    };
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include
  });

  if (!category) {
    const response: ApiResponse = {
      success: false,
      message: 'Category not found',
      error: 'CATEGORY_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse<typeof category> = {
    success: true,
    message: 'Category retrieved successfully',
    data: category
  };

  res.json(response);
});

// Update category
export const updateCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData: UpdateCategoryData = req.body;

  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id }
  });

  if (!existingCategory) {
    const response: ApiResponse = {
      success: false,
      message: 'Category not found',
      error: 'CATEGORY_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  // Check for conflicts with title or slug (excluding current category)
  if (updateData.title || updateData.slug) {
    const conflictCategory = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              updateData.title ? { title: updateData.title } : {},
              updateData.slug ? { slug: updateData.slug } : {}
            ].filter(obj => Object.keys(obj).length > 0)
          }
        ]
      }
    });

    if (conflictCategory) {
      const field = conflictCategory.title === updateData.title ? 'title' : 'slug';
      const response: ApiResponse = {
        success: false,
        message: `Category with this ${field} already exists`,
        error: 'CATEGORY_ALREADY_EXISTS'
      };
      res.status(400).json(response);
      return;
    }
  }

  // Update category
  const category = await prisma.category.update({
    where: { id },
    data: {
      ...updateData,
      updatedBy: req.user?.id || 'system'
    },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  const response: ApiResponse<typeof category> = {
    success: true,
    message: 'Category updated successfully',
    data: category
  };

  res.json(response);
});

// Delete category
export const deleteCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  if (!existingCategory) {
    const response: ApiResponse = {
      success: false,
      message: 'Category not found',
      error: 'CATEGORY_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  // Check if category has products
  if (existingCategory._count.products > 0) {
    const response: ApiResponse = {
      success: false,
      message: 'Cannot delete category with existing products. Please move or delete products first.',
      error: 'CATEGORY_HAS_PRODUCTS'
    };
    res.status(400).json(response);
    return;
  }

  // Delete category
  await prisma.category.delete({
    where: { id }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Category deleted successfully'
  };

  res.json(response);
});

// Reorder categories
export const reorderCategories = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { categoryIds }: { categoryIds: string[] } = req.body;

  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    const response: ApiResponse = {
      success: false,
      message: 'Category IDs array is required',
      error: 'INVALID_INPUT'
    };
    res.status(400).json(response);
    return;
  }

  // Update sort order for each category
  const updatePromises = categoryIds.map((categoryId, index) =>
    prisma.category.update({
      where: { id: categoryId },
      data: { 
        sortOrder: index + 1,
        updatedBy: req.user?.id || 'system'
      }
    })
  );

  await Promise.all(updatePromises);

  const response: ApiResponse = {
    success: true,
    message: 'Categories reordered successfully'
  };

  res.json(response);
});

// Get category statistics
export const getCategoryStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const stats = await prisma.category.findMany({
    select: {
      id: true,
      title: true,
      isActive: true,
      _count: {
        select: { products: true }
      }
    },
    orderBy: { sortOrder: 'asc' }
  });

  const totalCategories = stats.length;
  const activeCategories = stats.filter(cat => cat.isActive).length;
  const totalProducts = stats.reduce((sum, cat) => sum + cat._count.products, 0);

  const response: ApiResponse = {
    success: true,
    message: 'Category statistics retrieved successfully',
    data: {
      totalCategories,
      activeCategories,
      inactiveCategories: totalCategories - activeCategories,
      totalProducts,
      categories: stats
    }
  };

  res.json(response);
});
