import { z } from 'zod';

// Helper function to create URL-friendly slug
const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Create Category Schema
export const CreateCategorySchema = z.object({
  title: z.string()
    .min(1, 'Category title is required')
    .max(100, 'Category title must be less than 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0)
}).transform((data) => ({
  ...data,
  // Auto-generate slug from title if not provided
  slug: data.slug || createSlug(data.title)
}));

// Update Category Schema (all fields optional except validation requirements)
export const UpdateCategorySchema = z.object({
  title: z.string()
    .min(1, 'Category title is required')
    .max(100, 'Category title must be less than 100 characters')
    .trim()
    .optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional()
}).transform((data) => ({
  ...data,
  // Auto-generate slug from title if title is provided but slug is not
  slug: data.slug || (data.title ? createSlug(data.title) : undefined)
}));

// Query parameters for getting categories
export const GetCategoriesQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  sortBy: z.string().optional().default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  isActive: z.enum(['true', 'false']).optional().transform(val => val ? val === 'true' : undefined),
  search: z.string().optional(),
  includeProducts: z.enum(['true', 'false']).optional().transform(val => val === 'true')
});

// Category ID parameter validation
export const CategoryIdParamSchema = z.object({
  id: z.string().min(1, 'Category ID is required')
});

// Bulk operations
export const BulkUpdateCategoriesSchema = z.object({
  categoryIds: z.array(z.string().min(1)),
  updates: z.object({
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional()
  })
});

// Export types
export type CreateCategoryData = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryData = z.infer<typeof UpdateCategorySchema>;
export type GetCategoriesQuery = z.infer<typeof GetCategoriesQuerySchema>;
export type CategoryIdParam = z.infer<typeof CategoryIdParamSchema>;
export type BulkUpdateCategoriesData = z.infer<typeof BulkUpdateCategoriesSchema>;
