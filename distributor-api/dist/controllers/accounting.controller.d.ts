import { Request, Response } from 'express';
export declare const journalEntryController: {
    getJournalEntries(req: Request, res: Response): Promise<Response>;
    getJournalEntryById(req: Request, res: Response): Promise<Response>;
    createJournalEntry(req: Request, res: Response): Promise<Response>;
    updateJournalEntry(req: Request, res: Response): Promise<Response>;
    postJournalEntry(req: Request, res: Response): Promise<Response>;
    deleteJournalEntry(req: Request, res: Response): Promise<Response>;
    validateJournalEntry(req: Request, res: Response): Promise<Response>;
};
export declare const ledgerController: {
    getLedgerEntries(req: Request, res: Response): Promise<Response>;
    getAccountLedger(req: Request, res: Response): Promise<Response>;
    getAccountBalance(req: Request, res: Response): Promise<Response>;
};
export declare const accountsController: {
    getAccounts(req: Request, res: Response): Promise<Response>;
    getChartOfAccounts(req: Request, res: Response): Promise<Response>;
    getAccountById(req: Request, res: Response): Promise<Response>;
    createAccount(req: Request, res: Response): Promise<Response>;
    updateAccount(req: Request, res: Response): Promise<Response>;
    deleteAccount(req: Request, res: Response): Promise<Response>;
};
export declare const partyLedgerController: {
    getPartyLedgers(req: Request, res: Response): Promise<Response>;
    getPartyLedgerById(req: Request, res: Response): Promise<Response>;
    getPartyTransactions(req: Request, res: Response): Promise<Response>;
    createParty(req: Request, res: Response): Promise<Response>;
    updateParty(req: Request, res: Response): Promise<Response>;
    deleteParty(req: Request, res: Response): Promise<Response>;
    getAgingAnalysis(req: Request, res: Response): Promise<Response>;
};
export declare const purchaseEntryController: {
    getPurchaseEntries(req: Request, res: Response): Promise<Response>;
    getPurchaseEntryById(req: Request, res: Response): Promise<Response>;
    createPurchaseEntry(req: Request, res: Response): Promise<Response>;
    updatePurchaseEntry(req: Request, res: Response): Promise<Response>;
    markAsPaid(req: Request, res: Response): Promise<Response>;
    deletePurchaseEntry(req: Request, res: Response): Promise<Response>;
    createPurchaseJournalEntry(purchaseEntry: any): Promise<void>;
    createPaymentJournalEntry(purchaseEntry: any, paymentData: any): Promise<void>;
};
export declare const salesEntryController: {
    getSalesEntries(req: Request, res: Response): Promise<Response>;
    getSalesEntryById(req: Request, res: Response): Promise<Response>;
    createSalesEntry(req: Request, res: Response): Promise<Response>;
    updateSalesEntry(req: Request, res: Response): Promise<Response>;
    markAsPaid(req: Request, res: Response): Promise<Response>;
    deleteSalesEntry(req: Request, res: Response): Promise<Response>;
    createSalesJournalEntry(salesEntry: any): Promise<void>;
    createPaymentJournalEntry(salesEntry: any, paymentData: any): Promise<void>;
};
export declare const salesReturnController: {
    getSalesReturns(req: Request, res: Response): Promise<Response>;
    getSalesReturnById(req: Request, res: Response): Promise<Response>;
    createSalesReturn(req: Request, res: Response): Promise<Response>;
    updateSalesReturn(req: Request, res: Response): Promise<Response>;
    processReturn(req: Request, res: Response): Promise<Response>;
    deleteSalesReturn(req: Request, res: Response): Promise<Response>;
    createSalesReturnJournalEntry(salesReturn: any): Promise<void>;
};
export declare const purchaseReturnController: {
    getPurchaseReturns(req: Request, res: Response): Promise<Response>;
    getPurchaseReturnById(req: Request, res: Response): Promise<Response>;
    createPurchaseReturn(req: Request, res: Response): Promise<Response>;
    updatePurchaseReturn(req: Request, res: Response): Promise<Response>;
    processReturn(req: Request, res: Response): Promise<Response>;
    deletePurchaseReturn(req: Request, res: Response): Promise<Response>;
    createPurchaseReturnJournalEntry(purchaseReturn: any): Promise<void>;
};
export declare const vatReportController: {
    getVATReports(req: Request, res: Response): Promise<Response>;
    getVATReportById(req: Request, res: Response): Promise<Response>;
    generateVATReport(req: Request, res: Response): Promise<Response>;
    fileVATReport(req: Request, res: Response): Promise<Response>;
    deleteVATReport(req: Request, res: Response): Promise<Response>;
};
export declare const trialBalanceController: {
    generateTrialBalance(req: Request, res: Response): Promise<Response>;
    getTrialBalanceHistory(req: Request, res: Response): Promise<Response>;
};
export declare const balanceSheetController: {
    generateBalanceSheet(req: Request, res: Response): Promise<Response>;
    getBalanceSheetHistory(req: Request, res: Response): Promise<Response>;
    getFinancialRatios(req: Request, res: Response): Promise<Response>;
};
export declare const debtorsCreditorsController: {
    getDebtorsCreditors(req: Request, res: Response): Promise<Response>;
    getAgingAnalysis(req: Request, res: Response): Promise<Response>;
    getPartyTransactions(req: Request, res: Response): Promise<Response>;
    markTransactionAsPaid(req: Request, res: Response): Promise<Response>;
};
export declare const purchaseSalesReportsController: {
    getReports(req: Request, res: Response): Promise<Response>;
    generateReport(req: Request, res: Response): Promise<Response>;
};
export declare const misReportController: {
    getMISReports(req: Request, res: Response): Promise<Response>;
    generateMISReport(req: Request, res: Response): Promise<Response>;
    getDashboardKPIs(req: Request, res: Response): Promise<Response>;
};
//# sourceMappingURL=accounting.controller.d.ts.map