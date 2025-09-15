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
};
export declare const purchaseEntryController: {
    getPurchaseEntries(req: Request, res: Response): Promise<Response>;
    getPurchaseEntryById(req: Request, res: Response): Promise<Response>;
    createPurchaseEntry(req: Request, res: Response): Promise<Response>;
    updatePurchaseEntry(req: Request, res: Response): Promise<Response>;
    markAsPaid(req: Request, res: Response): Promise<Response>;
    deletePurchaseEntry(req: Request, res: Response): Promise<Response>;
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
export declare const debtorsCreditors: {
    getDebtorsCreditors(req: Request, res: Response): Promise<Response>;
    getAgingAnalysis(req: Request, res: Response): Promise<Response>;
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