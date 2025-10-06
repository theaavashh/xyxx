import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '@/middleware/error.middleware';
import { ApiResponse, AuthenticatedRequest } from '@/types';

const prisma = new PrismaClient();

// Submit a new order
export const submitOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { items, notes } = req.body;
  const distributorId = req.user?.id;

  if (!distributorId) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    const response: ApiResponse = {
      success: false,
      message: 'Order items are required',
      error: 'INVALID_ORDER_ITEMS'
    };
    res.status(400).json(response);
    return;
  }

  try {
    // Calculate totals
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const totalQuantity = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          distributorId,
          totalAmount,
          totalQuantity,
          notes: notes || null,
          items: {
            create: items.map((item: any) => ({
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

    const response: ApiResponse = {
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
  } catch (error) {
    console.error('Error submitting order:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to submit order',
      error: 'ORDER_SUBMISSION_FAILED'
    };
    res.status(500).json(response);
  }
});

// Get all orders (for admin panel)
export const getAllOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status, distributorId, page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  try {
    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (distributorId) {
      where.distributorId = distributorId;
    }

    // Get orders with pagination
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

    const response: ApiResponse = {
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
  } catch (error) {
    console.error('Error fetching orders:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch orders',
      error: 'FETCH_ORDERS_FAILED'
    };
    res.status(500).json(response);
  }
});

// Get orders for a specific distributor
export const getDistributorOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const distributorId = req.user?.id;

  if (!distributorId) {
    const response: ApiResponse = {
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

    const response: ApiResponse = {
      success: true,
      message: 'Distributor orders retrieved successfully',
      data: {
        orders
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching distributor orders:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch distributor orders',
      error: 'FETCH_DISTRIBUTOR_ORDERS_FAILED'
    };
    res.status(500).json(response);
  }
});

// Update order status (for admin)
export const updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!status || !['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
    const response: ApiResponse = {
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

    const response: ApiResponse = {
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating order status:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to update order status',
      error: 'UPDATE_ORDER_STATUS_FAILED'
    };
    res.status(500).json(response);
  }
});

// Get order details
export const getOrderDetails = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      const response: ApiResponse = {
        success: false,
        message: 'Order not found',
        error: 'ORDER_NOT_FOUND'
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Order details retrieved successfully',
      data: order
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching order details:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch order details',
      error: 'FETCH_ORDER_DETAILS_FAILED'
    };
    res.status(500).json(response);
  }
});
