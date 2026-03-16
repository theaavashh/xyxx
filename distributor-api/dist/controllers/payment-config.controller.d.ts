import { Request, Response } from 'express';
export declare const getPaymentConfigs: (req: Request, res: Response) => Promise<void>;
export declare const getPaymentConfig: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createPaymentConfig: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updatePaymentConfig: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deletePaymentConfig: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const uploadQrCode: (req: Request, res: Response) => void;
//# sourceMappingURL=payment-config.controller.d.ts.map