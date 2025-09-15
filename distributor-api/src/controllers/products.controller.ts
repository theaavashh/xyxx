import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  ApiResponse, 
  AuthenticatedRequest, 
  CreateProductData,
  UpdateProductData,
  UpdateStockData,
  PaginatedResponse,
  ProductWithCategory
} from '../types';
import { asyncHandler } from '../middleware/error.middleware';
import { getFilePaths } from '../middleware/upload.middleware';

const prisma = new PrismaClient();

// Create new product
export const createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  let productData: CreateProductData;
  
  // Parse JSON data from FormData if present
  try {
    if (req.body.data) {
      productData = JSON.parse(req.body.data);
    } else {
      productData = req.body;
    }
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid data format',
      error: 'INVALID_DATA_FORMAT'
    };
    res.status(400).json(response);
    return;
  }

  // Handle file uploads
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const filePaths = files ? getFilePaths(files) : {};

  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id: productData.categoryId }
  });

  if (!category) {
    const response: ApiResponse = {
      success: false,
      message: 'Category not found',
      error: 'CATEGORY_NOT_FOUND'
    };
    res.status(400).json(response);
    return;
  }

  // Check if product with same name or SKU already exists
  const whereConditions: any[] = [
    { name: productData.name }
  ];
  
  if (productData.sku) {
    whereConditions.push({ sku: productData.sku });
  }

  const existingProduct = await prisma.product.findFirst({
    where: { OR: whereConditions }
  });

  if (existingProduct) {
    const field = existingProduct.name === productData.name ? 'name' : 'SKU';
    const response: ApiResponse = {
      success: false,
      message: `Product with this ${field} already exists`,
      error: 'PRODUCT_ALREADY_EXISTS'
    };
    res.status(400).json(response);
    return;
  }

  // Create product
  const product = await prisma.product.create({
    data: {
      name: productData.name,
      description: productData.description,
      categoryId: productData.categoryId,
      sku: productData.sku,
      price: productData.price,
      costPrice: productData.costPrice,
      stockQuantity: productData.stockQuantity ?? 0,
      minStockLevel: productData.minStockLevel ?? 0,
      weight: productData.weight,
      dimensions: productData.dimensions,
      brand: productData.brand,
      model: productData.model,
      color: productData.color,
      size: productData.size,
      tags: productData.tags,
      isActive: productData.isActive ?? true,
      slug: productData.slug!,
      images: filePaths.images ? JSON.stringify([filePaths.images]) : null,
      documents: filePaths.documents ? JSON.stringify([filePaths.documents]) : null,
      createdBy: req.user?.id || 'system'
    },
    include: {
      category: true
    }
  });

  const response: ApiResponse<typeof product> = {
    success: true,
    message: 'Product created successfully',
    data: product
  };
  
  res.status(201).json(response);
});

// Get all products with pagination and filtering
export const getProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    categoryId,
    isActive,
    inStock,
    lowStock,
    search,
    brand,
    minPrice,
    maxPrice,
    includeCategory = true
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build where clause
  const where: any = {};
  
  if (categoryId) {
    where.categoryId = categoryId as string;
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  
  if (inStock === 'true') {
    where.stockQuantity = { gt: 0 };
  }
  
  if (lowStock === 'true') {
    where.stockQuantity = { lte: prisma.product.fields.minStockLevel };
  }
  
  if (brand) {
    where.brand = { contains: brand as string, mode: 'insensitive' };
  }
  
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { sku: { contains: search as string, mode: 'insensitive' } },
      { brand: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  // Build include clause
  const include: any = {};
  if (includeCategory) {
    include.category = true;
  }

  // Get products and total count
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include,
      skip,
      take,
      orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' }
    }),
    prisma.product.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / take);

  const response: PaginatedResponse<typeof products[0]> = {
    success: true,
    message: 'Products retrieved successfully',
    data: products,
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

// Get single product by ID
export const getProductById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const includeCategory = req.query.includeCategory !== 'false';

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: includeCategory
    }
  });

  if (!product) {
    const response: ApiResponse = {
      success: false,
      message: 'Product not found',
      error: 'PRODUCT_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse<typeof product> = {
    success: true,
    message: 'Product retrieved successfully',
    data: product
  };

  res.json(response);
});

