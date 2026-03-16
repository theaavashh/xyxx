import { Request, Response } from 'express';
export declare const submitApplication: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getApplications: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getApplicationById: (req: Request, res: Response, next: import("express").NextFunction) => void;
export { updateApplicationStatus, updateApplicationStatusDev, deleteApplication, getApplicationStats, saveDraftApplication, getApplicationByReference, sendOfferLetter } from './distributor.controller.original';
//# sourceMappingURL=distributor.controller.original.d.ts.map