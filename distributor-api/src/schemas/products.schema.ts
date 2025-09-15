import { z } from 'zod';

// Helper function to create URL-friendly slug
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Create Product Schema
export const CreateProductSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be less than 200 characters')
    .trim(),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  categoryId: z.string()
    .min(1, 'Category ID is required'),
  sku: z.string()
    .max(50, 'SKU must be less than 50 characters')
    .optional(),
  price: z.number()
    .min(0, 'Price must be positive')
    .max(999999.99, 'Price is too large')
    .optional(),
  costPrice: z.number()
    .min(0, 'Cost price must be positive')
    .max(999999.99, 'Cost price is too large')
    .optional(),
  stockQuantity: z.number()
    .int()
    .min(0, 'Stock quantity must be non-negative')
    .optional()
    .default(0),
  minStockLevel: z.number()
    .int()
    .min(0, 'Minimum stock level must be non-negative')
    .optional()
    .default(0),
  weight: z.number()
    .min(0, 'Weight must be positive')
    .optional(),
  dimensions: z.string()
    .max(200, 'Dimensions must be less than 200 characters')
    .optional(),
  brand: z.string()
    .max(100, 'Brand must be less than 100 characters')
    .optional(),
  model: z.string()
    .max(100, 'Model must be less than 100 characters')
    .optional(),
  color: z.string()
    .max(50, 'Color must be less than 50 characters')
    .optional(),
  size: z.string()
    .max(50, 'Size must be less than 50 characters')
    .optional(),
  tags: z.string()
    .max(500, 'Tags must be less than 500 characters')
    .optional(),
  isActive: z.boolean().optional().default(true),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(200, 'Slug must be less than 200 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional()
}).transform((data) => ({
  ...data,
  // Auto-generate slug from name if not provided
  slug: data.slug || createSlug(data.name)
})).refine((data) => {
  // Ensure cost price is not greater than selling price
  if (data.price && data.costPrice && data.costPrice > data.price) {
    return false;
  }
  return true;
}, {
  message: "Cost price cannot be greater than selling price",
  path: ["costPrice"]
});

// Update Product Schema
export const UpdateProductSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be less than 200 characters')
    .trim()
    .optional(),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  categoryId: z.string()
    .min(1, 'Category ID is required')
    .optional(),
  sku: z.string()
    .max(50, 'SKU must be less than 50 characters')
    .optional(),
  price: z.number()
    .min(0, 'Price must be positive')
    .max(999999.99, 'Price is too large')
    .optional(),
  costPrice: z.number()
    .min(0, 'Cost price must be positive')
    .max(999999.99, 'Cost price is too large')
    .optional(),
  stockQuantity: z.number()
    .int()
    .min(0, 'Stock quantity must be non-negative')
    .optional(),
  minStockLevel: z.number()
    .int()
    .min(0, 'Minimum stock level must be non-negative')
    .optional(),
  weight: z.number()
    .min(0, 'Weight must be positive')
    .optional(),
  dimensions: z.string()
    .max(200, 'Dimensions must be less than 200 characters')
    .optional(),
  brand: z.string()
    .max(100, 'Brand must be less than 100 characters')
    .optional(),
  model: z.string()
    .max(100, 'Model must be less than 100 characters')
    .optional(),
  color: z.string()
    .max(50, 'Color must be less than 50 characters')
    .optional(),
  size: z.string()
    .max(50, 'Size must be less than 50 characters')
    .optional(),
  tags: z.string()
    .max(500, 'Tags must be less than 500 characters')
    .optional(),
  isActive: z.boolean().optional(),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(200, 'Slug must be less than 200 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional()
}).transform((data) => ({
  ...data,
  // Auto-generate slug from name if name is provided but slug is not
  slug: data.slug || (data.name ? createSlug(data.name) : undefined)
})).refine((data) => {
  // Ensure cost price is not greater than selling price
  if (data.price && data.costPrice && data.costPrice > data.price) {
    return false;
  }
  return true;
}, {
  message: "Cost price cannot be greater than selling price",
  path: ["costPrice"]
});

// Query parameters for getting products
export const GetProductsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  categoryId: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional().transform(val => val ? val === 'true' : undefined),
  inStock: z.enum(['true', 'false']).optional().transform(val => val ? val === 'true' : undefined),
  lowStock: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  search: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  includeCategory: z.enum(['true', 'false']).optional().transform(val => val === 'true')
});

// Product ID parameter validation
export const ProductIdParamSchema = z.object({
  id: z.string().min(1, 'Product ID is required')
});

// Stock update schema
export const UpdateStockSchema = z.object({
  stockQuantity: z.number()
    .int()
    .min(0, 'Stock quantity must be non-negative'),
  operation: z.enum(['set', 'add', 'subtract']).optional().default('set'),
  reason: z.string()
    .max(200, 'Reason must be less than 200 characters')
    .optional()
});

// Bulk operations
export const BulkUpdateProductsSchema = z.object({
  productIds: z.array(z.string().min(1)),
  updates: z.object({
    categoryId: z.string().optional(),
    isActive: z.boolean().optional(),
    price: z.number().min(0).optional(),
    stockQuantity: z.number().int().min(0).optional()
  })
});

// Import/Export schema
export const ImportProductsSchema = z.object({
  products: z.array(CreateProductSchema),
  overwriteExisting: z.boolean().optional().default(false)
});

// Export types
export type CreateProductData = z.infer<typeof CreateProductSchema>;
export type UpdateProductData = z.infer<typeof UpdateProductSchema>;
export type GetProductsQuery = z.infer<typeof GetProductsQuerySchema>;
export type ProductIdParam = z.infer<typeof ProductIdParamSchema>;
export type UpdateStockData = z.infer<typeof UpdateStockSchema>;
export type BulkUpdateProductsData = z.infer<typeof BulkUpdateProductsSchema>;
export type ImportProductsData = z.infer<typeof ImportProductsSchema>;
