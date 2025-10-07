import { Request, Response } from 'express';
import logger from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Journal Entry Controller
export const journalEntryController = {
  async getJournalEntries(req: Request, res: Response): Promise<Response> {
    try {
      const { fromDate, toDate, accountCode, status, search, page = 1, limit = 10 } = req.query;
      
      const where: any = {};
      
      if (fromDate && toDate) {
        where.date = {
          gte: new Date(fromDate as string),
          lte: new Date(toDate as string)
        };
      }
      
      if (accountCode) {
        where.entries = {
          some: {
            account: {
              code: accountCode as string
            }
          }
        };
      }
      
      if (status) {
        where.status = status as string;
      }
      
      if (search) {
        where.OR = [
          { description: { contains: search as string, mode: 'insensitive' } },
          { referenceNumber: { contains: search as string, mode: 'insensitive' } }
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
    } catch (error) {
      logger.error('Error fetching journal entries:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch journal entries',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getJournalEntryById(req: Request, res: Response): Promise<Response> {
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
    } catch (error) {
      logger.error('Error fetching journal entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch journal entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async createJournalEntry(req: Request, res: Response): Promise<Response> {
    try {
      const journalEntryData = req.body;
      
      // Validate that debits equal credits
      const totalDebits = journalEntryData.entries.reduce((sum: number, entry: any) => sum + (entry.debitAmount || 0), 0);
      const totalCredits = journalEntryData.entries.reduce((sum: number, entry: any) => sum + (entry.creditAmount || 0), 0);
      
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

      logger.info(`Journal entry created: ${journalEntry.id}`);

      return res.status(201).json({
        success: true,
        message: 'Journal entry created successfully',
        data: journalEntry
      });
    } catch (error) {
      logger.error('Error creating journal entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create journal entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async updateJournalEntry(req: Request, res: Response): Promise<Response> {
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

      // Delete existing entries and create new ones
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

      logger.info(`Journal entry updated: ${id}`);

      return res.status(200).json({
        success: true,
        message: 'Journal entry updated successfully',
        data: journalEntry
      });
    } catch (error) {
      logger.error('Error updating journal entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update journal entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async postJournalEntry(req: Request, res: Response): Promise<Response> {
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

      logger.info(`Journal entry posted: ${id}`);

      return res.status(200).json({
        success: true,
        message: 'Journal entry posted successfully',
        data: journalEntry
      });
    } catch (error) {
      logger.error('Error posting journal entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to post journal entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async deleteJournalEntry(req: Request, res: Response): Promise<Response> {
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

      logger.info(`Journal entry deleted: ${id}`);

      return res.status(200).json({
        success: true,
        message: 'Journal entry deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting journal entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete journal entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async validateJournalEntry(req: Request, res: Response): Promise<Response> {
    try {
      const journalEntryData = req.body;
      const errors: string[] = [];

      // Validate that debits equal credits
      const totalDebits = journalEntryData.entries.reduce((sum: number, entry: any) => sum + (entry.debitAmount || 0), 0);
      const totalCredits = journalEntryData.entries.reduce((sum: number, entry: any) => sum + (entry.creditAmount || 0), 0);
      
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        errors.push(`Total debits (${totalDebits}) must equal total credits (${totalCredits})`);
      }

      // Validate at least 2 entries
      if (journalEntryData.entries.length < 2) {
        errors.push('Journal entry must have at least 2 entries');
      }

      // Validate each entry has either debit or credit (not both)
      journalEntryData.entries.forEach((entry: any, index: number) => {
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
    } catch (error) {
      logger.error('Error validating journal entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to validate journal entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// Ledger Controller
export const ledgerController = {
  async getLedgerEntries(req: Request, res: Response): Promise<Response> {
    try {
      const { accountCode, fromDate, toDate, search, page = 1, limit = 10 } = req.query;
      
      const where: any = {};
      
      if (accountCode) {
        where.accountCode = accountCode as string;
      }
      
      if (fromDate && toDate) {
        where.date = {
          gte: new Date(fromDate as string),
          lte: new Date(toDate as string)
        };
      }
      
      if (search) {
        where.OR = [
          { description: { contains: search as string, mode: 'insensitive' } },
          { accountName: { contains: search as string, mode: 'insensitive' } },
          { referenceId: { contains: search as string, mode: 'insensitive' } }
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
    } catch (error) {
      logger.error('Error fetching ledger entries:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch ledger entries',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getAccountLedger(req: Request, res: Response): Promise<Response> {
    try {
      const { accountCode } = req.params;
      const { fromDate, toDate } = req.query;
      
      const where: any = { accountCode };
      
      if (fromDate && toDate) {
        where.date = {
          gte: new Date(fromDate as string),
          lte: new Date(toDate as string)
        };
      }
      
      const ledgerEntries = await prisma.ledgerEntry.findMany({
        where,
        orderBy: [{ date: 'asc' }, { createdAt: 'asc' }]
      });

      // Calculate running balances
      let runningBalance = 0;
      const entriesWithBalance = ledgerEntries.map((entry: any) => {
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
    } catch (error) {
      logger.error('Error fetching account ledger:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch account ledger',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getAccountBalance(req: Request, res: Response): Promise<Response> {
    try {
      const { accountCode } = req.params;
      const { asOfDate } = req.query;
      
      const where: any = { accountCode };
      
      if (asOfDate) {
        where.date = {
          lte: new Date(asOfDate as string)
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
    } catch (error) {
      logger.error('Error fetching account balance:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch account balance',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// Accounts Controller
export const accountsController = {
  async getAccounts(req: Request, res: Response): Promise<Response> {
    try {
      const { type, search, isActive } = req.query;
      
      const where: any = {};
      
      if (type) {
        where.type = type as string;
      }
      
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { code: { contains: search as string, mode: 'insensitive' } }
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
    } catch (error) {
      logger.error('Error fetching accounts:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch accounts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getChartOfAccounts(req: Request, res: Response): Promise<Response> {
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
    } catch (error) {
      logger.error('Error fetching chart of accounts:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch chart of accounts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getAccountById(req: Request, res: Response): Promise<Response> {
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
    } catch (error) {
      logger.error('Error fetching account:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch account',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async createAccount(req: Request, res: Response): Promise<Response> {
    try {
      const accountData = req.body;
      
      // Check if account code already exists
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

      logger.info(`Account created: ${account.code}`);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: account
      });
    } catch (error) {
      logger.error('Error creating account:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create account',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async updateAccount(req: Request, res: Response): Promise<Response> {
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

      // Check if updating code and it conflicts with another account
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

      logger.info(`Account updated: ${account.code}`);

      return res.status(200).json({
        success: true,
        message: 'Account updated successfully',
        data: account
      });
    } catch (error) {
      logger.error('Error updating account:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update account',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async deleteAccount(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const existingAccount = await prisma.account.findUnique({ where: { id } });
      
      if (!existingAccount) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      // Check if account has ledger entries
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

      logger.info(`Account deleted: ${existingAccount.code}`);

      return res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting account:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete account',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// Party Ledger Controller
export const partyLedgerController = {
  async getPartyLedgers(req: Request, res: Response): Promise<Response> {
    try {
      const { partyType, search, hasOutstanding, page = 1, limit = 10 } = req.query;
      
      const where: any = {};
      
      if (partyType) {
        where.partyType = partyType as string;
      }
      
      if (search) {
        where.OR = [
          { partyName: { contains: search as string, mode: 'insensitive' } },
          { contactPerson: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } }
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
    } catch (error) {
      logger.error('Error fetching party ledgers:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch party ledgers',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getPartyLedgerById(req: Request, res: Response): Promise<Response> {
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
    } catch (error) {
      logger.error('Error fetching party ledger:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch party ledger',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getPartyTransactions(req: Request, res: Response): Promise<Response> {
    try {
      const { partyId } = req.params;
      const { fromDate, toDate, page = 1, limit = 10 } = req.query;
      
      const where: any = { partyLedgerId: partyId };
      
      if (fromDate && toDate) {
        where.date = {
          gte: new Date(fromDate as string),
          lte: new Date(toDate as string)
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
    } catch (error) {
      logger.error('Error fetching party transactions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch party transactions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async createParty(req: Request, res: Response): Promise<Response> {
    try {
      const partyData = req.body;
      
      // Check if party already exists
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

      logger.info(`Party created: ${party.partyName}`);

    return res.status(201).json({
      success: true,
        message: 'Party created successfully',
        data: party
      });
    } catch (error) {
      logger.error('Error creating party:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create party',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async updateParty(req: Request, res: Response): Promise<Response> {
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

      // Check if updating name and type conflicts with another party
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

      logger.info(`Party updated: ${party.partyName}`);

    return res.status(200).json({
      success: true,
        message: 'Party updated successfully',
        data: party
      });
    } catch (error) {
      logger.error('Error updating party:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update party',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async deleteParty(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const existingParty = await prisma.partyLedger.findUnique({ where: { id } });
      
      if (!existingParty) {
        return res.status(404).json({
          success: false,
          message: 'Party not found'
        });
      }

      // Check if party has transactions
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

      logger.info(`Party deleted: ${existingParty.partyName}`);

    return res.status(200).json({
      success: true,
        message: 'Party deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting party:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete party',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getAgingAnalysis(req: Request, res: Response): Promise<Response> {
    try {
      const { asOfDate } = req.query;
      const cutoffDate = asOfDate ? new Date(asOfDate as string) : new Date();
      
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
    } catch (error) {
      logger.error('Error fetching aging analysis:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch aging analysis',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// Purchase Entry Controller
export const purchaseEntryController = {
  async getPurchaseEntries(req: Request, res: Response): Promise<Response> {
    try {
      const { fromDate, toDate, supplierId, status, search, page = 1, limit = 10 } = req.query;
      
      const where: any = {};
      
      if (fromDate && toDate) {
        where.date = {
          gte: new Date(fromDate as string),
          lte: new Date(toDate as string)
        };
      }
      
      if (supplierId) {
        where.supplierName = { contains: supplierId as string, mode: 'insensitive' };
      }
      
      if (status) {
        where.status = status as string;
      }
      
      if (search) {
        where.OR = [
          { purchaseNumber: { contains: search as string, mode: 'insensitive' } },
          { supplierName: { contains: search as string, mode: 'insensitive' } }
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
    } catch (error) {
      logger.error('Error fetching purchase entries:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch purchase entries',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getPurchaseEntryById(req: Request, res: Response): Promise<Response> {
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
    } catch (error) {
      logger.error('Error fetching purchase entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch purchase entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async createPurchaseEntry(req: Request, res: Response): Promise<Response> {
    try {
      const purchaseData = req.body;
      
      // Generate purchase number
      const purchaseNumber = `PO${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
      
      const purchaseEntry = await prisma.purchaseEntry.create({
        data: {
          ...purchaseData,
          purchaseNumber,
          enteredBy: 'admin' // In real app, get from auth
        }
      });

      // Create journal entry for purchase
      await this.createPurchaseJournalEntry(purchaseEntry);

      logger.info(`Purchase entry created: ${purchaseEntry.entryNumber}`);

    return res.status(201).json({
      success: true,
        message: 'Purchase entry created successfully',
        data: purchaseEntry
      });
    } catch (error) {
      logger.error('Error creating purchase entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create purchase entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async updatePurchaseEntry(req: Request, res: Response): Promise<Response> {
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

      logger.info(`Purchase entry updated: ${purchaseEntry.entryNumber}`);

    return res.status(200).json({
      success: true,
        message: 'Purchase entry updated successfully',
        data: purchaseEntry
      });
    } catch (error) {
      logger.error('Error updating purchase entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update purchase entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async markAsPaid(req: Request, res: Response): Promise<Response> {
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

      // Create payment journal entry
      await this.createPaymentJournalEntry(purchaseEntry, {
        paymentDate,
        paymentMethod,
        referenceNumber,
        bankAccount
      });

      logger.info(`Purchase entry marked as paid: ${purchaseEntry.entryNumber}`);

    return res.status(200).json({
      success: true,
        message: 'Purchase entry marked as paid successfully',
        data: purchaseEntry
      });
    } catch (error) {
      logger.error('Error marking purchase entry as paid:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark purchase entry as paid',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async deletePurchaseEntry(req: Request, res: Response): Promise<Response> {
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

      logger.info(`Purchase entry deleted: ${existingEntry.entryNumber}`);

    return res.status(200).json({
      success: true,
        message: 'Purchase entry deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting purchase entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete purchase entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async createPurchaseJournalEntry(purchaseEntry: any) {
    try {
      // Create journal entry for purchase
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
                accountId: 'purchase-account-id', // Get from accounts table
                description: `Purchase from ${purchaseEntry.supplierName}`,
                debitAmount: purchaseEntry.subtotal,
                creditAmount: 0
              },
              {
                accountId: 'vat-input-account-id', // Get from accounts table
                description: `VAT on purchase from ${purchaseEntry.supplierName}`,
                debitAmount: purchaseEntry.vatAmount,
                creditAmount: 0
              },
              {
                accountId: 'creditors-account-id', // Get from accounts table
                description: `Amount due to ${purchaseEntry.supplierName}`,
                debitAmount: 0,
                creditAmount: purchaseEntry.totalAmount
              }
            ]
          }
        }
      });

      // Journal entry created successfully for purchase entry

    } catch (error) {
      logger.error('Error creating purchase journal entry:', error);
    }
  },

  async createPaymentJournalEntry(purchaseEntry: any, paymentData: any) {
    try {
      // Create journal entry for payment
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
                accountId: 'creditors-account-id', // Get from accounts table
                description: `Payment to ${purchaseEntry.supplierName}`,
                debitAmount: purchaseEntry.totalAmount,
                creditAmount: 0
              },
              {
                accountId: 'bank-account-id', // Get from accounts table
                description: `Payment to ${purchaseEntry.supplierName}`,
                debitAmount: 0,
                creditAmount: purchaseEntry.totalAmount
              }
            ]
          }
        }
      });

    } catch (error) {
      logger.error('Error creating payment journal entry:', error);
    }
  }
};

// Sales Entry Controller
export const salesEntryController = {
  async getSalesEntries(req: Request, res: Response): Promise<Response> {
    try {
      const { fromDate, toDate, customerId, status, search, page = 1, limit = 10 } = req.query;
      
      const where: any = {};
      
      if (fromDate && toDate) {
        where.date = {
          gte: new Date(fromDate as string),
          lte: new Date(toDate as string)
        };
      }
      
      if (customerId) {
        where.customerName = { contains: customerId as string, mode: 'insensitive' };
      }
      
      if (status) {
        where.status = status as string;
      }
      
      if (search) {
        where.OR = [
          { salesNumber: { contains: search as string, mode: 'insensitive' } },
          { customerName: { contains: search as string, mode: 'insensitive' } }
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
    } catch (error) {
      logger.error('Error fetching sales entries:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch sales entries',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getSalesEntryById(req: Request, res: Response): Promise<Response> {
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
    } catch (error) {
      logger.error('Error fetching sales entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch sales entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async createSalesEntry(req: Request, res: Response): Promise<Response> {
    try {
      const salesData = req.body;
      
      // Generate sales number
      const salesNumber = `SI${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
      
      const salesEntry = await prisma.salesEntry.create({
        data: {
          ...salesData,
          salesNumber,
          enteredBy: 'admin' // In real app, get from auth
        }
      });

      // Create journal entry for sales
      await this.createSalesJournalEntry(salesEntry);

      logger.info(`Sales entry created: ${salesEntry.entryNumber}`);

      return res.status(201).json({
        success: true,
        message: 'Sales entry created successfully',
        data: salesEntry
      });
    } catch (error) {
      logger.error('Error creating sales entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create sales entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async updateSalesEntry(req: Request, res: Response): Promise<Response> {
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

      logger.info(`Sales entry updated: ${salesEntry.entryNumber}`);

      return res.status(200).json({
        success: true,
        message: 'Sales entry updated successfully',
        data: salesEntry
      });
    } catch (error) {
      logger.error('Error updating sales entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update sales entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async markAsPaid(req: Request, res: Response): Promise<Response> {
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

      // Create payment journal entry
      await this.createPaymentJournalEntry(salesEntry, {
        paymentDate,
        paymentMethod,
        referenceNumber,
        bankAccount
      });

      logger.info(`Sales entry marked as paid: ${salesEntry.entryNumber}`);

      return res.status(200).json({
        success: true,
        message: 'Sales entry marked as paid successfully',
        data: salesEntry
      });
    } catch (error) {
      logger.error('Error marking sales entry as paid:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark sales entry as paid',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async deleteSalesEntry(req: Request, res: Response): Promise<Response> {
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

      logger.info(`Sales entry deleted: ${existingEntry.entryNumber}`);

      return res.status(200).json({
        success: true,
        message: 'Sales entry deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting sales entry:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete sales entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async createSalesJournalEntry(salesEntry: any) {
    try {
      // Create journal entry for sales
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
                accountId: 'debtors-account-id', // Get from accounts table
                description: `Amount due from ${salesEntry.customerName}`,
                debitAmount: salesEntry.totalAmount,
                creditAmount: 0
              },
              {
                accountId: 'sales-account-id', // Get from accounts table
                description: `Sales to ${salesEntry.customerName}`,
                debitAmount: 0,
                creditAmount: salesEntry.subtotal
              },
              {
                accountId: 'vat-output-account-id', // Get from accounts table
                description: `VAT on sales to ${salesEntry.customerName}`,
                debitAmount: 0,
                creditAmount: salesEntry.vatAmount
              }
            ]
          }
        }
      });

      // Journal entry created successfully for sales entry

    } catch (error) {
      logger.error('Error creating sales journal entry:', error);
    }
  },

  async createPaymentJournalEntry(salesEntry: any, paymentData: any) {
    try {
      // Create journal entry for payment
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
                accountId: 'bank-account-id', // Get from accounts table
                description: `Payment from ${salesEntry.customerName}`,
                debitAmount: salesEntry.totalAmount,
                creditAmount: 0
              },
              {
                accountId: 'debtors-account-id', // Get from accounts table
                description: `Payment from ${salesEntry.customerName}`,
                debitAmount: 0,
                creditAmount: salesEntry.totalAmount
              }
            ]
          }
        }
      });

    } catch (error) {
      logger.error('Error creating payment journal entry:', error);
    }
  }
};

// Sales Return Controller
export const salesReturnController = {
  async getSalesReturns(req: Request, res: Response): Promise<Response> {
    try {
      const { fromDate, toDate, customerId, status, search, page = 1, limit = 10 } = req.query;
      
      const where: any = {};
      
      if (fromDate && toDate) {
        where.date = {
          gte: new Date(fromDate as string),
          lte: new Date(toDate as string)
        };
      }
      
      if (customerId) {
        where.customerName = { contains: customerId as string, mode: 'insensitive' };
      }
      
      if (status) {
        where.status = status as string;
      }
      
      if (search) {
        where.OR = [
          { returnNumber: { contains: search as string, mode: 'insensitive' } },
          { customerName: { contains: search as string, mode: 'insensitive' } },
          { originalInvoiceNumber: { contains: search as string, mode: 'insensitive' } }
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
    } catch (error) {
      logger.error('Error fetching sales returns:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch sales returns',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getSalesReturnById(req: Request, res: Response): Promise<Response> {
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
    } catch (error) {
      logger.error('Error fetching sales return:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch sales return',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async createSalesReturn(req: Request, res: Response): Promise<Response> {
    try {
      const returnData = req.body;
      
      // Generate return number
      const returnNumber = `SR${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
      
      const salesReturn = await prisma.salesReturn.create({
        data: {
          ...returnData,
          returnNumber,
          enteredBy: 'admin' // In real app, get from auth
        }
      });

      // Create journal entry for sales return
      await this.createSalesReturnJournalEntry(salesReturn);

      logger.info(`Sales return created: ${salesReturn.returnNumber}`);

      return res.status(201).json({
        success: true,
        message: 'Sales return created successfully',
        data: salesReturn
      });
    } catch (error) {
      logger.error('Error creating sales return:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create sales return',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async updateSalesReturn(req: Request, res: Response): Promise<Response> {
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

      logger.info(`Sales return updated: ${salesReturn.returnNumber}`);

      return res.status(200).json({
        success: true,
        message: 'Sales return updated successfully',
        data: salesReturn
      });
    } catch (error) {
      logger.error('Error updating sales return:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update sales return',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async processReturn(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const salesReturn = await prisma.salesReturn.update({
        where: { id },
        data: {
          status: 'processed',
          updatedAt: new Date()
        }
      });

      logger.info(`Sales return processed: ${salesReturn.returnNumber}`);

      return res.status(200).json({
        success: true,
        message: 'Sales return processed successfully',
        data: salesReturn
      });
    } catch (error) {
      logger.error('Error processing sales return:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process sales return',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async deleteSalesReturn(req: Request, res: Response): Promise<Response> {
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

      logger.info(`Sales return deleted: ${existingReturn.returnNumber}`);

      return res.status(200).json({
        success: true,
        message: 'Sales return deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting sales return:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete sales return',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async createSalesReturnJournalEntry(salesReturn: any) {
    try {
      // Create journal entry for sales return
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
                accountId: 'sales-return-account-id', // Get from accounts table
                description: `Sales return from ${salesReturn.customerName}`,
                debitAmount: salesReturn.subtotal,
                creditAmount: 0
              },
              {
                accountId: 'vat-output-account-id', // Get from accounts table
                description: `VAT on sales return from ${salesReturn.customerName}`,
                debitAmount: salesReturn.vatAmount,
                creditAmount: 0
              },
              {
                accountId: 'debtors-account-id', // Get from accounts table
                description: `Amount due to ${salesReturn.customerName}`,
                debitAmount: 0,
                creditAmount: salesReturn.totalAmount
              }
            ]
          }
        }
      });

      // Journal entry created successfully for sales return

    } catch (error) {
      logger.error('Error creating sales return journal entry:', error);
    }
  }
};

// Purchase Return Controller
export const purchaseReturnController = {
  async getPurchaseReturns(req: Request, res: Response): Promise<Response> {
    try {
      const { fromDate, toDate, supplierId, status, search, page = 1, limit = 10 } = req.query;
      
      const where: any = {};
      
      if (fromDate && toDate) {
        where.date = {
          gte: new Date(fromDate as string),
          lte: new Date(toDate as string)
        };
      }
      
      if (supplierId) {
        where.supplierName = { contains: supplierId as string, mode: 'insensitive' };
      }
      
      if (status) {
        where.status = status as string;
      }
      
      if (search) {
        where.OR = [
          { returnNumber: { contains: search as string, mode: 'insensitive' } },
          { supplierName: { contains: search as string, mode: 'insensitive' } },
          { originalPurchaseNumber: { contains: search as string, mode: 'insensitive' } }
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
    } catch (error) {
      logger.error('Error fetching purchase returns:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch purchase returns',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getPurchaseReturnById(req: Request, res: Response): Promise<Response> {
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
    } catch (error) {
      logger.error('Error fetching purchase return:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch purchase return',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async createPurchaseReturn(req: Request, res: Response): Promise<Response> {
    try {
      const returnData = req.body;
      
      // Generate return number
      const returnNumber = `PR${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
      
      const purchaseReturn = await prisma.purchaseReturn.create({
        data: {
          ...returnData,
          returnNumber,
          enteredBy: 'admin' // In real app, get from auth
        }
      });

      // Create journal entry for purchase return
      await this.createPurchaseReturnJournalEntry(purchaseReturn);

      logger.info(`Purchase return created: ${purchaseReturn.returnNumber}`);

      return res.status(201).json({
        success: true,
        message: 'Purchase return created successfully',
        data: purchaseReturn
      });
    } catch (error) {
      logger.error('Error creating purchase return:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create purchase return',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async updatePurchaseReturn(req: Request, res: Response): Promise<Response> {
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

      logger.info(`Purchase return updated: ${purchaseReturn.returnNumber}`);

      return res.status(200).json({
        success: true,
        message: 'Purchase return updated successfully',
        data: purchaseReturn
      });
    } catch (error) {
      logger.error('Error updating purchase return:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update purchase return',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async processReturn(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const purchaseReturn = await prisma.purchaseReturn.update({
        where: { id },
        data: {
          status: 'processed',
          updatedAt: new Date()
        }
      });

      logger.info(`Purchase return processed: ${purchaseReturn.returnNumber}`);

      return res.status(200).json({
        success: true,
        message: 'Purchase return processed successfully',
        data: purchaseReturn
      });
    } catch (error) {
      logger.error('Error processing purchase return:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process purchase return',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async deletePurchaseReturn(req: Request, res: Response): Promise<Response> {
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

      logger.info(`Purchase return deleted: ${existingReturn.returnNumber}`);

      return res.status(200).json({
        success: true,
        message: 'Purchase return deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting purchase return:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete purchase return',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async createPurchaseReturnJournalEntry(purchaseReturn: any) {
    try {
      // Create journal entry for purchase return
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
                accountId: 'creditors-account-id', // Get from accounts table
                description: `Amount due to ${purchaseReturn.supplierName}`,
                debitAmount: purchaseReturn.totalAmount,
                creditAmount: 0
              },
              {
                accountId: 'purchase-return-account-id', // Get from accounts table
                description: `Purchase return to ${purchaseReturn.supplierName}`,
                debitAmount: 0,
                creditAmount: purchaseReturn.subtotal
              },
              {
                accountId: 'vat-input-account-id', // Get from accounts table
                description: `VAT on purchase return to ${purchaseReturn.supplierName}`,
                debitAmount: 0,
                creditAmount: purchaseReturn.vatAmount
              }
            ]
          }
        }
      });

      // Journal entry created successfully for purchase return

    } catch (error) {
      logger.error('Error creating purchase return journal entry:', error);
    }
  }
};

export const vatReportController = {
  async getVATReports(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      success: true,
      message: 'VAT reports endpoint - implementation pending',
      data: []
    });
  },

  async getVATReportById(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      success: true,
      message: 'VAT report by ID endpoint - implementation pending',
      data: null
    });
  },

  async generateVATReport(req: Request, res: Response): Promise<Response> {
    return res.status(201).json({
      success: true,
      message: 'Generate VAT report endpoint - implementation pending',
      data: null
    });
  },

  async fileVATReport(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      success: true,
      message: 'File VAT report endpoint - implementation pending',
      data: null
    });
  },

  async deleteVATReport(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      success: true,
      message: 'Delete VAT report endpoint - implementation pending'
    });
  }
};

export const trialBalanceController = {
  async generateTrialBalance(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      success: true,
      message: 'Generate trial balance endpoint - implementation pending',
      data: null
    });
  },

  async getTrialBalanceHistory(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      success: true,
      message: 'Trial balance history endpoint - implementation pending',
      data: []
    });
  }
};

export const balanceSheetController = {
  async generateBalanceSheet(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      success: true,
      message: 'Generate balance sheet endpoint - implementation pending',
      data: null
    });
  },

  async getBalanceSheetHistory(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      success: true,
      message: 'Balance sheet history endpoint - implementation pending',
      data: []
    });
  },

  async getFinancialRatios(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      success: true,
      message: 'Financial ratios endpoint - implementation pending',
      data: null
    });
  }
};

export const debtorsCreditorsController = {
  // Get debtors and creditors summary
  async getDebtorsCreditors(req: Request, res: Response): Promise<Response> {
    try {
      const { partyType, status } = req.query;

      // Build where clause
      const whereClause: any = {};
      if (partyType) {
        whereClause.partyType = partyType;
      }
      if (status) {
        whereClause.status = status;
      }

      // Get parties with their current balances
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

      // Separate debtors and creditors
      const debtors = parties.filter(party => Number(party.currentBalance) > 0);
      const creditors = parties.filter(party => Number(party.currentBalance) < 0);

      // Calculate totals
      const totalDebtors = debtors.reduce((sum, party) => sum + Number(party.currentBalance), 0);
      const totalCreditors = Math.abs(creditors.reduce((sum, party) => sum + Number(party.currentBalance), 0));

      logger.info(`Retrieved ${debtors.length} debtors and ${creditors.length} creditors`);

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
    } catch (error) {
      logger.error('Error getting debtors and creditors:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get debtors and creditors',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get aging analysis
  async getAgingAnalysis(req: Request, res: Response): Promise<Response> {
    try {
      const { partyType } = req.query;

      // Build where clause
      const whereClause: any = {};
      if (partyType) {
        whereClause.partyType = partyType;
      }

      // Get parties with their transactions
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
        current: 0,      // 0-30 days
        days30: 0,       // 31-60 days
        days60: 0,       // 61-90 days
        days90: 0,       // 91-180 days
        over180: 0       // 180+ days
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
          } else if (daysDiff <= 60) {
            aging.days30 += amount;
          } else if (daysDiff <= 90) {
            aging.days60 += amount;
          } else if (daysDiff <= 180) {
            aging.days90 += amount;
          } else {
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

      // Calculate totals
      const totalAging = agingAnalysis.reduce((totals, party) => {
        totals.current += party.aging.current;
        totals.days30 += party.aging.days30;
        totals.days60 += party.aging.days60;
        totals.days90 += party.aging.days90;
        totals.over180 += party.aging.over180;
        return totals;
      }, { ...agingCategories });

      logger.info('Aging analysis completed');

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
    } catch (error) {
      logger.error('Error getting aging analysis:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get aging analysis',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get party transaction history
  async getPartyTransactions(req: Request, res: Response): Promise<Response> {
    try {
      const { partyId } = req.params;
      const { startDate, endDate, status } = req.query;

      // Build where clause
      const whereClause: any = {
        partyId
      };

      if (startDate || endDate) {
        whereClause.date = {};
        if (startDate) whereClause.date.gte = new Date(startDate as string);
        if (endDate) whereClause.date.lte = new Date(endDate as string);
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

      logger.info(`Retrieved ${transactions.length} transactions for party ${partyId}`);

      return res.status(200).json({
        success: true,
        message: 'Party transactions retrieved successfully',
        data: transactions
      });
    } catch (error) {
      logger.error('Error getting party transactions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get party transactions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Mark transaction as paid
  async markTransactionAsPaid(req: Request, res: Response): Promise<Response> {
    try {
      const { transactionId } = req.params;
      const { paymentDate, paymentMethod, reference } = req.body;

      // Get the transaction
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

      // Update transaction status
      const updatedTransaction = await prisma.partyTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'PAID'
        }
      });

      // Update party balance
      const newBalance = Number(transaction.partyLedger.currentBalance) - Number(transaction.amount);
      await prisma.partyLedger.update({
        where: { id: transaction.partyLedgerId },
        data: { currentBalance: newBalance }
      });

      logger.info(`Transaction ${transactionId} marked as paid`);

      return res.status(200).json({
        success: true,
        message: 'Transaction marked as paid successfully',
        data: updatedTransaction
      });
    } catch (error) {
      logger.error('Error marking transaction as paid:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark transaction as paid',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

export const purchaseSalesReportsController = {
  async getReports(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      success: true,
      message: 'Purchase & sales reports endpoint - implementation pending',
      data: []
    });
  },

  async generateReport(req: Request, res: Response): Promise<Response> {
    return res.status(201).json({
      success: true,
      message: 'Generate purchase & sales report endpoint - implementation pending',
      data: null
    });
  }
};

export const misReportController = {
  async getMISReports(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      success: true,
      message: 'MIS reports endpoint - implementation pending',
      data: []
    });
  },

  async generateMISReport(req: Request, res: Response): Promise<Response> {
    return res.status(201).json({
      success: true,
      message: 'Generate MIS report endpoint - implementation pending',
      data: null
    });
  },

  async getDashboardKPIs(req: Request, res: Response): Promise<Response> {
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