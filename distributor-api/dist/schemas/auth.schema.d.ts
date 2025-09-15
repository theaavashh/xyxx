import { z } from 'zod';
export declare const UserRoleSchema: z.ZodEnum<["ADMIN", "MANAGERIAL", "SALES_MANAGER", "SALES_REPRESENTATIVE", "DISTRIBUTOR"]>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const RegisterSchema: z.ZodEffects<z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    address: z.ZodString;
    department: z.ZodString;
    position: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["ADMIN", "MANAGERIAL", "SALES_MANAGER", "SALES_REPRESENTATIVE", "DISTRIBUTOR"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    username: string;
    fullName: string;
    password: string;
    address: string;
    department: string;
    position: string;
    role: "ADMIN" | "MANAGERIAL" | "SALES_MANAGER" | "SALES_REPRESENTATIVE" | "DISTRIBUTOR";
    confirmPassword: string;
}, {
    email: string;
    username: string;
    fullName: string;
    password: string;
    address: string;
    department: string;
    position: string;
    confirmPassword: string;
    role?: "ADMIN" | "MANAGERIAL" | "SALES_MANAGER" | "SALES_REPRESENTATIVE" | "DISTRIBUTOR" | undefined;
}>, {
    email: string;
    username: string;
    fullName: string;
    password: string;
    address: string;
    department: string;
    position: string;
    role: "ADMIN" | "MANAGERIAL" | "SALES_MANAGER" | "SALES_REPRESENTATIVE" | "DISTRIBUTOR";
    confirmPassword: string;
}, {
    email: string;
    username: string;
    fullName: string;
    password: string;
    address: string;
    department: string;
    position: string;
    confirmPassword: string;
    role?: "ADMIN" | "MANAGERIAL" | "SALES_MANAGER" | "SALES_REPRESENTATIVE" | "DISTRIBUTOR" | undefined;
}>;
export declare const ChangePasswordSchema: z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmNewPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}>;
export declare const ForgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const ResetPasswordSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
    confirmNewPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    newPassword: string;
    confirmNewPassword: string;
    token: string;
}, {
    newPassword: string;
    confirmNewPassword: string;
    token: string;
}>, {
    newPassword: string;
    confirmNewPassword: string;
    token: string;
}, {
    newPassword: string;
    confirmNewPassword: string;
    token: string;
}>;
export declare const UpdateProfileSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    username?: string | undefined;
    fullName?: string | undefined;
    address?: string | undefined;
    department?: string | undefined;
    position?: string | undefined;
}, {
    username?: string | undefined;
    fullName?: string | undefined;
    address?: string | undefined;
    department?: string | undefined;
    position?: string | undefined;
}>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterData = z.infer<typeof RegisterSchema>;
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;
export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
export type UpdateProfileData = z.infer<typeof UpdateProfileSchema>;
//# sourceMappingURL=auth.schema.d.ts.map