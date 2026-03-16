"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSKUsByProduct = exports.deleteSKU = exports.updateSKU = exports.createSKU = exports.getSKUById = exports.getAllSKUs = void 0;
const client_1 = require("@prisma/client");
const error_middleware_1 = require("../middleware/error.middleware");
const prisma = new client_1.PrismaClient();
exports.getAllSKUs = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { productId, isActive, search } = req.query;
    const where = {};
    if (productId) {
        where.productId = productId;
    }
    if (isActive !== undefined) {
        where.isActive = isActive === 'true';
    }
    if (search) {
        where.OR = [
            { sku: { contains: search, mode: 'insensitive' } },
            { variantName: { contains: search, mode: 'insensitive' } },
            { barcode: { contains: search, mode: 'insensitive' } }
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
    const response = {
        success: true,
        message: 'SKUs retrieved successfully',
        data: skus
    };
    res.status(200).json(response);
});
exports.getSKUById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
        const response = {
            success: false,
            message: 'SKU not found',
            error: 'SKU_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    const response = {
        success: true,
        message: 'SKU retrieved successfully',
        data: sku
    };
    res.status(200).json(response);
});
exports.createSKU = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { sku, productId, productName, variantName, attributes, price, costPrice, stockQuantity, minStockLevel, maxStockLevel, barcode, weight, dimensions, isActive, images, notes } = req.body;
    let finalProductId = productId;
    if (productId) {
        const productById = await prisma.product.findUnique({
            where: { id: productId }
        });
        if (productById) {
            finalProductId = productById.id;
        }
    }
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
    if (!finalProductId && productName) {
        let defaultCategory = await prisma.category.findFirst();
        if (!defaultCategory) {
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
        const response = {
            success: false,
            message: 'Product not found. Please provide a valid productId or productName.',
            error: 'PRODUCT_NOT_FOUND'
        };
        res.status(400).json(response);
        return;
    }
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
        const response = {
            success: false,
            message: `${field} already exists`,
            error: 'SKU_ALREADY_EXISTS'
        };
        res.status(400).json(response);
        return;
    }
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
    const response = {
        success: true,
        message: 'SKU created successfully',
        data: newSKU
    };
    res.status(201).json(response);
});
exports.updateSKU = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { sku, productId, variantName, attributes, price, costPrice, stockQuantity, minStockLevel, maxStockLevel, barcode, weight, dimensions, isActive, images, notes } = req.body;
    const existingSKU = await prisma.productSKU.findUnique({
        where: { id }
    });
    if (!existingSKU) {
        const response = {
            success: false,
            message: 'SKU not found',
            error: 'SKU_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    if (sku && sku !== existingSKU.sku) {
        const skuExists = await prisma.productSKU.findFirst({
            where: { sku, id: { not: id } }
        });
        if (skuExists) {
            const response = {
                success: false,
                message: 'SKU code already exists',
                error: 'SKU_ALREADY_EXISTS'
            };
            res.status(400).json(response);
            return;
        }
    }
    if (barcode && barcode !== existingSKU.barcode) {
        const barcodeExists = await prisma.productSKU.findFirst({
            where: { barcode, id: { not: id } }
        });
        if (barcodeExists) {
            const response = {
                success: false,
                message: 'Barcode already exists',
                error: 'BARCODE_ALREADY_EXISTS'
            };
            res.status(400).json(response);
            return;
        }
    }
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
    const response = {
        success: true,
        message: 'SKU updated successfully',
        data: updatedSKU
    };
    res.status(200).json(response);
});
exports.deleteSKU = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const existingSKU = await prisma.productSKU.findUnique({
        where: { id }
    });
    if (!existingSKU) {
        const response = {
            success: false,
            message: 'SKU not found',
            error: 'SKU_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    await prisma.productSKU.delete({
        where: { id }
    });
    const response = {
        success: true,
        message: 'SKU deleted successfully'
    };
    res.status(200).json(response);
});
exports.getSKUsByProduct = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const product = await prisma.product.findUnique({
        where: { id: productId }
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
    const response = {
        success: true,
        message: 'SKUs retrieved successfully',
        data: skus
    };
    res.status(200).json(response);
});
//# sourceMappingURL=product-sku.controller.js.map