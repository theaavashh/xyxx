import { useApi, useApiMutation, usePaginatedApi, useCachedApi } from './useApi';
import { accountingService } from '@/services/accounting.service';
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

// Journal Entry Hooks
export function useJournalEntries(params?: {
  fromDate?: string;
  toDate?: string;
  accountCode?: string;
  status?: 'draft' | 'posted';
  search?: string;
}) {
  return useApi(
    () => accountingService.journalEntry.getJournalEntries(params),
    [params?.fromDate, params?.toDate, params?.accountCode, params?.status, params?.search]
  );
}

export function useCreateJournalEntry() {
  return useApiMutation((entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) =>
    accountingService.journalEntry.createJournalEntry(entry)
  );
}

export function useUpdateJournalEntry() {
  return useApiMutation(({ id, entry }: { id: string; entry: Partial<JournalEntry> }) =>
    accountingService.journalEntry.updateJournalEntry(id, entry)
  );
}

export function usePostJournalEntry() {
  return useApiMutation((id: string) =>
    accountingService.journalEntry.postJournalEntry(id)
  );
}

export function useValidateJournalEntry() {
  return useApiMutation((entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) =>
    accountingService.journalEntry.validateJournalEntry(entry)
  );
}

// Ledger Hooks
export function useLedgerEntries(params?: {
  accountCode?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}) {
  return useApi(
    () => accountingService.ledger.getLedgerEntries(params),
    [params?.accountCode, params?.fromDate, params?.toDate, params?.search]
  );
}

export function useAccountLedger(accountCode: string, fromDate?: string, toDate?: string) {
  return useApi(
    () => accountingService.ledger.getAccountLedger(accountCode, fromDate, toDate),
    [accountCode, fromDate, toDate],
    !!accountCode
  );
}

export function useAccountBalance(accountCode: string, asOfDate?: string) {
  return useApi(
    () => accountingService.ledger.getAccountBalance(accountCode, asOfDate),
    [accountCode, asOfDate],
    !!accountCode
  );
}

// Accounts Hooks
export function useAccounts(params?: {
  type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  search?: string;
  isActive?: boolean;
}) {
  return useCachedApi(
    `accounts_${JSON.stringify(params)}`,
    () => accountingService.accounts.getAccounts(params),
    5 * 60 * 1000, // Cache for 5 minutes
    [params?.type, params?.search, params?.isActive]
  );
}

export function useChartOfAccounts() {
  return useCachedApi(
    'chart_of_accounts',
    () => accountingService.accounts.getChartOfAccounts(),
    10 * 60 * 1000 // Cache for 10 minutes
  );
}

export function useCreateAccount() {
  return useApiMutation((account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) =>
    accountingService.accounts.createAccount(account)
  );
}

export function useUpdateAccount() {
  return useApiMutation(({ id, account }: { id: string; account: Partial<Account> }) =>
    accountingService.accounts.updateAccount(id, account)
  );
}

// Party Ledger Hooks
export function usePartyLedgers(params?: {
  partyType?: 'customer' | 'supplier';
  search?: string;
  hasOutstanding?: boolean;
}) {
  return useApi(
    () => accountingService.partyLedger.getPartyLedgers(params),
    [params?.partyType, params?.search, params?.hasOutstanding]
  );
}

export function usePartyTransactions(partyId: string, fromDate?: string, toDate?: string) {
  return useApi(
    () => accountingService.partyLedger.getPartyTransactions(partyId, fromDate, toDate),
    [partyId, fromDate, toDate],
    !!partyId
  );
}

export function useCreateParty() {
  return useApiMutation((party: Omit<PartyLedger, 'id' | 'currentBalance' | 'transactions' | 'createdAt' | 'updatedAt'>) =>
    accountingService.partyLedger.createParty(party)
  );
}

export function useUpdateParty() {
  return useApiMutation(({ id, party }: { id: string; party: Partial<PartyLedger> }) =>
    accountingService.partyLedger.updateParty(id, party)
  );
}

// Purchase Entry Hooks
export function usePurchaseEntries(params?: {
  fromDate?: string;
  toDate?: string;
  supplierId?: string;
  status?: 'pending' | 'paid' | 'overdue';
  search?: string;
}) {
  return useApi(
    () => accountingService.purchaseEntry.getPurchaseEntries(params),
    [params?.fromDate, params?.toDate, params?.supplierId, params?.status, params?.search]
  );
}

export function useCreatePurchaseEntry() {
  return useApiMutation((entry: Omit<PurchaseEntry, 'id' | 'createdAt' | 'updatedAt'>) =>
    accountingService.purchaseEntry.createPurchaseEntry(entry)
  );
}

export function useUpdatePurchaseEntry() {
  return useApiMutation(({ id, entry }: { id: string; entry: Partial<PurchaseEntry> }) =>
    accountingService.purchaseEntry.updatePurchaseEntry(id, entry)
  );
}

