"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDistributor = exports.saveDistributorTargets = exports.getDistributorTargets = exports.getProductsByCategory = exports.getProductCategories = exports.getDistributors = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const mockDistributors = [
    { id: 'dist_1', name: 'Kathmandu Distributors', email: 'kathmandu@dist.com', province: 'Province 3' },
    { id: 'dist_2', name: 'Pokhara Traders', email: 'pokhara@dist.com', province: 'Province 4' },
    { id: 'dist_3', name: 'Biratnagar Suppliers', email: 'biratnagar@dist.com', province: 'Province 1' },
    { id: 'dist_4', name: 'Nepal Wholesale', email: 'wholesale@dist.com', province: 'Province 2' },
    { id: 'dist_5', name: 'Himalaya Traders', email: 'himalaya@dist.com', province: 'Province 5' }
];
const mockProductCategories = [
    { id: 'achar', name: 'Achar', description: 'Traditional Nepali pickles' },
    { id: 'dry_meat', name: 'Dry Meat', description: 'Dried meat products' },
    { id: 'spices', name: 'Spices', description: 'Various spices and seasonings' }
];
const mockProducts = {
    achar: [
        { id: 'prod_achar_1', name: 'Buff Achar', units: '500 gm' },
        { id: 'prod_achar_2', name: 'Pork Achar', units: '500 gm' },
        { id: 'prod_achar_3', name: 'Chicken Achar', units: '500 gm' },
        { id: 'prod_achar_4', name: 'Mixed Achar', units: '750 gm' }
    ],
    dry_meat: [
        { id: 'prod_dry_1', name: 'Buff Sukuti', units: '500 gm' },
        { id: 'prod_dry_2', name: 'Pork Sukuti', units: '500 gm' },
        { id: 'prod_dry_3', name: 'Chicken Sukuti', units: '500 gm' }
    ],
    spices: [
        { id: 'prod_spice_1', name: 'Turmeric Powder', units: '250 gm' },
        { id: 'prod_spice_2', name: 'Cumin Powder', units: '250 gm' },
        { id: 'prod_spice_3', name: 'Coriander Powder', units: '250 gm' },
        { id: 'prod_spice_4', name: 'Chili Powder', units: '250 gm' }
    ]
};
exports.getDistributors = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { province, search } = req.query;
    let filteredDistributors = [...mockDistributors];
    if (province && typeof province === 'string') {
        filteredDistributors = filteredDistributors.filter(distributor => distributor.province.toLowerCase().includes(province.toLowerCase()));
    }
    if (search && typeof search === 'string') {
        const searchTerm = search.toLowerCase();
        filteredDistributors = filteredDistributors.filter(distributor => distributor.name.toLowerCase().includes(searchTerm) ||
            distributor.email.toLowerCase().includes(searchTerm) ||
            distributor.province.toLowerCase().includes(searchTerm));
    }
    const response = {
        success: true,
        message: 'Distributors retrieved successfully',
        data: {
            distributors: filteredDistributors,
            total: filteredDistributors.length
        }
    };
    res.status(200).json(response);
});
exports.getProductCategories = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const response = {
        success: true,
        message: 'Product categories retrieved successfully',
        data: mockProductCategories
    };
    res.status(200).json(response);
});
exports.getProductsByCategory = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { categoryId } = req.params;
    const products = mockProducts[categoryId] || [];
    const response = {
        success: true,
        message: 'Products retrieved successfully',
        data: {
            products,
            categoryId,
            total: products.length
        }
    };
    res.status(200).json(response);
});
exports.getDistributorTargets = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { categoryId, month, year, distributorId } = req.query;
    const mockTargets = mockDistributors.map(distributor => ({
        distributorId: distributor.id,
        distributorName: distributor.name,
        categoryId: categoryId || 'achar',
        month: parseInt(month) || new Date().getMonth() + 1,
        year: parseInt(year) || new Date().getFullYear(),
        totalTarget: Math.floor(Math.random() * 1000) + 100,
        totalAchieved: Math.floor(Math.random() * 800) + 50,
        items: (mockProducts[categoryId] || mockProducts.achar).map(product => ({
            productId: product.id,
            productName: product.name,
            targetValue: Math.floor(Math.random() * 200) + 10,
            achievedValue: Math.floor(Math.random() * 150) + 5
        }))
    }));
    let filteredTargets = mockTargets;
    if (distributorId && typeof distributorId === 'string') {
        filteredTargets = filteredTargets.filter(target => target.distributorId === distributorId);
    }
    const response = {
        success: true,
        message: 'Distributor targets retrieved successfully',
        data: {
            targets: filteredTargets,
            filters: {
                categoryId,
                month,
                year,
                distributorId
            }
        }
    };
    res.status(200).json(response);
});
exports.saveDistributorTargets = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { categoryId, month, year, targets } = req.body;
    if (!categoryId || !month || !year || !targets || !Array.isArray(targets)) {
        const response = {
            success: false,
            message: 'Missing required fields',
            error: 'INVALID_INPUT'
        };
        res.status(400).json(response);
        return;
    }
    console.log('Saving distributor targets:', {
        categoryId,
        month,
        year,
        targetsCount: targets.length
    });
    const response = {
        success: true,
        message: 'Distributor targets saved successfully',
        data: {
            categoryId,
            month,
            year,
            savedTargets: targets.length
        }
    };
    res.status(200).json(response);
});
exports.addDistributor = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { name, email, province } = req.body;
    if (!name || !email || !province) {
        const response = {
            success: false,
            message: 'Missing required fields: name, email, and province are required',
            error: 'INVALID_INPUT'
        };
        res.status(400).json(response);
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const response = {
            success: false,
            message: 'Invalid email format',
            error: 'INVALID_EMAIL'
        };
        res.status(400).json(response);
        return;
    }
    const existingDistributor = mockDistributors.find(d => d.email === email);
    if (existingDistributor) {
        const response = {
            success: false,
            message: 'Distributor with this email already exists',
            error: 'DUPLICATE_EMAIL'
        };
        res.status(409).json(response);
        return;
    }
    const newDistributor = {
        id: `dist_${Date.now()}`,
        name,
        email,
        province
    };
    mockDistributors.push(newDistributor);
    const response = {
        success: true,
        message: 'Distributor added successfully',
        data: newDistributor
    };
    res.status(201).json(response);
});
//# sourceMappingURL=salesTargets.controller.js.map