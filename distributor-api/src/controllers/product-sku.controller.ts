import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/error.middleware';

const prisma = new PrismaClient();

// Get all SKUs
export const getAllSKUs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { productId, isActive, search } = req.query;

  const where: any = {};
  
  if (productId) {
    where.productId = productId as string;
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  if (search) {
    where.OR = [
      { sku: { contains: search as string, mode: 'insensitive' } },
      { variantName: { contains: search as string, mode: 'insensitive' } },
      { barcode: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  const skus = await prisma.productSKU.findMany({
    where,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          category: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const response: ApiResponse = {
    success: true,
    message: 'SKUs retrieved successfully',
    data: skus
  };
  res.status(200).json(response);
});

// Get SKU by ID
export const getSKUById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const sku = await prisma.productSKU.findUnique({
    where: { id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          category: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    }
  });

  if (!sku) {
    const response: ApiResponse = {
      success: false,
      message: 'SKU not found',
      error: 'SKU_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse = {
    success: true,
    message: 'SKU retrieved successfully',
    data: sku
  };
  res.status(200).json(response);
});

// Create new SKU
export const createSKU = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    sku,
    productId,
    productName,
    variantName,
    attributes,
    price,
    costPrice,
    stockQuantity,
    minStockLevel,
    maxStockLevel,
    barcode,
    weight,
    dimensions,
    isActive,
    images,
    notes
  } = req.body;

  let finalProductId = productId;

  // Check if product exists by ID first
  if (productId) {
    const productById = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (productById) {
      finalProductId = productById.id;
    }
  }

  // If no product found by ID, try to find by name
  if (!finalProductId && productName) {
    const productByName = await prisma.product.findFirst({
      where: { 
        name: {
          equals: productName,
          mode: 'insensitive'
        }
      }
    });
    
    if (productByName) {
      finalProductId = productByName.id;
    }
  }

  // If still no product, create a new one
  if (!finalProductId && productName) {
    // Find or create a default category
    let defaultCategory = await prisma.category.findFirst();
    
    if (!defaultCategory) {
      // Create a default category if none exists
      defaultCategory = await prisma.category.create({
        data: {
          title: 'General',
          slug: 'general',
          description: 'General products',
          isActive: true,
          createdBy: 'system'
        }
      });
    }

    // Create new product
    const newProduct = await prisma.product.create({
      data: {
        name: productName,
        description: `${productName} - Auto created`,
        categoryId: defaultCategory.id,
        sku: `PROD-${Date.now()}`,
        price: price || 0,
        costPrice: costPrice || 0,
        stockQuantity: stockQuantity || 0,
        minStockLevel: minStockLevel || 0,
        isActive: true,
        slug: productName.toLowerCase().replace(/\s+/g, '-'),
        createdBy: 'system'
      }
    });
    
    finalProductId = newProduct.id;
  }

  if (!finalProductId) {
    const response: ApiResponse = {
      success: false,
      message: 'Product not found. Please provide a valid productId or productName.',
      error: 'PRODUCT_NOT_FOUND'
    };
    res.status(400).json(response);
    return;
  }

  // Check if SKU already exists
  const existingSKU = await prisma.productSKU.findFirst({
    where: {
      OR: [
        { sku },
        ...(barcode ? [{ barcode }] : [])
      ]
    }
  });

  if (existingSKU) {
    const field = existingSKU.sku === sku ? 'SKU' : 'Barcode';
    const response: ApiResponse = {
      success: false,
      message: `${field} already exists`,
      error: 'SKU_ALREADY_EXISTS'
    };
    res.status(400).json(response);
    return;
  }

  // Create SKU
  const newSKU = await prisma.productSKU.create({
    data: {
      sku,
      productId: finalProductId,
      variantName,
      attributes: attributes ? JSON.stringify(attributes) : null,
      price,
      costPrice,
      stockQuantity: stockQuantity ?? 0,
      minStockLevel: minStockLevel ?? 0,
      maxStockLevel: maxStockLevel ?? 0,
      barcode,
      weight,
      dimensions: dimensions ? JSON.stringify(dimensions) : null,
      isActive: isActive ?? true,
      images: images ? JSON.stringify(images) : null,
      notes
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          category: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    }
  });

  const response: ApiResponse = {
    success: true,
    message: 'SKU created successfully',
    data: newSKU
  };
  res.status(201).json(response);
});

