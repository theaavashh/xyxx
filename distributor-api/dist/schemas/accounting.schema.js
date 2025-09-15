"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.misReportSchema = exports.reportGenerationSchema = exports.dateRangeSchema = exports.vatReportSchema = exports.purchaseEntrySchema = exports.partyLedgerSchema = exports.accountSchema = exports.journalEntrySchema = exports.journalEntryDetailSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.journalEntryDetailSchema = joi_1.default.object({
    accountCode: joi_1.default.string().required().messages({
        'string.empty': 'Account code is required',
        'any.required': 'Account code is required'
    }),
    accountName: joi_1.default.string().required().messages({
        'string.empty': 'Account name is required',
        'any.required': 'Account name is required'
    }),
    description: joi_1.default.string().allow('').optional(),
    debitAmount: joi_1.default.number().min(0).default(0).messages({
        'number.min': 'Debit amount cannot be negative'
    }),
    creditAmount: joi_1.default.number().min(0).default(0).messages({
        'number.min': 'Credit amount cannot be negative'
    })
});
exports.journalEntrySchema = joi_1.default.object({
    date: joi_1.default.date().required().messages({
        'date.base': 'Valid date is required',
        'any.required': 'Date is required'
    }),
    description: joi_1.default.string().required().min(3).max(500).messages({
        'string.empty': 'Description is required',
        'string.min': 'Description must be at least 3 characters',
        'string.max': 'Description cannot exceed 500 characters',
        'any.required': 'Description is required'
    }),
    referenceNumber: joi_1.default.string().allow('').optional(),
    referenceType: joi_1.default.string().valid('invoice', 'payment', 'adjustment', 'manual').default('manual'),
    status: joi_1.default.string().valid('draft', 'posted').default('draft'),
    entries: joi_1.default.array().items(exports.journalEntryDetailSchema).min(2).required().messages({
        'array.min': 'Journal entry must have at least 2 entries',
        'any.required': 'Journal entries are required'
    }),
    notes: joi_1.default.string().allow('').optional().max(1000).messages({
        'string.max': 'Notes cannot exceed 1000 characters'
    })
}).custom((value, helpers) => {
    const totalDebits = value.entries.reduce((sum, entry) => sum + (entry.debitAmount || 0), 0);
    const totalCredits = value.entries.reduce((sum, entry) => sum + (entry.creditAmount || 0), 0);
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
        return helpers.error('custom.debitCreditBalance', {
            totalDebits,
            totalCredits,
            difference: Math.abs(totalDebits - totalCredits)
        });
    }
    for (let i = 0; i < value.entries.length; i++) {
        const entry = value.entries[i];
        const hasDebit = (entry.debitAmount || 0) > 0;
        const hasCredit = (entry.creditAmount || 0) > 0;
        if (hasDebit && hasCredit) {
            return helpers.error('custom.entryBothDebitCredit', { index: i + 1 });
        }
        if (!hasDebit && !hasCredit) {
            return helpers.error('custom.entryNoAmount', { index: i + 1 });
        }
    }
    return value;
}, 'Journal Entry Validation').messages({
    'custom.debitCreditBalance': 'Total debits ({{#totalDebits}}) must equal total credits ({{#totalCredits}}). Difference: {{#difference}}',
    'custom.entryBothDebitCredit': 'Entry {{#index}} cannot have both debit and credit amounts',
    'custom.entryNoAmount': 'Entry {{#index}} must have either debit or credit amount'
});
exports.accountSchema = joi_1.default.object({
    code: joi_1.default.string().required().min(3).max(20).pattern(/^[A-Z0-9-]+$/).messages({
        'string.empty': 'Account code is required',
        'string.min': 'Account code must be at least 3 characters',
        'string.max': 'Account code cannot exceed 20 characters',
        'string.pattern.base': 'Account code must contain only uppercase letters, numbers, and hyphens',
        'any.required': 'Account code is required'
    }),
    name: joi_1.default.string().required().min(3).max(100).messages({
        'string.empty': 'Account name is required',
        'string.min': 'Account name must be at least 3 characters',
        'string.max': 'Account name cannot exceed 100 characters',
        'any.required': 'Account name is required'
    }),
    type: joi_1.default.string().valid('asset', 'liability', 'equity', 'revenue', 'expense').required().messages({
        'any.only': 'Account type must be one of: asset, liability, equity, revenue, expense',
        'any.required': 'Account type is required'
    }),
    parentAccountCode: joi_1.default.string().allow('').optional(),
    description: joi_1.default.string().allow('').optional().max(500).messages({
        'string.max': 'Description cannot exceed 500 characters'
    }),
    isActive: joi_1.default.boolean().default(true),
    normalBalance: joi_1.default.string().valid('debit', 'credit').required().messages({
        'any.only': 'Normal balance must be either debit or credit',
        'any.required': 'Normal balance is required'
    })
}).custom((value, helpers) => {
    const { type, normalBalance } = value;
    const expectedNormalBalance = {
        asset: 'debit',
        expense: 'debit',
        liability: 'credit',
        equity: 'credit',
        revenue: 'credit'
    };
    if (expectedNormalBalance[type] !== normalBalance) {
        return helpers.error('custom.invalidNormalBalance', { type, expectedNormalBalance: expectedNormalBalance[type] });
    }
    return value;
}, 'Account Normal Balance Validation').messages({
    'custom.invalidNormalBalance': '{{#type}} accounts should have {{#expectedNormalBalance}} normal balance'
});
exports.partyLedgerSchema = joi_1.default.object({
    partyName: joi_1.default.string().required().min(2).max(100).messages({
        'string.empty': 'Party name is required',
        'string.min': 'Party name must be at least 2 characters',
        'string.max': 'Party name cannot exceed 100 characters',
        'any.required': 'Party name is required'
    }),
    partyType: joi_1.default.string().valid('customer', 'supplier').required().messages({
        'any.only': 'Party type must be either customer or supplier',
        'any.required': 'Party type is required'
    }),
    contactNumber: joi_1.default.string().allow('').optional().pattern(/^[0-9+\-\s()]+$/).messages({
        'string.pattern.base': 'Contact number must contain only numbers, spaces, hyphens, plus signs, and parentheses'
    }),
    email: joi_1.default.string().allow('').optional().email().messages({
        'string.email': 'Please provide a valid email address'
    }),
    address: joi_1.default.string().allow('').optional().max(500).messages({
        'string.max': 'Address cannot exceed 500 characters'
    }),
    panNumber: joi_1.default.string().allow('').optional().pattern(/^[0-9]{9}$/).messages({
        'string.pattern.base': 'PAN number must be exactly 9 digits'
    }),
    openingBalance: joi_1.default.number().default(0).messages({
        'number.base': 'Opening balance must be a number'
    }),
    openingBalanceType: joi_1.default.string().valid('debit', 'credit').default('debit').messages({
        'any.only': 'Opening balance type must be either debit or credit'
    }),
    creditLimit: joi_1.default.number().min(0).allow(null).optional().messages({
        'number.min': 'Credit limit cannot be negative'
    })
});
exports.purchaseEntrySchema = joi_1.default.object({
    purchaseDate: joi_1.default.date().required().messages({
        'date.base': 'Valid purchase date is required',
        'any.required': 'Purchase date is required'
    }),
    billNumber: joi_1.default.string().required().min(1).max(50).messages({
        'string.empty': 'Bill number is required',
        'string.max': 'Bill number cannot exceed 50 characters',
        'any.required': 'Bill number is required'
    }),
    supplierId: joi_1.default.string().required().messages({
        'string.empty': 'Supplier is required',
        'any.required': 'Supplier is required'
    }),
    supplierName: joi_1.default.string().required().min(2).max(100).messages({
        'string.empty': 'Supplier name is required',
        'string.min': 'Supplier name must be at least 2 characters',
        'string.max': 'Supplier name cannot exceed 100 characters',
        'any.required': 'Supplier name is required'
    }),
    items: joi_1.default.array().items(joi_1.default.object({
        description: joi_1.default.string().required().min(1).max(200).messages({
            'string.empty': 'Item description is required',
            'string.max': 'Item description cannot exceed 200 characters',
            'any.required': 'Item description is required'
        }),
        quantity: joi_1.default.number().min(0.01).required().messages({
            'number.min': 'Quantity must be greater than 0',
            'any.required': 'Quantity is required'
        }),
        unitPrice: joi_1.default.number().min(0).required().messages({
            'number.min': 'Unit price cannot be negative',
            'any.required': 'Unit price is required'
        }),
        amount: joi_1.default.number().min(0).required().messages({
            'number.min': 'Amount cannot be negative',
            'any.required': 'Amount is required'
        }),
        isVATExempt: joi_1.default.boolean().default(false)
    })).min(1).required().messages({
        'array.min': 'At least one item is required',
        'any.required': 'Items are required'
    }),
    subtotal: joi_1.default.number().min(0).required().messages({
        'number.min': 'Subtotal cannot be negative',
        'any.required': 'Subtotal is required'
    }),
    discountAmount: joi_1.default.number().min(0).default(0).messages({
        'number.min': 'Discount amount cannot be negative'
    }),
    taxableAmount: joi_1.default.number().min(0).required().messages({
        'number.min': 'Taxable amount cannot be negative',
        'any.required': 'Taxable amount is required'
    }),
    vatAmount: joi_1.default.number().min(0).required().messages({
        'number.min': 'VAT amount cannot be negative',
        'any.required': 'VAT amount is required'
    }),
    totalAmount: joi_1.default.number().min(0).required().messages({
        'number.min': 'Total amount cannot be negative',
        'any.required': 'Total amount is required'
    }),
    paymentMethod: joi_1.default.string().valid('cash', 'bank_transfer', 'cheque', 'credit').default('credit').messages({
        'any.only': 'Payment method must be one of: cash, bank_transfer, cheque, credit'
    }),
    dueDate: joi_1.default.date().optional().messages({
        'date.base': 'Valid due date is required'
    }),
    notes: joi_1.default.string().allow('').optional().max(1000).messages({
        'string.max': 'Notes cannot exceed 1000 characters'
    }),
    status: joi_1.default.string().valid('pending', 'paid', 'overdue').default('pending').messages({
        'any.only': 'Status must be one of: pending, paid, overdue'
    })
}).custom((value, helpers) => {
    const expectedVAT = value.taxableAmount * 0.13;
    if (Math.abs(value.vatAmount - expectedVAT) > 0.01) {
        return helpers.error('custom.invalidVATAmount', {
            expected: expectedVAT.toFixed(2),
            actual: value.vatAmount
        });
    }
    const expectedTotal = value.taxableAmount + value.vatAmount;
    if (Math.abs(value.totalAmount - expectedTotal) > 0.01) {
        return helpers.error('custom.invalidTotalAmount', {
            expected: expectedTotal.toFixed(2),
            actual: value.totalAmount
        });
    }
    if (value.paymentMethod === 'credit' && value.dueDate && value.dueDate <= new Date()) {
        return helpers.error('custom.dueDateInPast');
    }
    return value;
}, 'Purchase Entry Validation').messages({
    'custom.invalidVATAmount': 'VAT amount should be {{#expected}} (13% of taxable amount), but got {{#actual}}',
    'custom.invalidTotalAmount': 'Total amount should be {{#expected}} (taxable + VAT), but got {{#actual}}',
    'custom.dueDateInPast': 'Due date must be in the future for credit purchases'
});
exports.vatReportSchema = joi_1.default.object({
    quarter: joi_1.default.number().integer().min(1).max(4).required().messages({
        'number.base': 'Quarter must be a number',
        'number.integer': 'Quarter must be an integer',
        'number.min': 'Quarter must be between 1 and 4',
        'number.max': 'Quarter must be between 1 and 4',
        'any.required': 'Quarter is required'
    }),
    year: joi_1.default.number().integer().min(2000).max(2100).required().messages({
        'number.base': 'Year must be a number',
        'number.integer': 'Year must be an integer',
        'number.min': 'Year must be 2000 or later',
        'number.max': 'Year must be 2100 or earlier',
        'any.required': 'Year is required'
    }),
    fromDate: joi_1.default.date().required().messages({
        'date.base': 'Valid from date is required',
        'any.required': 'From date is required'
    }),
    toDate: joi_1.default.date().required().min(joi_1.default.ref('fromDate')).messages({
        'date.base': 'Valid to date is required',
        'date.min': 'To date must be after from date',
        'any.required': 'To date is required'
    })
});
exports.dateRangeSchema = joi_1.default.object({
    fromDate: joi_1.default.date().required().messages({
        'date.base': 'Valid from date is required',
        'any.required': 'From date is required'
    }),
    toDate: joi_1.default.date().required().min(joi_1.default.ref('fromDate')).messages({
        'date.base': 'Valid to date is required',
        'date.min': 'To date must be after from date',
        'any.required': 'To date is required'
    })
});
exports.reportGenerationSchema = joi_1.default.object({
    reportType: joi_1.default.string().valid('purchase', 'sales').required().messages({
        'any.only': 'Report type must be either purchase or sales',
        'any.required': 'Report type is required'
    }),
    fromDate: joi_1.default.date().required().messages({
        'date.base': 'Valid from date is required',
        'any.required': 'From date is required'
    }),
    toDate: joi_1.default.date().required().min(joi_1.default.ref('fromDate')).messages({
        'date.base': 'Valid to date is required',
        'date.min': 'To date must be after from date',
        'any.required': 'To date is required'
    }),
    includeDetails: joi_1.default.boolean().default(true),
    format: joi_1.default.string().valid('summary', 'detailed').default('detailed').messages({
        'any.only': 'Format must be either summary or detailed'
    })
});
exports.misReportSchema = joi_1.default.object({
    fromDate: joi_1.default.date().required().messages({
        'date.base': 'Valid from date is required',
        'any.required': 'From date is required'
    }),
    toDate: joi_1.default.date().required().min(joi_1.default.ref('fromDate')).messages({
        'date.base': 'Valid to date is required',
        'date.min': 'To date must be after from date',
        'any.required': 'To date is required'
    }),
    periodType: joi_1.default.string().valid('monthly', 'quarterly', 'yearly').required().messages({
        'any.only': 'Period type must be one of: monthly, quarterly, yearly',
        'any.required': 'Period type is required'
    }),
    includeComparisons: joi_1.default.boolean().default(true),
    includeBudgetVariance: joi_1.default.boolean().default(false)
});
exports.default = {
    journalEntrySchema: exports.journalEntrySchema,
    journalEntryDetailSchema: exports.journalEntryDetailSchema,
    accountSchema: exports.accountSchema,
    partyLedgerSchema: exports.partyLedgerSchema,
    purchaseEntrySchema: exports.purchaseEntrySchema,
    vatReportSchema: exports.vatReportSchema,
    dateRangeSchema: exports.dateRangeSchema,
    reportGenerationSchema: exports.reportGenerationSchema,
    misReportSchema: exports.misReportSchema
};
//# sourceMappingURL=accounting.schema.js.map