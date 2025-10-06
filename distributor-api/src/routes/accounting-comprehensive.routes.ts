import { Router } from 'express';
import { 
  journalEntryController,
  ledgerController,
  accountsController,
  partyLedgerController,
  purchaseEntryController,
  salesEntryController,
  salesReturnController,
  purchaseReturnController,
  vatReportController,
  trialBalanceController,
  balanceSheetController,
  debtorsCreditorsController,
  purchaseSalesReportsController,
  misReportController
} from '../controllers/accounting.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Journal Entry Routes
router.get('/journal-entries', journalEntryController.getJournalEntries);
router.get('/journal-entries/:id', journalEntryController.getJournalEntryById);
router.post('/journal-entries', journalEntryController.createJournalEntry);
router.put('/journal-entries/:id', journalEntryController.updateJournalEntry);
router.patch('/journal-entries/:id/post', journalEntryController.postJournalEntry);
router.delete('/journal-entries/:id', journalEntryController.deleteJournalEntry);
router.post('/journal-entries/validate', journalEntryController.validateJournalEntry);

// Ledger Routes
router.get('/ledger', ledgerController.getLedgerEntries);
router.get('/ledger/account/:accountCode', ledgerController.getAccountLedger);
router.get('/ledger/account/:accountCode/balance', ledgerController.getAccountBalance);

// Accounts Routes
router.get('/accounts', accountsController.getAccounts);
router.get('/accounts/chart', accountsController.getChartOfAccounts);
router.get('/accounts/:id', accountsController.getAccountById);
router.post('/accounts', accountsController.createAccount);
router.put('/accounts/:id', accountsController.updateAccount);
router.delete('/accounts/:id', accountsController.deleteAccount);

// Party Ledger Routes
router.get('/party-ledger', partyLedgerController.getPartyLedgers);
router.get('/party-ledger/:id', partyLedgerController.getPartyLedgerById);
router.get('/party-ledger/:partyId/transactions', partyLedgerController.getPartyTransactions);
router.post('/party-ledger', partyLedgerController.createParty);
router.put('/party-ledger/:id', partyLedgerController.updateParty);
router.delete('/party-ledger/:id', partyLedgerController.deleteParty);
router.get('/party-ledger/aging', partyLedgerController.getAgingAnalysis);

// Purchase Entry Routes
router.get('/purchase-entries', purchaseEntryController.getPurchaseEntries);
router.get('/purchase-entries/:id', purchaseEntryController.getPurchaseEntryById);
router.post('/purchase-entries', purchaseEntryController.createPurchaseEntry);
router.put('/purchase-entries/:id', purchaseEntryController.updatePurchaseEntry);
router.patch('/purchase-entries/:id/mark-paid', purchaseEntryController.markAsPaid);
router.delete('/purchase-entries/:id', purchaseEntryController.deletePurchaseEntry);

// Sales Entry Routes
router.get('/sales-entries', salesEntryController.getSalesEntries);
router.get('/sales-entries/:id', salesEntryController.getSalesEntryById);
router.post('/sales-entries', salesEntryController.createSalesEntry);
router.put('/sales-entries/:id', salesEntryController.updateSalesEntry);
router.patch('/sales-entries/:id/mark-paid', salesEntryController.markAsPaid);
router.delete('/sales-entries/:id', salesEntryController.deleteSalesEntry);

// Sales Return Routes
router.get('/sales-returns', salesReturnController.getSalesReturns);
router.get('/sales-returns/:id', salesReturnController.getSalesReturnById);
router.post('/sales-returns', salesReturnController.createSalesReturn);
router.put('/sales-returns/:id', salesReturnController.updateSalesReturn);
router.patch('/sales-returns/:id/process', salesReturnController.processReturn);
router.delete('/sales-returns/:id', salesReturnController.deleteSalesReturn);

// Purchase Return Routes
router.get('/purchase-returns', purchaseReturnController.getPurchaseReturns);
router.get('/purchase-returns/:id', purchaseReturnController.getPurchaseReturnById);
router.post('/purchase-returns', purchaseReturnController.createPurchaseReturn);
router.put('/purchase-returns/:id', purchaseReturnController.updatePurchaseReturn);
router.patch('/purchase-returns/:id/process', purchaseReturnController.processReturn);
router.delete('/purchase-returns/:id', purchaseReturnController.deletePurchaseReturn);

// VAT Report Routes
router.get('/vat-reports', vatReportController.getVATReports);
router.get('/vat-reports/:id', vatReportController.getVATReportById);
router.post('/vat-reports/generate', vatReportController.generateVATReport);
router.patch('/vat-reports/:id/file', vatReportController.fileVATReport);
router.delete('/vat-reports/:id', vatReportController.deleteVATReport);

// Trial Balance Routes
router.get('/trial-balance', trialBalanceController.generateTrialBalance);
router.get('/trial-balance/history', trialBalanceController.getTrialBalanceHistory);

// Balance Sheet Routes
router.get('/balance-sheet', balanceSheetController.generateBalanceSheet);
router.get('/balance-sheet/history', balanceSheetController.getBalanceSheetHistory);
router.get('/balance-sheet/ratios', balanceSheetController.getFinancialRatios);

// Debtors & Creditors Routes
router.get('/debtors-creditors', debtorsCreditorsController.getDebtorsCreditors);
router.get('/debtors-creditors/aging', debtorsCreditorsController.getAgingAnalysis);
router.get('/debtors-creditors/parties/:partyId/transactions', debtorsCreditorsController.getPartyTransactions);
router.patch('/debtors-creditors/transactions/:transactionId/paid', debtorsCreditorsController.markTransactionAsPaid);

// Purchase & Sales Reports Routes
router.get('/purchase-sales-reports', purchaseSalesReportsController.getReports);
router.post('/purchase-sales-reports/generate', purchaseSalesReportsController.generateReport);

// MIS Report Routes
router.get('/mis-reports', misReportController.getMISReports);
router.post('/mis-reports/generate', misReportController.generateMISReport);
router.get('/mis-reports/kpis', misReportController.getDashboardKPIs);

export default router;
