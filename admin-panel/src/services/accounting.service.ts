import { httpClient, apiCall, retryApiCall } from '@/lib/api';
import { 
  JournalEntry, 
  LedgerEntry, 
  Account, 
  PartyLedger, 
  PurchaseEntry, 
  VATReport,
  TrialBalance,
  BalanceSheet,
  DebtorsCreditors,
  PurchaseSalesReport,
  MISReport
} from '@/types';

// Base service class for common operations
class BaseAccountingService {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll<T>(params?: Record<string, any>): Promise<T[]> {
    const data = await apiCall(() => httpClient.get<T[]>(this.endpoint, params));
    return data || [];
  }

  async getById<T>(id: string): Promise<T | null> {
    return await apiCall(() => httpClient.get<T>(`${this.endpoint}/${id}`));
  }

  async create<T>(data: Partial<T>): Promise<T | null> {
    return await apiCall(() => httpClient.post<T>(this.endpoint, data), true, 'Created successfully');
  }

  async update<T>(id: string, data: Partial<T>): Promise<T | null> {
    return await apiCall(() => httpClient.put<T>(`${this.endpoint}/${id}`, data), true, 'Updated successfully');
  }

  async delete(id: string): Promise<boolean> {
    const result = await apiCall(() => httpClient.delete(`${this.endpoint}/${id}`), true, 'Deleted successfully');
    return result !== null;
  }
}

// Journal Entry Service
class JournalEntryService extends BaseAccountingService {
  constructor() {
    super('/accounting/journal-entries');
  }

  async getJournalEntries(params?: {
    fromDate?: string;
    toDate?: string;
    accountCode?: string;
    status?: 'draft' | 'posted';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<JournalEntry[]> {
    // The API returns data in a nested structure: { journalEntries: [...], pagination: {...} }
    const response = await this.getAll<{ journalEntries: JournalEntry[]; pagination: any }>(params);
    return response?.journalEntries || [];
  }

  async createJournalEntry(entry: {
    date: Date | string; // Accept both Date and string for flexibility
    journalNumber: string;
    companyName: string;
    description: string;
    entries: {
      accountId: string;
      description: string;
      debitAmount: number;
      creditAmount: number;
    }[];
    totalDebit: number;
    totalCredit: number;
    status: 'DRAFT' | 'POSTED';
    createdById: string;
  }): Promise<JournalEntry | null> {
    return this.create<JournalEntry>(entry);
  }

  async updateJournalEntry(id: string, entry: Partial<JournalEntry>): Promise<JournalEntry | null> {
    return this.update<JournalEntry>(id, entry);
  }

  async postJournalEntry(id: string): Promise<JournalEntry | null> {
    return await apiCall(() => httpClient.patch<JournalEntry>(`${this.endpoint}/${id}/post`), true, 'Journal entry posted successfully');
  }

  async validateJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ isValid: boolean; errors: string[] }> {
    const data = await apiCall(() => httpClient.post<{ isValid: boolean; errors: string[] }>(`${this.endpoint}/validate`, entry));
    return data || { isValid: false, errors: ['Validation failed'] };
  }
}

// Ledger Service
class LedgerService extends BaseAccountingService {
  constructor() {
    super('/accounting/ledger');
  }

