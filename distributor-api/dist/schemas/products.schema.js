"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportProductsSchema = exports.BulkUpdateProductsSchema = exports.UpdateStockSchema = exports.ProductIdParamSchema = exports.GetProductsQuerySchema = exports.UpdateProductSchema = exports.CreateProductSchema = void 0;
const zod_1 = require("zod");
const createSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
};
exports.CreateProductSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'Product name is required')
        .max(200, 'Product name must be less than 200 characters')
        .trim(),
    description: zod_1.z.string()
        .max(2000, 'Description must be less than 2000 characters')
        .optional(),
    categoryId: zod_1.z.string()
        .min(1, 'Category ID is required'),
    sku: zod_1.z.string()
        .max(50, 'SKU must be less than 50 characters')
        .optional(),
    price: zod_1.z.number()
        .min(0, 'Price must be positive')
        .max(999999.99, 'Price is too large')
        .optional(),
    costPrice: zod_1.z.number()
        .min(0, 'Cost price must be positive')
        .max(999999.99, 'Cost price is too large')
        .optional(),
    stockQuantity: zod_1.z.number()
        .int()
        .min(0, 'Stock quantity must be non-negative')
        .optional()
        .default(0),
    minStockLevel: zod_1.z.number()
        .int()
        .min(0, 'Minimum stock level must be non-negative')
        .optional()
        .default(0),
    weight: zod_1.z.number()
        .min(0, 'Weight must be positive')
        .optional(),
    dimensions: zod_1.z.string()
        .max(200, 'Dimensions must be less than 200 characters')
        .optional(),
    brand: zod_1.z.string()
        .max(100, 'Brand must be less than 100 characters')
        .optional(),
    model: zod_1.z.string()
        .max(100, 'Model must be less than 100 characters')
        .optional(),
    color: zod_1.z.string()
        .max(50, 'Color must be less than 50 characters')
        .optional(),
    size: zod_1.z.string()
        .max(50, 'Size must be less than 50 characters')
        .optional(),
    tags: zod_1.z.string()
        .max(500, 'Tags must be less than 500 characters')
        .optional(),
    isActive: zod_1.z.boolean().optional().default(true),
    slug: zod_1.z.string()
        .min(1, 'Slug is required')
        .max(200, 'Slug must be less than 200 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
        .optional()
}).transform((data) => ({
    ...data,
    slug: data.slug || createSlug(data.name)
})).refine((data) => {
    if (data.price && data.costPrice && data.costPrice > data.price) {
        return false;
    }
    return true;
}, {
    message: "Cost price cannot be greater than selling price",
    path: ["costPrice"]
});
exports.UpdateProductSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'Product name is required')
        .max(200, 'Product name must be less than 200 characters')
        .trim()
        .optional(),
    description: zod_1.z.string()
        .max(2000, 'Description must be less than 2000 characters')
        .optional(),
    categoryId: zod_1.z.string()
        .min(1, 'Category ID is required')
        .optional(),
    sku: zod_1.z.string()
        .max(50, 'SKU must be less than 50 characters')
        .optional(),
    price: zod_1.z.number()
        .min(0, 'Price must be positive')
        .max(999999.99, 'Price is too large')
        .optional(),
    costPrice: zod_1.z.number()
        .min(0, 'Cost price must be positive')
        .max(999999.99, 'Cost price is too large')
        .optional(),
    stockQuantity: zod_1.z.number()
        .int()
        .min(0, 'Stock quantity must be non-negative')
        .optional(),
    minStockLevel: zod_1.z.number()
        .int()
        .min(0, 'Minimum stock level must be non-negative')
        .optional(),
    weight: zod_1.z.number()
        .min(0, 'Weight must be positive')
        .optional(),
    dimensions: zod_1.z.string()
        .max(200, 'Dimensions must be less than 200 characters')
        .optional(),
    brand: zod_1.z.string()
        .max(100, 'Brand must be less than 100 characters')
        .optional(),
    model: zod_1.z.string()
        .max(100, 'Model must be less than 100 characters')
        .optional(),
    color: zod_1.z.string()
        .max(50, 'Color must be less than 50 characters')
        .optional(),
    size: zod_1.z.string()
        .max(50, 'Size must be less than 50 characters')
        .optional(),
    tags: zod_1.z.string()
        .max(500, 'Tags must be less than 500 characters')
        .optional(),
    isActive: zod_1.z.boolean().optional(),
    slug: zod_1.z.string()
        .min(1, 'Slug is required')
        .max(200, 'Slug must be less than 200 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
        .optional()
}).transform((data) => ({
    ...data,
    slug: data.slug || (data.name ? createSlug(data.name) : undefined)
})).refine((data) => {
    if (data.price && data.costPrice && data.costPrice > data.price) {
        return false;
    }
    return true;
}, {
    message: "Cost price cannot be greater than selling price",
    path: ["costPrice"]
});
exports.GetProductsQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 10),
    sortBy: zod_1.z.string().optional().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    categoryId: zod_1.z.string().optional(),
    isActive: zod_1.z.enum(['true', 'false']).optional().transform(val => val ? val === 'true' : undefined),
    inStock: zod_1.z.enum(['true', 'false']).optional().transform(val => val ? val === 'true' : undefined),
    lowStock: zod_1.z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    search: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    minPrice: zod_1.z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    maxPrice: zod_1.z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    includeCategory: zod_1.z.enum(['true', 'false']).optional().transform(val => val === 'true')
});
exports.ProductIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Product ID is required')
});
exports.UpdateStockSchema = zod_1.z.object({
    stockQuantity: zod_1.z.number()
        .int()
        .min(0, 'Stock quantity must be non-negative'),
    operation: zod_1.z.enum(['set', 'add', 'subtract']).optional().default('set'),
    reason: zod_1.z.string()
        .max(200, 'Reason must be less than 200 characters')
        .optional()
});
exports.BulkUpdateProductsSchema = zod_1.z.object({
    productIds: zod_1.z.array(zod_1.z.string().min(1)),
    updates: zod_1.z.object({
        categoryId: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional(),
        price: zod_1.z.number().min(0).optional(),
        stockQuantity: zod_1.z.number().int().min(0).optional()
    })
});
exports.ImportProductsSchema = zod_1.z.object({
    products: zod_1.z.array(exports.CreateProductSchema),
    overwriteExisting: zod_1.z.boolean().optional().default(false)
});
//# sourceMappingURL=products.schema.js.map