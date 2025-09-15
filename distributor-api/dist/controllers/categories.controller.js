"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryStats = exports.reorderCategories = exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const client_1 = require("@prisma/client");
const error_middleware_1 = require("../middleware/error.middleware");
const prisma = new client_1.PrismaClient();
exports.createCategory = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const categoryData = req.body;
    if (!categoryData.slug) {
        categoryData.slug = categoryData.title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
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
        const response = {
            success: false,
            message: `Category with this ${field} already exists`,
            error: 'CATEGORY_ALREADY_EXISTS'
        };
        res.status(400).json(response);
        return;
    }
    const category = await prisma.category.create({
        data: {
            title: categoryData.title,
            description: categoryData.description,
            slug: categoryData.slug,
            isActive: categoryData.isActive ?? true,
            sortOrder: categoryData.sortOrder ?? 0,
            createdBy: req.user?.id || 'system',
        },
        include: {
            _count: {
                select: { products: true }
            }
        }
    });
    const response = {
        success: true,
        message: 'Category created successfully',
        data: category
    };
    res.status(201).json(response);
});
exports.getCategories = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'sortOrder', sortOrder = 'asc', isActive, search, includeProducts = false } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where = {};
    if (isActive !== undefined) {
        where.isActive = isActive === 'true';
    }
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }
    const include = {
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
    const [categories, totalCount] = await Promise.all([
        prisma.category.findMany({
            where,
            include,
            skip,
            take,
            orderBy: { [sortBy]: sortOrder }
        }),
        prisma.category.count({ where })
    ]);
    const totalPages = Math.ceil(totalCount / take);
    const response = {
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
exports.getCategoryById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const includeProducts = req.query.includeProducts === 'true';
    const include = {
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
        const response = {
            success: false,
            message: 'Category not found',
            error: 'CATEGORY_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    const response = {
        success: true,
        message: 'Category retrieved successfully',
        data: category
    };
    res.json(response);
});
exports.updateCategory = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const existingCategory = await prisma.category.findUnique({
        where: { id }
    });
    if (!existingCategory) {
        const response = {
            success: false,
            message: 'Category not found',
            error: 'CATEGORY_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
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
            const response = {
                success: false,
                message: `Category with this ${field} already exists`,
                error: 'CATEGORY_ALREADY_EXISTS'
            };
            res.status(400).json(response);
            return;
        }
    }
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
    const response = {
        success: true,
        message: 'Category updated successfully',
        data: category
    };
    res.json(response);
});
exports.deleteCategory = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const existingCategory = await prisma.category.findUnique({
        where: { id },
        include: {
            _count: {
                select: { products: true }
            }
        }
    });
    if (!existingCategory) {
        const response = {
            success: false,
            message: 'Category not found',
            error: 'CATEGORY_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    if (existingCategory._count.products > 0) {
        const response = {
            success: false,
            message: 'Cannot delete category with existing products. Please move or delete products first.',
            error: 'CATEGORY_HAS_PRODUCTS'
        };
        res.status(400).json(response);
        return;
    }
    await prisma.category.delete({
        where: { id }
    });
    const response = {
        success: true,
        message: 'Category deleted successfully'
    };
    res.json(response);
});
exports.reorderCategories = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { categoryIds } = req.body;
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        const response = {
            success: false,
            message: 'Category IDs array is required',
            error: 'INVALID_INPUT'
        };
        res.status(400).json(response);
        return;
    }
    const updatePromises = categoryIds.map((categoryId, index) => prisma.category.update({
        where: { id: categoryId },
        data: {
            sortOrder: index + 1,
            updatedBy: req.user?.id || 'system'
        }
    }));
    await Promise.all(updatePromises);
    const response = {
        success: true,
        message: 'Categories reordered successfully'
    };
    res.json(response);
});
exports.getCategoryStats = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
    const response = {
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
//# sourceMappingURL=categories.controller.js.map