  async getLedgerEntries(params?: {
    accountCode?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<LedgerEntry[]> {
    return this.getAll<LedgerEntry>(params);
  }

  async getAccountLedger(accountCode: string, fromDate?: string, toDate?: string): Promise<LedgerEntry[]> {
    const data = await apiCall(() => httpClient.get<LedgerEntry[]>(`${this.endpoint}/account/${accountCode}`, {
      fromDate,
      toDate
    }));
    return data || [];
  }

  async getAccountBalance(accountCode: string, asOfDate?: string): Promise<{ balance: number; balanceType: 'debit' | 'credit' }> {
    const data = await apiCall(() => httpClient.get<{ balance: number; balanceType: 'debit' | 'credit' }>(`${this.endpoint}/account/${accountCode}/balance`, {
      asOfDate
    }));
    return data || { balance: 0, balanceType: 'debit' };
  }
}

// Accounts Service
class AccountsService extends BaseAccountingService {
  constructor() {
    super('/accounting/accounts');
  }

  async getAccounts(params?: {
    type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    search?: string;
    isActive?: boolean;
  }): Promise<Account[]> {
    return this.getAll<Account>(params);
  }

  async createAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account | null> {
    return this.create<Account>(account);
  }

  async updateAccount(id: string, account: Partial<Account>): Promise<Account | null> {
    return this.update<Account>(id, account);
  }

  async getChartOfAccounts(): Promise<Account[]> {
    const data = await apiCall(() => httpClient.get<Account[]>(`${this.endpoint}/chart`));
    return data || [];
  }
}

// Party Ledger Service
class PartyLedgerService extends BaseAccountingService {
  constructor() {
    super('/accounting/party-ledger');
  }

  async getPartyLedgers(params?: {
    partyType?: 'customer' | 'supplier';
    search?: string;
    hasOutstanding?: boolean;
  }): Promise<PartyLedger[]> {
    return this.getAll<PartyLedger>(params);
  }

  async createParty(party: Omit<PartyLedger, 'id' | 'currentBalance' | 'transactions' | 'createdAt' | 'updatedAt'>): Promise<PartyLedger | null> {
    return this.create<PartyLedger>(party);
  }

  async updateParty(id: string, party: Partial<PartyLedger>): Promise<PartyLedger | null> {
    return this.update<PartyLedger>(id, party);
  }

  async getPartyTransactions(partyId: string, fromDate?: string, toDate?: string): Promise<PartyLedger | null> {
    const data = await apiCall(() => httpClient.get<PartyLedger>(`${this.endpoint}/${partyId}/transactions`, {
      fromDate,
      toDate
    }));
    return data;
  }
}

// Purchase Entry Service
class PurchaseEntryService extends BaseAccountingService {
  constructor() {
    super('/accounting/purchase-entries');
  }

  async getPurchaseEntries(params?: {
    fromDate?: string;
    toDate?: string;
    supplierId?: string;
    status?: 'pending' | 'paid' | 'overdue';
    search?: string;
  }): Promise<PurchaseEntry[]> {
    return this.getAll<PurchaseEntry>(params);
  }

  async createPurchaseEntry(entry: Omit<PurchaseEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseEntry | null> {
    return this.create<PurchaseEntry>(entry);
  }

  async updatePurchaseEntry(id: string, entry: Partial<PurchaseEntry>): Promise<PurchaseEntry | null> {
    return this.update<PurchaseEntry>(id, entry);
  }

  async markAsPaid(id: string, paymentData: {
    paymentDate: string;
    paymentMethod: string;
    referenceNumber?: string;
    bankAccount?: string;
  }): Promise<PurchaseEntry | null> {
    return await apiCall(() => httpClient.patch<PurchaseEntry>(`${this.endpoint}/${id}/mark-paid`, paymentData), true, 'Payment recorded successfully');
  }
}

// VAT Report Service
class VATReportService extends BaseAccountingService {
  constructor() {
    super('/accounting/vat-reports');
  }

  async generateVATReport(params: {
    fromDate: string;
    toDate: string;
    quarter: number;
    year: number;
  }): Promise<VATReport | null> {
    return await apiCall(() => httpClient.post<VATReport>(`${this.endpoint}/generate`, params));
  }

  async getVATReports(params?: {
    year?: number;
    quarter?: number;
    status?: 'draft' | 'filed';
  }): Promise<VATReport[]> {
    return this.getAll<VATReport>(params);
  }

  async fileVATReport(id: string): Promise<VATReport | null> {
    return await apiCall(() => httpClient.patch<VATReport>(`${this.endpoint}/${id}/file`), true, 'VAT report filed successfully');
  }
}

// Trial Balance Service
class TrialBalanceService extends BaseAccountingService {
  constructor() {
    super('/accounting/trial-balance');
  }

  async generateTrialBalance(asOfDate: string): Promise<TrialBalance | null> {
    return await apiCall(() => httpClient.get<TrialBalance>(`${this.endpoint}`, { asOfDate }));
  }

  async getTrialBalanceHistory(params?: {
    fromDate?: string;
    toDate?: string;
    frequency?: 'monthly' | 'quarterly' | 'yearly';
  }): Promise<TrialBalance[]> {
    return this.getAll<TrialBalance>(params);
  }
}

// Balance Sheet Service
class BalanceSheetService extends BaseAccountingService {
  constructor() {
    super('/accounting/balance-sheet');
  }

  async generateBalanceSheet(asOfDate: string): Promise<BalanceSheet | null> {
    return await apiCall(() => httpClient.get<BalanceSheet>(`${this.endpoint}`, { asOfDate }));
  }

  async getBalanceSheetHistory(params?: {
    fromDate?: string;
    toDate?: string;
    frequency?: 'monthly' | 'quarterly' | 'yearly';
  }): Promise<BalanceSheet[]> {
    return this.getAll<BalanceSheet>(params);
  }

  async getFinancialRatios(asOfDate: string): Promise<{
    currentRatio: number;
    quickRatio: number;
    debtToEquityRatio: number;
    returnOnAssets: number;
    returnOnEquity: number;
  } | null> {
    return await apiCall(() => httpClient.get(`${this.endpoint}/ratios`, { asOfDate }));
  }
}

// Debtors & Creditors Service
class DebtorsCreditors extends BaseAccountingService {
  constructor() {
    super('/accounting/debtors-creditors');
  }

  async getDebtorsCreditors(params?: {
    type?: 'debtor' | 'creditor';
    overdueOnly?: boolean;
    search?: string;
  }): Promise<DebtorsCreditors[]> {
    return this.getAll<DebtorsCreditors>(params);
  }

  async getAgingAnalysis(asOfDate?: string): Promise<{
    current: number;
    thirtyDays: number;
    sixtyDays: number;
    ninetyDaysPlus: number;
  } | null> {
    return await apiCall(() => httpClient.get(`${this.endpoint}/aging`, { asOfDate }));
  }
}

// Purchase & Sales Reports Service
class PurchaseSalesReportsService extends BaseAccountingService {
  constructor() {
    super('/accounting/purchase-sales-reports');
  }

  async generateReport(params: {
    reportType: 'purchase' | 'sales';
    fromDate: string;
    toDate: string;
  }): Promise<PurchaseSalesReport | null> {
    return await apiCall(() => httpClient.post<PurchaseSalesReport>(`${this.endpoint}/generate`, params));
  }

  async getReports(params?: {
    reportType?: 'purchase' | 'sales';
    fromDate?: string;
    toDate?: string;
  }): Promise<PurchaseSalesReport[]> {
    return this.getAll<PurchaseSalesReport>(params);
  }
}

// MIS Report Service
class MISReportService extends BaseAccountingService {
  constructor() {
    super('/accounting/mis-reports');
  }

  async generateMISReport(params: {
    fromDate: string;
    toDate: string;
    periodType: 'monthly' | 'quarterly' | 'yearly';
  }): Promise<MISReport | null> {
    return await apiCall(() => httpClient.post<MISReport>(`${this.endpoint}/generate`, params));
  }

  async getMISReports(params?: {
    fromDate?: string;
    toDate?: string;
    periodType?: 'monthly' | 'quarterly' | 'yearly';
  }): Promise<MISReport[]> {
    return this.getAll<MISReport>(params);
  }

  async getDashboardKPIs(asOfDate?: string): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    cashFlow: number;
    outstandingReceivables: number;
    outstandingPayables: number;
  } | null> {
    return await apiCall(() => httpClient.get(`${this.endpoint}/kpis`, { asOfDate }));
  }
}

// Export service instances
export const journalEntryService = new JournalEntryService();
export const ledgerService = new LedgerService();
export const accountsService = new AccountsService();
export const partyLedgerService = new PartyLedgerService();
export const purchaseEntryService = new PurchaseEntryService();
export const vatReportService = new VATReportService();
export const trialBalanceService = new TrialBalanceService();
export const balanceSheetService = new BalanceSheetService();
export const debtorsCreditors = new DebtorsCreditors();
export const purchaseSalesReportsService = new PurchaseSalesReportsService();
export const misReportService = new MISReportService();

// Export a combined service object
export const accountingService = {
  journalEntry: journalEntryService,
  ledger: ledgerService,
  accounts: accountsService,
  partyLedger: partyLedgerService,
  purchaseEntry: purchaseEntryService,
  vatReport: vatReportService,
  trialBalance: trialBalanceService,
  balanceSheet: balanceSheetService,
  debtorsCreditors,
  purchaseSalesReports: purchaseSalesReportsService,
  misReport: misReportService,
};

export default accountingService;


