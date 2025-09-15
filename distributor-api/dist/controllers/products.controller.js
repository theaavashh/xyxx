"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductStats = exports.getProductsByCategory = exports.deleteProduct = exports.updateProductStock = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const client_1 = require("@prisma/client");
const error_middleware_1 = require("../middleware/error.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const prisma = new client_1.PrismaClient();
exports.createProduct = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    let productData;
    try {
        if (req.body.data) {
            productData = JSON.parse(req.body.data);
        }
        else {
            productData = req.body;
        }
    }
    catch (error) {
        const response = {
            success: false,
            message: 'Invalid data format',
            error: 'INVALID_DATA_FORMAT'
        };
        res.status(400).json(response);
        return;
    }
    const files = req.files;
    const filePaths = files ? (0, upload_middleware_1.getFilePaths)(files) : {};
    const category = await prisma.category.findUnique({
        where: { id: productData.categoryId }
    });
    if (!category) {
        const response = {
            success: false,
            message: 'Category not found',
            error: 'CATEGORY_NOT_FOUND'
        };
        res.status(400).json(response);
        return;
    }
    const whereConditions = [
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
        const response = {
            success: false,
            message: `Product with this ${field} already exists`,
            error: 'PRODUCT_ALREADY_EXISTS'
        };
        res.status(400).json(response);
        return;
    }
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
            slug: productData.slug,
            images: filePaths.images ? JSON.stringify([filePaths.images]) : null,
            documents: filePaths.documents ? JSON.stringify([filePaths.documents]) : null,
            createdBy: req.user?.id || 'system'
        },
        include: {
            category: true
        }
    });
    const response = {
        success: true,
        message: 'Product created successfully',
        data: product
    };
    res.status(201).json(response);
});
exports.getProducts = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', categoryId, isActive, inStock, lowStock, search, brand, minPrice, maxPrice, includeCategory = true } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where = {};
    if (categoryId) {
        where.categoryId = categoryId;
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
        where.brand = { contains: brand, mode: 'insensitive' };
    }
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice)
            where.price.gte = Number(minPrice);
        if (maxPrice)
            where.price.lte = Number(maxPrice);
    }
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } }
        ];
    }
    const include = {};
    if (includeCategory) {
        include.category = true;
    }
    const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
            where,
            include,
            skip,
            take,
            orderBy: { [sortBy]: sortOrder }
        }),
        prisma.product.count({ where })
    ]);
    const totalPages = Math.ceil(totalCount / take);
    const response = {
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
exports.getProductById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const includeCategory = req.query.includeCategory !== 'false';
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: includeCategory
        }
    });
    if (!product) {
        const response = {
            success: false,
            message: 'Product not found',
            error: 'PRODUCT_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    const response = {
        success: true,
        message: 'Product retrieved successfully',
        data: product
    };
    res.json(response);
});
exports.updateProduct = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    let updateData;
    try {
        if (req.body.data) {
            updateData = JSON.parse(req.body.data);
        }
        else {
            updateData = req.body;
        }
    }
    catch (error) {
        const response = {
            success: false,
            message: 'Invalid data format',
            error: 'INVALID_DATA_FORMAT'
        };
        res.status(400).json(response);
        return;
    }
    const existingProduct = await prisma.product.findUnique({
        where: { id }
    });
    if (!existingProduct) {
        const response = {
            success: false,
            message: 'Product not found',
            error: 'PRODUCT_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    if (updateData.categoryId) {
        const category = await prisma.category.findUnique({
            where: { id: updateData.categoryId }
        });
        if (!category) {
            const response = {
                success: false,
                message: 'Category not found',
                error: 'CATEGORY_NOT_FOUND'
            };
            res.status(400).json(response);
            return;
        }
    }
    if (updateData.name || updateData.sku) {
        const whereConditions = [];
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
            const response = {
                success: false,
                message: `Product with this ${field} already exists`,
                error: 'PRODUCT_ALREADY_EXISTS'
            };
            res.status(400).json(response);
            return;
        }
    }
    const files = req.files;
    const filePaths = files ? (0, upload_middleware_1.getFilePaths)(files) : {};
    const finalUpdateData = {
        ...updateData,
        updatedBy: req.user?.id || 'system'
    };
    if (filePaths.images) {
        finalUpdateData.images = JSON.stringify([filePaths.images]);
    }
    if (filePaths.documents) {
        finalUpdateData.documents = JSON.stringify([filePaths.documents]);
    }
    const product = await prisma.product.update({
        where: { id },
        data: finalUpdateData,
        include: {
            category: true
        }
    });
    const response = {
        success: true,
        message: 'Product updated successfully',
        data: product
    };
    res.json(response);
});
exports.updateProductStock = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { stockQuantity, operation = 'set', reason } = req.body;
    const existingProduct = await prisma.product.findUnique({
        where: { id }
    });
    if (!existingProduct) {
        const response = {
            success: false,
            message: 'Product not found',
            error: 'PRODUCT_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    let newStockQuantity = stockQuantity;
    if (operation === 'add') {
        newStockQuantity = existingProduct.stockQuantity + stockQuantity;
    }
    else if (operation === 'subtract') {
        newStockQuantity = Math.max(0, existingProduct.stockQuantity - stockQuantity);
    }
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
    const response = {
        success: true,
        message: `Product stock ${operation === 'set' ? 'updated' : operation === 'add' ? 'increased' : 'decreased'} successfully`,
        data: product
    };
    res.json(response);
});
exports.deleteProduct = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const existingProduct = await prisma.product.findUnique({
        where: { id }
    });
    if (!existingProduct) {
        const response = {
            success: false,
            message: 'Product not found',
            error: 'PRODUCT_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    await prisma.product.delete({
        where: { id }
    });
    const response = {
        success: true,
        message: 'Product deleted successfully'
    };
    res.json(response);
});
exports.getProductsByCategory = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { categoryId } = req.params;
    const { page = 1, limit = 10, isActive, inStock } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const category = await prisma.category.findUnique({
        where: { id: categoryId }
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
    const where = { categoryId };
    if (isActive !== undefined) {
        where.isActive = isActive === 'true';
    }
    if (inStock === 'true') {
        where.stockQuantity = { gt: 0 };
    }
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
    const response = {
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
exports.getProductStats = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const [totalProducts, activeProducts, outOfStockProducts, lowStockProducts, totalValue] = await Promise.all([
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
    const response = {
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
//# sourceMappingURL=products.controller.js.map