export function useMarkPurchaseAsPaid() {
  return useApiMutation(({ id, paymentData }: { 
    id: string; 
    paymentData: {
      paymentDate: string;
      paymentMethod: string;
      referenceNumber?: string;
      bankAccount?: string;
    }
  }) => accountingService.purchaseEntry.markAsPaid(id, paymentData));
}

// VAT Report Hooks
export function useVATReports(params?: {
  year?: number;
  quarter?: number;
  status?: 'draft' | 'filed';
}) {
  return useApi(
    () => accountingService.vatReport.getVATReports(params),
    [params?.year, params?.quarter, params?.status]
  );
}

export function useGenerateVATReport() {
  return useApiMutation((params: {
    fromDate: string;
    toDate: string;
    quarter: number;
    year: number;
  }) => accountingService.vatReport.generateVATReport(params));
}

export function useFileVATReport() {
  return useApiMutation((id: string) =>
    accountingService.vatReport.fileVATReport(id)
  );
}

// Trial Balance Hooks
export function useTrialBalance(asOfDate: string) {
  return useApi(
    () => accountingService.trialBalance.generateTrialBalance(asOfDate),
    [asOfDate],
    !!asOfDate
  );
}

export function useTrialBalanceHistory(params?: {
  fromDate?: string;
  toDate?: string;
  frequency?: 'monthly' | 'quarterly' | 'yearly';
}) {
  return useApi(
    () => accountingService.trialBalance.getTrialBalanceHistory(params),
    [params?.fromDate, params?.toDate, params?.frequency]
  );
}

// Balance Sheet Hooks
export function useBalanceSheet(asOfDate: string) {
  return useApi(
    () => accountingService.balanceSheet.generateBalanceSheet(asOfDate),
    [asOfDate],
    !!asOfDate
  );
}

export function useBalanceSheetHistory(params?: {
  fromDate?: string;
  toDate?: string;
  frequency?: 'monthly' | 'quarterly' | 'yearly';
}) {
  return useApi(
    () => accountingService.balanceSheet.getBalanceSheetHistory(params),
    [params?.fromDate, params?.toDate, params?.frequency]
  );
}

export function useFinancialRatios(asOfDate: string) {
  return useApi(
    () => accountingService.balanceSheet.getFinancialRatios(asOfDate),
    [asOfDate],
    !!asOfDate
  );
}

// Debtors & Creditors Hooks
export function useDebtorsCreditors(params?: {
  type?: 'debtor' | 'creditor';
  overdueOnly?: boolean;
  search?: string;
}) {
  return useApi(
    () => accountingService.debtorsCreditors.getDebtorsCreditors(params),
    [params?.type, params?.overdueOnly, params?.search]
  );
}

export function useAgingAnalysis(asOfDate?: string) {
  return useApi(
    () => accountingService.debtorsCreditors.getAgingAnalysis(asOfDate),
    [asOfDate]
  );
}

// Purchase & Sales Reports Hooks
export function usePurchaseSalesReports(params?: {
  reportType?: 'purchase' | 'sales';
  fromDate?: string;
  toDate?: string;
}) {
  return useApi(
    () => accountingService.purchaseSalesReports.getReports(params),
    [params?.reportType, params?.fromDate, params?.toDate]
  );
}

export function useGeneratePurchaseSalesReport() {
  return useApiMutation((params: {
    reportType: 'purchase' | 'sales';
    fromDate: string;
    toDate: string;
  }) => accountingService.purchaseSalesReports.generateReport(params));
}

// MIS Report Hooks
export function useMISReports(params?: {
  fromDate?: string;
  toDate?: string;
  periodType?: 'monthly' | 'quarterly' | 'yearly';
}) {
  return useApi(
    () => accountingService.misReport.getMISReports(params),
    [params?.fromDate, params?.toDate, params?.periodType]
  );
}

export function useGenerateMISReport() {
  return useApiMutation((params: {
    fromDate: string;
    toDate: string;
    periodType: 'monthly' | 'quarterly' | 'yearly';
  }) => accountingService.misReport.generateMISReport(params));
}

export function useDashboardKPIs(asOfDate?: string) {
  return useCachedApi(
    `dashboard_kpis_${asOfDate}`,
    () => accountingService.misReport.getDashboardKPIs(asOfDate),
    2 * 60 * 1000, // Cache for 2 minutes
    [asOfDate]
  );
}

// Combined hook for accounting dashboard
export function useAccountingDashboard() {
  const today = new Date().toISOString().split('T')[0];
  
  const kpis = useDashboardKPIs(today);
  const trialBalance = useTrialBalance(today);
  const agingAnalysis = useAgingAnalysis(today);
  
  return {
    kpis: kpis.data,
    trialBalance: trialBalance.data,
    agingAnalysis: agingAnalysis.data,
    loading: kpis.loading || trialBalance.loading || agingAnalysis.loading,
    error: kpis.error || trialBalance.error || agingAnalysis.error,
    refetch: () => {
      kpis.refetch();
      trialBalance.refetch();
      agingAnalysis.refetch();
    }
  };
}








