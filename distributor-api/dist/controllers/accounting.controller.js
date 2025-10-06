"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.misReportController = exports.purchaseSalesReportsController = exports.debtorsCreditorsController = exports.balanceSheetController = exports.trialBalanceController = exports.vatReportController = exports.purchaseReturnController = exports.salesReturnController = exports.salesEntryController = exports.purchaseEntryController = exports.partyLedgerController = exports.accountsController = exports.ledgerController = exports.journalEntryController = void 0;
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
        try {
            const { partyType, search, hasOutstanding, page = 1, limit = 10 } = req.query;
            const where = {};
            if (partyType) {
                where.partyType = partyType;
            }
            if (search) {
                where.OR = [
                    { partyName: { contains: search, mode: 'insensitive' } },
                    { contactPerson: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (hasOutstanding === 'true') {
                where.currentBalance = { not: 0 };
            }
            const skip = (Number(page) - 1) * Number(limit);
            const [partyLedgers, total] = await Promise.all([
                prisma.partyLedger.findMany({
                    where,
                    include: {
                        transactions: {
                            orderBy: { date: 'desc' },
                            take: 5
                        }
                    },
                    orderBy: { partyName: 'asc' },
                    skip,
                    take: Number(limit)
                }),
                prisma.partyLedger.count({ where })
            ]);
            return res.status(200).json({
                success: true,
                message: 'Party ledgers retrieved successfully',
                data: {
                    partyLedgers,
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
            logger_1.default.error('Error fetching party ledgers:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch party ledgers',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async getPartyLedgerById(req, res) {
        try {
            const { id } = req.params;
            const partyLedger = await prisma.partyLedger.findUnique({
                where: { id },
                include: {
                    transactions: {
                        orderBy: { date: 'desc' }
                    }
                }
            });
            if (!partyLedger) {
                return res.status(404).json({
                    success: false,
                    message: 'Party ledger not found'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Party ledger retrieved successfully',
                data: partyLedger
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching party ledger:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch party ledger',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async getPartyTransactions(req, res) {
        try {
            const { partyId } = req.params;
            const { fromDate, toDate, page = 1, limit = 10 } = req.query;
            const where = { partyLedgerId: partyId };
            if (fromDate && toDate) {
                where.date = {
                    gte: new Date(fromDate),
                    lte: new Date(toDate)
                };
            }
            const skip = (Number(page) - 1) * Number(limit);
            const [transactions, total] = await Promise.all([
                prisma.partyTransaction.findMany({
                    where,
                    orderBy: { date: 'desc' },
                    skip,
                    take: Number(limit)
                }),
                prisma.partyTransaction.count({ where })
            ]);
            return res.status(200).json({
                success: true,
                message: 'Party transactions retrieved successfully',
                data: {
                    transactions,
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
            logger_1.default.error('Error fetching party transactions:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch party transactions',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async createParty(req, res) {
        try {
            const partyData = req.body;
            const existingParty = await prisma.partyLedger.findFirst({
                where: {
                    partyName: partyData.partyName,
                    partyType: partyData.partyType
                }
            });
            if (existingParty) {
                return res.status(400).json({
                    success: false,
                    message: 'Party with this name and type already exists',
                    errors: {
                        partyName: ['Party name must be unique for each type']
                    }
                });
            }
            const party = await prisma.partyLedger.create({
                data: {
                    ...partyData,
                    currentBalance: partyData.openingBalance || 0
                }
            });
            logger_1.default.info(`Party created: ${party.partyName}`);
            return res.status(201).json({
                success: true,
                message: 'Party created successfully',
                data: party
            });
        }
        catch (error) {
            logger_1.default.error('Error creating party:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create party',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async updateParty(req, res) {
        try {
            const { id } = req.params;
            const partyData = req.body;
            const existingParty = await prisma.partyLedger.findUnique({ where: { id } });
            if (!existingParty) {
                return res.status(404).json({
                    success: false,
                    message: 'Party not found'
                });
            }
            if (partyData.partyName && partyData.partyType) {
                const nameExists = await prisma.partyLedger.findFirst({
                    where: {
                        partyName: partyData.partyName,
                        partyType: partyData.partyType,
                        id: { not: id }
                    }
                });
                if (nameExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'Party with this name and type already exists',
                        errors: {
                            partyName: ['Party name must be unique for each type']
                        }
                    });
                }
            }
            const party = await prisma.partyLedger.update({
                where: { id },
                data: partyData
            });
            logger_1.default.info(`Party updated: ${party.partyName}`);
            return res.status(200).json({
                success: true,
                message: 'Party updated successfully',
                data: party
            });
        }
        catch (error) {
            logger_1.default.error('Error updating party:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update party',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async deleteParty(req, res) {
        try {
            const { id } = req.params;
            const existingParty = await prisma.partyLedger.findUnique({ where: { id } });
            if (!existingParty) {
                return res.status(404).json({
                    success: false,
                    message: 'Party not found'
                });
            }
            const hasTransactions = await prisma.partyTransaction.findFirst({
                where: { partyLedgerId: id }
            });
            if (hasTransactions) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete party with existing transactions. Consider deactivating instead.'
                });
            }
            await prisma.partyLedger.delete({ where: { id } });
            logger_1.default.info(`Party deleted: ${existingParty.partyName}`);
            return res.status(200).json({
                success: true,
                message: 'Party deleted successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting party:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete party',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async getAgingAnalysis(req, res) {
        try {
            const { asOfDate } = req.query;
            const cutoffDate = asOfDate ? new Date(asOfDate) : new Date();
            const thirtyDaysAgo = new Date(cutoffDate);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const sixtyDaysAgo = new Date(cutoffDate);
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
            const ninetyDaysAgo = new Date(cutoffDate);
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            const [current, thirtyDays, sixtyDays, ninetyDaysPlus] = await Promise.all([
                prisma.partyLedger.aggregate({
                    where: {
                        currentBalance: { gt: 0 },
                        partyType: 'customer'
                    },
                    _sum: { currentBalance: true }
                }),
                prisma.partyLedger.aggregate({
                    where: {
                        currentBalance: { gt: 0 },
                        partyType: 'customer'
                    },
                    _sum: { currentBalance: true }
                }),
                prisma.partyLedger.aggregate({
                    where: {
                        currentBalance: { gt: 0 },
                        partyType: 'customer'
                    },
                    _sum: { currentBalance: true }
                }),
                prisma.partyLedger.aggregate({
                    where: {
                        currentBalance: { gt: 0 },
                        partyType: 'customer'
                    },
                    _sum: { currentBalance: true }
                })
            ]);
            return res.status(200).json({
                success: true,
                message: 'Aging analysis retrieved successfully',
                data: {
                    current: Number(current._sum.currentBalance || 0),
                    thirtyDays: Number(thirtyDays._sum.currentBalance || 0),
                    sixtyDays: Number(sixtyDays._sum.currentBalance || 0),
                    ninetyDaysPlus: Number(ninetyDaysPlus._sum.currentBalance || 0)
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching aging analysis:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch aging analysis',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
};
exports.purchaseEntryController = {
    async getPurchaseEntries(req, res) {
        try {
            const { fromDate, toDate, supplierId, status, search, page = 1, limit = 10 } = req.query;
            const where = {};
            if (fromDate && toDate) {
                where.date = {
                    gte: new Date(fromDate),
                    lte: new Date(toDate)
                };
            }
            if (supplierId) {
                where.supplierName = { contains: supplierId, mode: 'insensitive' };
            }
            if (status) {
                where.status = status;
            }
            if (search) {
                where.OR = [
                    { purchaseNumber: { contains: search, mode: 'insensitive' } },
                    { supplierName: { contains: search, mode: 'insensitive' } }
                ];
            }
            const skip = (Number(page) - 1) * Number(limit);
            const [purchaseEntries, total] = await Promise.all([
                prisma.purchaseEntry.findMany({
                    where,
                    orderBy: { date: 'desc' },
                    skip,
                    take: Number(limit)
                }),
                prisma.purchaseEntry.count({ where })
            ]);
            return res.status(200).json({
                success: true,
                message: 'Purchase entries retrieved successfully',
                data: {
                    purchaseEntries,
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
            logger_1.default.error('Error fetching purchase entries:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch purchase entries',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async getPurchaseEntryById(req, res) {
        try {
            const { id } = req.params;
            const purchaseEntry = await prisma.purchaseEntry.findUnique({
                where: { id }
            });
            if (!purchaseEntry) {
                return res.status(404).json({
                    success: false,
                    message: 'Purchase entry not found'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Purchase entry retrieved successfully',
                data: purchaseEntry
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching purchase entry:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch purchase entry',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async createPurchaseEntry(req, res) {
        try {
            const purchaseData = req.body;
            const purchaseNumber = `PO${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
            const purchaseEntry = await prisma.purchaseEntry.create({
                data: {
                    ...purchaseData,
                    purchaseNumber,
                    enteredBy: 'admin'
                }
            });
            await this.createPurchaseJournalEntry(purchaseEntry);
            logger_1.default.info(`Purchase entry created: ${purchaseEntry.purchaseNumber}`);
            return res.status(201).json({
                success: true,
                message: 'Purchase entry created successfully',
                data: purchaseEntry
            });
        }
        catch (error) {
            logger_1.default.error('Error creating purchase entry:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create purchase entry',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async updatePurchaseEntry(req, res) {
        try {
            const { id } = req.params;
            const purchaseData = req.body;
            const existingEntry = await prisma.purchaseEntry.findUnique({ where: { id } });
            if (!existingEntry) {
                return res.status(404).json({
                    success: false,
                    message: 'Purchase entry not found'
                });
            }
            if (existingEntry.status === 'paid') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot modify paid purchase entry'
                });
            }
            const purchaseEntry = await prisma.purchaseEntry.update({
                where: { id },
                data: purchaseData
            });
            logger_1.default.info(`Purchase entry updated: ${purchaseEntry.purchaseNumber}`);
            return res.status(200).json({
                success: true,
                message: 'Purchase entry updated successfully',
                data: purchaseEntry
            });
        }
        catch (error) {
            logger_1.default.error('Error updating purchase entry:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update purchase entry',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async markAsPaid(req, res) {
        try {
            const { id } = req.params;
            const { paymentDate, paymentMethod, referenceNumber, bankAccount } = req.body;
            const purchaseEntry = await prisma.purchaseEntry.update({
                where: { id },
                data: {
                    status: 'paid',
                    updatedAt: new Date()
                }
            });
            await this.createPaymentJournalEntry(purchaseEntry, {
                paymentDate,
                paymentMethod,
                referenceNumber,
                bankAccount
            });
            logger_1.default.info(`Purchase entry marked as paid: ${purchaseEntry.purchaseNumber}`);
            return res.status(200).json({
                success: true,
                message: 'Purchase entry marked as paid successfully',
                data: purchaseEntry
            });
        }
        catch (error) {
            logger_1.default.error('Error marking purchase entry as paid:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to mark purchase entry as paid',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async deletePurchaseEntry(req, res) {
        try {
            const { id } = req.params;
            const existingEntry = await prisma.purchaseEntry.findUnique({ where: { id } });
            if (!existingEntry) {
                return res.status(404).json({
                    success: false,
                    message: 'Purchase entry not found'
                });
            }
            if (existingEntry.status === 'paid') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete paid purchase entry'
                });
            }
            await prisma.purchaseEntry.delete({ where: { id } });
            logger_1.default.info(`Purchase entry deleted: ${existingEntry.purchaseNumber}`);
            return res.status(200).json({
                success: true,
                message: 'Purchase entry deleted successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting purchase entry:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete purchase entry',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async createPurchaseJournalEntry(purchaseEntry) {
        try {
            const journalNumber = `JE${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
            const journalEntry = await prisma.journalEntry.create({
                data: {
                    journalNumber,
                    date: purchaseEntry.date,
                    description: `Purchase from ${purchaseEntry.supplierName}`,
                    companyName: purchaseEntry.supplierName,
                    totalDebit: purchaseEntry.totalAmount,
                    totalCredit: purchaseEntry.totalAmount,
                    status: 'POSTED',
                    createdById: 'admin',
                    entries: {
                        create: [
                            {
                                accountId: 'purchase-account-id',
                                description: `Purchase from ${purchaseEntry.supplierName}`,
                                debitAmount: purchaseEntry.subtotal,
                                creditAmount: 0
                            },
                            {
                                accountId: 'vat-input-account-id',
                                description: `VAT on purchase from ${purchaseEntry.supplierName}`,
                                debitAmount: purchaseEntry.vatAmount,
                                creditAmount: 0
                            },
                            {
                                accountId: 'creditors-account-id',
                                description: `Amount due to ${purchaseEntry.supplierName}`,
                                debitAmount: 0,
                                creditAmount: purchaseEntry.totalAmount
                            }
                        ]
                    }
                }
            });
            await prisma.purchaseEntry.update({
                where: { id: purchaseEntry.id },
                data: { journalEntry: { connect: { id: journalEntry.id } } }
            });
        }
        catch (error) {
            logger_1.default.error('Error creating purchase journal entry:', error);
        }
    },
    async createPaymentJournalEntry(purchaseEntry, paymentData) {
        try {
            const journalNumber = `JE${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
            await prisma.journalEntry.create({
                data: {
                    journalNumber,
                    date: new Date(paymentData.paymentDate),
                    description: `Payment to ${purchaseEntry.supplierName}`,
                    companyName: purchaseEntry.supplierName,
                    totalDebit: purchaseEntry.totalAmount,
                    totalCredit: purchaseEntry.totalAmount,
                    status: 'POSTED',
                    createdById: 'admin',
                    entries: {
                        create: [
                            {
                                accountId: 'creditors-account-id',
                                description: `Payment to ${purchaseEntry.supplierName}`,
                                debitAmount: purchaseEntry.totalAmount,
                                creditAmount: 0
                            },
                            {
                                accountId: 'bank-account-id',
                                description: `Payment to ${purchaseEntry.supplierName}`,
                                debitAmount: 0,
                                creditAmount: purchaseEntry.totalAmount
                            }
                        ]
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error creating payment journal entry:', error);
        }
    }
};
exports.salesEntryController = {
    async getSalesEntries(req, res) {
        try {
            const { fromDate, toDate, customerId, status, search, page = 1, limit = 10 } = req.query;
            const where = {};
            if (fromDate && toDate) {
                where.date = {
                    gte: new Date(fromDate),
                    lte: new Date(toDate)
                };
            }
            if (customerId) {
                where.customerName = { contains: customerId, mode: 'insensitive' };
            }
            if (status) {
                where.status = status;
            }
            if (search) {
                where.OR = [
                    { salesNumber: { contains: search, mode: 'insensitive' } },
                    { customerName: { contains: search, mode: 'insensitive' } }
                ];
            }
            const skip = (Number(page) - 1) * Number(limit);
            const [salesEntries, total] = await Promise.all([
                prisma.salesEntry.findMany({
                    where,
                    orderBy: { date: 'desc' },
                    skip,
                    take: Number(limit)
                }),
                prisma.salesEntry.count({ where })
            ]);
            return res.status(200).json({
                success: true,
                message: 'Sales entries retrieved successfully',
                data: {
                    salesEntries,
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
            logger_1.default.error('Error fetching sales entries:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch sales entries',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async getSalesEntryById(req, res) {
        try {
            const { id } = req.params;
            const salesEntry = await prisma.salesEntry.findUnique({
                where: { id }
            });
            if (!salesEntry) {
                return res.status(404).json({
                    success: false,
                    message: 'Sales entry not found'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Sales entry retrieved successfully',
                data: salesEntry
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching sales entry:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch sales entry',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async createSalesEntry(req, res) {
        try {
            const salesData = req.body;
            const salesNumber = `SI${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
            const salesEntry = await prisma.salesEntry.create({
                data: {
                    ...salesData,
                    salesNumber,
                    enteredBy: 'admin'
                }
            });
            await this.createSalesJournalEntry(salesEntry);
            logger_1.default.info(`Sales entry created: ${salesEntry.salesNumber}`);
            return res.status(201).json({
                success: true,
                message: 'Sales entry created successfully',
                data: salesEntry
            });
        }
        catch (error) {
            logger_1.default.error('Error creating sales entry:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create sales entry',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async updateSalesEntry(req, res) {
        try {
            const { id } = req.params;
            const salesData = req.body;
            const existingEntry = await prisma.salesEntry.findUnique({ where: { id } });
            if (!existingEntry) {
                return res.status(404).json({
                    success: false,
                    message: 'Sales entry not found'
                });
            }
            if (existingEntry.status === 'paid') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot modify paid sales entry'
                });
            }
            const salesEntry = await prisma.salesEntry.update({
                where: { id },
                data: salesData
            });
            logger_1.default.info(`Sales entry updated: ${salesEntry.salesNumber}`);
            return res.status(200).json({
                success: true,
                message: 'Sales entry updated successfully',
                data: salesEntry
            });
        }
        catch (error) {
            logger_1.default.error('Error updating sales entry:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update sales entry',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async markAsPaid(req, res) {
        try {
            const { id } = req.params;
            const { paymentDate, paymentMethod, referenceNumber, bankAccount } = req.body;
            const salesEntry = await prisma.salesEntry.update({
                where: { id },
                data: {
                    status: 'paid',
                    updatedAt: new Date()
                }
            });
            await this.createPaymentJournalEntry(salesEntry, {
                paymentDate,
                paymentMethod,
                referenceNumber,
                bankAccount
            });
            logger_1.default.info(`Sales entry marked as paid: ${salesEntry.salesNumber}`);
            return res.status(200).json({
                success: true,
                message: 'Sales entry marked as paid successfully',
                data: salesEntry
            });
        }
        catch (error) {
            logger_1.default.error('Error marking sales entry as paid:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to mark sales entry as paid',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async deleteSalesEntry(req, res) {
        try {
            const { id } = req.params;
            const existingEntry = await prisma.salesEntry.findUnique({ where: { id } });
            if (!existingEntry) {
                return res.status(404).json({
                    success: false,
                    message: 'Sales entry not found'
                });
            }
            if (existingEntry.status === 'paid') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete paid sales entry'
                });
            }
            await prisma.salesEntry.delete({ where: { id } });
            logger_1.default.info(`Sales entry deleted: ${existingEntry.salesNumber}`);
            return res.status(200).json({
                success: true,
                message: 'Sales entry deleted successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting sales entry:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete sales entry',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async createSalesJournalEntry(salesEntry) {
        try {
            const journalNumber = `JE${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
            const journalEntry = await prisma.journalEntry.create({
                data: {
                    journalNumber,
                    date: salesEntry.date,
                    description: `Sales to ${salesEntry.customerName}`,
                    companyName: salesEntry.customerName,
                    totalDebit: salesEntry.totalAmount,
                    totalCredit: salesEntry.totalAmount,
                    status: 'POSTED',
                    createdById: 'admin',
                    entries: {
                        create: [
                            {
                                accountId: 'debtors-account-id',
                                description: `Amount due from ${salesEntry.customerName}`,
                                debitAmount: salesEntry.totalAmount,
                                creditAmount: 0
                            },
                            {
                                accountId: 'sales-account-id',
                                description: `Sales to ${salesEntry.customerName}`,
                                debitAmount: 0,
                                creditAmount: salesEntry.subtotal
                            },
                            {
                                accountId: 'vat-output-account-id',
                                description: `VAT on sales to ${salesEntry.customerName}`,
                                debitAmount: 0,
                                creditAmount: salesEntry.vatAmount
                            }
                        ]
                    }
                }
            });
            await prisma.salesEntry.update({
                where: { id: salesEntry.id },
                data: { journalEntry: { connect: { id: journalEntry.id } } }
            });
        }
        catch (error) {
            logger_1.default.error('Error creating sales journal entry:', error);
        }
    },
    async createPaymentJournalEntry(salesEntry, paymentData) {
        try {
            const journalNumber = `JE${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
            await prisma.journalEntry.create({
                data: {
                    journalNumber,
                    date: new Date(paymentData.paymentDate),
                    description: `Payment from ${salesEntry.customerName}`,
                    companyName: salesEntry.customerName,
                    totalDebit: salesEntry.totalAmount,
                    totalCredit: salesEntry.totalAmount,
                    status: 'POSTED',
                    createdById: 'admin',
                    entries: {
                        create: [
                            {
                                accountId: 'bank-account-id',
                                description: `Payment from ${salesEntry.customerName}`,
                                debitAmount: salesEntry.totalAmount,
                                creditAmount: 0
                            },
                            {
                                accountId: 'debtors-account-id',
                                description: `Payment from ${salesEntry.customerName}`,
                                debitAmount: 0,
                                creditAmount: salesEntry.totalAmount
                            }
                        ]
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error creating payment journal entry:', error);
        }
    }
};
exports.salesReturnController = {
    async getSalesReturns(req, res) {
        try {
            const { fromDate, toDate, customerId, status, search, page = 1, limit = 10 } = req.query;
            const where = {};
            if (fromDate && toDate) {
                where.date = {
                    gte: new Date(fromDate),
                    lte: new Date(toDate)
                };
            }
            if (customerId) {
                where.customerName = { contains: customerId, mode: 'insensitive' };
            }
            if (status) {
                where.status = status;
            }
            if (search) {
                where.OR = [
                    { returnNumber: { contains: search, mode: 'insensitive' } },
                    { customerName: { contains: search, mode: 'insensitive' } },
                    { originalInvoiceNumber: { contains: search, mode: 'insensitive' } }
                ];
            }
            const skip = (Number(page) - 1) * Number(limit);
            const [salesReturns, total] = await Promise.all([
                prisma.salesReturn.findMany({
                    where,
                    orderBy: { date: 'desc' },
                    skip,
                    take: Number(limit)
                }),
                prisma.salesReturn.count({ where })
            ]);
            return res.status(200).json({
                success: true,
                message: 'Sales returns retrieved successfully',
                data: {
                    salesReturns,
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
            logger_1.default.error('Error fetching sales returns:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch sales returns',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async getSalesReturnById(req, res) {
        try {
            const { id } = req.params;
            const salesReturn = await prisma.salesReturn.findUnique({
                where: { id }
            });
            if (!salesReturn) {
                return res.status(404).json({
                    success: false,
                    message: 'Sales return not found'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Sales return retrieved successfully',
                data: salesReturn
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching sales return:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch sales return',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async createSalesReturn(req, res) {
        try {
            const returnData = req.body;
            const returnNumber = `SR${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
            const salesReturn = await prisma.salesReturn.create({
                data: {
                    ...returnData,
                    returnNumber,
                    enteredBy: 'admin'
                }
            });
            await this.createSalesReturnJournalEntry(salesReturn);
            logger_1.default.info(`Sales return created: ${salesReturn.returnNumber}`);
            return res.status(201).json({
                success: true,
                message: 'Sales return created successfully',
                data: salesReturn
            });
        }
        catch (error) {
            logger_1.default.error('Error creating sales return:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create sales return',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async updateSalesReturn(req, res) {
        try {
            const { id } = req.params;
            const returnData = req.body;
            const existingReturn = await prisma.salesReturn.findUnique({ where: { id } });
            if (!existingReturn) {
                return res.status(404).json({
                    success: false,
                    message: 'Sales return not found'
                });
            }
            if (existingReturn.status === 'processed') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot modify processed sales return'
                });
            }
            const salesReturn = await prisma.salesReturn.update({
                where: { id },
                data: returnData
            });
            logger_1.default.info(`Sales return updated: ${salesReturn.returnNumber}`);
            return res.status(200).json({
                success: true,
                message: 'Sales return updated successfully',
                data: salesReturn
            });
        }
        catch (error) {
            logger_1.default.error('Error updating sales return:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update sales return',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async processReturn(req, res) {
        try {
            const { id } = req.params;
            const salesReturn = await prisma.salesReturn.update({
                where: { id },
                data: {
                    status: 'processed',
                    updatedAt: new Date()
                }
            });
            logger_1.default.info(`Sales return processed: ${salesReturn.returnNumber}`);
            return res.status(200).json({
                success: true,
                message: 'Sales return processed successfully',
                data: salesReturn
            });
        }
        catch (error) {
            logger_1.default.error('Error processing sales return:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to process sales return',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async deleteSalesReturn(req, res) {
        try {
            const { id } = req.params;
            const existingReturn = await prisma.salesReturn.findUnique({ where: { id } });
            if (!existingReturn) {
                return res.status(404).json({
                    success: false,
                    message: 'Sales return not found'
                });
            }
            if (existingReturn.status === 'processed') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete processed sales return'
                });
            }
            await prisma.salesReturn.delete({ where: { id } });
            logger_1.default.info(`Sales return deleted: ${existingReturn.returnNumber}`);
            return res.status(200).json({
                success: true,
                message: 'Sales return deleted successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting sales return:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete sales return',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async createSalesReturnJournalEntry(salesReturn) {
        try {
            const journalNumber = `JE${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
            const journalEntry = await prisma.journalEntry.create({
                data: {
                    journalNumber,
                    date: salesReturn.date,
                    description: `Sales return from ${salesReturn.customerName}`,
                    companyName: salesReturn.customerName,
                    totalDebit: salesReturn.totalAmount,
                    totalCredit: salesReturn.totalAmount,
                    status: 'POSTED',
                    createdById: 'admin',
                    entries: {
                        create: [
                            {
                                accountId: 'sales-return-account-id',
                                description: `Sales return from ${salesReturn.customerName}`,
                                debitAmount: salesReturn.subtotal,
                                creditAmount: 0
                            },
                            {
                                accountId: 'vat-output-account-id',
                                description: `VAT on sales return from ${salesReturn.customerName}`,
                                debitAmount: salesReturn.vatAmount,
                                creditAmount: 0
                            },
                            {
                                accountId: 'debtors-account-id',
                                description: `Amount due to ${salesReturn.customerName}`,
                                debitAmount: 0,
                                creditAmount: salesReturn.totalAmount
                            }
                        ]
                    }
                }
            });
            await prisma.salesReturn.update({
                where: { id: salesReturn.id },
                data: { journalEntry: { connect: { id: journalEntry.id } } }
            });
        }
        catch (error) {
            logger_1.default.error('Error creating sales return journal entry:', error);
        }
    }
};
exports.purchaseReturnController = {
    async getPurchaseReturns(req, res) {
        try {
            const { fromDate, toDate, supplierId, status, search, page = 1, limit = 10 } = req.query;
            const where = {};
            if (fromDate && toDate) {
                where.date = {
                    gte: new Date(fromDate),
                    lte: new Date(toDate)
                };
            }
            if (supplierId) {
                where.supplierName = { contains: supplierId, mode: 'insensitive' };
            }
            if (status) {
                where.status = status;
            }
            if (search) {
                where.OR = [
                    { returnNumber: { contains: search, mode: 'insensitive' } },
                    { supplierName: { contains: search, mode: 'insensitive' } },
                    { originalPurchaseNumber: { contains: search, mode: 'insensitive' } }
                ];
            }
            const skip = (Number(page) - 1) * Number(limit);
            const [purchaseReturns, total] = await Promise.all([
                prisma.purchaseReturn.findMany({
                    where,
                    orderBy: { date: 'desc' },
                    skip,
                    take: Number(limit)
                }),
                prisma.purchaseReturn.count({ where })
            ]);
            return res.status(200).json({
                success: true,
                message: 'Purchase returns retrieved successfully',
                data: {
                    purchaseReturns,
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
            logger_1.default.error('Error fetching purchase returns:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch purchase returns',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async getPurchaseReturnById(req, res) {
        try {
            const { id } = req.params;
            const purchaseReturn = await prisma.purchaseReturn.findUnique({
                where: { id }
            });
            if (!purchaseReturn) {
                return res.status(404).json({
                    success: false,
                    message: 'Purchase return not found'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Purchase return retrieved successfully',
                data: purchaseReturn
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching purchase return:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch purchase return',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async createPurchaseReturn(req, res) {
        try {
            const returnData = req.body;
            const returnNumber = `PR${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
            const purchaseReturn = await prisma.purchaseReturn.create({
                data: {
                    ...returnData,
                    returnNumber,
                    enteredBy: 'admin'
                }
            });
            await this.createPurchaseReturnJournalEntry(purchaseReturn);
            logger_1.default.info(`Purchase return created: ${purchaseReturn.returnNumber}`);
            return res.status(201).json({
                success: true,
                message: 'Purchase return created successfully',
                data: purchaseReturn
            });
        }
        catch (error) {
            logger_1.default.error('Error creating purchase return:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create purchase return',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async updatePurchaseReturn(req, res) {
        try {
            const { id } = req.params;
            const returnData = req.body;
            const existingReturn = await prisma.purchaseReturn.findUnique({ where: { id } });
            if (!existingReturn) {
                return res.status(404).json({
                    success: false,
                    message: 'Purchase return not found'
                });
            }
            if (existingReturn.status === 'processed') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot modify processed purchase return'
                });
            }
            const purchaseReturn = await prisma.purchaseReturn.update({
                where: { id },
                data: returnData
            });
            logger_1.default.info(`Purchase return updated: ${purchaseReturn.returnNumber}`);
            return res.status(200).json({
                success: true,
                message: 'Purchase return updated successfully',
                data: purchaseReturn
            });
        }
        catch (error) {
            logger_1.default.error('Error updating purchase return:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update purchase return',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async processReturn(req, res) {
        try {
            const { id } = req.params;
            const purchaseReturn = await prisma.purchaseReturn.update({
                where: { id },
                data: {
                    status: 'processed',
                    updatedAt: new Date()
                }
            });
            logger_1.default.info(`Purchase return processed: ${purchaseReturn.returnNumber}`);
            return res.status(200).json({
                success: true,
                message: 'Purchase return processed successfully',
                data: purchaseReturn
            });
        }
        catch (error) {
            logger_1.default.error('Error processing purchase return:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to process purchase return',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async deletePurchaseReturn(req, res) {
        try {
            const { id } = req.params;
            const existingReturn = await prisma.purchaseReturn.findUnique({ where: { id } });
            if (!existingReturn) {
                return res.status(404).json({
                    success: false,
                    message: 'Purchase return not found'
                });
            }
            if (existingReturn.status === 'processed') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete processed purchase return'
                });
            }
            await prisma.purchaseReturn.delete({ where: { id } });
            logger_1.default.info(`Purchase return deleted: ${existingReturn.returnNumber}`);
            return res.status(200).json({
                success: true,
                message: 'Purchase return deleted successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting purchase return:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete purchase return',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async createPurchaseReturnJournalEntry(purchaseReturn) {
        try {
            const journalNumber = `JE${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
            const journalEntry = await prisma.journalEntry.create({
                data: {
                    journalNumber,
                    date: purchaseReturn.date,
                    description: `Purchase return to ${purchaseReturn.supplierName}`,
                    companyName: purchaseReturn.supplierName,
                    totalDebit: purchaseReturn.totalAmount,
                    totalCredit: purchaseReturn.totalAmount,
                    status: 'POSTED',
                    createdById: 'admin',
                    entries: {
                        create: [
                            {
                                accountId: 'creditors-account-id',
                                description: `Amount due to ${purchaseReturn.supplierName}`,
                                debitAmount: purchaseReturn.totalAmount,
                                creditAmount: 0
                            },
                            {
                                accountId: 'purchase-return-account-id',
                                description: `Purchase return to ${purchaseReturn.supplierName}`,
                                debitAmount: 0,
                                creditAmount: purchaseReturn.subtotal
                            },
                            {
                                accountId: 'vat-input-account-id',
                                description: `VAT on purchase return to ${purchaseReturn.supplierName}`,
                                debitAmount: 0,
                                creditAmount: purchaseReturn.vatAmount
                            }
                        ]
                    }
                }
            });
            await prisma.purchaseReturn.update({
                where: { id: purchaseReturn.id },
                data: { journalEntry: { connect: { id: journalEntry.id } } }
            });
        }
        catch (error) {
            logger_1.default.error('Error creating purchase return journal entry:', error);
        }
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
exports.debtorsCreditorsController = {
    async getDebtorsCreditors(req, res) {
        try {
            const { partyType, status } = req.query;
            const whereClause = {};
            if (partyType) {
                whereClause.partyType = partyType;
            }
            if (status) {
                whereClause.status = status;
            }
            const parties = await prisma.partyLedger.findMany({
                where: whereClause,
                include: {
                    transactions: {
                        orderBy: { date: 'desc' },
                        take: 5
                    }
                },
                orderBy: { currentBalance: 'desc' }
            });
            const debtors = parties.filter(party => Number(party.currentBalance) > 0);
            const creditors = parties.filter(party => Number(party.currentBalance) < 0);
            const totalDebtors = debtors.reduce((sum, party) => sum + Number(party.currentBalance), 0);
            const totalCreditors = Math.abs(creditors.reduce((sum, party) => sum + Number(party.currentBalance), 0));
            logger_1.default.info(`Retrieved ${debtors.length} debtors and ${creditors.length} creditors`);
            return res.status(200).json({
                success: true,
                message: 'Debtors and creditors summary retrieved successfully',
                data: {
                    debtors,
                    creditors,
                    totalDebtors,
                    totalCreditors,
                    summary: {
                        totalDebtorsCount: debtors.length,
                        totalCreditorsCount: creditors.length,
                        netPosition: totalDebtors - totalCreditors
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error getting debtors and creditors:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get debtors and creditors',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async getAgingAnalysis(req, res) {
        try {
            const { partyType } = req.query;
            const whereClause = {};
            if (partyType) {
                whereClause.partyType = partyType;
            }
            const parties = await prisma.partyLedger.findMany({
                where: whereClause,
                include: {
                    transactions: {
                        where: {
                            status: 'PENDING'
                        },
                        orderBy: { date: 'asc' }
                    }
                }
            });
            const now = new Date();
            const agingCategories = {
                current: 0,
                days30: 0,
                days60: 0,
                days90: 0,
                over180: 0
            };
            const agingAnalysis = parties.map(party => {
                const aging = { ...agingCategories };
                let totalOutstanding = 0;
                party.transactions.forEach(transaction => {
                    const daysDiff = Math.floor((now.getTime() - transaction.date.getTime()) / (1000 * 60 * 60 * 24));
                    const amount = Number(transaction.amount);
                    totalOutstanding += amount;
                    if (daysDiff <= 30) {
                        aging.current += amount;
                    }
                    else if (daysDiff <= 60) {
                        aging.days30 += amount;
                    }
                    else if (daysDiff <= 90) {
                        aging.days60 += amount;
                    }
                    else if (daysDiff <= 180) {
                        aging.days90 += amount;
                    }
                    else {
                        aging.over180 += amount;
                    }
                });
                return {
                    partyId: party.id,
                    partyName: party.partyName,
                    partyType: party.partyType,
                    currentBalance: party.currentBalance,
                    totalOutstanding,
                    aging
                };
            });
            const totalAging = agingAnalysis.reduce((totals, party) => {
                totals.current += party.aging.current;
                totals.days30 += party.aging.days30;
                totals.days60 += party.aging.days60;
                totals.days90 += party.aging.days90;
                totals.over180 += party.aging.over180;
                return totals;
            }, { ...agingCategories });
            logger_1.default.info('Aging analysis completed');
            return res.status(200).json({
                success: true,
                message: 'Aging analysis retrieved successfully',
                data: {
                    parties: agingAnalysis,
                    totals: totalAging,
                    summary: {
                        totalParties: agingAnalysis.length,
                        totalOutstanding: agingAnalysis.reduce((sum, party) => sum + party.totalOutstanding, 0)
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error getting aging analysis:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get aging analysis',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async getPartyTransactions(req, res) {
        try {
            const { partyId } = req.params;
            const { startDate, endDate, status } = req.query;
            const whereClause = {
                partyId
            };
            if (startDate || endDate) {
                whereClause.date = {};
                if (startDate)
                    whereClause.date.gte = new Date(startDate);
                if (endDate)
                    whereClause.date.lte = new Date(endDate);
            }
            if (status) {
                whereClause.status = status;
            }
            const transactions = await prisma.partyTransaction.findMany({
                where: whereClause,
                include: {
                    journalEntry: {
                        select: {
                            id: true,
                            journalNumber: true,
                            date: true,
                            description: true
                        }
                    }
                },
                orderBy: { date: 'desc' }
            });
            logger_1.default.info(`Retrieved ${transactions.length} transactions for party ${partyId}`);
            return res.status(200).json({
                success: true,
                message: 'Party transactions retrieved successfully',
                data: transactions
            });
        }
        catch (error) {
            logger_1.default.error('Error getting party transactions:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get party transactions',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    async markTransactionAsPaid(req, res) {
        try {
            const { transactionId } = req.params;
            const { paymentDate, paymentMethod, reference } = req.body;
            const transaction = await prisma.partyTransaction.findUnique({
                where: { id: transactionId },
                include: { partyLedger: true }
            });
            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }
            if (transaction.status === 'PAID') {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction is already marked as paid'
                });
            }
            const updatedTransaction = await prisma.partyTransaction.update({
                where: { id: transactionId },
                data: {
                    status: 'PAID',
                    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                    paymentMethod,
                    reference
                }
            });
            const newBalance = Number(transaction.partyLedger.currentBalance) - Number(transaction.amount);
            await prisma.partyLedger.update({
                where: { id: transaction.partyLedgerId },
                data: { currentBalance: newBalance }
            });
            logger_1.default.info(`Transaction ${transactionId} marked as paid`);
            return res.status(200).json({
                success: true,
                message: 'Transaction marked as paid successfully',
                data: updatedTransaction
            });
        }
        catch (error) {
            logger_1.default.error('Error marking transaction as paid:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to mark transaction as paid',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
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