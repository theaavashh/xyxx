export declare const uploadDocuments: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadSingle: (fieldName: string) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadMultiple: (fieldName: string, maxCount?: number) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getFilePaths: (files: {
    [fieldname: string]: Express.Multer.File[];
} | Express.Multer.File[]) => Record<string, string>;
export declare const deleteFiles: (filePaths: string[]) => void;
export declare const validateFileExists: (filePath: string) => boolean;
export declare const getFileInfo: (filePath: string) => {
    size: number;
    mtime: Date;
} | null;
//# sourceMappingURL=upload.middleware.d.ts.map