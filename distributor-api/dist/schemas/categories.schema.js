"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkUpdateCategoriesSchema = exports.CategoryIdParamSchema = exports.GetCategoriesQuerySchema = exports.UpdateCategorySchema = exports.CreateCategorySchema = void 0;
const zod_1 = require("zod");
const createSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
};
exports.CreateCategorySchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(1, 'Category title is required')
        .max(100, 'Category title must be less than 100 characters')
        .trim(),
    description: zod_1.z.string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),
    slug: zod_1.z.string()
        .min(1, 'Slug is required')
        .max(100, 'Slug must be less than 100 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
        .optional(),
    isActive: zod_1.z.boolean().optional().default(true),
    sortOrder: zod_1.z.number().int().min(0).optional().default(0)
}).transform((data) => ({
    ...data,
    slug: data.slug || createSlug(data.title)
}));
exports.UpdateCategorySchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(1, 'Category title is required')
        .max(100, 'Category title must be less than 100 characters')
        .trim()
        .optional(),
    description: zod_1.z.string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),
    slug: zod_1.z.string()
        .min(1, 'Slug is required')
        .max(100, 'Slug must be less than 100 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
        .optional(),
    isActive: zod_1.z.boolean().optional(),
    sortOrder: zod_1.z.number().int().min(0).optional()
}).transform((data) => ({
    ...data,
    slug: data.slug || (data.title ? createSlug(data.title) : undefined)
}));
exports.GetCategoriesQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 10),
    sortBy: zod_1.z.string().optional().default('sortOrder'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('asc'),
    isActive: zod_1.z.enum(['true', 'false']).optional().transform(val => val ? val === 'true' : undefined),
    search: zod_1.z.string().optional(),
    includeProducts: zod_1.z.enum(['true', 'false']).optional().transform(val => val === 'true')
});
exports.CategoryIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Category ID is required')
});
exports.BulkUpdateCategoriesSchema = zod_1.z.object({
    categoryIds: zod_1.z.array(zod_1.z.string().min(1)),
    updates: zod_1.z.object({
        isActive: zod_1.z.boolean().optional(),
        sortOrder: zod_1.z.number().int().min(0).optional()
    })
});
//# sourceMappingURL=categories.schema.js.map