// Update SKU
export const updateSKU = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    sku,
    productId,
    variantName,
    attributes,
    price,
    costPrice,
    stockQuantity,
    minStockLevel,
    maxStockLevel,
    barcode,
    weight,
    dimensions,
    isActive,
    images,
    notes
  } = req.body;

  // Check if SKU exists
  const existingSKU = await prisma.productSKU.findUnique({
    where: { id }
  });

  if (!existingSKU) {
    const response: ApiResponse = {
      success: false,
      message: 'SKU not found',
      error: 'SKU_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  // Check if new SKU code conflicts with another SKU
  if (sku && sku !== existingSKU.sku) {
    const skuExists = await prisma.productSKU.findFirst({
      where: { sku, id: { not: id } }
    });

    if (skuExists) {
      const response: ApiResponse = {
        success: false,
        message: 'SKU code already exists',
        error: 'SKU_ALREADY_EXISTS'
      };
      res.status(400).json(response);
      return;
    }
  }

  // Check if new barcode conflicts with another SKU
  if (barcode && barcode !== existingSKU.barcode) {
    const barcodeExists = await prisma.productSKU.findFirst({
      where: { barcode, id: { not: id } }
    });

    if (barcodeExists) {
      const response: ApiResponse = {
        success: false,
        message: 'Barcode already exists',
        error: 'BARCODE_ALREADY_EXISTS'
      };
      res.status(400).json(response);
      return;
    }
  }

  // Update SKU
  const updatedSKU = await prisma.productSKU.update({
    where: { id },
    data: {
      ...(sku && { sku }),
      ...(productId && { productId }),
      ...(variantName && { variantName }),
      ...(attributes !== undefined && { attributes: attributes ? JSON.stringify(attributes) : null }),
      ...(price !== undefined && { price }),
      ...(costPrice !== undefined && { costPrice }),
      ...(stockQuantity !== undefined && { stockQuantity }),
      ...(minStockLevel !== undefined && { minStockLevel }),
      ...(maxStockLevel !== undefined && { maxStockLevel }),
      ...(barcode !== undefined && { barcode }),
      ...(weight !== undefined && { weight }),
      ...(dimensions !== undefined && { dimensions: dimensions ? JSON.stringify(dimensions) : null }),
      ...(isActive !== undefined && { isActive }),
      ...(images !== undefined && { images: images ? JSON.stringify(images) : null }),
      ...(notes !== undefined && { notes })
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          category: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    }
  });

  const response: ApiResponse = {
    success: true,
    message: 'SKU updated successfully',
    data: updatedSKU
  };
  res.status(200).json(response);
});

// Delete SKU
export const deleteSKU = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Check if SKU exists
  const existingSKU = await prisma.productSKU.findUnique({
    where: { id }
  });

  if (!existingSKU) {
    const response: ApiResponse = {
      success: false,
      message: 'SKU not found',
      error: 'SKU_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  // Delete SKU
  await prisma.productSKU.delete({
    where: { id }
  });

  const response: ApiResponse = {
    success: true,
    message: 'SKU deleted successfully'
  };
  res.status(200).json(response);
});

// Get SKUs by product ID
export const getSKUsByProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.params;

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId }
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

  const skus = await prisma.productSKU.findMany({
    where: { productId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          category: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const response: ApiResponse = {
    success: true,
    message: 'SKUs retrieved successfully',
    data: skus
  };
  res.status(200).json(response);
});