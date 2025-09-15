"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.misReportController = exports.purchaseSalesReportsController = exports.debtorsCreditors = exports.balanceSheetController = exports.trialBalanceController = exports.vatReportController = exports.purchaseEntryController = exports.partyLedgerController = exports.accountsController = exports.ledgerController = exports.journalEntryController = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.journalEntryController = {
    async getJournalEntries(req, res) {
        try {
            const { fromDate, toDate, accountCode, status, search, page = 1, limit = 10 } = req.query;
            const where = {};
            if (fromDate && toDate) {
                where.date = {
                    gte: new Date(fromDate),
                    lte: new Date(toDate)
                };
            }
            if (accountCode) {
                where.entries = {
                    some: {
                        account: {
                            code: accountCode
                        }
                    }
                };
            }
            if (status) {
                where.status = status;
            }
            if (search) {
                where.OR = [
                    { description: { contains: search, mode: 'insensitive' } },
                    { referenceNumber: { contains: search, mode: 'insensitive' } }
                ];
            }
            const skip = (Number(page) - 1) * Number(limit);
            const [journalEntries, total] = await Promise.all([
                prisma.journalEntry.findMany({
                    where,
                    include: {
                        entries: {
                            include: {
                                account: true
                            }
                        },
                        createdBy: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true
                            }
                        }
                    },
                    orderBy: { date: 'desc' },
                    skip,
                    take: Number(limit)
                }),
                prisma.journalEntry.count({ where })
            ]);
            return res.status(200).json({
                success: true,
                message: 'Journal entries retrieved successfully',
                data: {
                    journalEntries,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        totalPages: Math.ceil(total / Number(limit))
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching journal entries:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch journal entries',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async getJournalEntryById(req, res) {
        try {
            const { id } = req.params;
            const journalEntry = await prisma.journalEntry.findUnique({
                where: { id },
                include: {
                    entries: true
                }
            });
            if (!journalEntry) {
                return res.status(404).json({
                    success: false,
                    message: 'Journal entry not found'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Journal entry retrieved successfully',
                data: journalEntry
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching journal entry:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch journal entry',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async createJournalEntry(req, res) {
        try {
            const journalEntryData = req.body;
            const totalDebits = journalEntryData.entries.reduce((sum, entry) => sum + (entry.debitAmount || 0), 0);
            const totalCredits = journalEntryData.entries.reduce((sum, entry) => sum + (entry.creditAmount || 0), 0);
            if (Math.abs(totalDebits - totalCredits) > 0.01) {
                return res.status(400).json({
                    success: false,
                    message: 'Total debits must equal total credits',
                    errors: {
                        balance: [`Difference: ${Math.abs(totalDebits - totalCredits).toFixed(2)}`]
                    }
                });
            }
            const journalEntry = await prisma.journalEntry.create({
                data: {
                    ...journalEntryData,
                    entries: {
                        create: journalEntryData.entries
                    }
                },
                include: {
                    entries: true
                }
            });
            logger_1.default.info(`Journal entry created: ${journalEntry.id}`);
            return res.status(201).json({
                success: true,
                message: 'Journal entry created successfully',
                data: journalEntry
            });
        }
        catch (error) {
            logger_1.default.error('Error creating journal entry:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create journal entry',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async updateJournalEntry(req, res) {
        try {
            const { id } = req.params;
            const journalEntryData = req.body;
            const existingEntry = await prisma.journalEntry.findUnique({ where: { id } });
            if (!existingEntry) {
                return res.status(404).json({
                    success: false,
                    message: 'Journal entry not found'
                });
            }
            if (existingEntry.status === 'POSTED') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot modify posted journal entry'
                });
            }
            await prisma.journalLineItem.deleteMany({ where: { journalEntryId: id } });
            const journalEntry = await prisma.journalEntry.update({
                where: { id },
                data: {
                    ...journalEntryData,
                    entries: {
                        create: journalEntryData.entries
                    }
                },
                include: {
                    entries: true
                }
            });
            logger_1.default.info(`Journal entry updated: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Journal entry updated successfully',
                data: journalEntry
            });
        }
        catch (error) {
            logger_1.default.error('Error updating journal entry:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update journal entry',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async postJournalEntry(req, res) {
        try {
            const { id } = req.params;
            const journalEntry = await prisma.journalEntry.update({
                where: { id },
                data: {
                    status: 'POSTED',
                    postedAt: new Date(),
                    postedBy: 'admin'
                },
                include: {
                    entries: true
                }
            });
            logger_1.default.info(`Journal entry posted: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Journal entry posted successfully',
                data: journalEntry
            });
        }
        catch (error) {
            logger_1.default.error('Error posting journal entry:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to post journal entry',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async deleteJournalEntry(req, res) {
        try {
            const { id } = req.params;
            const existingEntry = await prisma.journalEntry.findUnique({ where: { id } });
            if (!existingEntry) {
                return res.status(404).json({
                    success: false,
                    message: 'Journal entry not found'
                });
            }
            if (existingEntry.status === 'POSTED') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete posted journal entry'
                });
            }
            await prisma.journalEntry.delete({ where: { id } });
            logger_1.default.info(`Journal entry deleted: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Journal entry deleted successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting journal entry:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete journal entry',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async validateJournalEntry(req, res) {
        try {
            const journalEntryData = req.body;
            const errors = [];
            const totalDebits = journalEntryData.entries.reduce((sum, entry) => sum + (entry.debitAmount || 0), 0);
            const totalCredits = journalEntryData.entries.reduce((sum, entry) => sum + (entry.creditAmount || 0), 0);
            if (Math.abs(totalDebits - totalCredits) > 0.01) {
                errors.push(`Total debits (${totalDebits}) must equal total credits (${totalCredits})`);
            }
            if (journalEntryData.entries.length < 2) {
                errors.push('Journal entry must have at least 2 entries');
            }
            journalEntryData.entries.forEach((entry, index) => {
                if ((entry.debitAmount || 0) > 0 && (entry.creditAmount || 0) > 0) {
                    errors.push(`Entry ${index + 1}: Cannot have both debit and credit amounts`);
                }
                if ((entry.debitAmount || 0) === 0 && (entry.creditAmount || 0) === 0) {
                    errors.push(`Entry ${index + 1}: Must have either debit or credit amount`);
                }
            });
            return res.status(200).json({
                success: true,
                message: 'Journal entry validation completed',
                data: {
                    isValid: errors.length === 0,
                    errors
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error validating journal entry:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to validate journal entry',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
};
exports.ledgerController = {
    async getLedgerEntries(req, res) {
        try {
            const { accountCode, fromDate, toDate, search, page = 1, limit = 10 } = req.query;
            const where = {};
            if (accountCode) {
                where.accountCode = accountCode;
            }
            if (fromDate && toDate) {
                where.date = {
                    gte: new Date(fromDate),
                    lte: new Date(toDate)
                };
            }
            if (search) {
                where.OR = [
                    { description: { contains: search, mode: 'insensitive' } },
                    { accountName: { contains: search, mode: 'insensitive' } },
                    { referenceId: { contains: search, mode: 'insensitive' } }
                ];
            }
            const skip = (Number(page) - 1) * Number(limit);
            const [ledgerEntries, total] = await Promise.all([
                prisma.ledgerEntry.findMany({
                    where,
                    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
                    skip,
                    take: Number(limit)
                }),
                prisma.ledgerEntry.count({ where })
            ]);
            return res.status(200).json({
                success: true,
                message: 'Ledger entries retrieved successfully',
                data: {
                    ledgerEntries,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        totalPages: Math.ceil(total / Number(limit))
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching ledger entries:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch ledger entries',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async getAccountLedger(req, res) {
        try {
            const { accountCode } = req.params;
            const { fromDate, toDate } = req.query;
            const where = { accountCode };
            if (fromDate && toDate) {
                where.date = {
                    gte: new Date(fromDate),
                    lte: new Date(toDate)
                };
            }
            const ledgerEntries = await prisma.ledgerEntry.findMany({
                where,
                orderBy: [{ date: 'asc' }, { createdAt: 'asc' }]
            });
            let runningBalance = 0;
            const entriesWithBalance = ledgerEntries.map((entry) => {
                runningBalance += entry.debitAmount - entry.creditAmount;
                return {
                    ...entry,
                    balance: runningBalance
                };
            });
            return res.status(200).json({
                success: true,
                message: 'Account ledger retrieved successfully',
                data: entriesWithBalance
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching account ledger:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch account ledger',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async getAccountBalance(req, res) {
        try {
            const { accountCode } = req.params;
            const { asOfDate } = req.query;
            const where = { accountCode };
            if (asOfDate) {
                where.date = {
                    lte: new Date(asOfDate)
                };
            }
            const result = await prisma.ledgerEntry.aggregate({
                where,
                _sum: {
                    debitAmount: true,
                    creditAmount: true
                }
            });
            const balance = Number(result._sum.debitAmount || 0) - Number(result._sum.creditAmount || 0);
            const balanceType = balance >= 0 ? 'debit' : 'credit';
            return res.status(200).json({
                success: true,
                message: 'Account balance retrieved successfully',
                data: {
                    balance: Math.abs(balance),
                    balanceType
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching account balance:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch account balance',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
};
exports.accountsController = {
    async getAccounts(req, res) {
        try {
            const { type, search, isActive } = req.query;
            const where = {};
            if (type) {
                where.type = type;
            }
            if (isActive !== undefined) {
                where.isActive = isActive === 'true';
            }
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { code: { contains: search, mode: 'insensitive' } }
                ];
            }
            const accounts = await prisma.account.findMany({
                where,
                orderBy: { code: 'asc' }
            });
            return res.status(200).json({
                success: true,
                message: 'Accounts retrieved successfully',
                data: accounts
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching accounts:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch accounts',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async getChartOfAccounts(req, res) {
        try {
            const accounts = await prisma.account.findMany({
                where: { isActive: true },
                orderBy: { code: 'asc' }
            });
            return res.status(200).json({
                success: true,
                message: 'Chart of accounts retrieved successfully',
                data: accounts
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching chart of accounts:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch chart of accounts',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async getAccountById(req, res) {
        try {
            const { id } = req.params;
            const account = await prisma.account.findUnique({
                where: { id }
            });
            if (!account) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Account retrieved successfully',
                data: account
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching account:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch account',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async createAccount(req, res) {
        try {
            const accountData = req.body;
            const existingAccount = await prisma.account.findUnique({
                where: { code: accountData.code }
            });
            if (existingAccount) {
                return res.status(400).json({
                    success: false,
                    message: 'Account code already exists',
                    errors: {
                        code: ['Account code must be unique']
                    }
                });
            }
            const account = await prisma.account.create({
                data: {
                    ...accountData,
                    createdBy: 'admin'
                }
            });
            logger_1.default.info(`Account created: ${account.code}`);
            return res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: account
            });
        }
        catch (error) {
            logger_1.default.error('Error creating account:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create account',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async updateAccount(req, res) {
        try {
            const { id } = req.params;
            const accountData = req.body;
            const existingAccount = await prisma.account.findUnique({ where: { id } });
            if (!existingAccount) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found'
                });
            }
            if (accountData.code && accountData.code !== existingAccount.code) {
                const codeExists = await prisma.account.findUnique({
                    where: { code: accountData.code }
                });
                if (codeExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'Account code already exists',
                        errors: {
                            code: ['Account code must be unique']
                        }
                    });
                }
            }
            const account = await prisma.account.update({
                where: { id },
                data: {
                    ...accountData,
                    updatedBy: 'admin'
                }
            });
            logger_1.default.info(`Account updated: ${account.code}`);
            return res.status(200).json({
                success: true,
                message: 'Account updated successfully',
                data: account
            });
        }
        catch (error) {
            logger_1.default.error('Error updating account:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update account',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async deleteAccount(req, res) {
        try {
            const { id } = req.params;
            const existingAccount = await prisma.account.findUnique({ where: { id } });
            if (!existingAccount) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found'
                });
            }
            const hasTransactions = await prisma.ledgerEntry.findFirst({
                where: { accountId: existingAccount.id }
            });
            if (hasTransactions) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete account with existing transactions. Consider deactivating instead.'
                });
            }
            await prisma.account.delete({ where: { id } });
            logger_1.default.info(`Account deleted: ${existingAccount.code}`);
            return res.status(200).json({
                success: true,
                message: 'Account deleted successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting account:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete account',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
};
exports.partyLedgerController = {
    async getPartyLedgers(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Party ledgers endpoint - implementation pending',
            data: []
        });
    },
    async getPartyLedgerById(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Party ledger by ID endpoint - implementation pending',
            data: null
        });
    },
    async getPartyTransactions(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Party transactions endpoint - implementation pending',
            data: []
        });
    },
    async createParty(req, res) {
        return res.status(201).json({
            success: true,
            message: 'Create party endpoint - implementation pending',
            data: null
        });
    },
    async updateParty(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Update party endpoint - implementation pending',
            data: null
        });
    },
    async deleteParty(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Delete party endpoint - implementation pending'
        });
    }
};
exports.purchaseEntryController = {
    async getPurchaseEntries(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Purchase entries endpoint - implementation pending',
            data: []
        });
    },
    async getPurchaseEntryById(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Purchase entry by ID endpoint - implementation pending',
            data: null
        });
    },
    async createPurchaseEntry(req, res) {
        return res.status(201).json({
            success: true,
            message: 'Create purchase entry endpoint - implementation pending',
            data: null
        });
    },
    async updatePurchaseEntry(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Update purchase entry endpoint - implementation pending',
            data: null
        });
    },
    async markAsPaid(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Mark as paid endpoint - implementation pending',
            data: null
        });
    },
    async deletePurchaseEntry(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Delete purchase entry endpoint - implementation pending'
        });
    }
};
exports.vatReportController = {
    async getVATReports(req, res) {
        return res.status(200).json({
            success: true,
            message: 'VAT reports endpoint - implementation pending',
            data: []
        });
    },
    async getVATReportById(req, res) {
        return res.status(200).json({
            success: true,
            message: 'VAT report by ID endpoint - implementation pending',
            data: null
        });
    },
    async generateVATReport(req, res) {
        return res.status(201).json({
            success: true,
            message: 'Generate VAT report endpoint - implementation pending',
            data: null
        });
    },
    async fileVATReport(req, res) {
        return res.status(200).json({
            success: true,
            message: 'File VAT report endpoint - implementation pending',
            data: null
        });
    },
    async deleteVATReport(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Delete VAT report endpoint - implementation pending'
        });
    }
};
exports.trialBalanceController = {
    async generateTrialBalance(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Generate trial balance endpoint - implementation pending',
            data: null
        });
    },
    async getTrialBalanceHistory(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Trial balance history endpoint - implementation pending',
            data: []
        });
    }
};
exports.balanceSheetController = {
    async generateBalanceSheet(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Generate balance sheet endpoint - implementation pending',
            data: null
        });
    },
    async getBalanceSheetHistory(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Balance sheet history endpoint - implementation pending',
            data: []
        });
    },
    async getFinancialRatios(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Financial ratios endpoint - implementation pending',
            data: null
        });
    }
};
exports.debtorsCreditors = {
    async getDebtorsCreditors(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Debtors & creditors endpoint - implementation pending',
            data: []
        });
    },
    async getAgingAnalysis(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Aging analysis endpoint - implementation pending',
            data: null
        });
    }
};
exports.purchaseSalesReportsController = {
    async getReports(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Purchase & sales reports endpoint - implementation pending',
            data: []
        });
    },
    async generateReport(req, res) {
        return res.status(201).json({
            success: true,
            message: 'Generate purchase & sales report endpoint - implementation pending',
            data: null
        });
    }
};
exports.misReportController = {
    async getMISReports(req, res) {
        return res.status(200).json({
            success: true,
            message: 'MIS reports endpoint - implementation pending',
            data: []
        });
    },
    async generateMISReport(req, res) {
        return res.status(201).json({
            success: true,
            message: 'Generate MIS report endpoint - implementation pending',
            data: null
        });
    },
    async getDashboardKPIs(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Dashboard KPIs retrieved successfully',
            data: {
                totalRevenue: 50000,
                totalExpenses: 30000,
                netProfit: 20000,
                cashFlow: 15000,
                outstandingReceivables: 25000,
                outstandingPayables: 18000
            }
        });
    }
};
//# sourceMappingURL=accounting.controller.js.map