// Update product
export const updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  let updateData: UpdateProductData;

  // Parse JSON data from FormData if present
  try {
    if (req.body.data) {
      updateData = JSON.parse(req.body.data);
    } else {
      updateData = req.body;
    }
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid data format',
      error: 'INVALID_DATA_FORMAT'
    };
    res.status(400).json(response);
    return;
  }

  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!existingProduct) {
    const response: ApiResponse = {
      success: false,
      message: 'Product not found',
      error: 'PRODUCT_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  // Check if category exists (if categoryId is being updated)
  if (updateData.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: updateData.categoryId }
    });

    if (!category) {
      const response: ApiResponse = {
        success: false,
        message: 'Category not found',
        error: 'CATEGORY_NOT_FOUND'
      };
      res.status(400).json(response);
      return;
    }
  }

  // Check for conflicts with name or SKU (excluding current product)
  if (updateData.name || updateData.sku) {
    const whereConditions: any[] = [];
    
    if (updateData.name) {
      whereConditions.push({ name: updateData.name });
    }
    
    if (updateData.sku) {
      whereConditions.push({ sku: updateData.sku });
    }

    const conflictProduct = await prisma.product.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { OR: whereConditions }
        ]
      }
    });

    if (conflictProduct) {
      const field = conflictProduct.name === updateData.name ? 'name' : 'SKU';
      const response: ApiResponse = {
        success: false,
        message: `Product with this ${field} already exists`,
        error: 'PRODUCT_ALREADY_EXISTS'
      };
      res.status(400).json(response);
      return;
    }
  }

  // Handle file uploads
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const filePaths = files ? getFilePaths(files) : {};

  // Prepare update data with file paths
  const finalUpdateData: any = {
    ...updateData,
    updatedBy: req.user?.id || 'system'
  };

  if (filePaths.images) {
    finalUpdateData.images = JSON.stringify([filePaths.images]);
  }

  if (filePaths.documents) {
    finalUpdateData.documents = JSON.stringify([filePaths.documents]);
  }

  // Update product
  const product = await prisma.product.update({
    where: { id },
    data: finalUpdateData,
    include: {
      category: true
    }
  });

  const response: ApiResponse<typeof product> = {
    success: true,
    message: 'Product updated successfully',
    data: product
  };

  res.json(response);
});

// Update product stock
export const updateProductStock = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { stockQuantity, operation = 'set', reason }: UpdateStockData = req.body;

  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!existingProduct) {
    const response: ApiResponse = {
      success: false,
      message: 'Product not found',
      error: 'PRODUCT_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  let newStockQuantity = stockQuantity;

  // Calculate new stock based on operation
  if (operation === 'add') {
    newStockQuantity = existingProduct.stockQuantity + stockQuantity;
  } else if (operation === 'subtract') {
    newStockQuantity = Math.max(0, existingProduct.stockQuantity - stockQuantity);
  }

  // Update stock
  const product = await prisma.product.update({
    where: { id },
    data: {
      stockQuantity: newStockQuantity,
      updatedBy: req.user?.id || 'system'
    },
    include: {
      category: true
    }
  });

  const response: ApiResponse<typeof product> = {
    success: true,
    message: `Product stock ${operation === 'set' ? 'updated' : operation === 'add' ? 'increased' : 'decreased'} successfully`,
    data: product
  };

  res.json(response);
});

// Delete product
export const deleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!existingProduct) {
    const response: ApiResponse = {
      success: false,
      message: 'Product not found',
      error: 'PRODUCT_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  // Delete product
  await prisma.product.delete({
    where: { id }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Product deleted successfully'
  };

  res.json(response);
});

// Get products by category
export const getProductsByCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { categoryId } = req.params;
  const { 
    page = 1, 
    limit = 10, 
    isActive,
    inStock 
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
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

  // Build where clause
  const where: any = { categoryId };
  
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  
  if (inStock === 'true') {
    where.stockQuantity = { gt: 0 };
  }

  // Get products and total count
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / take);

  const response: PaginatedResponse<typeof products[0]> = {
    success: true,
    message: 'Products retrieved successfully',
    data: products,
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

// Get product statistics
export const getProductStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const [
    totalProducts,
    activeProducts,
    outOfStockProducts,
    lowStockProducts,
    totalValue
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { stockQuantity: 0 } }),
    prisma.product.count({ 
      where: { 
        stockQuantity: { 
          lte: prisma.product.fields.minStockLevel,
          gt: 0 
        } 
      } 
    }),
    prisma.product.aggregate({
      _sum: {
        stockQuantity: true
      },
      where: { isActive: true }
    })
  ]);

  const response: ApiResponse = {
    success: true,
    message: 'Product statistics retrieved successfully',
    data: {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      outOfStockProducts,
      lowStockProducts,
      totalStockValue: totalValue._sum.stockQuantity || 0
    }
  };

  res.json(response);
});
