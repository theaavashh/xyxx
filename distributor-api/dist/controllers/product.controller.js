"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductCategories = exports.getProductById = exports.getProducts = void 0;
const error_middleware_1 = require("@/middleware/error.middleware");
const mockProducts = [
    {
        id: 'prod_1',
        name: 'Buff Achar',
        units: '500gm',
        packaging: 'Plastic Bottle',
        distributorPrice: 500,
        wholesalePrice: 525,
        rate: 575,
        mrp: 700,
        category: 'Food Products',
        description: 'Traditional Nepali buffalo pickle'
    },
    {
        id: 'prod_2',
        name: 'Mutton Achar',
        units: '500gm',
        packaging: 'Plastic Bottle',
        distributorPrice: 550,
        wholesalePrice: 575,
        rate: 625,
        mrp: 750,
        category: 'Food Products',
        description: 'Traditional Nepali mutton pickle'
    },
    {
        id: 'prod_3',
        name: 'Pork Achar',
        units: '500gm',
        packaging: 'Plastic Bottle',
        distributorPrice: 600,
        wholesalePrice: 625,
        rate: 675,
        mrp: 800,
        category: 'Food Products',
        description: 'Traditional Nepali pork pickle'
    },
    {
        id: 'prod_4',
        name: 'Mixed Achar',
        units: '750gm',
        packaging: 'Glass Jar',
        distributorPrice: 450,
        wholesalePrice: 475,
        rate: 525,
        mrp: 650,
        category: 'Food Products',
        description: 'Mixed vegetable pickle'
    },
    {
        id: 'prod_5',
        name: 'Chicken Achar',
        units: '500gm',
        packaging: 'Plastic Bottle',
        distributorPrice: 520,
        wholesalePrice: 545,
        rate: 595,
        mrp: 720,
        category: 'Food Products',
        description: 'Traditional Nepali chicken pickle'
    },
    {
        id: 'prod_6',
        name: 'Fish Achar',
        units: '500gm',
        packaging: 'Plastic Bottle',
        distributorPrice: 580,
        wholesalePrice: 605,
        rate: 655,
        mrp: 780,
        category: 'Food Products',
        description: 'Traditional Nepali fish pickle'
    }
];
exports.getProducts = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { category, search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    let filteredProducts = [...mockProducts];
    if (category && typeof category === 'string') {
        filteredProducts = filteredProducts.filter(product => product.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (search && typeof search === 'string') {
        const searchTerm = search.toLowerCase();
        filteredProducts = filteredProducts.filter(product => product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm));
    }
    filteredProducts.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        if (sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
        }
        else {
            return aValue > bValue ? 1 : -1;
        }
    });
    const response = {
        success: true,
        message: 'Products retrieved successfully',
        data: {
            products: filteredProducts,
            total: filteredProducts.length,
            filters: {
                category: category || 'all',
                search: search || '',
                sortBy,
                sortOrder
            }
        }
    };
    res.status(200).json(response);
});
exports.getProductById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const product = mockProducts.find(p => p.id === id);
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
    res.status(200).json(response);
});
exports.getProductCategories = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const categories = Array.from(new Set(mockProducts.map(product => product.category)));
    const response = {
        success: true,
        message: 'Product categories retrieved successfully',
        data: categories
    };
    res.status(200).json(response);
});
//# sourceMappingURL=product.controller.js.map