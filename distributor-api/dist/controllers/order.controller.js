"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderDetails = exports.updateOrderStatus = exports.getDistributorOrders = exports.getAllOrders = exports.submitOrder = void 0;
const client_1 = require("@prisma/client");
const error_middleware_1 = require("@/middleware/error.middleware");
const prisma = new client_1.PrismaClient();
exports.submitOrder = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { items, notes } = req.body;
    const distributorId = req.user?.id;
    if (!distributorId) {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        const response = {
            success: false,
            message: 'Order items are required',
            error: 'INVALID_ORDER_ITEMS'
        };
        res.status(400).json(response);
        return;
    }
    try {
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    distributorId,
                    totalAmount,
                    totalQuantity,
                    notes: notes || null,
                    items: {
                        create: items.map((item) => ({
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.quantity * item.unitPrice,
                            unit: item.unit,
                            productName: item.subcategory,
                            categoryName: item.categoryTitle
                        }))
                    }
                },
                include: {
                    distributor: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true
                        }
                    },
                    items: true
                }
            });
            return newOrder;
        });
        const response = {
            success: true,
            message: 'Order submitted successfully',
            data: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                totalQuantity: order.totalQuantity,
                status: order.status,
                createdAt: order.createdAt,
                itemsCount: order.items.length
            }
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error submitting order:', error);
        const response = {
            success: false,
            message: 'Failed to submit order',
            error: 'ORDER_SUBMISSION_FAILED'
        };
        res.status(500).json(response);
    }
});
exports.getAllOrders = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { status, distributorId, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    try {
        const where = {};
        if (status) {
            where.status = status;
        }
        if (distributorId) {
            where.distributorId = distributorId;
        }
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    distributor: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true
                        }
                    },
                    items: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: offset,
                take: limitNum
            }),
            prisma.order.count({ where })
        ]);
        const response = {
            success: true,
            message: 'Orders retrieved successfully',
            data: {
                orders,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        const response = {
            success: false,
            message: 'Failed to fetch orders',
            error: 'FETCH_ORDERS_FAILED'
        };
        res.status(500).json(response);
    }
});
exports.getDistributorOrders = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const distributorId = req.user?.id;
    if (!distributorId) {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    try {
        const orders = await prisma.order.findMany({
            where: {
                distributorId
            },
            include: {
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        const response = {
            success: true,
            message: 'Distributor orders retrieved successfully',
            data: {
                orders
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error fetching distributor orders:', error);
        const response = {
            success: false,
            message: 'Failed to fetch distributor orders',
            error: 'FETCH_DISTRIBUTOR_ORDERS_FAILED'
        };
        res.status(500).json(response);
    }
});
exports.updateOrderStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    if (!status || !['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
        const response = {
            success: false,
            message: 'Valid status is required',
            error: 'INVALID_STATUS'
        };
        res.status(400).json(response);
        return;
    }
    try {
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status,
                notes: notes || undefined
            },
            include: {
                distributor: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                items: true
            }
        });
        const response = {
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error updating order status:', error);
        const response = {
            success: false,
            message: 'Failed to update order status',
            error: 'UPDATE_ORDER_STATUS_FAILED'
        };
        res.status(500).json(response);
    }
});
exports.getOrderDetails = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                distributor: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        address: true
                    }
                },
                items: true
            }
        });
        if (!order) {
            const response = {
                success: false,
                message: 'Order not found',
                error: 'ORDER_NOT_FOUND'
            };
            res.status(404).json(response);
            return;
        }
        const response = {
            success: true,
            message: 'Order details retrieved successfully',
            data: order
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error fetching order details:', error);
        const response = {
            success: false,
            message: 'Failed to fetch order details',
            error: 'FETCH_ORDER_DETAILS_FAILED'
        };
        res.status(500).json(response);
    }
});
//# sourceMappingURL=order.controller.js.map