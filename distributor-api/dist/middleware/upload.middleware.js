"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileInfo = exports.validateFileExists = exports.deleteFiles = exports.getFilePaths = exports.uploadMultiple = exports.uploadSingle = exports.uploadDocuments = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ensureDirectoryExists = (dirPath) => {
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
};
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/documents';
        switch (file.fieldname) {
            case 'citizenshipId':
            case 'companyRegistration':
            case 'panVatRegistration':
                uploadPath = 'uploads/documents';
                break;
            case 'officePhoto':
            case 'areaMap':
                uploadPath = 'uploads/photos';
                break;
            case 'digitalSignature':
                uploadPath = 'uploads/signatures';
                break;
            default:
                uploadPath = 'uploads/misc';
        }
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path_1.default.extname(file.originalname);
        const baseName = path_1.default.basename(file.originalname, extension);
        const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${file.fieldname}-${sanitizedBaseName}-${uniqueSuffix}${extension}`);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        citizenshipId: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
        companyRegistration: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
        panVatRegistration: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
        officePhoto: ['image/jpeg', 'image/jpg', 'image/png'],
        areaMap: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
        digitalSignature: ['image/png', 'image/jpeg', 'image/jpg'],
        documents: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    };
    const fieldAllowedTypes = allowedTypes[file.fieldname];
    if (!fieldAllowedTypes) {
        cb(new Error(`अनुमति नभएको फिल्ड: ${file.fieldname}`));
        return;
    }
    if (!fieldAllowedTypes.includes(file.mimetype)) {
        cb(new Error(`${file.fieldname} को लागि अनुमति नभएको फाइल प्रकार: ${file.mimetype}`));
        return;
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
        files: 5
    }
});
exports.uploadDocuments = upload.fields([
    { name: 'citizenshipId', maxCount: 1 },
    { name: 'companyRegistration', maxCount: 1 },
    { name: 'panVatRegistration', maxCount: 1 },
    { name: 'officePhoto', maxCount: 1 },
    { name: 'areaMap', maxCount: 1 },
    { name: 'digitalSignature', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
]);
const uploadSingle = (fieldName) => upload.single(fieldName);
exports.uploadSingle = uploadSingle;
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
exports.uploadMultiple = uploadMultiple;
const getFilePaths = (files) => {
    const filePaths = {};
    if (Array.isArray(files)) {
        files.forEach((file, index) => {
            filePaths[`file_${index}`] = file.path;
        });
    }
    else {
        Object.keys(files).forEach(fieldName => {
            const fileArray = files[fieldName];
            if (fileArray && fileArray.length > 0) {
                filePaths[fieldName] = fileArray[0].path;
            }
        });
    }
    return filePaths;
};
exports.getFilePaths = getFilePaths;
const deleteFiles = (filePaths) => {
    filePaths.forEach(filePath => {
        if (fs_1.default.existsSync(filePath)) {
            try {
                fs_1.default.unlinkSync(filePath);
                console.log(`Deleted file: ${filePath}`);
            }
            catch (error) {
                console.error(`Error deleting file ${filePath}:`, error);
            }
        }
    });
};
exports.deleteFiles = deleteFiles;
const validateFileExists = (filePath) => {
    return fs_1.default.existsSync(filePath);
};
exports.validateFileExists = validateFileExists;
const getFileInfo = (filePath) => {
    try {
        const stats = fs_1.default.statSync(filePath);
        return {
            size: stats.size,
            mtime: stats.mtime
        };
    }
    catch (error) {
        return null;
    }
};
exports.getFileInfo = getFileInfo;
//# sourceMappingURL=upload.middleware.js.map